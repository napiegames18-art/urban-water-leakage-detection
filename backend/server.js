import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { DMA_ZONES, NETWORK_NODES, PIPELINE_SEGMENTS, ISOLATION_VALVES, SMART_METERS_DATA } from './data/networkTopology.js';
import { 
  analyzeAcousticTelemetry, 
  calculateTransientLocalization, 
  classifySmartMeterConsumption, 
  calculatePipeRisk, 
  solveValveIsolation, 
  calculateWaterBalance 
} from './services/aiDetectionEngine.js';
import { simulationState } from './services/simulationService.js';

const app = express();
app.use(cors());
app.use(express.json());

// 1. System Overview & Executive KPIs
app.get('/api/overview', (req, res) => {
  const telemetry = simulationState.getLiveNetworkTelemetry();
  const balance = calculateWaterBalance('ALL');
  const pipeRisks = PIPELINE_SEGMENTS.map(calculatePipeRisk);
  const criticalPipes = pipeRisks.filter(p => p.riskCategory === 'CRITICAL_REPLACE').length;

  const totalActiveLossRateM3h = telemetry.activeIncidents
    .filter(i => i.status !== 'RESOLVED')
    .reduce((sum, i) => sum + (i.leakRateM3h || 0), 0);

  res.json({
    timestamp: telemetry.timestamp,
    kpis: {
      nrwPercent: balance.nrwPercent,
      targetNRWPercent: balance.targetNRWPercent,
      nrwStatus: balance.nrwPercent <= balance.targetNRWPercent ? 'ON_TARGET' : 'ATTENTION_REQUIRED',
      activeIncidentsCount: telemetry.activeIncidents.filter(i => i.status !== 'RESOLVED').length,
      currentRealLossRateM3h: parseFloat(totalActiveLossRateM3h.toFixed(1)),
      dailyRevenueLossUsd: balance.estimatedDailyRevenueLossUSD,
      totalSystemInputVolumeM3d: balance.systemInputVolumeM3d,
      infrastructureLeakageIndex: balance.infrastructureLeakageIndex,
      dailyCarbonLossKgCO2e: balance.dailyCarbonLossKgCO2e,
      totalPipeLengthKm: 197.0,
      totalMonitoredConnections: 17600,
      criticalPipesAtRiskCount: criticalPipes
    },
    topIncidents: telemetry.activeIncidents.slice(0, 5),
    dmaSummary: telemetry.dmas,
    recentWorkOrders: telemetry.workOrders.slice(0, 4)
  });
});

// 2. Digital Twin Network Graph & Real-time Telemetry
app.get('/api/network', (req, res) => {
  const telemetry = simulationState.getLiveNetworkTelemetry();
  res.json(telemetry);
});

// 3. DMA Sectors Breakdown
app.get('/api/dma', (req, res) => {
  const telemetry = simulationState.getLiveNetworkTelemetry();
  res.json({ dmas: telemetry.dmas });
});

// 4. IWA Water Balance Audit
app.get('/api/water-balance', (req, res) => {
  const { dmaId } = req.query;
  const balance = calculateWaterBalance(dmaId || 'ALL');
  res.json(balance);
});

// 5. Smart Meter (AMI) Telemetry & Anomaly Classification
app.get('/api/smart-meters', (req, res) => {
  const metersWithClassifications = simulationState.smartMeters.map(meter => {
    const aiAnalysis = classifySmartMeterConsumption(meter);
    return {
      ...meter,
      aiAnalysis
    };
  });

  const summary = {
    totalMeters: metersWithClassifications.length,
    normalCount: metersWithClassifications.filter(m => m.aiAnalysis.anomalyType === 'NORMAL').length,
    anomalyCount: metersWithClassifications.filter(m => m.aiAnalysis.anomalyType !== 'NORMAL').length,
    estimatedCustomerLossM3d: metersWithClassifications.reduce((sum, m) => sum + (m.aiAnalysis.estimatedLossM3d || 0), 0)
  };

  res.json({
    summary,
    meters: metersWithClassifications
  });
});

// 6. Pipe Deterioration & Remaining Useful Life (RUL) Risk Ranking
app.get('/api/pipe-risks', (req, res) => {
  const pipeRisks = PIPELINE_SEGMENTS.map(pipe => {
    const risk = calculatePipeRisk(pipe);
    return {
      ...pipe,
      ...risk
    };
  }).sort((a, b) => b.riskScore - a.riskScore);

  res.json({
    totalPipes: pipeRisks.length,
    highRiskCount: pipeRisks.filter(p => p.riskCategory === 'CRITICAL_REPLACE').length,
    pipes: pipeRisks
  });
});

// 7. Active Incidents Feed
app.get('/api/incidents', (req, res) => {
  res.json({
    incidents: simulationState.activeIncidents
  });
});

// 8. Work Orders & Crew Dispatch
app.get('/api/work-orders', (req, res) => {
  res.json({
    workOrders: simulationState.workOrders
  });
});

// 9. Update Work Order Status
app.post('/api/work-orders/update', (req, res) => {
  const { woId, status } = req.body;
  try {
    const updated = simulationState.updateWorkOrderStatus(woId, status);
    res.json({ success: true, workOrder: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 10. Toggle Isolation Valve
app.post('/api/valve/toggle', (req, res) => {
  const { valveId, status } = req.body;
  try {
    const result = simulationState.toggleValve(valveId, status);
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 11. Fault & Incident Injection Simulator
app.post('/api/simulate/incident', (req, res) => {
  try {
    const result = simulationState.injectIncident(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 12. Reset Simulation State
app.post('/api/simulate/reset', (req, res) => {
  const result = simulationState.resetAllIncidents();
  res.json(result);
});

// 13. Deep AI Root Cause & Multi-Model Diagnostic Engine
app.post('/api/ai/diagnose', (req, res) => {
  const { pipeId, deltaT_ms } = req.body;
  const pipe = PIPELINE_SEGMENTS.find(p => p.id === pipeId);
  if (!pipe) return res.status(404).json({ error: 'Pipe not found' });

  const activeInc = simulationState.activeIncidents.find(i => i.targetPipeId === pipeId);
  const acoustic = analyzeAcousticTelemetry(pipe, {
    acousticDb: activeInc ? activeInc.acousticDb : 34.0,
    peakFreqHz: activeInc ? activeInc.peakFreqHz : 380
  });

  const transient = calculateTransientLocalization(pipe, pipe.from, pipe.to, deltaT_ms || 18.4);
  const valvePlan = solveValveIsolation(pipeId);
  const risk = calculatePipeRisk(pipe);

  res.json({
    pipeId,
    pipeDetails: pipe,
    isIncidentActive: !!activeInc,
    severity: activeInc ? activeInc.severity : 'NORMAL',
    acousticDiagnosis: acoustic,
    transientLocalization: transient,
    riskEvaluation: risk,
    recommendedValveIsolation: valvePlan,
    synthesisReport: activeInc 
      ? `🚨 CONFIRMED LEAK EVENT: Segment ${pipe.id} shows high-amplitude acoustic resonance (${acoustic.acousticDb} dB @ ${acoustic.peakFreqHz}Hz) with wave travel differential indicating rupture at ~${transient.estimatedDistanceMetersFromNodeA}m from ${pipe.from}. Estimated loss: ${activeInc.leakRateM3h} m³/h ($${activeInc.costLossUsdPerHour}/hr). Immediate closure of valves [${valvePlan.valvesToClose.map(v => v.valveId).join(', ')}] recommended.`
      : `✅ OPTIMAL HYDRAULIC EQUILIBRIUM: Pipe ${pipe.id} is operating within nominal pressure envelopes. Acoustic level (${acoustic.acousticDb} dB) corresponds to clean laminar fluid flow.`
  });
});

// 14. Automated Valve Isolation Solver
app.post('/api/ai/isolate-valve', (req, res) => {
  const { pipeId } = req.body;
  const plan = solveValveIsolation(pipeId);
  if (!plan) return res.status(404).json({ error: 'Pipe segment not found' });
  res.json(plan);
});

// 15. Intelligent AI Water Utility Copilot Assistant
app.post('/api/ai/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const telemetry = simulationState.getLiveNetworkTelemetry();
  const activeInc = telemetry.activeIncidents.filter(i => i.status !== 'RESOLVED');
  const balance = calculateWaterBalance('ALL');
  const pipeRisks = PIPELINE_SEGMENTS.map(calculatePipeRisk).sort((a, b) => b.riskScore - a.riskScore);

  // If OpenAI key is present in environment, call LLM with real telemetry context
  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const systemPrompt = `You are "AquaIntel AI", an advanced Chief Hydraulic Operations Copilot for an Urban Water Distribution Authority.
You have real-time access to the city's Digital Twin telemetry:
- Current NRW (Non-Revenue Water): ${balance.nrwPercent}% (Target: 10.0%)
- Active Incidents: ${JSON.stringify(activeInc)}
- High Risk Aging Pipes: ${JSON.stringify(pipeRisks.slice(0, 4))}
- Daily Financial Loss: $${balance.estimatedDailyRevenueLossUSD}
- 4 District Metered Areas: Sector A (Downtown), Sector B (North Metro), Sector C (Industrial East), Sector D (Hillside).

Provide clear, highly technical, actionable advice on leak localization, acoustic frequency signatures, valve shutoff procedures, customer water outage minimization, and hydraulic engineering best practices. Keep your responses crisp and formatted with markdown.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      });

      return res.json({
        reply: completion.choices[0]?.message?.content,
        source: 'OpenAI-GPT4o'
      });
    } catch (err) {
      console.warn('OpenAI call failed, falling back to rule-based copilot:', err.message);
    }
  }

  // Rule-based Domain Expert Copilot Fallback
  const lower = message.toLowerCase();
  let reply = '';

  if (lower.includes('burst') || lower.includes('leak') || lower.includes('incident') || lower.includes('active')) {
    if (activeInc.length === 0) {
      reply = `✅ **No Active Pipe Bursts Detected**\nAll 28 network pipeline segments are currently operating within standard pressure envelopes (3.5 - 4.8 bar). Background acoustic noise across all 18 sensor loggers is nominal (<36 dB).`;
    } else {
      const incList = activeInc.map(i => `• **${i.title}** (${i.dma}): Loss rate **${i.leakRateM3h} m³/h** ($${i.costLossUsdPerHour}/hr). Status: \`${i.status}\``).join('\n');
      reply = `🚨 **Active Leak Incidents Alert (${activeInc.length} Detected)**\n\n${incList}\n\n**Recommended Action:** Trigger automatic isolation valve sequence for the affected DMA and dispatch Rapid Response Units.`;
    }
  } else if (lower.includes('nrw') || lower.includes('balance') || lower.includes('loss') || lower.includes('revenue')) {
    reply = `📊 **Current Urban Water Balance & NRW Audit (IWA Standard):**\n\n- **System Input Volume:** ${balance.systemInputVolumeM3d.toLocaleString()} m³/day\n- **Billed Authorized Consumption:** ${balance.billedAuthorizedM3d.toLocaleString()} m³/day\n- **Current Non-Revenue Water (NRW):** **${balance.nrwPercent}%** (Target: ${balance.targetNRWPercent}%)\n- **Real Physical Losses:** ${balance.realLossesM3d.toLocaleString()} m³/day (${balance.infrastructureLeakageIndex} ILI ratio)\n- **Estimated Daily Revenue Loss:** **$${balance.estimatedDailyRevenueLossUSD.toLocaleString()} / day**\n- **Carbon Footprint Impact:** ${balance.dailyCarbonLossKgCO2e.toLocaleString()} kg CO₂e/day in wasted pumping energy.`;
  } else if (lower.includes('valve') || lower.includes('isolate') || lower.includes('shut')) {
    reply = `🔧 **Emergency Valve Isolation Protocol:**\nWhen isolating a pipe rupture:\n1. Query the AI Valve Isolation Solver to identify the minimum boundary boundary cut-set.\n2. Prioritize motorized SCADA valves (V-01, V-02, V-201, V-202) for immediate closure in <120 seconds.\n3. Reroute secondary flow to prevent pressure drop in hospital/critical zones.\n4. Monitor downstream transient water hammer to avoid secondary bursts.`;
  } else if (lower.includes('meter') || lower.includes('tamper') || lower.includes('consumer') || lower.includes('abnormal')) {
    reply = `🏠 **Smart Meter (AMI) Anomaly Insights:**\n- **Continuous Micro-Leak:** Detected on residential meter #10089 (steady 0.12 m³/h during 02:00-05:00 AM). Suggest automated SMS notification to homeowner.\n- **Meter Tampering / Bypass:** Detected on commercial meter #20984 (Westlake Laundromat) with 92% sudden drop in registration while main pressure is standard. Inspection ticket generated.\n- **Backflow Risk:** Detected on meter #40251 with reverse flow registration (-0.08 m³/h). Potential contamination hazard.`;
  } else if (lower.includes('risk') || lower.includes('pipe') || lower.includes('asset') || lower.includes('age')) {
    const top4 = pipeRisks.slice(0, 3).map(p => `• **${p.id}** (${p.material}, ${p.ageYears} yrs old, ${p.soilType}): **Risk Score ${p.riskScore}/100** (RUL: ~${p.remainingLifeYears} yrs)`).join('\n');
    reply = `🔮 **Top High-Risk Pipe Segments (Weibull Deterioration Model):**\n\n${top4}\n\n**Action Plan:** Pipe \`P-203\` (Asbestos Cement, installed 1989) and \`P-201\` (Cast Iron in corrosive clay) require immediate trenchless lining or CIPP rehabilitation within 6 months.`;
  } else {
    reply = `👋 **AquaIntel AI Operations Copilot is Online.**\nI can help you with:\n1. *Real-time Leak Localization & Acoustic Frequency Analysis*\n2. *DMA Water Balance & NRW Optimization*\n3. *Automated Valve Isolation & Outage Minimization*\n4. *Smart Meter (AMI) Consumption Anomaly Diagnostics*\n5. *Pipe Deterioration & Asset Health Index (RUL)*\n\nAsk any question or inject simulated incidents from the Mission Control Studio!`;
  }

  res.json({
    reply,
    source: 'AquaIntel-RuleEngine'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌊 AquaIntel AI Water Network Server running on http://localhost:${PORT}`);
});