import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Truck, 
  AlertOctagon, 
  ShieldAlert, 
  UserCheck,
  Check
} from 'lucide-react';

export default function WorkOrdersModal({ isOpen, onClose, onRefreshData }) {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkOrders = () => {
    setLoading(true);
    fetch('/api/work-orders')
      .then(res => res.json())
      .then(data => {
        setWorkOrders(data.workOrders || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching work orders:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) fetchWorkOrders();
  }, [isOpen]);

  const handleUpdateStatus = (woId, newStatus) => {
    fetch('/api/work-orders/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ woId, status: newStatus })
    })
      .then(res => res.json())
      .then(() => {
        fetchWorkOrders();
        if (onRefreshData) onRefreshData();
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Wrench size={20} className="text-cyan" />
            <h2>Emergency Dispatch & Field Work Orders</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">Loading Dispatch Queue...</div>
          ) : workOrders.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={40} className="text-emerald" />
              <h4>All Work Orders Resolved</h4>
              <p>No active repair tickets pending field crew dispatch.</p>
            </div>
          ) : (
            <div className="work-orders-list">
              {workOrders.map(wo => {
                const isCritical = wo.priority === 'P1_CRITICAL';
                return (
                  <div key={wo.id} className={`wo-card ${wo.status}`}>
                    <div className="wo-top">
                      <div className="wo-id-badge">
                        <span className="wo-id">{wo.id}</span>
                        <span className={`priority-badge ${isCritical ? 'p1' : 'p2'}`}>{wo.priority}</span>
                      </div>
                      <span className={`wo-status-tag ${wo.status}`}>
                        {wo.status === 'EN_ROUTE' && <Truck size={12} />}
                        {wo.status === 'ASSIGNED' && <Clock size={12} />}
                        {wo.status === 'RESOLVED' && <Check size={12} />}
                        {wo.status}
                      </span>
                    </div>

                    <h4 className="wo-title">{wo.title}</h4>

                    <div className="wo-meta-grid">
                      <div className="meta-item">
                        <MapPin size={14} className="text-cyan" />
                        <span>{wo.locationCoords} ({wo.dma})</span>
                      </div>
                      <div className="meta-item">
                        <UserCheck size={14} className="text-emerald" />
                        <span>{wo.assignedCrew}</span>
                      </div>
                      <div className="meta-item">
                        <Clock size={14} className="text-muted" />
                        <span>Est. Duration: {wo.estimatedRepairTimeHours} hours</span>
                      </div>
                    </div>

                    <div className="wo-actions-row">
                      {wo.status === 'ASSIGNED' && (
                        <button 
                          className="btn-status-action btn-enroute"
                          onClick={() => handleUpdateStatus(wo.id, 'EN_ROUTE')}
                        >
                          <Truck size={14} /> Dispatch Crew En Route
                        </button>
                      )}
                      {wo.status === 'EN_ROUTE' && (
                        <button 
                          className="btn-status-action btn-repairing"
                          onClick={() => handleUpdateStatus(wo.id, 'IN_PROGRESS')}
                        >
                          <Wrench size={14} /> Mark Repair in Progress
                        </button>
                      )}
                      {wo.status === 'IN_PROGRESS' && (
                        <button 
                          className="btn-status-action btn-resolve"
                          onClick={() => handleUpdateStatus(wo.id, 'RESOLVED')}
                        >
                          <CheckCircle2 size={14} /> Mark Resolved & Repressurize
                        </button>
                      )}
                      {wo.status === 'RESOLVED' && (
                        <span className="text-emerald font-semibold text-sm">
                          ✅ Completed & Segment Repressurized
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
