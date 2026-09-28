import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  TrendingDown, 
  CheckCircle, 
  AlertCircle, 
  Droplet, 
  DollarSign, 
  Leaf, 
  BarChart3, 
  Layers, 
  ArrowDownRight,
  Info
} from 'lucide-react';

export default function WaterBalanceAnalytics({ dmas = [] }) {
  const [selectedDmaId, setSelectedDmaId] = useState('ALL');
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/water-balance?dmaId=${selectedDmaId}`)
      .then(res => res.json())
      .then(data => {
        setBalanceData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching water balance:', err);
        setLoading(false);
      });
  }, [selectedDmaId]);

  return (
    <div className="water-balance-container">
      {/* Header & Sector Filter */}
      <div className="analytics-header glass-panel">
        <div>
          <h2><BarChart3 className="text-cyan inline-icon" size={22} /> IWA Standard Water Balance & Non-Revenue Water (NRW) Audit</h2>
          <p className="subtitle">International Water Association (IWA) standardized volume accounting & loss breakdown</p>
        </div>

        <div className="sector-pill-selector">
          <button 
            className={`sector-pill ${selectedDmaId === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedDmaId('ALL')}
          >
            Citywide Network
          </button>
          {dmas.map(d => (
            <button 
              key={d.id} 
              className={`sector-pill ${selectedDmaId === d.id ? 'active' : ''}`}
              onClick={() => setSelectedDmaId(d.id)}
            >
              {d.name.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {loading || !balanceData ? (
        <div className="loading-state">Computing hydraulic mass balance...</div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="balance-kpi-grid">
            <div className="kpi-box glass-panel">
              <span className="kpi-label">Current NRW Ratio</span>
              <div className="kpi-val-row">
                <span className={`kpi-big ${balanceData.nrwPercent > balanceData.targetNRWPercent ? 'text-red' : 'text-emerald'}`}>
                  {balanceData.nrwPercent}%
                </span>
                <span className="kpi-badge">Target: {balanceData.targetNRWPercent}%</span>
              </div>
              <span className="kpi-sub">Total unaccounted non-revenue water</span>
            </div>

            <div className="kpi-box glass-panel">
              <span className="kpi-label">Infrastructure Leakage Index (ILI)</span>
              <div className="kpi-val-row">
                <span className="kpi-big text-cyan">{balanceData.infrastructureLeakageIndex}</span>
                <span className={`status-pill ${balanceData.infrastructureLeakageIndex > 3.0 ? 'WARNING' : 'NORMAL'}`}>
                  {balanceData.infrastructureLeakageIndex > 3.0 ? 'Band C (Poor)' : 'Band A (Excellent)'}
                </span>
              </div>
              <span className="kpi-sub">Ratio of Current Real Loss to Unavoidable Loss</span>
            </div>

            <div className="kpi-box glass-panel">
              <span className="kpi-label">Daily Revenue Deficit</span>
              <div className="kpi-val-row">
                <span className="kpi-big text-amber">${balanceData.estimatedDailyRevenueLossUSD.toLocaleString()}</span>
                <span className="kpi-unit">/ day</span>
              </div>
              <span className="kpi-sub">Calculated at standard $1.85/m³ tariff</span>
            </div>

            <div className="kpi-box glass-panel">
              <span className="kpi-label">Wasted Carbon Footprint</span>
              <div className="kpi-val-row">
                <span className="kpi-big text-purple">{balanceData.dailyCarbonLossKgCO2e.toLocaleString()}</span>
                <span className="kpi-unit">kg CO₂e</span>
              </div>
              <span className="kpi-sub">Pumping & chemical treatment emissions</span>
            </div>
          </div>

          {/* IWA Standard Hierarchical Sankey Flow Breakdown */}
          <div className="sankey-panel glass-panel">
            <div className="panel-title-bar">
              <h3><Layers size={18} className="text-cyan" /> System Input Volume (SIV) Flow Breakdown</h3>
              <span className="badge-info">IWA Standard Matrix</span>
            </div>

            <div className="sankey-flow-wrapper">
              {/* Level 1: System Input Volume */}
              <div className="sankey-level level-1">
                <div className="sankey-block bg-blue">
                  <span className="block-title">System Input Volume (SIV)</span>
                  <span className="block-volume">{balanceData.systemInputVolumeM3d.toLocaleString()} m³/d</span>
                  <span className="block-pct">100% Total Water Supplied</span>
                </div>
              </div>

              {/* Level 2: Authorized vs Losses */}
              <div className="sankey-level level-2">
                <div className="sankey-block bg-emerald">
                  <span className="block-title">Authorized Consumption</span>
                  <span className="block-volume">{balanceData.authorizedConsumptionM3d.toLocaleString()} m³/d</span>
                  <span className="block-pct">
                    {((balanceData.authorizedConsumptionM3d / balanceData.systemInputVolumeM3d) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="sankey-block bg-red">
                  <span className="block-title">Water Losses</span>
                  <span className="block-volume">{balanceData.waterLossesM3d.toLocaleString()} m³/d</span>
                  <span className="block-pct">
                    {((balanceData.waterLossesM3d / balanceData.systemInputVolumeM3d) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Level 3: Detailed Breakdown */}
              <div className="sankey-level level-3">
                <div className="sankey-block sub-block bg-emerald-dim">
                  <span className="block-title">Billed Authorized</span>
                  <span className="block-volume">{balanceData.billedAuthorizedM3d.toLocaleString()} m³/d</span>
                  <span className="block-note">Revenue Water</span>
                </div>
                <div className="sankey-block sub-block bg-yellow-dim">
                  <span className="block-title">Unbilled Authorized</span>
                  <span className="block-volume">{balanceData.unbilledAuthorizedM3d.toLocaleString()} m³/d</span>
                  <span className="block-note">Firefighting & Flushing</span>
                </div>
                <div className="sankey-block sub-block bg-orange-dim">
                  <span className="block-title">Apparent Commercial Losses</span>
                  <span className="block-volume">{balanceData.apparentLossesM3d.toLocaleString()} m³/d</span>
                  <span className="block-note">Meter Error & Tampering</span>
                </div>
                <div className="sankey-block sub-block bg-red-dim">
                  <span className="block-title">Real Physical Losses</span>
                  <span className="block-volume">{balanceData.realLossesM3d.toLocaleString()} m³/d</span>
                  <span className="block-note">Pipe Bursts & Micro-leaks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Minimum Night Flow (MNF) Analysis Section */}
          <div className="mnf-analysis-grid">
            <div className="mnf-panel glass-panel">
              <div className="panel-title-bar">
                <h3><Droplet size={18} className="text-cyan" /> Minimum Night Flow (MNF) Nocturnal Leak Analyzer</h3>
                <span className="badge-time">02:00 AM - 04:00 AM Evaluation Window</span>
              </div>
              <p className="mnf-description">
                During 02:00-04:00 AM, legitimate consumer consumption hits diurnal minimum. 
                Any elevation in baseline flow represents background hidden transmission leakage.
              </p>

              <div className="mnf-bars">
                <div className="mnf-bar-row">
                  <div className="mnf-bar-label">
                    <span>Legitimate Night Consumption</span>
                    <strong>48.2 m³/h</strong>
                  </div>
                  <div className="mnf-bar-track">
                    <div className="mnf-bar-fill bg-cyan" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div className="mnf-bar-row">
                  <div className="mnf-bar-label">
                    <span>Background Infrastructure Leakage (Excess MNF)</span>
                    <strong className="text-red">94.8 m³/h</strong>
                  </div>
                  <div className="mnf-bar-track">
                    <div className="mnf-bar-fill bg-red" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sector NRW Comparison */}
            <div className="sector-compare-panel glass-panel">
              <div className="panel-title-bar">
                <h3><TrendingDown size={18} className="text-emerald" /> DMA Sector NRW Benchmark</h3>
              </div>

              <div className="sector-table">
                {dmas.map(dma => (
                  <div key={dma.id} className="sector-row">
                    <div className="sector-name-col">
                      <span className="dma-color-dot" style={{ background: dma.color }}></span>
                      <span>{dma.name.split(':')[0]}</span>
                    </div>
                    <div className="sector-val-col">
                      <span className={dma.currentNRWPercent > dma.targetNRWPercent ? 'text-red font-bold' : 'text-emerald'}>
                        {dma.currentNRWPercent}%
                      </span>
                      <small className="text-muted">Target: {dma.targetNRWPercent}%</small>
                    </div>
                    <div className="sector-progress-col">
                      <div className="progress-track">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${Math.min(100, (dma.currentNRWPercent / 25) * 100)}%`,
                            background: dma.color
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
