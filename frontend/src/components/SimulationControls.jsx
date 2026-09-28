import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  RotateCcw, 
  Play, 
  Flame, 
  Droplet, 
  Users, 
  Radio, 
  CheckCircle, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

export default function SimulationControls({ 
  onInjectIncident, 
  onResetSimulation, 
  pipes = [], 
  smartMeters = [] 
}) {
  const [selectedPipeId, setSelectedPipeId] = useState('P-201');
  const [selectedMeterId, setSelectedMeterId] = useState('AMI-20984');
  const [injectionNotice, setInjectionNotice] = useState(null);

  const handleInjectBurst = () => {
    onInjectIncident({
      type: 'PIPE_BURST_CRITICAL',
      targetPipeId: selectedPipeId,
      customTitle: `Major High-Pressure Burst Rupture on ${selectedPipeId}`
    });
    setInjectionNotice(`💥 Injected Critical Pipe Burst on segment ${selectedPipeId}!`);
    setTimeout(() => setInjectionNotice(null), 4000);
  };

  const handleInjectMicroLeak = () => {
    onInjectIncident({
      type: 'UNDERGROUND_MICRO_LEAK',
      targetPipeId: selectedPipeId,
      customTitle: `Subsurface Pinhole Fracture Leak on ${selectedPipeId}`
    });
    setInjectionNotice(`⚠️ Injected Underground Micro-Fissure on segment ${selectedPipeId}!`);
    setTimeout(() => setInjectionNotice(null), 4000);
  };

  const handleInjectMeterTamper = () => {
    onInjectIncident({
      type: 'METER_TAMPERING',
      meterId: selectedMeterId
    });
    setInjectionNotice(`🚨 Injected AMI Meter Bypass on ${selectedMeterId}!`);
    setTimeout(() => setInjectionNotice(null), 4000);
  };

  const handleInjectMeterSurge = () => {
    onInjectIncident({
      type: 'SURGE',
      meterId: selectedMeterId
    });
    setInjectionNotice(`📈 Injected Uncharacteristic Surge on ${selectedMeterId}!`);
    setTimeout(() => setInjectionNotice(null), 4000);
  };

  const handleReset = () => {
    onResetSimulation();
    setInjectionNotice('🔄 Network state reset to optimal 100% nominal baseline.');
    setTimeout(() => setInjectionNotice(null), 4000);
  };

  return (
    <div className="simulation-studio-container glass-panel">
      <div className="studio-header">
        <div className="title-block">
          <h2><Zap className="text-cyan inline-icon" size={22} /> Incident Simulation & Fault Injection Studio</h2>
          <p className="subtitle">Interactive physical & behavioral anomaly triggers to test AI multi-sensor detection and emergency response</p>
        </div>

        <button className="btn-reset" onClick={handleReset}>
          <RotateCcw size={16} /> Reset Network to Nominal Baseline
        </button>
      </div>

      {injectionNotice && (
        <div className="injection-alert-banner slide-down">
          <Sparkles size={16} /> {injectionNotice}
        </div>
      )}

      <div className="scenarios-grid">
        {/* Scenario 1: Pipeline Hydraulic Catastrophe */}
        <div className="scenario-card glass-panel">
          <div className="scenario-top">
            <span className="scenario-badge burst">Physical Infrastructure Fault</span>
            <h3>Transmission & Distribution Pipe Burst</h3>
          </div>

          <p className="scenario-desc">
            Simulates a catastrophic longitudinal rupture resulting in sudden pressure drop (-1.4 bar), mass-balance flow surge (+145 m³/h), and high-frequency acoustic resonance (88+ dB).
          </p>

          <div className="target-select-row">
            <label>Target Pipe Segment:</label>
            <select 
              value={selectedPipeId} 
              onChange={(e) => setSelectedPipeId(e.target.value)}
              className="select-styled"
            >
              {pipes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.id} ({p.material}, {p.dma})
                </option>
              ))}
            </select>
          </div>

          <div className="scenario-buttons">
            <button className="btn-trigger burst-btn" onClick={handleInjectBurst}>
              💥 Inject Critical Pipe Burst (145 m³/h)
            </button>
            <button className="btn-trigger leak-btn" onClick={handleInjectMicroLeak}>
              ⚠️ Inject Underground Pinhole Leak (38 m³/h)
            </button>
          </div>
        </div>

        {/* Scenario 2: Smart Meter & Consumer Anomaly */}
        <div className="scenario-card glass-panel">
          <div className="scenario-top">
            <span className="scenario-badge tamper">Consumer / AMI Anomaly</span>
            <h3>Abnormal Consumption & Meter Tampering</h3>
          </div>

          <p className="scenario-desc">
            Simulates illegal consumer meter bypass, physical tampering, reverse flow backflow risk, or uncharacteristic commercial burst surges.
          </p>

          <div className="target-select-row">
            <label>Target Smart Meter:</label>
            <select 
              value={selectedMeterId} 
              onChange={(e) => setSelectedMeterId(e.target.value)}
              className="select-styled"
            >
              <option value="AMI-20984">AMI-20984 - Westlake Laundromat (Commercial)</option>
              <option value="AMI-10089">AMI-10089 - Jenkins Residence (Residential)</option>
              <option value="AMI-30115">AMI-30115 - BioChem Pharma Lab (Industrial)</option>
              <option value="AMI-40251">AMI-40251 - Sun Valley Pool (Commercial)</option>
            </select>
          </div>

          <div className="scenario-buttons">
            <button className="btn-trigger tamper-btn" onClick={handleInjectMeterTamper}>
              🚨 Inject Meter Tampering / Mechanical Bypass
            </button>
            <button className="btn-trigger surge-btn" onClick={handleInjectMeterSurge}>
              📈 Inject Massive 300% Uncharacteristic Surge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
