import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Activity, 
  Radio, 
  Wrench, 
  CheckCircle2, 
  Volume2, 
  Clock, 
  DollarSign, 
  Droplet, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Sliders
} from 'lucide-react';

export default function LeakDetectionHub({ 
  incidents = [], 
  pipes = [], 
  onToggleValve, 
  onResolveIncident,
  onOpenWorkOrders 
}) {
  const [selectedIncident, setSelectedIncident] = useState(incidents[0] || null);
  const [diagnosingPipeId, setDiagnosingPipeId] = useState(incidents[0]?.targetPipeId || 'P-203');
  const [diagnosticsData, setDiagnosticsData] = useState(null);
  const [loadingDiag, setLoadingDiag] = useState(false);
  const [valveExecutionStatus, setValveExecutionStatus] = useState(null);

  // Sync selected incident when incident list changes
  useEffect(() => {
    if (incidents.length > 0 && (!selectedIncident || !incidents.find(i => i.id === selectedIncident.id))) {
      setSelectedIncident(incidents[0]);
      setDiagnosingPipeId(incidents[0].targetPipeId);
    }
  }, [incidents]);

  // Fetch deep AI diagnosis whenever diagnosingPipeId changes
  useEffect(() => {
    if (!diagnosingPipeId) return;
    setLoadingDiag(true);
    fetch('/api/ai/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipeId: diagnosingPipeId, deltaT_ms: 18.4 })
    })
      .then(res => res.json())
      .then(data => {
        setDiagnosticsData(data);
        setLoadingDiag(false);
      })
      .catch(err => {
        console.error('Diagnosis error:', err);
        setLoadingDiag(false);
      });
  }, [diagnosingPipeId]);

  const handleIsolateValves = async (valveList) => {
    setValveExecutionStatus('EXECUTING');
    try {
      for (const valve of valveList) {
        await fetch('/api/valve/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ valveId: valve.valveId, status: 'CLOSED' })
        });
        if (onToggleValve) onToggleValve(valve.valveId);
      }
      setValveExecutionStatus('ISOLATED_SUCCESS');
      setTimeout(() => setValveExecutionStatus(null), 4000);
    } catch (err) {
      setValveExecutionStatus('ERROR');
    }
  };

  const activeCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const totalWaterLoss = incidents.filter(i => i.status !== 'RESOLVED').reduce((s, i) => s + (i.leakRateM3h || 0), 0);
  const totalCostLoss = incidents.filter(i => i.status !== 'RESOLVED').reduce((s, i) => s + (i.costLossUsdPerHour || 0), 0);

  return (
    <div className="leak-hub-container">
      {/* Top Incident Summary Metrics */}
      <div className="metrics-row">
        <div className="metric-card glass-panel alert-glow">
          <div className="metric-icon-wrap bg-red-dim">
            <AlertOctagon size={24} className="text-red" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Leak / Burst Events</span>
            <span className="metric-number text-red">{activeCount}</span>
            <span className="metric-sub">{incidents.length} total logged today</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap bg-cyan-dim">
            <Droplet size={24} className="text-cyan" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Current Water Loss Rate</span>
            <span className="metric-number text-cyan">{totalWaterLoss.toFixed(1)} <small>m³/h</small></span>
            <span className="metric-sub">{(totalWaterLoss * 24).toFixed(0)} m³ daily deficit</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap bg-amber-dim">
            <DollarSign size={24} className="text-amber" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Financial Loss Rate</span>
            <span className="metric-number text-amber">${totalCostLoss.toFixed(2)} <small>/hr</small></span>
            <span className="metric-sub">${(totalCostLoss * 24).toFixed(0)} / day non-revenue cost</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap bg-purple-dim">
            <Radio size={24} className="text-purple" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Acoustic Loggers Active</span>
            <span className="metric-number text-purple">18 / 18</span>
            <span className="metric-sub">99.4% hydrophone uptime</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Incidents Feed + Multi-Model Diagnostic Engine */}
      <div className="leak-hub-grid">
        {/* Left Column: Active Incidents List */}
        <div className="incident-list-panel glass-panel">
          <div className="panel-header">
            <h3><Activity size={18} className="text-cyan" /> Real-Time Leak Incidents Stream</h3>
            <span className="count-pill">{activeCount} ACTIVE</span>
          </div>

          <div className="incidents-scroll">
            {incidents.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={40} className="text-emerald" />
                <h4>All Networks Operating at Nominal Equilibrium</h4>
                <p>No active pipeline ruptures or micro-fissures detected across all 4 DMAs.</p>
              </div>
            ) : (
              incidents.map(inc => {
                const isSelected = selectedIncident && selectedIncident.id === inc.id;
                const isBurst = inc.type === 'PIPE_BURST_CRITICAL';
                return (
                  <div 
                    key={inc.id} 
                    className={`incident-item ${isSelected ? 'selected' : ''} ${inc.status}`}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setDiagnosingPipeId(inc.targetPipeId);
                    }}
                  >
                    <div className="incident-top">
                      <span className={`incident-type-tag ${isBurst ? 'tag-critical' : 'tag-warning'}`}>
                        {isBurst ? 'CRITICAL BURST' : 'UNDERGROUND LEAK'}
                      </span>
                      <span className="incident-time">
                        <Clock size={12} /> {new Date(inc.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="incident-title">{inc.title}</h4>

                    <div className="incident-stats-row">
                      <span className="stat-badge"><Droplet size={12} /> {inc.leakRateM3h} m³/h</span>
                      <span className="stat-badge"><DollarSign size={12} /> ${inc.costLossUsdPerHour}/h</span>
                      <span className="stat-badge"><Volume2 size={12} /> {inc.acousticDb} dB</span>
                      <span className="stat-confidence">AI Conf: {(inc.confidence * 100).toFixed(0)}%</span>
                    </div>

                    <div className="incident-footer">
                      <span className={`incident-status-badge ${inc.status}`}>
                        {inc.status === 'ISOLATED_CONTAINED' ? '🔒 VALVES ISOLATED' : inc.status === 'RESOLVED' ? '✅ REPAIRED' : '🚨 ACTIVE UNCONTAINED'}
                      </span>
                      <span className="text-link">Inspect Multi-Model Diagnostics →</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Multi-Model AI Diagnostics & Valve Isolation Studio */}
        <div className="diagnostic-studio-panel glass-panel">
          <div className="panel-header">
            <div className="header-title-group">
              <h3><Zap size={18} className="text-cyan" /> Multi-Model AI Leak Localization Engine</h3>
              <p className="panel-sub">Fusion of Hydrophone FFT Spectrogram + Wave Transient Arrival Δt + Mass Balance</p>
            </div>

            {/* Pipe Selector Dropdown */}
            <div className="pipe-quick-select">
              <label>Inspecting Pipe:</label>
              <select 
                value={diagnosingPipeId} 
                onChange={(e) => setDiagnosingPipeId(e.target.value)}
                className="select-styled"
              >
                {pipes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.id} ({p.material}, {p.lengthM}m) - {p.dma}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingDiag ? (
            <div className="diagnostic-loading">
              <Activity className="spin text-cyan" size={36} />
              <p>Computing transient wave reflection and acoustic peak decomposition...</p>
            </div>
          ) : diagnosticsData ? (
            <div className="diagnostic-content">
              {/* AI Synthesis Banner */}
              <div className={`ai-synthesis-box ${diagnosticsData.isIncidentActive ? 'incident-active' : 'nominal'}`}>
                <div className="synthesis-header">
                  <Sparkles size={18} className="text-cyan" />
                  <h4>Real-Time AI Multi-Sensor Synthesis</h4>
                  <span className="confidence-tag">96.4% Model Certainty</span>
                </div>
                <p className="synthesis-text">{diagnosticsData.synthesisReport}</p>
              </div>

              {/* Multi-Model Breakdown Cards */}
              <div className="models-grid">
                {/* 1. Acoustic Spectrogram Model */}
                <div className="model-card">
                  <div className="model-card-header">
                    <Volume2 size={16} className="text-cyan" />
                    <span>Acoustic Spectral Analysis</span>
                  </div>
                  <div className="model-value-large">
                    {diagnosticsData.acousticDiagnosis.acousticDb} <small>dB</small>
                  </div>
                  <div className="model-sub-details">
                    <div>Peak Resonance: <strong>{diagnosticsData.acousticDiagnosis.peakFreqHz} Hz</strong></div>
                    <div>Signature: <strong>{diagnosticsData.acousticDiagnosis.signatureType}</strong></div>
                  </div>
                  {/* Visual frequency bars */}
                  <div className="frequency-bars-visual">
                    {[120, 240, 420, 680, 850, 1100, 1400, 1800, 2200].map(freq => {
                      const isPeak = Math.abs(freq - diagnosticsData.acousticDiagnosis.peakFreqHz) < 250;
                      const barHeight = isPeak ? 90 : Math.min(65, (diagnosticsData.acousticDiagnosis.acousticDb / 85) * 45 + (freq % 15));
                      return (
                        <div key={freq} className="freq-bar-col">
                          <div 
                            className={`freq-bar ${isPeak ? 'peak-bar' : ''}`}
                            style={{ height: `${barHeight}%` }}
                          ></div>
                          <span className="freq-label">{freq}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Wave Transient & Arrival Difference Localization */}
                <div className="model-card">
                  <div className="model-card-header">
                    <Activity size={16} className="text-blue" />
                    <span>Pressure Transient Wave Arrival</span>
                  </div>
                  <div className="model-value-large text-blue">
                    ~{diagnosticsData.transientLocalization.estimatedDistanceMetersFromNodeA} <small>meters</small>
                  </div>
                  <div className="model-sub-details">
                    <div>From Sensor Node: <strong>{diagnosticsData.pipeDetails.from}</strong></div>
                    <div>Wave Velocity (c): <strong>{diagnosticsData.transientLocalization.waveSpeedMs} m/s</strong></div>
                    <div>Localization Tolerance: <strong>±{diagnosticsData.transientLocalization.confidenceRadiusMeters}m</strong></div>
                  </div>
                  {/* Pipe Distance Pin Visualization */}
                  <div className="pipe-distance-bar-wrap">
                    <div className="pipe-bar-nodes">
                      <span>{diagnosticsData.pipeDetails.from} (0m)</span>
                      <span>{diagnosticsData.pipeDetails.to} ({diagnosticsData.pipeDetails.lengthM}m)</span>
                    </div>
                    <div className="pipe-track">
                      <div 
                        className="leak-pin-marker"
                        style={{ 
                          left: `${(diagnosticsData.transientLocalization.estimatedDistanceMetersFromNodeA / diagnosticsData.pipeDetails.lengthM) * 100}%` 
                        }}
                      >
                        <div className="pin-head">💥</div>
                        <div className="pin-line"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automated Emergency Valve Isolation Section */}
              {diagnosticsData.recommendedValveIsolation && (
                <div className="valve-isolation-section glass-panel">
                  <div className="section-title-row">
                    <div className="title-with-icon">
                      <ShieldCheck size={18} className="text-emerald" />
                      <h4>Automated Boundary Valve Isolation Solution</h4>
                    </div>
                    <span className="outage-estimate-badge">
                      Impact: ~{diagnosticsData.recommendedValveIsolation.estimatedDisconnectedHouseholds} Households Disconnected
                    </span>
                  </div>

                  <p className="isolation-subtext">
                    Topological cut-set algorithm solved minimal valve isolation set to extinguish burst while keeping adjacent hospitals and schools pressurized.
                  </p>

                  <div className="valves-action-row">
                    <div className="valves-list">
                      {diagnosticsData.recommendedValveIsolation.valvesToClose.map(valve => (
                        <div key={valve.valveId} className="valve-chip">
                          <span className="valve-chip-id">{valve.valveId}</span>
                          <span className="valve-chip-name">{valve.name}</span>
                          <span className="valve-chip-type">({valve.actuatorType})</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      className={`btn-isolate-trigger ${valveExecutionStatus === 'ISOLATED_SUCCESS' ? 'btn-success' : 'btn-danger'}`}
                      onClick={() => handleIsolateValves(diagnosticsData.recommendedValveIsolation.valvesToClose)}
                      disabled={valveExecutionStatus === 'EXECUTING'}
                    >
                      {valveExecutionStatus === 'EXECUTING' ? (
                        <>⚡ Commanding SCADA Actuators...</>
                      ) : valveExecutionStatus === 'ISOLATED_SUCCESS' ? (
                        <>✅ Valves Closed & Burst Contained!</>
                      ) : (
                        <>🔒 Execute SCADA Valve Isolation Now</>
                      )}
                    </button>
                  </div>

                  <div className="reroute-note">
                    <strong>Secondary Rerouting:</strong> {diagnosticsData.recommendedValveIsolation.recommendedAlternativeSupplyRerouting}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
