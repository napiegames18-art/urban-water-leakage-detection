// Real-Time Hydraulic Telemetry Stream & Fault Injection Simulation Engine
import { DMA_ZONES, NETWORK_NODES, PIPELINE_SEGMENTS, ISOLATION_VALVES, SMART_METERS_DATA } from '../data/networkTopology.js';
import { 
  analyzeAcousticTelemetry, 
  calculateTransientLocalization, 
  classifySmartMeterConsumption, 
  calculatePipeRisk, 
  solveValveIsolation, 
  calculateWaterBalance 
} from './aiDetectionEngine.js';

class SimulationState {
  constructor() {
    this.activeIncidents = [
      {
        id: 'INC-701',
        type: 'UNDERGROUND_MICRO_LEAK',
        targetPipeId: 'P-203',
        dma: 'DMA-02',
        title: 'Continuous Micro-Fissure Leak at Pipe P-203',
        severity: 'HIGH',
        confidence: 0.94,
        leakRateM3h: 38.5,
        costLossUsdPerHour: 71.2,
        detectedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
        status: 'ACTIVE_UNISOLATED',
        acousticDb: 72.4,
        peakFreqHz: 840,
        pressureDropBar: 0.65,
        estimatedDistanceMetersFromNodeA: 340.0,
        aiDiagnosis: 'Acoustic frequency spectrum shows 840 Hz stationary acoustic peak consistent with pipe wall fracture on aging Asbestos Cement trunk. Mass-balance residual indicates 38.5 m³/h unaccounted flow.'
      }
    ];

    this.workOrders = [
      {
        id: 'WO-1092',
        incidentId: 'INC-701',
        title: 'Emergency Excavation & Clamp Repair for Pipe P-203',
        dma: 'DMA-02',
        targetPipeId: 'P-203',
        priority: 'P1_CRITICAL',
        status: 'EN_ROUTE',
        assignedCrew: 'Rapid Response Unit Delta-3 (Lead: Marcus Vance)',
        locationCoords: 'J-202 to J-203 Corridor (Chainage 340m)',
        estimatedRepairTimeHours: 3.5,
        createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
      },
      {
        id: 'WO-1088',
        incidentId: 'INC-682',
        title: 'AMI Tampering Investigation - Westlake Laundromat',
        dma: 'DMA-02',
        targetPipeId: 'P-203',
        priority: 'P2_HIGH',
        status: 'ASSIGNED',
        assignedCrew: 'Revenue Protection Inspector (T. Rodriguez)',
        locationCoords: '124 North Market Way, Sector B',
        estimatedRepairTimeHours: 1.5,
        createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString()
      }
    ];

    this.smartMeters = JSON.parse(JSON.stringify(SMART_METERS_DATA));
    this.valveStates = ISOLATION_VALVES.reduce((acc, v) => ({ ...acc, [v.id]: v.status }), {});
    this.simSpeed = 1.0;
    this.simTick = 0;
    this.historyBuffer = [];
  }

  getLiveNetworkTelemetry() {
    const timeSec = Date.now() / 1000;
    
    // Check if any active pipe burst or leak is modifying hydraulic state
    const activeLeakPipes = this.activeIncidents.filter(i => i.status !== 'RESOLVED');

    const pipesWithLiveTelemetry = PIPELINE_SEGMENTS.map(pipe => {
      const activeIncident = activeLeakPipes.find(inc => inc.targetPipeId === pipe.id);
      const isBurst = activeIncident && activeIncident.type === 'PIPE_BURST_CRITICAL';
      const isMicroLeak = activeIncident && activeIncident.type === 'UNDERGROUND_MICRO_LEAK';

      // Subtle dynamic noise
      const flowNoise = (Math.sin(timeSec + pipe.lengthM) * 3.5);
      const pressureNoise = (Math.cos(timeSec * 0.8 + pipe.diameterMm) * 0.05);

      let currentFlowM3h = pipe.baseFlowM3h + flowNoise;
      let pressureDropBar = pipe.basePressureDropBar + pressureNoise;
      let acousticDb = 32 + (Math.sin(timeSec * 0.5) * 3.0);
      let peakFreqHz = 320 + Math.round(Math.cos(timeSec) * 40);
      let status = 'NORMAL';

      if (isBurst) {
        currentFlowM3h += (activeIncident.leakRateM3h || 120);
        pressureDropBar += 1.35;
        acousticDb = 84.5 + (Math.random() * 4);
        peakFreqHz = 1180;
        status = 'CRITICAL_BURST';
      } else if (isMicroLeak) {
        currentFlowM3h += (activeIncident.leakRateM3h || 35);
        pressureDropBar += 0.55;
        acousticDb = activeIncident.acousticDb || 71.0;
        peakFreqHz = activeIncident.peakFreqHz || 850;
        status = 'WARNING_LEAK';
      }

      const acousticEval = analyzeAcousticTelemetry(pipe, { acousticDb, peakFreqHz });
      const riskDetails = calculatePipeRisk(pipe);

      return {
        ...pipe,
        currentFlowM3h: parseFloat(currentFlowM3h.toFixed(1)),
        currentPressureDropBar: parseFloat(pressureDropBar.toFixed(2)),
        acousticDb: parseFloat(acousticDb.toFixed(1)),
        peakFreqHz,
        status,
        acousticEval,
        riskDetails,
        activeIncident: activeIncident || null
      };
    });

    const nodesWithLiveTelemetry = NETWORK_NODES.map(node => {
      const isReservoir = node.type === 'reservoir';
      const isPump = node.type === 'pump';
      const isPRV = node.type === 'prv';

      let livePressureBar = 4.0;
      if (isReservoir) livePressureBar = node.headPressureBar;
      else if (isPRV) livePressureBar = node.setPressureBar;
      else if (isPump) livePressureBar = 5.4;
      else {
        // Find adjacent pipes to determine junction pressure
        const connectedPipes = pipesWithLiveTelemetry.filter(p => p.from === node.id || p.to === node.id);
        const hasCritical = connectedPipes.some(p => p.status === 'CRITICAL_BURST');
        const hasWarning = connectedPipes.some(p => p.status === 'WARNING_LEAK');
        
        livePressureBar = 4.1 - (node.elevationM * 0.02);
        if (hasCritical) livePressureBar -= 1.4;
        else if (hasWarning) livePressureBar -= 0.5;
      }

      return {
        ...node,
        livePressureBar: parseFloat(Math.max(0.8, livePressureBar + (Math.sin(timeSec + node.x) * 0.04)).toFixed(2)),
        turbidityNtu: parseFloat((0.42 + (Math.random() * 0.08)).toFixed(2)),
        chlorinePpm: parseFloat((1.15 + (Math.sin(timeSec * 0.3) * 0.05)).toFixed(2))
      };
    });

    return {
      timestamp: new Date().toISOString(),
      nodes: nodesWithLiveTelemetry,
      pipes: pipesWithLiveTelemetry,
      valves: ISOLATION_VALVES.map(v => ({ ...v, status: this.valveStates[v.id] || v.status })),
      dmas: DMA_ZONES.map(dma => {
        const dmaPipes = pipesWithLiveTelemetry.filter(p => p.dma === dma.id);
        const totalFlow = dmaPipes.reduce((sum, p) => sum + p.currentFlowM3h, 0);
        const hasActiveIncident = dmaPipes.some(p => p.status !== 'NORMAL');
        return {
          ...dma,
          liveFlowM3h: parseFloat(totalFlow.toFixed(1)),
          status: hasActiveIncident ? 'ANOMALY_DETECTED' : 'OPTIMAL'
        };
      }),
      activeIncidents: this.activeIncidents,
      workOrders: this.workOrders
    };
  }

  injectIncident(incidentPayload) {
    const { type, targetPipeId, meterId, customTitle } = incidentPayload;

    if (meterId) {
      // Meter-specific anomaly injection
      const meterIndex = this.smartMeters.findIndex(m => m.meterId === meterId);
      if (meterIndex !== -1) {
        if (type === 'METER_TAMPERING') {
          this.smartMeters[meterIndex].anomalyStatus = 'METER_TAMPERING_BYPASS';
          this.smartMeters[meterIndex].anomalyConfidence = 0.95;
          this.smartMeters[meterIndex].description = 'Manual bypass trigger: Flow registration dropped to 0 m³/h despite active consumer line pressure.';
        } else if (type === 'CONTINUOUS_LEAK') {
          this.smartMeters[meterIndex].anomalyStatus = 'CONTINUOUS_LEAK';
          this.smartMeters[meterIndex].anomalyConfidence = 0.96;
          this.smartMeters[meterIndex].description = 'Injected continuous 0.15 m³/h internal plumbing leak pattern.';
        } else if (type === 'SURGE') {
          this.smartMeters[meterIndex].anomalyStatus = 'UNCHARACTERISTIC_SURGE';
          this.smartMeters[meterIndex].anomalyConfidence = 0.98;
          this.smartMeters[meterIndex].description = 'Injected massive 300% uncharacteristic surge.';
        }
        return { success: true, message: `Injected ${type} anomaly on Smart Meter ${meterId}` };
      }
    }

    const pipe = PIPELINE_SEGMENTS.find(p => p.id === (targetPipeId || 'P-201'));
    if (!pipe) throw new Error('Target pipe not found');

    const newIncident = {
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      type: type || 'PIPE_BURST_CRITICAL',
      targetPipeId: pipe.id,
      dma: pipe.dma,
      title: customTitle || (type === 'PIPE_BURST_CRITICAL' ? `Major Catastrophic Pipe Burst on ${pipe.id}` : `High-Pressure Pinhole Leak on ${pipe.id}`),
      severity: type === 'PIPE_BURST_CRITICAL' ? 'CRITICAL' : 'HIGH',
      confidence: 0.96,
      leakRateM3h: type === 'PIPE_BURST_CRITICAL' ? 145.0 : 42.0,
      costLossUsdPerHour: type === 'PIPE_BURST_CRITICAL' ? 268.25 : 77.70,
      detectedAt: new Date().toISOString(),
      status: 'ACTIVE_UNISOLATED',
      acousticDb: type === 'PIPE_BURST_CRITICAL' ? 88.2 : 74.0,
      peakFreqHz: type === 'PIPE_BURST_CRITICAL' ? 1220 : 780,
      pressureDropBar: type === 'PIPE_BURST_CRITICAL' ? 1.45 : 0.60,
      estimatedDistanceMetersFromNodeA: Math.round(pipe.lengthM * 0.45),
      aiDiagnosis: `Multi-Sensor AI Fusion triggered: Transient pressure wave reflection and 88+ dB acoustic signature localized leak at ${Math.round(pipe.lengthM * 0.45)}m from ${pipe.from}. Immediate valve closure recommended.`
    };

    // Remove existing incident on this pipe if any
    this.activeIncidents = this.activeIncidents.filter(i => i.targetPipeId !== pipe.id);
    this.activeIncidents.unshift(newIncident);

    // Auto-create urgent work order
    const newWO = {
      id: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
      incidentId: newIncident.id,
      title: `Emergency Repair: ${newIncident.title}`,
      dma: pipe.dma,
      targetPipeId: pipe.id,
      priority: type === 'PIPE_BURST_CRITICAL' ? 'P1_CRITICAL' : 'P2_HIGH',
      status: 'ASSIGNED',
      assignedCrew: 'Rapid Response Unit Bravo-1 (Lead: Alex Mercer)',
      locationCoords: `Segment ${pipe.id} between ${pipe.from} and ${pipe.to}`,
      estimatedRepairTimeHours: type === 'PIPE_BURST_CRITICAL' ? 4.0 : 2.5,
      createdAt: new Date().toISOString()
    };
    this.workOrders.unshift(newWO);

    return { success: true, incident: newIncident, workOrder: newWO };
  }

  resetAllIncidents() {
    this.activeIncidents = [];
    this.smartMeters = JSON.parse(JSON.stringify(SMART_METERS_DATA));
    this.valveStates = ISOLATION_VALVES.reduce((acc, v) => ({ ...acc, [v.id]: 'OPEN' }), {});
    return { success: true, message: 'Simulation reset to optimal baseline network state.' };
  }

  toggleValve(valveId, newStatus) {
    const valve = ISOLATION_VALVES.find(v => v.id === valveId);
    if (!valve) throw new Error('Valve not found');
    
    this.valveStates[valveId] = newStatus || (this.valveStates[valveId] === 'OPEN' ? 'CLOSED' : 'OPEN');
    
    // If closing valve for an active incident, mark incident as isolated
    const affectedIncidents = this.activeIncidents.filter(i => i.targetPipeId === valve.pipeId);
    if (this.valveStates[valveId] === 'CLOSED') {
      affectedIncidents.forEach(inc => {
        inc.status = 'ISOLATED_CONTAINED';
      });
    }

    return { 
      valveId, 
      status: this.valveStates[valveId],
      affectedIncidentsUpdated: affectedIncidents.length 
    };
  }

  updateWorkOrderStatus(woId, status) {
    const wo = this.workOrders.find(w => w.id === woId);
    if (!wo) throw new Error('Work order not found');
    wo.status = status;
    if (status === 'RESOLVED') {
      const incident = this.activeIncidents.find(i => i.id === wo.incidentId);
      if (incident) incident.status = 'RESOLVED';
    }
    return wo;
  }
}

export const simulationState = new SimulationState();
