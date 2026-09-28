import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  Building2, 
  Home, 
  Factory, 
  Search, 
  Filter, 
  Send, 
  CheckCircle, 
  Activity, 
  ShieldAlert, 
  Clock, 
  Droplet,
  Sparkles
} from 'lucide-react';

export default function SmartMeterMonitoring({ onInjectMeterAnomaly }) {
  const [smartMetersData, setSmartMetersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [anomalyFilter, setAnomalyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifiedMeters, setNotifiedMeters] = useState({});

  const fetchMeters = () => {
    setLoading(true);
    fetch('/api/smart-meters')
      .then(res => res.json())
      .then(data => {
        setSmartMetersData(data);
        if (!selectedMeter && data.meters?.length > 0) {
          // Select first anomalous meter by default if available
          const firstAnomaly = data.meters.find(m => m.aiAnalysis?.anomalyType !== 'NORMAL');
          setSelectedMeter(firstAnomaly || data.meters[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching smart meters:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMeters();
  }, []);

  const handleSendNotification = (meterId) => {
    setNotifiedMeters(prev => ({ ...prev, [meterId]: 'SENT' }));
    setTimeout(() => {
      setNotifiedMeters(prev => ({ ...prev, [meterId]: 'CONFIRMED' }));
    }, 1500);
  };

  if (loading || !smartMetersData) {
    return <div className="loading-state">Streaming AMI Smart Meter Consumption Telemetry...</div>;
  }

  const { summary, meters = [] } = smartMetersData;

  // Filter meters
  const filteredMeters = meters.filter(m => {
    const matchesCategory = categoryFilter === 'ALL' || m.category === categoryFilter;
    const matchesAnomaly = anomalyFilter === 'ALL' || 
      (anomalyFilter === 'ANOMALY_ONLY' && m.aiAnalysis.anomalyType !== 'NORMAL') ||
      m.aiAnalysis.anomalyType === anomalyFilter;
    const matchesSearch = searchQuery === '' || 
      m.accountHolder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.meterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesAnomaly && matchesSearch;
  });

  const getCategoryIcon = (cat) => {
    if (cat === 'Residential') return <Home size={14} className="text-emerald" />;
    if (cat === 'Commercial') return <Building2 size={14} className="text-cyan" />;
    return <Factory size={14} className="text-purple" />;
  };

  const getAnomalyBadge = (type) => {
    switch (type) {
      case 'CONTINUOUS_LEAK':
        return <span className="anomaly-badge leak">⚠️ Continuous Micro-Leak</span>;
      case 'METER_TAMPERING_BYPASS':
        return <span className="anomaly-badge tamper">🚨 Suspected Meter Bypass</span>;
      case 'UNCHARACTERISTIC_SURGE':
        return <span className="anomaly-badge surge">💥 Uncharacteristic Surge</span>;
      case 'BACKFLOW_RISK':
        return <span className="anomaly-badge backflow">🛑 Backflow / Reverse Flow Risk</span>;
      default:
        return <span className="anomaly-badge normal">✅ Normal Profile</span>;
    }
  };

  return (
    <div className="smart-meters-container">
      {/* Overview Cards */}
      <div className="meter-metrics-row">
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap bg-blue-dim">
            <Users size={22} className="text-blue" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Monitored AMI Meters</span>
            <span className="metric-number text-blue">{summary.totalMeters}</span>
            <span className="metric-sub">100% AMI Telemetry Coverage</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap bg-red-dim">
            <AlertTriangle size={22} className="text-red" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Abnormal Consumption Alerts</span>
            <span className="metric-number text-red">{summary.anomalyCount}</span>
            <span className="metric-sub">{((summary.anomalyCount / summary.totalMeters) * 100).toFixed(1)}% anomaly rate</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap bg-cyan-dim">
            <Droplet size={22} className="text-cyan" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Consumer-Side Water Loss</span>
            <span className="metric-number text-cyan">{summary.estimatedCustomerLossM3d.toFixed(1)} <small>m³/d</small></span>
            <span className="metric-sub">${(summary.estimatedCustomerLossM3d * 1.85).toFixed(0)} / day customer cost</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="meters-filter-bar glass-panel">
        <div className="search-box">
          <Search size={16} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search account holder, address, or meter ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Categories</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
          </select>

          <select 
            value={anomalyFilter} 
            onChange={(e) => setAnomalyFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="ANOMALY_ONLY">Anomalies Only</option>
            <option value="CONTINUOUS_LEAK">Continuous Leaks</option>
            <option value="METER_TAMPERING_BYPASS">Meter Tampering</option>
            <option value="UNCHARACTERISTIC_SURGE">Surges</option>
            <option value="BACKFLOW_RISK">Backflow Risks</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Meters List + Detailed 24h Consumption Profiler */}
      <div className="smart-meters-grid">
        {/* Left List of Smart Meters */}
        <div className="meters-list-panel glass-panel">
          <div className="panel-header">
            <h3>Connected Smart Meters ({filteredMeters.length})</h3>
          </div>

          <div className="meters-scroll">
            {filteredMeters.map(meter => {
              const isSelected = selectedMeter && selectedMeter.meterId === meter.meterId;
              const hasAnomaly = meter.aiAnalysis.anomalyType !== 'NORMAL';

              return (
                <div 
                  key={meter.meterId}
                  className={`meter-card-item ${isSelected ? 'selected' : ''} ${hasAnomaly ? 'has-anomaly' : ''}`}
                  onClick={() => setSelectedMeter(meter)}
                >
                  <div className="meter-item-top">
                    <div className="category-tag">
                      {getCategoryIcon(meter.category)}
                      <span>{meter.category}</span>
                    </div>
                    <span className="meter-id-mono">{meter.meterId}</span>
                  </div>

                  <h4 className="holder-name">{meter.accountHolder}</h4>
                  <p className="address-text">{meter.address}</p>

                  <div className="meter-item-footer">
                    {getAnomalyBadge(meter.aiAnalysis.anomalyType)}
                    <span className="usage-today">
                      Today: <strong>{meter.todayUsageM3} m³</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail: 24-Hour Profile & AI Anomaly Diagnostic */}
        <div className="meter-detail-panel glass-panel">
          {selectedMeter ? (
            <div className="meter-detail-content">
              {/* Account Header */}
              <div className="detail-header-card">
                <div>
                  <span className="detail-category-label">
                    {getCategoryIcon(selectedMeter.category)} {selectedMeter.category} Sector Account
                  </span>
                  <h2>{selectedMeter.accountHolder}</h2>
                  <p className="detail-address-sub">{selectedMeter.address} • Connected Pipe: <code>{selectedMeter.pipeConnected}</code> ({selectedMeter.dma})</p>
                </div>

                <div className="usage-summary-badges">
                  <div className="badge-stat">
                    <span className="b-label">Daily Avg Baseline</span>
                    <span className="b-val">{selectedMeter.dailyAvgM3} m³</span>
                  </div>
                  <div className="badge-stat">
                    <span className="b-label">Today's Consumption</span>
                    <span className="b-val text-cyan">{selectedMeter.todayUsageM3} m³</span>
                  </div>
                </div>
              </div>

              {/* AI Diagnostic Report Banner */}
              <div className={`ai-meter-alert-box ${selectedMeter.aiAnalysis.anomalyType}`}>
                <div className="alert-box-top">
                  <div className="alert-title-row">
                    <Sparkles size={18} className="text-cyan" />
                    <h4>AI Consumption Classification & Diagnosis</h4>
                  </div>
                  <span className="confidence-pill">
                    {(selectedMeter.aiAnalysis.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>

                <p className="diagnostic-explanation">
                  {selectedMeter.description || selectedMeter.aiAnalysis.rationale}
                </p>

                {selectedMeter.aiAnalysis.anomalyType !== 'NORMAL' && (
                  <div className="action-row">
                    <button 
                      className={`btn-notify ${notifiedMeters[selectedMeter.meterId] ? 'btn-notified' : ''}`}
                      onClick={() => handleSendNotification(selectedMeter.meterId)}
                    >
                      {notifiedMeters[selectedMeter.meterId] === 'CONFIRMED' ? (
                        <>✅ Automated SMS / Push Notice Delivered</>
                      ) : notifiedMeters[selectedMeter.meterId] === 'SENT' ? (
                        <>⚡ Dispatching Customer Alert...</>
                      ) : (
                        <><Send size={14} /> Send Instant Anomaly Alert to Customer</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* 24-Hour Time-Series Bar Chart */}
              <div className="hourly-profile-section glass-panel">
                <div className="chart-header">
                  <h3><Activity size={16} className="text-cyan" /> 24-Hour Diurnal Flow Profile (m³/h)</h3>
                  <span className="time-window-pill">00:00 - 23:00 Hourly Interval</span>
                </div>

                <div className="hourly-chart-bars">
                  {selectedMeter.hourlyProfile24h.map((val, idx) => {
                    const isNight = idx >= 1 && idx <= 5;
                    const isNegative = val < 0;
                    const maxVal = Math.max(...selectedMeter.hourlyProfile24h, 1.0);
                    const barHeightPct = isNegative ? 15 : Math.max(8, Math.min(95, (val / maxVal) * 90));

                    return (
                      <div key={idx} className={`hour-column ${isNight ? 'night-hour' : ''}`}>
                        <div className="bar-wrapper">
                          <div 
                            className={`bar-fill ${isNegative ? 'negative-bar' : isNight && val > 0.08 ? 'leak-night-bar' : ''}`}
                            style={{ height: `${barHeightPct}%` }}
                            title={`Hour ${idx}:00 - ${val} m³/h`}
                          ></div>
                        </div>
                        <span className="hour-label">{idx < 10 ? `0${idx}` : idx}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="chart-legend">
                  <span className="legend-entry"><span className="legend-dot night"></span> Sleeping Window (01:00-05:00 AM)</span>
                  <span className="legend-entry"><span className="legend-dot leak"></span> Continuous Leak Flow</span>
                  <span className="legend-entry"><span className="legend-dot normal"></span> Standard Flow</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="select-prompt">Select a meter from the list to inspect consumption profiles.</div>
          )}
        </div>
      </div>
    </div>
  );
}
