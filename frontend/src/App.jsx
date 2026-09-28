import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Activity, 
  BarChart3, 
  Users, 
  ShieldAlert, 
  Zap, 
  Wrench, 
  Bot, 
  Droplets, 
  AlertTriangle, 
  RotateCcw,
  CheckCircle2,
  RefreshCw,
  Bell
} from 'lucide-react';

import DigitalTwinMap from './components/DigitalTwinMap';
import LeakDetectionHub from './components/LeakDetectionHub';
import WaterBalanceAnalytics from './components/WaterBalanceAnalytics';
import SmartMeterMonitoring from './components/SmartMeterMonitoring';
import PipeRiskPredictor from './components/PipeRiskPredictor';
import SimulationControls from './components/SimulationControls';
import WorkOrdersModal from './components/WorkOrdersModal';
import AICopilotDrawer from './components/AICopilotDrawer';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('MAP'); // MAP, LEAKS, WATER_BALANCE, SMART_METERS, PIPE_RISK, SIMULATION
  const [networkData, setNetworkData] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWorkOrdersOpen, setIsWorkOrdersOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [selectedPipeId, setSelectedPipeId] = useState(null);

  const fetchFullState = () => {
    Promise.all([
      fetch('/api/network').then(r => r.json()),
      fetch('/api/overview').then(r => r.json())
    ])
      .then(([net, over]) => {
        setNetworkData(net);
        setOverviewData(over);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error polling telemetry:', err);
        setLoading(false);
      });
  };

  // Poll live telemetry every 4 seconds
  useEffect(() => {
    fetchFullState();
    const interval = setInterval(fetchFullState, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleValve = (valveId) => {
    fetch('/api/valve/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valveId })
    })
      .then(res => res.json())
      .then(() => fetchFullState());
  };

  const handleInjectIncident = (payload) => {
    fetch('/api/simulate/incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        fetchFullState();
        if (payload.type?.includes('BURST') || payload.type?.includes('LEAK')) {
          setActiveTab('LEAKS');
        } else if (payload.meterId) {
          setActiveTab('SMART_METERS');
        }
      });
  };

  const handleResetSimulation = () => {
    fetch('/api/simulate/reset', { method: 'POST' })
      .then(res => res.json())
      .then(() => fetchFullState());
  };

  const handleOpenDiagnoseModal = (pipeId) => {
    setSelectedPipeId(pipeId);
    setActiveTab('LEAKS');
  };

  const activeIncidents = networkData?.activeIncidents?.filter(i => i.status !== 'RESOLVED') || [];
  const kpis = overviewData?.kpis || {};

  return (
    <div className="app-layout">
      {/* Top Mission Control Header */}
      <header className="mission-control-header glass-panel">
        <div className="header-left">
          <div className="brand-badge">
            <Droplets className="text-cyan brand-icon" size={26} />
            <div>
              <div className="brand-title">
                AQUA<span className="text-cyan">INTEL</span> AI
              </div>
              <div className="brand-sub">Urban Water Leakage & Abnormal Consumption Detection</div>
            </div>
          </div>
          <span className="live-status-pill">
            <span className="pulse-dot"></span> SCADA & SENSOR TELEMETRY LIVE
          </span>
        </div>

        {/* Live Loss & KPI Ticker */}
        <div className="header-ticker">
          <div className="ticker-item">
            <span className="ticker-label">Non-Revenue Water</span>
            <span className={`ticker-val ${kpis.nrwPercent > 10 ? 'text-red' : 'text-emerald'}`}>
              {kpis.nrwPercent || 14.8}%
            </span>
          </div>
          <div className="ticker-divider"></div>
          <div className="ticker-item">
            <span className="ticker-label">Active Loss Rate</span>
            <span className="ticker-val text-cyan">
              {kpis.currentRealLossRateM3h || 0} <small>m³/h</small>
            </span>
          </div>
          <div className="ticker-divider"></div>
          <div className="ticker-item">
            <span className="ticker-label">Daily Revenue Deficit</span>
            <span className="ticker-val text-amber">
              ${(kpis.dailyRevenueLossUsd || 0).toLocaleString()}
            </span>
          </div>
          <div className="ticker-divider"></div>
          <div className="ticker-item">
            <span className="ticker-label">Active Incidents</span>
            <span className={`ticker-val ${activeIncidents.length > 0 ? 'text-red' : 'text-emerald'}`}>
              {activeIncidents.length}
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="header-actions">
          <button 
            className={`btn-action-header ${activeIncidents.length > 0 ? 'has-alerts' : ''}`}
            onClick={() => setIsWorkOrdersOpen(true)}
          >
            <Wrench size={16} /> Dispatch Queue
            {overviewData?.recentWorkOrders?.length > 0 && (
              <span className="alert-count">{overviewData.recentWorkOrders.length}</span>
            )}
          </button>

          <button 
            className={`btn-action-header btn-copilot ${isCopilotOpen ? 'active' : ''}`}
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          >
            <Bot size={16} /> AI Operations Copilot
          </button>
        </div>
      </header>

      {/* Emergency Alert Banner when active incidents exist */}
      {activeIncidents.length > 0 && (
        <div className="emergency-alert-strip">
          <div className="strip-content">
            <AlertTriangle className="text-red-light blink" size={18} />
            <span className="strip-text">
              <strong>CRITICAL HYDRAULIC ANOMALY:</strong> {activeIncidents[0].title} — Water loss of {activeIncidents[0].leakRateM3h} m³/h detected!
            </span>
            <button className="btn-strip-action" onClick={() => setActiveTab('LEAKS')}>
              Inspect AI Localization & Isolate Valves →
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <nav className="main-nav-bar glass-panel">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'MAP' ? 'active' : ''}`}
            onClick={() => setActiveTab('MAP')}
          >
            <Compass size={17} /> Digital Twin GIS Map
          </button>

          <button 
            className={`nav-tab ${activeTab === 'LEAKS' ? 'active' : ''}`}
            onClick={() => setActiveTab('LEAKS')}
          >
            <Activity size={17} /> AI Leak & Burst Hub
            {activeIncidents.length > 0 && (
              <span className="nav-badge-red">{activeIncidents.length}</span>
            )}
          </button>

          <button 
            className={`nav-tab ${activeTab === 'WATER_BALANCE' ? 'active' : ''}`}
            onClick={() => setActiveTab('WATER_BALANCE')}
          >
            <BarChart3 size={17} /> IWA Water Balance & NRW
          </button>

          <button 
            className={`nav-tab ${activeTab === 'SMART_METERS' ? 'active' : ''}`}
            onClick={() => setActiveTab('SMART_METERS')}
          >
            <Users size={17} /> Smart Meter (AMI) Profiler
          </button>

          <button 
            className={`nav-tab ${activeTab === 'PIPE_RISK' ? 'active' : ''}`}
            onClick={() => setActiveTab('PIPE_RISK')}
          >
            <ShieldAlert size={17} /> Pipe Risk & Asset Health
          </button>

          <button 
            className={`nav-tab ${activeTab === 'SIMULATION' ? 'active' : ''}`}
            onClick={() => setActiveTab('SIMULATION')}
          >
            <Zap size={17} /> Fault Injection Studio
          </button>
        </div>

        <div className="nav-extra-tools">
          <button className="btn-refresh" onClick={fetchFullState} title="Force Telemetry Sync">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </nav>

      {/* Main Dynamic View Content */}
      <main className="app-main-content">
        {loading && !networkData ? (
          <div className="master-loading">
            <RefreshCw className="spin text-cyan" size={48} />
            <h2>Connecting to Urban Water Digital Twin Telemetry Stream...</h2>
            <p>Initializing Hydrophones, Pressure Transducers & Smart Meter Network</p>
          </div>
        ) : (
          <>
            {activeTab === 'MAP' && (
              <DigitalTwinMap 
                networkData={networkData}
                onSelectPipe={(pipe) => setSelectedPipeId(pipe.id)}
                onToggleValve={handleToggleValve}
                onInjectIncident={handleInjectIncident}
                onOpenDiagnoseModal={handleOpenDiagnoseModal}
                selectedPipeId={selectedPipeId}
              />
            )}

            {activeTab === 'LEAKS' && (
              <LeakDetectionHub 
                incidents={networkData?.activeIncidents || []}
                pipes={networkData?.pipes || []}
                onToggleValve={handleToggleValve}
                onOpenWorkOrders={() => setIsWorkOrdersOpen(true)}
              />
            )}

            {activeTab === 'WATER_BALANCE' && (
              <WaterBalanceAnalytics dmas={networkData?.dmas || []} />
            )}

            {activeTab === 'SMART_METERS' && (
              <SmartMeterMonitoring onInjectMeterAnomaly={handleInjectIncident} />
            )}

            {activeTab === 'PIPE_RISK' && (
              <PipeRiskPredictor onSelectPipe={(pipe) => { setSelectedPipeId(pipe.id); setActiveTab('MAP'); }} />
            )}

            {activeTab === 'SIMULATION' && (
              <SimulationControls 
                onInjectIncident={handleInjectIncident}
                onResetSimulation={handleResetSimulation}
                pipes={networkData?.pipes || []}
                smartMeters={networkData?.smartMeters || []}
              />
            )}
          </>
        )}
      </main>

      {/* Emergency Work Orders Modal */}
      <WorkOrdersModal 
        isOpen={isWorkOrdersOpen}
        onClose={() => setIsWorkOrdersOpen(false)}
        onRefreshData={fetchFullState}
      />

      {/* AI Copilot Drawer */}
      <AICopilotDrawer 
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
}