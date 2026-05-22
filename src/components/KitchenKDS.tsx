import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChefHat, Clock, Flame, Ban } from 'lucide-react';

export const KitchenKDS: React.FC = () => {
  const {
    orders,
    menuItems,
    updateOrderItemStatus,
    updateOrderStatus,
    toggleItemAvailability
  } = useApp();

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [stockSearch, setStockSearch] = useState('');
  
  // Audio state simulation
  const [newOrderBeep, setNewOrderBeep] = useState(false);

  // Monitor for incoming new orders to simulate audio trigger
  useEffect(() => {
    const hasNew = orders.some(o => o.status === 'pending');
    if (hasNew) {
      setNewOrderBeep(true);
      const timer = setTimeout(() => setNewOrderBeep(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [orders]);

  // Filters
  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const displayedOrders = activeTab === 'active' ? activeOrders : completedOrders;

  // Calculate elapsed time
  const getElapsedTime = (createdTime: Date) => {
    const elapsedMs = Date.now() - new Date(createdTime).getTime();
    const mins = Math.floor(elapsedMs / (60 * 1000));
    return mins;
  };

  const getUrgencyClass = (mins: number) => {
    if (mins >= 10) return 'urgent-red';
    if (mins >= 5) return 'urgent-amber';
    return '';
  };

  const getUrgencyStyle = (mins: number) => {
    if (mins >= 10) return { borderColor: '#EF4444', background: 'rgba(239, 68, 68, 0.03)' };
    if (mins >= 5) return { borderColor: '#FF9F1C', background: 'rgba(255, 159, 28, 0.02)' };
    return { borderColor: 'rgba(212, 175, 55, 0.15)' };
  };

  // Quick stats
  const pendingCount = activeOrders.length;
  const preparingCount = activeOrders.filter(o => o.status === 'preparing').length;
  const readyCount = activeOrders.filter(o => o.status === 'ready').length;

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      
      {/* 1. KDS Audio Simulated Notification Banner */}
      {newOrderBeep && (
        <div style={{ background: 'var(--nonveg-crimson)', color: '#fff', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'pulse-red 1s infinite', border: '1px solid #fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame size={20} className="spice-chili" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 'bold', fontSize: '14px' }}>
              🔊 CHIME: NEW ORDER TICKET INCOMING! (#0{orders.length + 19})
            </span>
          </div>
          <span style={{ fontSize: '11px', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '6px' }}>KOT Auto-Printed</span>
        </div>
      )}

      {/* 2. Top KDS Dashboard Controls */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'var(--gold-gradient)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChefHat size={22} style={{ color: '#000' }} />
          </div>
          <div>
            <h1 className="gold-text" style={{ fontSize: '24px', margin: 0 }}>KITCHEN DISPLAY SYSTEM</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sangamithra Live KOT Dispatch</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('active')} 
            className="btn-outline-gold" 
            style={{ 
              padding: '10px 16px', 
              fontSize: '12px', 
              background: activeTab === 'active' ? 'var(--gold-gradient)' : 'transparent',
              color: activeTab === 'active' ? '#000' : 'var(--gold)',
              border: '1px solid var(--gold)',
              borderRadius: '8px'
            }}
          >
            Active Tickets ({activeOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('completed')} 
            className="btn-outline-gold"
            style={{ 
              padding: '10px 16px', 
              fontSize: '12px', 
              background: activeTab === 'completed' ? 'var(--gold-gradient)' : 'transparent',
              color: activeTab === 'completed' ? '#000' : 'var(--gold)',
              border: '1px solid var(--gold)',
              borderRadius: '8px'
            }}
          >
            Completed History ({completedOrders.length})
          </button>
        </div>
      </header>

      {/* 3. Real-Time Stats summary strip */}
      <section style={{ display: 'flex', gap: '15px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px', padding: '15px' }} className="glass-panel">
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Pending Tickets</span>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '4px', color: '#fff' }}>{pendingCount}</h3>
        </div>
        <div style={{ flex: 1, minWidth: '150px', padding: '15px' }} className="glass-panel">
          <span style={{ fontSize: '11px', color: 'var(--accent-amber)' }}>Preparing Dishes</span>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '4px', color: 'var(--accent-amber)' }}>{preparingCount}</h3>
        </div>
        <div style={{ flex: 1, minWidth: '150px', padding: '15px' }} className="glass-panel">
          <span style={{ fontSize: '11px', color: 'var(--veg-emerald)' }}>Ready to Serve</span>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '4px', color: 'var(--veg-emerald)' }}>{readyCount}</h3>
        </div>
      </section>

      {/* 4. Main grid split: KOT Grid + Stock Out Toggles shelf */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Left Side: Tickets Feed */}
        <div style={{ flex: 3, minWidth: '320px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {displayedOrders.map(order => {
            const elapsedMins = getElapsedTime(order.createdTime);
            const urgencyClass = getUrgencyClass(elapsedMins);
            const urgencyStyle = getUrgencyStyle(elapsedMins);

            return (
              <div 
                key={order.id} 
                className={`glass-panel ${urgencyClass}`}
                style={{ 
                  borderRadius: '16px', 
                  padding: '16px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  ...urgencyStyle
                }}
              >
                {/* KOT Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SEQUENCE KOT</span>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{order.orderSequenceNumber}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--gold)', display: 'block' }}>
                      TABLE {order.tableNumber}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Dine-in Order
                    </span>
                  </div>
                </div>

                {/* Items in KOT */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {order.items.map(item => {
                    let itemColor = 'var(--text-primary)';
                    let checkDecor = 'none';
                    if (item.status === 'ready') {
                      itemColor = 'var(--text-secondary)';
                      checkDecor = 'line-through';
                    } else if (item.status === 'served') {
                      itemColor = 'var(--text-muted)';
                      checkDecor = 'line-through';
                    }

                    return (
                      <div 
                        key={item.id} 
                        style={{ 
                          padding: '8px', 
                          borderRadius: '8px', 
                          background: 'rgba(255,255,255,0.01)', 
                          border: '1px solid rgba(255,255,255,0.03)',
                          opacity: (item.status === 'ready' || item.status === 'served') ? 0.5 : 1
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '13px', marginRight: '6px' }}>{item.quantity}x</span>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: itemColor, textDecoration: checkDecor }}>{item.name}</span>
                          </div>
                          
                          {/* Item status trigger */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {item.status === 'new' && (
                              <button 
                                onClick={() => updateOrderItemStatus(order.id, item.id, 'preparing')}
                                style={{ background: 'rgba(255, 159, 28, 0.15)', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)', fontSize: '9px', fontWeight: 'bold', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Cook 🍳
                              </button>
                            )}
                            {item.status === 'preparing' && (
                              <button 
                                onClick={() => updateOrderItemStatus(order.id, item.id, 'ready')}
                                style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--veg-emerald)', color: 'var(--veg-emerald)', fontSize: '9px', fontWeight: 'bold', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Ready ✅
                              </button>
                            )}
                            {item.status === 'ready' && (
                              <span style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--gold)', color: 'var(--gold)', fontSize: '8px', padding: '3px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                Ready to Serve
                              </span>
                            )}
                            {item.status === 'served' && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '8px', padding: '3px 6px' }}>
                                Served
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Spice & notes */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)', marginTop: '4px', paddingLeft: '22px' }}>
                          <span>Spice: {'🌶️'.repeat(item.spiceLevel || 0)}</span>
                          {item.kitchenNotes && <span style={{ color: 'var(--accent-amber)', fontWeight: 'bold' }}>✍️: {item.kitchenNotes}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* KOT Footer: Notes and Timer */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: elapsedMins >= 5 ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>
                    <Clock size={12} />
                    <span>{elapsedMins} mins elapsed</span>
                  </div>
                  
                  {/* Master Serve trigger */}
                  {order.status !== 'ready' && order.status !== 'served' ? (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      style={{ background: 'var(--gold-gradient)', color: '#000', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Mark All Ready
                    </button>
                  ) : (
                    <span style={{ fontSize: '10px', color: 'var(--veg-emerald)', fontWeight: 'bold' }}>
                      Ready for Pick-up
                    </span>
                  )}
                </div>

              </div>
            );
          })}

          {displayedOrders.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              No KDS order tickets pending. Great job! 🍳
            </div>
          )}
        </div>

        {/* Right Side: Chef Out-of-Stock Shelf */}
        <div style={{ flex: 1.2, minWidth: '280px' }} className="glass-panel">
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
              <Ban size={16} style={{ color: 'var(--nonveg-crimson)' }} />
              Chef's Inventory Stocks
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Toggle items out of stock to block diner screens immediately.
            </p>
            <input 
              type="text" 
              placeholder="Filter menu items..." 
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', marginTop: '10px', outline: 'none' }}
            />
          </div>

          {/* List shelf */}
          <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '10px' }}>
            {menuItems
              .filter(i => i.name.toLowerCase().includes(stockSearch.toLowerCase()))
              .map(item => (
                <div 
                  key={item.id}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '8px 10px', 
                    borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid rgba(255,255,255,0.03)',
                    marginBottom: '6px',
                    opacity: item.isAvailable ? 1 : 0.6
                  }}
                >
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: item.isAvailable ? '#fff' : 'var(--text-secondary)' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>
                      ₹{item.price} — {item.category}
                    </span>
                  </div>

                  {/* Stock Toggle Action */}
                  <button 
                    onClick={() => toggleItemAvailability(item.id)}
                    style={{
                      background: item.isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: item.isAvailable ? '1px solid var(--veg-emerald)' : '1px solid var(--nonveg-crimson)',
                      color: item.isAvailable ? 'var(--veg-emerald)' : 'var(--nonveg-crimson)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      minWidth: '90px'
                    }}
                  >
                    {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </button>
                </div>
              ))}
          </div>

        </div>

      </div>

    </div>
  );
};
