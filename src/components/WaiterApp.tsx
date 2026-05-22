import React from 'react';
import { useApp } from '../context/AppContext';
import type { DiningTable } from '../context/AppContext';
import { Bell } from 'lucide-react';

export const WaiterApp: React.FC = () => {
  const {
    tables,
    alerts,
    orders,
    acknowledgeAlert,
    resolveAlert,
    cleanTable
  } = useApp();

  // Active unacknowledged alerts first, then acknowledged, exclude resolved
  const activeAlerts = alerts.filter(a => a.status !== 'resolved');

  // Group active orders that are "ready" to notify the waiter to serve them
  const readyOrders = orders.filter(o => o.status === 'ready');

  // Quick count for indicators
  const alertCount = activeAlerts.filter(a => a.status === 'unacknowledged').length + readyOrders.length;

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'vacant': return 'var(--veg-emerald)';
      case 'occupied': return 'var(--accent-amber)';
      case 'dirty': return 'var(--nonveg-crimson)';
      default: return '#3B82F6'; // reserved
    }
  };

  const handleTableTap = (table: DiningTable) => {
    if (table.status === 'dirty') {
      if (confirm(`Mark Table ${table.tableNumber} as CLEANED and VACANT?`)) {
        cleanTable(table.id);
      }
    } else if (table.status === 'vacant') {
      // Allow simulating occupancies
      if (confirm(`Manually seat guests at Table ${table.tableNumber}?`)) {
        // Can be done by placing an order or via admin
      }
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'var(--bg-primary)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px', paddingBottom: '90px' }}>
      
      {/* 1. Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--gold)', fontWeight: 600, display: 'block' }}>STAFF PORTAL</span>
          <h1 className="gold-text" style={{ fontSize: '22px', margin: 0 }}>WAITER COMPANION</h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Section-Based Priorities</p>
        </div>

        {/* Priority alert badge */}
        <div style={{ position: 'relative', background: 'rgba(212,175,55,0.1)', border: '1px solid var(--gold)', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bell size={20} style={{ color: 'var(--gold)' }} />
          {alertCount > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--nonveg-crimson)', color: '#fff', fontSize: '9px', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse-red 1.2s infinite' }}>
              {alertCount}
            </span>
          )}
        </div>
      </header>

      {/* 2. Priority Feed (Action Required List) */}
      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🚨</span> PRIORITY TASKS FEED ({alertCount} Alerts)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* A. Food Ready to Serve warnings (pushed from KDS) */}
          {readyOrders.map(order => (
            <div 
              key={order.id}
              className="glass-panel urgent-amber"
              style={{ padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <span style={{ fontSize: '9px', background: 'var(--veg-emerald)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Food Ready 🍳
                </span>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '6px' }}>
                  Serve Table {order.tableNumber}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  KOT {order.orderSequenceNumber} ({order.items.filter(i => i.status === 'ready').length} items ready)
                </p>
              </div>

              {/* Servicing button */}
              <button 
                onClick={() => resolveAlert(order.id)} // Will solve internally
                style={{ background: 'var(--gold-gradient)', color: '#000', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Served 🍽️
              </button>
            </div>
          ))}

          {/* B. General Customer Alerts (Water, napkins, bill) */}
          {activeAlerts.map(alert => {
            const isUnack = alert.status === 'unacknowledged';
            const alertLabel = alert.alertType === 'water' ? 'Request: Bottled Water' : 
                               alert.alertType === 'napkins' ? 'Request: Extra Napkins' : 
                               alert.alertType === 'bill' ? 'Request: Printed GST Bill' : 'Call: Waiter needed';
            const urgencyClass = isUnack ? 'urgent-red' : '';

            return (
              <div 
                key={alert.id}
                className={`glass-panel ${urgencyClass}`}
                style={{ padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
              >
                <div>
                  <span style={{ fontSize: '9px', background: isUnack ? 'var(--nonveg-crimson)' : 'rgba(255,255,255,0.05)', color: isUnack ? '#fff' : 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {alert.status.toUpperCase()}
                  </span>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '6px' }}>
                    Table {alert.tableNumber}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {alertLabel}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {isUnack ? (
                    <button 
                      onClick={() => acknowledgeAlert(alert.id)}
                      style={{ background: 'rgba(255, 159, 28, 0.2)', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)', borderRadius: '6px', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <button 
                      onClick={() => resolveAlert(alert.id)}
                      style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--veg-emerald)', color: 'var(--veg-emerald)', borderRadius: '6px', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Resolve ✅
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {activeAlerts.length === 0 && readyOrders.length === 0 && (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed rgba(255,255,255,0.04)', borderRadius: '12px' }}>
              🎉 Zero active table alerts! Good coverage.
            </div>
          )}
        </div>
      </section>

      {/* 3. Table Seating Grid */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🍽️ DINING FLOOR GRID (8 Tables)
          </h3>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tap DIRTY to Clean</span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '10px', fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '15px', background: 'rgba(255,255,255,0.01)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--veg-emerald)', borderRadius: '50%' }}></span> Vacant
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--accent-amber)', borderRadius: '50%' }}></span> Occupied
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--nonveg-crimson)', borderRadius: '50%' }}></span> Dirty (Needs Clean)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', background: '#3B82F6', borderRadius: '50%' }}></span> Reserved
          </span>
        </div>

        {/* Floor Sections mapping */}
        {['indoor', 'outdoor', 'bbq'].map(sec => {
          const sectionTables = tables.filter(t => t.section === sec);
          return (
            <div key={sec} style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                📍 {sec === 'indoor' ? 'Indoor Dining' : sec === 'outdoor' ? 'Outdoor Terrace' : 'BBQ & Grill Area'}
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {sectionTables.map(table => {
                  const color = getTableStatusColor(table.status);
                  
                  return (
                    <div 
                      key={table.id}
                      onClick={() => handleTableTap(table)}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: `1.5px solid ${color}`,
                        borderRadius: '10px',
                        padding: '12px 6px',
                        textAlign: 'center',
                        cursor: table.status === 'dirty' ? 'pointer' : 'default',
                        boxShadow: table.status === 'dirty' ? '0 0 10px rgba(239,68,68,0.1)' : 'none',
                        transition: 'all 0.2s',
                        animation: table.status === 'dirty' ? 'pulse-red 2s infinite' : 'none'
                      }}
                    >
                      <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>T-{table.tableNumber}</h4>
                      <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                        👥 {table.seatingCapacity} seats
                      </span>
                      <span style={{ fontSize: '8px', color, fontWeight: 'bold', display: 'block', textTransform: 'uppercase', marginTop: '4px' }}>
                        {table.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

    </div>
  );
};
