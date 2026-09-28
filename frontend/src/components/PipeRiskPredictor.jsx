import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Calendar, 
  Wrench, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  ArrowUpRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function PipeRiskPredictor({ onSelectPipe }) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRiskCategory, setSelectedRiskCategory] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    fetch('/api/pipe-risks')
      .then(res => res.json())
      .then(data => {
        setRiskData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching pipe risks:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !riskData) {
    return <div className="loading-state">Evaluating Pipeline Deterioration & Weibull Hazard Indices...</div>;
  }

  const { totalPipes, pipes = [] } = riskData;

  const filteredPipes = selectedRiskCategory === 'ALL' 
    ? pipes 
    : pipes.filter(p => p.riskCategory === selectedRiskCategory);

  const criticalCount = pipes.filter(p => p.riskScore >= 75).length;
  const watchCount = pipes.filter(p => p.riskScore >= 50 && p.riskScore < 75).length;
  const lowCount = pipes.filter(p => p.riskScore < 50).length;

  return (
    <div className="pipe-risk-container">
      {/* Header */}
      <div className="risk-header glass-panel">
        <div>
          <h2><ShieldAlert className="text-cyan inline-icon" size={22} /> Predictive Pipe Deterioration & Burst Risk Index</h2>
          <p className="subtitle">Physics-informed Weibull survival model accounting for material, pipe age, cyclic pressure, and soil corrosivity</p>
        </div>

        <div className="risk-filter-pills">
          <button 
            className={`risk-pill ${selectedRiskCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedRiskCategory('ALL')}
          >
            All Segments ({pipes.length})
          </button>
          <button 
            className={`risk-pill critical ${selectedRiskCategory === 'CRITICAL_REPLACE' ? 'active' : ''}`}
            onClick={() => setSelectedRiskCategory('CRITICAL_REPLACE')}
          >
            Critical Priority ({criticalCount})
          </button>
          <button 
            className={`risk-pill elevated ${selectedRiskCategory === 'ELEVATED_WATCH' ? 'active' : ''}`}
            onClick={() => setSelectedRiskCategory('ELEVATED_WATCH')}
          >
            Elevated Watch ({watchCount})
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="risk-kpi-row">
        <div className="metric-card glass-panel alert-glow">
          <div className="metric-icon-wrap bg-red-dim">
            <AlertTriangle size={22} className="text-red" />
          </div>
          <div className="metric-info">
            <span className="metric-label">High-Risk Burst Segments</span>
            <span className="metric-number text-red">{criticalCount}</span>
            <span className="metric-sub">Risk Score &gt; 75 / 100</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap bg-amber-dim">
            <Clock size={22} className="text-amber" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Average Pipeline Age</span>
            <span className="metric-number text-amber">21.4 <small>years</small></span>
            <span className="metric-sub">Oldest active: 37 years (1989)</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap bg-cyan-dim">
            <Wrench size={22} className="text-cyan" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Recommended CIPP Lining</span>
            <span className="metric-number text-cyan">4.8 <small>km</small></span>
            <span className="metric-sub">Priority renewal plan (FY2026-27)</span>
          </div>
        </div>
      </div>

      {/* Risk Matrix & Prioritization Table Grid */}
      <div className="risk-grid-layout">
        {/* Risk Prioritization Table */}
        <div className="risk-table-panel glass-panel">
          <div className="panel-title-bar">
            <h3><Layers size={18} className="text-cyan" /> Asset Health & Remaining Useful Life (RUL) Matrix</h3>
          </div>

          <div className="table-responsive">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Pipe ID</th>
                  <th>DMA</th>
                  <th>Material</th>
                  <th>Age</th>
                  <th>Soil Condition</th>
                  <th>Risk Score</th>
                  <th>Est. RUL</th>
                  <th>Action Strategy</th>
                </tr>
              </thead>
              <tbody>
                {filteredPipes.map(pipe => {
                  const isHigh = pipe.riskScore >= 75;
                  const isMedium = pipe.riskScore >= 50 && pipe.riskScore < 75;

                  return (
                    <tr key={pipe.id} className={isHigh ? 'row-critical' : isMedium ? 'row-warning' : ''}>
                      <td>
                        <strong className="mono-pipe">{pipe.id}</strong>
                      </td>
                      <td><span className="dma-tag">{pipe.dma}</span></td>
                      <td>{pipe.material} (Ø{pipe.diameterMm}mm)</td>
                      <td>{pipe.ageYears} yrs ({pipe.installedYear})</td>
                      <td>
                        <span className={`soil-tag ${pipe.soilType.includes('Corrosive') ? 'corrosive' : ''}`}>
                          {pipe.soilType}
                        </span>
                      </td>
                      <td>
                        <div className="risk-score-cell">
                          <span className={`score-num ${isHigh ? 'text-red' : isMedium ? 'text-yellow' : 'text-emerald'}`}>
                            {pipe.riskScore}
                          </span>
                          <div className="mini-progress">
                            <div 
                              className={`mini-fill ${isHigh ? 'bg-red' : isMedium ? 'bg-amber' : 'bg-emerald'}`}
                              style={{ width: `${pipe.riskScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong className={pipe.remainingLifeYears <= 5 ? 'text-red' : 'text-slate'}>
                          ~{pipe.remainingLifeYears} yrs
                        </strong>
                      </td>
                      <td>
                        <span className="action-text">{pipe.recommendedAction}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
