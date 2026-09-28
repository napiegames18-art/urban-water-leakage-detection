import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Layers, 
  Radio, 
  Sliders, 
  Droplet, 
  ShieldAlert, 
  CheckCircle, 
  Info, 
  Compass, 
  Zap, 
  Filter,
  Eye,
  RefreshCw
} from 'lucide-react';

export default function DigitalTwinMap({ 
  networkData, 
  onSelectPipe, 
  onToggleValve, 
  onInjectIncident, 
  onOpenDiagnoseModal,
  selectedPipeId 
}) {
  const [activeLayer, setActiveLayer] = useState('ALL'); // ALL, PRESSURE, ACOUSTIC, RISK, VALVES
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedPipe, setSelectedPipe] = useState(null);
  const [filterDma, setFilterDma] = useState('ALL');

  if (!networkData) {
    return (
      <div className="digital-map-loading">
        <RefreshCw className="spin" size={32} />
        <p>Streaming Digital Twin Hydraulic Topology...</p>
      </div>
    );
  }

  const { nodes = [], pipes = [], valves = [], dmas = [], activeIncidents = [] } = networkData;

  const handlePipeClick = (pipe) => {
    setSelectedPipe(pipe);
    setSelectedNode(null);
    if (onSelectPipe) onSelectPipe(pipe);
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setSelectedPipe(null);
  };

  // Filter pipes and nodes based on DMA selection
  const filteredPipes = filterDma === 'ALL' ? pipes : pipes.filter(p => p.dma === filterDma);
  const filteredNodes = filterDma === 'ALL' ? nodes : nodes.filter(n => n.dma === filterDma || n.type === 'reservoir');

  const getNodeColor = (node) => {
    if (node.type === 'reservoir') return '#38bdf8'; // light sky blue
    if (node.type === 'pump') return '#f59e0b'; // amber
    if (node.type === 'prv') return '#ec4899'; // pink
    if (node.livePressureBar < 2.5) return '#ef4444'; // low pressure warning
    return '#10b981'; // normal green
  };

  const getPipeStrokeColor = (pipe) => {
    if (pipe.status === 'CRITICAL_BURST') return '#ef4444'; // Bright Red
    if (pipe.status === 'WARNING_LEAK') return '#f97316'; // Vivid Orange
    
    if (activeLayer === 'ACOUSTIC') {
      return pipe.acousticDb > 55 ? '#ef4444' : pipe.acousticDb > 40 ? '#f59e0b' : '#06b6d4';
    }
    if (activeLayer === 'RISK') {
      return pipe.riskScore >= 75 ? '#dc2626' : pipe.riskScore >= 50 ? '#f97316' : '#10b981';
    }
    if (activeLayer === 'PRESSURE') {
      return pipe.currentPressureDropBar > 0.5 ? '#e11d48' : '#3b82f6';
    }
    
    // Default DMA themed or status
    const dma = dmas.find(d => d.id === pipe.dma);
    return dma ? dma.color : '#0284c7';
  };

  return (
    <div className="digital-twin-container">
      {/* Map Header Controls */}
      <div className="map-toolbar glass-panel">
        <div className="toolbar-section">
          <span className="toolbar-title">
            <Compass size={18} className="icon-pulse" /> Digital Twin Network Canvas
          </span>
          <span className="live-badge">
            <span className="pulse-dot"></span> LIVE TELEMETRY
          </span>
        </div>

        <div className="toolbar-actions">
          {/* Layer Selector */}
          <div className="layer-pills">
            <button 
              className={`layer-pill ${activeLayer === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveLayer('ALL')}
            >
              <Layers size={14} /> Full GIS
            </button>
            <button 
              className={`layer-pill ${activeLayer === 'ACOUSTIC' ? 'active' : ''}`}
              onClick={() => setActiveLayer('ACOUSTIC')}
            >
              <Radio size={14} /> Acoustic Heatmap
            </button>
            <button 
              className={`layer-pill ${activeLayer === 'PRESSURE' ? 'active' : ''}`}
              onClick={() => setActiveLayer('PRESSURE')}
            >
              <Activity size={14} /> Pressure Drop
            </button>
            <button 
              className={`layer-pill ${activeLayer === 'RISK' ? 'active' : ''}`}
              onClick={() => setActiveLayer('RISK')}
            >
              <ShieldAlert size={14} /> Pipe Risk Index
            </button>
          </div>

          {/* DMA Filter */}
          <div className="dma-filter-group">
            <Filter size={14} />
            <select value={filterDma} onChange={(e) => setFilterDma(e.target.value)} className="dma-select">
              <option value="ALL">All DMA Sectors (Citywide)</option>
              {dmas.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Vector Map SVG & Interactive Overlay */}
      <div className="map-canvas-wrapper">
        <svg viewBox="100 80 840 550" className="network-svg-canvas">
          <defs>
            {/* Background Grid */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>
            
            {/* Glowing filter for leaks */}
            <filter id="glow-red" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="glow-orange" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Pulsing animation for active leak waves */}
            <radialGradient id="burst-pulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.9)" />
              <stop offset="60%" stopColor="rgba(239, 68, 68, 0.3)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect x="100" y="80" width="840" height="550" fill="url(#grid)" />

          {/* Sector Boundary Zones */}
          <g className="dma-zones-underlay" opacity="0.15">
            <rect x="150" y="100" width="310" height="420" rx="20" fill="#06b6d4" stroke="#06b6d4" strokeDasharray="6,6" />
            <text x="170" y="125" fill="#06b6d4" fontSize="11" fontWeight="bold" letterSpacing="1">DMA-01: DOWNTOWN CIVIC</text>

            <rect x="480" y="140" width="240" height="320" rx="20" fill="#3b82f6" stroke="#3b82f6" strokeDasharray="6,6" />
            <text x="500" y="165" fill="#3b82f6" fontSize="11" fontWeight="bold" letterSpacing="1">DMA-02: NORTH METRO</text>

            <rect x="360" y="440" width="320" height="170" rx="20" fill="#8b5cf6" stroke="#8b5cf6" strokeDasharray="6,6" />
            <text x="380" y="600" fill="#8b5cf6" fontSize="11" fontWeight="bold" letterSpacing="1">DMA-03: INDUSTRIAL EAST</text>

            <rect x="710" y="120" width="220" height="400" rx="20" fill="#10b981" stroke="#10b981" strokeDasharray="6,6" />
            <text x="730" y="145" fill="#10b981" fontSize="11" fontWeight="bold" letterSpacing="1">DMA-04: SUBURBAN HILLSIDE</text>
          </g>

          {/* Pipeline Edges */}
          <g className="pipes-group">
            {filteredPipes.map(pipe => {
              const nodeFrom = nodes.find(n => n.id === pipe.from);
              const nodeTo = nodes.find(n => n.id === pipe.to);
              if (!nodeFrom || !nodeTo) return null;

              const isSelected = selectedPipe && selectedPipe.id === pipe.id;
              const isBurst = pipe.status === 'CRITICAL_BURST';
              const isLeak = pipe.status === 'WARNING_LEAK';
              const strokeColor = getPipeStrokeColor(pipe);
              const strokeWidth = Math.max(3, Math.min(8, (pipe.diameterMm / 80)));

              const midX = (nodeFrom.x + nodeTo.x) / 2;
              const midY = (nodeFrom.y + nodeTo.y) / 2;

              return (
                <g key={pipe.id} className="pipe-element" onClick={() => handlePipeClick(pipe)}>
                  {/* Outer selection glow */}
                  {isSelected && (
                    <line
                      x1={nodeFrom.x}
                      y1={nodeFrom.y}
                      x2={nodeTo.x}
                      y2={nodeTo.y}
                      stroke="#38bdf8"
                      strokeWidth={strokeWidth + 8}
                      strokeOpacity="0.4"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Base Pipe Line */}
                  <line
                    x1={nodeFrom.x}
                    y1={nodeFrom.y}
                    x2={nodeTo.x}
                    y2={nodeTo.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    filter={isBurst ? 'url(#glow-red)' : isLeak ? 'url(#glow-orange)' : undefined}
                    className={isBurst ? 'pipe-burst-line' : isLeak ? 'pipe-leak-line' : 'pipe-normal-line'}
                  />

                  {/* Dynamic Flow Particles Animation */}
                  <line
                    x1={nodeFrom.x}
                    y1={nodeFrom.y}
                    x2={nodeTo.x}
                    y2={nodeTo.y}
                    stroke="rgba(255, 255, 255, 0.7)"
                    strokeWidth={Math.max(1.5, strokeWidth * 0.35)}
                    strokeDasharray="4, 16"
                    strokeDashoffset={isBurst ? "-50" : "-20"}
                    className="flow-animation-dash"
                  />

                  {/* Pipe Label Tag */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect 
                      x="-20" 
                      y="-9" 
                      width="40" 
                      height="18" 
                      rx="4" 
                      fill="rgba(15, 23, 42, 0.85)" 
                      stroke={strokeColor}
                      strokeWidth="1"
                    />
                    <text 
                      x="0" 
                      y="3.5" 
                      textAnchor="middle" 
                      fill="#e2e8f0" 
                      fontSize="9" 
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {pipe.id}
                    </text>
                  </g>

                  {/* Active Leak Wave Pulse */}
                  {(isBurst || isLeak) && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <circle r="22" fill="url(#burst-pulse)" className="burst-ping" />
                      <circle r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                      <text x="14" y="-12" fill="#ef4444" fontSize="10" fontWeight="bold" filter="url(#glow-red)">
                        {isBurst ? '💥 BURST -145m³/h' : '⚠️ LEAK -38.5m³/h'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Isolation Valves on Pipes */}
          <g className="valves-group">
            {valves.map(valve => {
              const isClosed = valve.status === 'CLOSED';
              return (
                <g 
                  key={valve.id} 
                  transform={`translate(${valve.x}, ${valve.y})`}
                  className="valve-node"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleValve) onToggleValve(valve.id);
                  }}
                >
                  <circle 
                    r="8" 
                    fill={isClosed ? '#ef4444' : '#10b981'} 
                    stroke="#ffffff" 
                    strokeWidth="1.5"
                  />
                  <text 
                    x="0" 
                    y="3" 
                    textAnchor="middle" 
                    fill="#ffffff" 
                    fontSize="7" 
                    fontWeight="bold"
                  >
                    {isClosed ? 'X' : 'V'}
                  </text>
                  <text 
                    x="0" 
                    y="17" 
                    textAnchor="middle" 
                    fill={isClosed ? '#f87171' : '#94a3b8'} 
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    {valve.id}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Network Nodes (Reservoirs, PRVs, Pumps, Junctions) */}
          <g className="nodes-group">
            {filteredNodes.map(node => {
              const isSelected = selectedNode && selectedNode.id === node.id;
              const nodeColor = getNodeColor(node);
              const isReservoir = node.type === 'reservoir';
              const isPump = node.type === 'pump';
              const isPRV = node.type === 'prv';

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  className="node-element"
                  onClick={() => handleNodeClick(node)}
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle r="18" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4,4" className="spin-slow" />
                  )}

                  {/* Node Shape */}
                  {isReservoir ? (
                    <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
                  ) : isPump ? (
                    <polygon points="0,-13 13,11 -13,11" fill="#b45309" stroke="#f59e0b" strokeWidth="2" />
                  ) : isPRV ? (
                    <rect x="-10" y="-10" width="20" height="20" transform="rotate(45)" fill="#be185d" stroke="#ec4899" strokeWidth="2" />
                  ) : (
                    <circle r="8" fill="#1e293b" stroke={nodeColor} strokeWidth="2.5" />
                  )}

                  {/* Node Symbol/Icon text */}
                  <text 
                    x="0" 
                    y="3" 
                    textAnchor="middle" 
                    fill="#ffffff" 
                    fontSize={isReservoir ? '9' : '8'} 
                    fontWeight="bold"
                  >
                    {isReservoir ? 'RES' : isPump ? 'P' : isPRV ? 'PRV' : 'J'}
                  </text>

                  {/* Node Label */}
                  <text 
                    x="0" 
                    y="-16" 
                    textAnchor="middle" 
                    fill="#cbd5e1" 
                    fontSize="8.5" 
                    fontWeight="600"
                    className="node-label-shadow"
                  >
                    {node.id}
                  </text>

                  {/* Pressure Bubble */}
                  <g transform="translate(0, 18)">
                    <rect x="-16" y="-6" width="32" height="12" rx="3" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(255, 255, 255, 0.15)" />
                    <text x="0" y="3" textAnchor="middle" fill="#38bdf8" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
                      {node.livePressureBar} bar
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend Panel */}
        <div className="map-legend glass-panel">
          <div className="legend-title">Topology Key</div>
          <div className="legend-items">
            <div className="legend-item"><span className="legend-symbol res"></span> Reservoir / Tank</div>
            <div className="legend-item"><span className="legend-symbol pump"></span> Booster Pump</div>
            <div className="legend-item"><span className="legend-symbol prv"></span> Pressure Reducing Valve</div>
            <div className="legend-item"><span className="legend-symbol burst"></span> Critical Burst (Red)</div>
            <div className="legend-item"><span className="legend-symbol leak"></span> Micro-Leak (Orange)</div>
            <div className="legend-item"><span className="legend-symbol valve-open"></span> Valve Open (Click to Close)</div>
          </div>
        </div>
      </div>

      {/* Selected Element Telemetry & AI Diagnostic Drawer */}
      {(selectedPipe || selectedNode) && (
        <div className="inspection-drawer glass-panel slide-up">
          <div className="drawer-header">
            <div className="drawer-title-group">
              <span className="drawer-type-badge">
                {selectedPipe ? 'PIPELINE SEGMENT INSPECTION' : 'JUNCTION & SENSOR NODE INSPECTION'}
              </span>
              <h3>{selectedPipe ? `Pipe Segment ${selectedPipe.id} (${selectedPipe.material})` : `${selectedNode.id} - ${selectedNode.name}`}</h3>
            </div>
            <button className="drawer-close-btn" onClick={() => { setSelectedPipe(null); setSelectedNode(null); }}>✕</button>
          </div>

          <div className="drawer-body">
            {selectedPipe && (
              <div className="pipe-detail-grid">
                <div className="detail-card">
                  <span className="detail-label">Current Flow</span>
                  <span className="detail-value text-cyan">{selectedPipe.currentFlowM3h} <small>m³/h</small></span>
                  <span className="detail-sub">Base: {selectedPipe.baseFlowM3h} m³/h</span>
                </div>

                <div className="detail-card">
                  <span className="detail-label">Pressure Drop</span>
                  <span className={`detail-value ${selectedPipe.currentPressureDropBar > 0.5 ? 'text-red' : 'text-blue'}`}>
                    {selectedPipe.currentPressureDropBar} <small>bar</small>
                  </span>
                  <span className="detail-sub">ΔP gradient along {selectedPipe.lengthM}m</span>
                </div>

                <div className="detail-card">
                  <span className="detail-label">Acoustic Vibration</span>
                  <span className={`detail-value ${selectedPipe.acousticDb > 55 ? 'text-orange' : 'text-emerald'}`}>
                    {selectedPipe.acousticDb} <small>dB</small>
                  </span>
                  <span className="detail-sub">Peak: {selectedPipe.peakFreqHz} Hz</span>
                </div>

                <div className="detail-card">
                  <span className="detail-label">Asset Risk Score</span>
                  <span className={`detail-value ${selectedPipe.riskScore >= 75 ? 'text-red' : 'text-yellow'}`}>
                    {selectedPipe.riskScore} <small>/100</small>
                  </span>
                  <span className="detail-sub">Age: {2026 - selectedPipe.installedYear} yrs ({selectedPipe.material})</span>
                </div>

                <div className="detail-card full-width ai-summary-card">
                  <div className="ai-header">
                    <Zap size={16} className="text-cyan" />
                    <span>AI Diagnostic Evaluation</span>
                    <span className={`status-pill ${selectedPipe.status}`}>
                      {selectedPipe.status === 'CRITICAL_BURST' ? 'CRITICAL PIPE BURST' : selectedPipe.status === 'WARNING_LEAK' ? 'UNDERGROUND LEAK DETECTED' : 'NOMINAL LAMINAR FLOW'}
                    </span>
                  </div>
                  <p className="ai-report-text">
                    {selectedPipe.activeIncident 
                      ? selectedPipe.activeIncident.aiDiagnosis 
                      : `Acoustic hydrophones record stationary noise (${selectedPipe.acousticDb} dB) well within normal fluid parameters. Pressure wave velocity corresponds to structural standard for ${selectedPipe.material}.`}
                  </p>
                  <div className="drawer-actions">
                    <button 
                      className="btn-action btn-primary"
                      onClick={() => onOpenDiagnoseModal && onOpenDiagnoseModal(selectedPipe.id)}
                    >
                      <Activity size={14} /> Multi-Model AI Diagnostic & Valve Solver
                    </button>
                    {selectedPipe.status === 'NORMAL' && (
                      <button 
                        className="btn-action btn-danger-outline"
                        onClick={() => onInjectIncident && onInjectIncident({ type: 'PIPE_BURST_CRITICAL', targetPipeId: selectedPipe.id })}
                      >
                        <AlertTriangle size={14} /> Simulate Burst on this Pipe
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedNode && (
              <div className="node-detail-grid">
                <div className="detail-card">
                  <span className="detail-label">Live Node Pressure</span>
                  <span className="detail-value text-cyan">{selectedNode.livePressureBar} <small>bar</small></span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">Elevation</span>
                  <span className="detail-value text-slate">{selectedNode.elevationM || 18} <small>meters</small></span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">Water Turbidity</span>
                  <span className="detail-value text-emerald">{selectedNode.turbidityNtu} <small>NTU</small></span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">Free Chlorine</span>
                  <span className="detail-value text-blue">{selectedNode.chlorinePpm} <small>ppm</small></span>
                </div>
                <div className="detail-card full-width">
                  <span className="detail-label">Installed Instrumentation</span>
                  <span className="detail-text">{selectedNode.sensorInstalled || 'Telemetry Cluster PS & MagFlow'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
