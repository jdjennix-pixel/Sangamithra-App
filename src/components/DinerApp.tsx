import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { MenuItem, CartItem } from '../context/AppContext';
import { Search, ShoppingBag, AlertCircle, X, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const DinerApp: React.FC = () => {
  const {
    tables,
    menuItems,
    orders,
    activeTableId,
    placeOrder,
    addStaffAlert,
    processPayment
  } = useApp();

  const activeTable = tables.find(t => t.id === activeTableId);
  const tableOrders = orders.filter(o => o.tableId === activeTableId && o.status !== 'completed' && o.status !== 'cancelled');

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non_veg'>('all');
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [specialNotes, setSpecialNotes] = useState('');

  // Selected item modal state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [custQty, setCustQty] = useState(1);
  const [custSpice, setCustSpice] = useState(1);
  const [custNotes, setCustNotes] = useState('');

  // Checkout modal
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number>(10); // Percent or rupee
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'counter_cash'>('upi');
  const [splitCount, setSplitCount] = useState(1);
  const [showUPIQR, setShowUPIQR] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Floating notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = ['All', 'Soup', 'Starters', 'Main Course', 'Desserts'];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectItem = (item: MenuItem) => {
    if (!item.isAvailable) {
      triggerToast(`"${item.name}" is currently Out of Stock!`);
      return;
    }
    setCustomizingItem(item);
    setCustQty(1);
    setCustSpice(item.spiceLevel);
    setCustNotes('');
  };

  const handleAddToCart = () => {
    if (!customizingItem) return;

    const existingIndex = cart.findIndex(
      c => c.menuItem.id === customizingItem.id && c.spiceLevel === custSpice && c.customNotes === custNotes
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += custQty;
      setCart(updated);
    } else {
      setCart([...cart, { menuItem: customizingItem, quantity: custQty, spiceLevel: custSpice, customNotes: custNotes }]);
    }

    triggerToast(`Added ${custQty}x "${customizingItem.name}" to cart!`);
    setCustomizingItem(null);
  };

  const updateCartQty = (idx: number, delta: number) => {
    const updated = [...cart];
    updated[idx].quantity += delta;
    if (updated[idx].quantity <= 0) {
      updated.splice(idx, 1);
    }
    setCart(updated);
  };

  const handleSendToKitchen = () => {
    if (cart.length === 0) return;
    placeOrder(activeTableId, cart, specialNotes);
    setCart([]);
    setSpecialNotes('');
    setIsCartOpen(false);
    triggerToast('Order sent to the kitchen instantly! 🍳');
  };

  const handleCallRequest = (type: 'water' | 'napkins' | 'waiter') => {
    addStaffAlert(activeTableId, type);
    const label = type === 'water' ? 'Water' : type === 'napkins' ? 'Napkins' : 'Waiter';
    triggerToast(`Requested ${label}. Waiter notified! 🤵`);
  };

  const handleRequestBill = () => {
    if (tableOrders.length === 0) {
      triggerToast('No active orders placed yet!');
      return;
    }
    // Check if any items are not served yet
    const hasUnserved = tableOrders.some(o => o.status !== 'served' && o.status !== 'ready');
    if (hasUnserved) {
      if (!confirm('Some of your ordered items are still preparing. Do you want to proceed to checkout anyway?')) {
        return;
      }
    }
    addStaffAlert(activeTableId, 'bill');
    setIsCheckingOut(true);
  };

  // Calculations
  const getDinerSubtotal = () => {
    let sub = 0;
    tableOrders.forEach(o => {
      o.items.forEach(i => {
        sub += i.unitPrice * i.quantity;
      });
    });
    return sub;
  };

  const subtotal = getDinerSubtotal();
  const cgst = parseFloat((subtotal * 0.025).toFixed(2));
  const sgst = parseFloat((subtotal * 0.025).toFixed(2));
  const tipAmount = selectedTip;
  const grandTotal = subtotal + cgst + sgst + tipAmount;

  const handleSimulatePayment = () => {
    setPaymentProcessing(true);
    if (paymentMethod === 'upi') {
      setShowUPIQR(true);
      setTimeout(() => {
        setPaymentProcessing(false);
        setShowUPIQR(false);
        setPaymentSuccess(true);
        setTimeout(() => {
          processPayment(activeTableId, 'upi', tipAmount);
          setPaymentSuccess(false);
          setIsCheckingOut(false);
          triggerToast('UPI Payment Captured Successfully! Bill completed.');
        }, 2000);
      }, 4000); // 4 sec simulation of phone paying
    } else {
      setTimeout(() => {
        setPaymentProcessing(false);
        setPaymentSuccess(true);
        setTimeout(() => {
          processPayment(activeTableId, paymentMethod === 'card' ? 'card' : 'counter_cash', tipAmount);
          setPaymentSuccess(false);
          setIsCheckingOut(false);
          triggerToast('Cashier notified of Counter Payment request!');
        }, 2000);
      }, 2000);
    }
  };

  // Filters
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesDiet = dietFilter === 'all' || 
                        (dietFilter === 'veg' && item.diet === 'veg') ||
                        (dietFilter === 'non_veg' && item.diet === 'non_veg');
    return matchesSearch && matchesCategory && matchesDiet;
  });

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'var(--bg-primary)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', position: 'relative', paddingBottom: '120px' }}>
      
      {/* Cinematic Progressive Blur at the bottom */}
      <div className="gradient-blur">
        <div></div><div></div><div></div><div></div><div></div><div></div>
      </div>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(212, 175, 55, 0.95)', color: '#000', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
          <AlertCircle size={16} />
          {toastMessage}
        </div>
      )}

      {/* 1. Header Banner */}
      <header style={{ padding: '20px', background: 'linear-gradient(to bottom, rgba(212,175,55,0.06) 0%, transparent 100%)', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--gold)', fontWeight: 600, display: 'block' }}>Tuticorin Specialty</span>
            <h1 className="gold-text" style={{ fontSize: '24px', margin: '2px 0 0' }}>SANGAMITHRA</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>85 Palai Road, Tuticorin</p>
          </div>
          
          {/* Active Table Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Scanned Table</span>
            <div style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>
              Table {activeTable?.tableNumber}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Fast Shortcuts */}
      <section style={{ padding: '15px 20px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <button onClick={() => handleCallRequest('water')} className="interactive-scale" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '30px', padding: '8px 14px', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
          💧 Request Water
        </button>
        <button onClick={() => handleCallRequest('napkins')} className="interactive-scale" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '30px', padding: '8px 14px', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          🧻 Napkins
        </button>
        <button onClick={() => handleCallRequest('waiter')} className="interactive-scale" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '30px', padding: '8px 14px', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          🤵 Call Waiter
        </button>
      </section>

      {/* 3. Live Order Tracking Status */}
      {tableOrders.length > 0 && (
        <section style={{ margin: '0 20px 20px', padding: '12px 16px' }} className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', display: 'inline-block', animation: 'float 1.5s infinite ease' }}></span>
              <h3 style={{ fontSize: '13px', fontWeight: 600 }}>Active Order Status</h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 'bold' }}>
              {tableOrders.length} ticket(s) active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tableOrders.map(order => {
              const itemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
              let statusLabel = 'Sent to Kitchen';
              let statusColor = '#9CA3AF';
              
              if (order.status === 'preparing') {
                statusLabel = 'Preparing in Kitchen 🍳';
                statusColor = 'var(--accent-amber)';
              } else if (order.status === 'ready') {
                statusLabel = 'Ready to Serve! 🤵';
                statusColor = 'var(--gold)';
              } else if (order.status === 'served') {
                statusLabel = 'Served & Enjoying 🍽️';
                statusColor = 'var(--veg-emerald)';
              }

              return (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{order.orderSequenceNumber}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({itemsCount} items)</span>
                    </div>
                    {/* Item snippets */}
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: statusColor, fontWeight: 'bold', display: 'block' }}>
                      {statusLabel}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                      Ordered {new Date(order.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={handleRequestBill} className="btn-outline-gold interactive-scale" style={{ width: '100%', padding: '10px', fontSize: '12px', marginTop: '12px' }}>
            💳 Checkout & Pay (₹{(subtotal + cgst + sgst).toFixed(0)})
          </button>
        </section>
      )}

      {/* 4. Search and Filters */}
      <section style={{ padding: '0 20px', marginBottom: '15px' }}>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <input 
            type="text" 
            placeholder="Search dry, curries, dessert, macaroon..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px 12px 42px', color: '#fff', outline: 'none', fontSize: '13px', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Diet Filters (Veg / Non-Veg Toggles) */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button 
            onClick={() => setDietFilter('all')}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: dietFilter === 'all' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.05)', background: dietFilter === 'all' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.02)', color: dietFilter === 'all' ? 'var(--gold)' : 'var(--text-secondary)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            All Items
          </button>
          <button 
            onClick={() => setDietFilter('veg')}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: dietFilter === 'veg' ? '1px solid var(--veg-emerald)' : '1px solid rgba(255,255,255,0.05)', background: dietFilter === 'veg' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)', color: dietFilter === 'veg' ? 'var(--veg-emerald)' : 'var(--text-secondary)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <span className="badge-diet badge-veg"><span className="badge-diet-dot"></span></span>
            Veg Only
          </button>
          <button 
            onClick={() => setDietFilter('non_veg')}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: dietFilter === 'non_veg' ? '1px solid var(--nonveg-crimson)' : '1px solid rgba(255,255,255,0.05)', background: dietFilter === 'non_veg' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)', color: dietFilter === 'non_veg' ? 'var(--nonveg-crimson)' : 'var(--text-secondary)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <span className="badge-diet badge-nonveg"><span className="badge-diet-dot"></span></span>
            Non-Veg
          </button>
        </div>

        {/* Categories Tab Scroll */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: '20px',
                background: selectedCategory === cat ? 'var(--gold-gradient)' : 'rgba(255, 255, 255, 0.02)',
                color: selectedCategory === cat ? '#000' : 'var(--text-secondary)',
                border: selectedCategory === cat ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 5. Menu Items List */}
      <main style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredMenuItems.map((item, index) => (
            <div 
              key={item.id}
              onClick={() => handleSelectItem(item)}
              style={{ 
                display: 'flex', 
                gap: '12px', 
                padding: '12px', 
                position: 'relative',
                opacity: item.isAvailable ? 1 : 0.4,
                borderRadius: '24px',
                animationDelay: `${index * 80}ms`
              }}
              className="glass-panel interactive-scale stagger-enter"
            >
              {/* Veg/Non-Veg icon floating */}
              <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 2, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '4px', borderRadius: '6px' }}>
                <span className={`badge-diet ${item.diet === 'veg' ? 'badge-veg' : item.diet === 'non_veg' ? 'badge-nonveg' : 'badge-egg'}`}>
                  <span className="badge-diet-dot"></span>
                </span>
              </div>

              {/* Image if available */}
              {(item as any).imageUrl && (
                <div style={{ width: '100px', height: '100px', flexShrink: 0, borderRadius: '16px' }} className="image-premium-outline">
                  <img src={import.meta.env.BASE_URL + (item as any).imageUrl.replace(/^\.?\//, '')} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                </div>
              )}

              {/* Text content details */}
              <div style={{ flex: 1, paddingLeft: (item as any).imageUrl ? '0px' : '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{item.name}</h3>
                  <span className="tabular-nums" style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-heading)' }}>
                    ₹{item.price}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                  {item.description}
                </p>

                {/* Spice indicators & Prep Time */}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)' }}>
                  {item.spiceLevel > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      Spice:{' '}
                      <span className="spice-chili">
                        {'🌶️'.repeat(item.spiceLevel)}
                      </span>
                    </span>
                  )}
                  <span>🕒 {item.prepTimeMinutes}m</span>
                  {item.allergens.length > 0 && (
                    <span style={{ color: 'rgba(255, 159, 28, 0.7)' }}>
                      ⚠️ {item.allergens.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Add Indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                {item.isAvailable ? (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontWeight: 'bold', fontSize: '18px' }}>
                    +
                  </div>
                ) : (
                  <span style={{ fontSize: '9px', background: '#EF4444', color: '#fff', padding: '3px 6px', borderRadius: '4px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Sold Out
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredMenuItems.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No items match your preferences. Try resetting search filters!
            </div>
          )}
        </div>
      </main>

      {/* 6. Customizable Item Modal */}
      {customizingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(28, 27, 25, 0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: '480px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', borderTop: '1px solid var(--gold)', padding: '24px', position: 'relative', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)' }}>
            
            {/* Close Button */}
            <button 
              onClick={() => setCustomizingItem(null)} 
              className="interactive-scale"
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {/* Diet Symbol */}
            <span className={`badge-diet ${customizingItem.diet === 'veg' ? 'badge-veg' : 'badge-nonveg'} `} style={{ marginBottom: '8px' }}>
              <span className="badge-diet-dot"></span>
            </span>

            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0 8px' }}>{customizingItem.name}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '16px' }}>{customizingItem.description}</p>

            {/* Customization Details: Spice Level */}
            {customizingItem.spiceLevel > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--gold)', marginBottom: '8px' }}>Customize Spice Level:</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3].map(lvl => (
                    <button 
                      key={lvl}
                      onClick={() => setCustSpice(lvl)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        background: custSpice === lvl ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.02)',
                        border: custSpice === lvl ? '1px solid var(--nonveg-crimson)' : '1px solid rgba(255,255,255,0.05)',
                        color: custSpice === lvl ? 'var(--nonveg-crimson)' : 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {lvl === 1 ? 'Mild 🌶️' : lvl === 2 ? 'Medium 🌶️🌶️' : 'Extra Hot 🌶️🌶️🌶️'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--gold)', marginBottom: '8px' }}>Kitchen Notes / Custom Swaps:</h4>
              <input 
                type="text" 
                placeholder="e.g., No onions, extra crispy, server gravy on side" 
                value={custNotes}
                onChange={(e) => setCustNotes(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '12px', outline: 'none' }}
              />
            </div>

            {/* Quantity Selector & Add Button */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={() => setCustQty(q => Math.max(1, q - 1))} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                <span style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '15px', textAlign: 'center' }}>{custQty}</span>
                <button onClick={() => setCustQty(q => q + 1)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
              </div>

              <button 
                onClick={handleAddToCart}
                className="btn-gold interactive-scale" 
                style={{ flex: 1, padding: '14px', fontSize: '14px' }}
              >
                Add {custQty} to Session Cart — ₹{customizingItem.price * custQty}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. Bottom Floating Bar for Cart */}
      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', zIndex: 400 }} className="glass-panel urgent-amber">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={20} style={{ color: 'var(--gold)' }} />
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#fff', color: '#000', borderRadius: '50%', width: '15px', height: '15px', fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>Draft Order Ready</span>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                Total: ₹{cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)}
              </span>
            </div>
          </div>

          <button onClick={() => setIsCartOpen(true)} className="btn-gold interactive-scale" style={{ padding: '8px 16px', fontSize: '12px' }}>
            View Cart <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* 8. Cart Sidebar Modal */}
      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(28, 27, 25, 0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 600, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: '480px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', borderTop: '1px solid var(--gold)', padding: '24px', position: 'relative', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={18} style={{ color: 'var(--gold)' }} />
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Review Session Cart</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)} 
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px', marginBottom: '20px' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className={`badge-diet ${item.menuItem.diet === 'veg' ? 'badge-veg' : 'badge-nonveg'}`}>
                        <span className="badge-diet-dot"></span>
                      </span>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.menuItem.name}</h4>
                    </div>
                    
                    {/* Add customizations text */}
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', paddingLeft: '18px' }}>
                      {item.menuItem.spiceLevel > 0 && `Spice: ${item.spiceLevel === 1 ? 'Mild' : item.spiceLevel === 2 ? 'Medium' : 'Extra Hot'}`}
                      {item.customNotes && ` | Note: "${item.customNotes}"`}
                    </div>
                  </div>

                  {/* Quantity and Price */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '30px' }}>
                      <button onClick={() => updateCartQty(idx, -1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>-</button>
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{item.quantity}</span>
                      <button onClick={() => updateCartQty(idx, 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>+</button>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 'bold', minWidth: '45px', textAlign: 'right' }}>
                      ₹{item.menuItem.price * item.quantity}
                    </span>
                  </div>
                </div>
              ))}

              {/* Special Instructions for overall order */}
              <div style={{ marginTop: '10px' }}>
                <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>General Table Notes (optional):</h4>
                <textarea 
                  placeholder="e.g. Serve starters and soups together..." 
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px', color: '#fff', fontSize: '11px', minHeight: '50px', resize: 'none', outline: 'none' }}
                />
              </div>
            </div>

            {/* Footer Button */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Draft Order Total:</span>
                <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>
                  ₹{cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)}
                </span>
              </div>
              <button 
                onClick={handleSendToKitchen}
                className="btn-gold interactive-scale" 
                style={{ width: '100%', padding: '14px', fontSize: '14px' }}
              >
                Send KOT to Kitchen Instantly
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 9. Checkout & Bill payment Modal */}
      {isCheckingOut && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(28, 27, 25, 0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 650, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: '480px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', borderTop: '1px solid var(--gold)', padding: '24px', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Tax Invoice Checkout</h2>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Table {activeTable?.tableNumber} Session Summary</span>
              </div>
              <button 
                onClick={() => setIsCheckingOut(false)} 
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Content scroll */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
              
              {/* Order breakdown */}
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '11px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Dine-In Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {tableOrders.map(order => 
                    order.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.quantity}x {item.name}</span>
                        <span>₹{item.unitPrice * item.quantity}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bill splits */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Split Bill (Simulate among friends):</h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px' }}>Number of Diners:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '30px' }}>
                    <button onClick={() => setSplitCount(s => Math.max(1, s - 1))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{splitCount}</span>
                    <button onClick={() => setSplitCount(s => s + 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                  </div>
                  {splitCount > 1 && (
                    <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 'bold', marginLeft: 'auto' }}>
                      ₹{(grandTotal / splitCount).toFixed(0)} / person
                    </span>
                  )}
                </div>
              </div>

              {/* Tip Picker */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Tip Waiter (Support Local Hospitality):</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[0, 20, 50, 100].map(tipVal => (
                    <button 
                      key={tipVal}
                      onClick={() => setSelectedTip(tipVal)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        background: selectedTip === tipVal ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.02)',
                        border: selectedTip === tipVal ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.05)',
                        color: selectedTip === tipVal ? 'var(--gold)' : 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {tipVal === 0 ? 'No Tip' : `₹${tipVal}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Choose Checkout Option:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={() => setPaymentMethod('upi')}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: paymentMethod === 'upi' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: paymentMethod === 'upi' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.05)',
                      color: paymentMethod === 'upi' ? 'var(--gold)' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>⚡ UPI Instant Payment (GPay, PhonePe)</span>
                    <ChevronRight size={14} />
                  </button>

                  <button 
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: paymentMethod === 'card' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: paymentMethod === 'card' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.05)',
                      color: paymentMethod === 'card' ? 'var(--gold)' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>💳 Visa/Mastercard (Tap to Pay)</span>
                    <ChevronRight size={14} />
                  </button>

                  <button 
                    onClick={() => setPaymentMethod('counter_cash')}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: paymentMethod === 'counter_cash' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: paymentMethod === 'counter_cash' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.05)',
                      color: paymentMethod === 'counter_cash' ? 'var(--gold)' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>💵 Pay Cash at Counter</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* GST splitted compliance details */}
              <div style={{ padding: '12px', borderTop: '1px dashed rgba(255,255,255,0.05)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Taxable Base Value:</span>
                  <span>₹{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>CGST (2.5%):</span>
                  <span>₹{cgst}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>SGST (2.5%):</span>
                  <span>₹{sgst}</span>
                </div>
                {tipAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--gold)' }}>
                    <span>Tip to Waiter:</span>
                    <span>₹{tipAmount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                  <span>Grand Total:</span>
                  <span className="gold-text">₹{grandTotal}</span>
                </div>
              </div>

            </div>

            {/* UPI QR Code Mock Overlay */}
            {showUPIQR && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#0a0a08', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 700, borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '3px solid var(--gold)' }}>
                  {/* Styled fake QR box */}
                  <div style={{ width: '180px', height: '180px', background: '#ccc', backgroundImage: 'radial-gradient(#000 60%, transparent 60%)', backgroundSize: '15px 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                    [ MOCK RAZORPAY UPI ]
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Scan Dynamic UPI Code
                </span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '5px' }}>
                  Amount: ₹{grandTotal}
                </span>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center', padding: '0 30px' }}>
                  Razorpay deep-linking sequence. Simulating UPI payment confirmation...
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <span style={{ width: '6px', height: '6px', background: 'var(--gold)', borderRadius: '50%', animation: 'float 1s infinite alternate' }}></span>
                  <span style={{ width: '6px', height: '6px', background: 'var(--gold)', borderRadius: '50%', animation: 'float 1s infinite alternate 0.2s' }}></span>
                  <span style={{ width: '6px', height: '6px', background: 'var(--gold)', borderRadius: '50%', animation: 'float 1s infinite alternate 0.4s' }}></span>
                </div>
              </div>
            )}

            {/* Payment success overlay */}
            {paymentSuccess && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#0a0a08', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 710, borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                <CheckCircle2 size={64} style={{ color: 'var(--veg-emerald)', marginBottom: '15px', animation: 'float 2s infinite' }} />
                <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>Payment Successful!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '6px', textAlign: 'center', padding: '0 40px' }}>
                  ₹{grandTotal} captured via Razorpay. GST invoice sent to WhatsApp.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '20px', color: 'var(--text-muted)', fontSize: '10px' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--gold)' }} />
                  <span>GST Compliant Transaction Audited</span>
                </div>
              </div>
            )}

            {/* Footer CTA */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <button 
                onClick={handleSimulatePayment}
                disabled={paymentProcessing}
                className="btn-gold" 
                style={{ width: '100%', padding: '14px', fontSize: '14px' }}
              >
                {paymentProcessing ? 'Processing Transaction Securely...' : `Proceed to Secure Checkout — ₹${grandTotal}`}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
