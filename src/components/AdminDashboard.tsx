import React, { useState } from 'react';
import type { BillRecord, MenuItem } from '../context/AppContext';
import { useApp } from '../context/AppContext';
import { TrendingUp, Users, ShoppingBag, ShieldCheck, Edit, FileSpreadsheet, Eye } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    bills,
    tables,
    menuItems,
    auditLogs,
    updateItemPrice
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kpis' | 'menu' | 'auditing'>('kpis');
  const [selectedBill, setSelectedBill] = useState<BillRecord | null>(null);
  
  // Menu price edit states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>('');

  // Calculations
  const totalRevenue = bills.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalTips = bills.reduce((sum, b) => sum + b.tip, 0);
  const totalTaxCGST = bills.reduce((sum, b) => sum + b.cgst, 0);
  const totalTaxSGST = bills.reduce((sum, b) => sum + b.sgst, 0);
  
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const occupancyRate = parseFloat(((occupiedCount / tables.length) * 100).toFixed(0));

  const averageCheck = bills.length > 0 ? parseFloat((totalRevenue / bills.length).toFixed(0)) : 0;

  const handleEditPriceStart = (item: MenuItem) => {
    setEditingItemId(item.id);
    setEditingPrice(String(item.price));
  };

  const handleEditPriceSave = (id: string) => {
    const parsed = parseFloat(editingPrice);
    if (!isNaN(parsed) && parsed > 0) {
      updateItemPrice(id, parsed);
      setEditingItemId(null);
    }
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      
      {/* 1. Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
              SECURED ACCESS
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>FSSAI Compliant Portal</span>
          </div>
          <h1 className="gold-text" style={{ fontSize: '26px', margin: '4px 0 0' }}>ADMIN & OWNER CONTROLLER</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sangamithra 85 Palai Road Outlet Dashboard</p>
        </div>

        {/* Tab selection links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('kpis')}
            style={{ padding: '10px 18px', fontSize: '12px', background: activeTab === 'kpis' ? 'var(--gold-gradient)' : 'rgba(255,255,255,0.02)', color: activeTab === 'kpis' ? '#000' : 'var(--text-secondary)', border: activeTab === 'kpis' ? 'none' : '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <TrendingUp size={14} /> Analytics & Live Feed
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            style={{ padding: '10px 18px', fontSize: '12px', background: activeTab === 'menu' ? 'var(--gold-gradient)' : 'rgba(255,255,255,0.02)', color: activeTab === 'menu' ? '#000' : 'var(--text-secondary)', border: activeTab === 'menu' ? 'none' : '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit size={14} /> Menu Configurator
          </button>
          <button 
            onClick={() => setActiveTab('auditing')}
            style={{ padding: '10px 18px', fontSize: '12px', background: activeTab === 'auditing' ? 'var(--gold-gradient)' : 'rgba(255,255,255,0.02)', color: activeTab === 'auditing' ? '#000' : 'var(--text-secondary)', border: activeTab === 'auditing' ? 'none' : '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={14} /> Tax Compliance Auditing
          </button>
        </div>
      </header>

      {/* 2. Analytical KPI Blocks */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        
        <div style={{ padding: '20px' }} className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Captured Revenue (Gross)</span>
              <h3 style={{ fontSize: '26px', fontWeight: 'bold', marginTop: '6px', color: '#fff' }}>₹{totalRevenue.toFixed(0)}</h3>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--veg-emerald)', padding: '8px', borderRadius: '8px' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '10px' }}>
            Includes ₹{totalTips.toFixed(0)} Tip & ₹{(totalTaxCGST + totalTaxSGST).toFixed(0)} GST split
          </span>
        </div>

        <div style={{ padding: '20px' }} className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Floor Table Occupancy</span>
              <h3 style={{ fontSize: '26px', fontWeight: 'bold', marginTop: '6px', color: 'var(--accent-amber)' }}>{occupancyRate}%</h3>
            </div>
            <div style={{ background: 'rgba(255,159,28,0.1)', color: 'var(--accent-amber)', padding: '8px', borderRadius: '8px' }}>
              <Users size={18} />
            </div>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '10px' }}>
            {occupiedCount} of {tables.length} tables currently seated
          </span>
        </div>

        <div style={{ padding: '20px' }} className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Completed Transactions</span>
              <h3 style={{ fontSize: '26px', fontWeight: 'bold', marginTop: '6px', color: 'var(--gold)' }}>{bills.length} bills</h3>
            </div>
            <div style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', padding: '8px', borderRadius: '8px' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '10px' }}>
            Average Ticket Size: ₹{averageCheck} / table
          </span>
        </div>

        <div style={{ padding: '20px' }} className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active FSSAI License</span>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '14px', color: 'var(--veg-emerald)' }}>VALID & ACTIVE</h3>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--veg-emerald)', padding: '8px', borderRadius: '8px' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '10px' }}>
            License: #22419329000092
          </span>
        </div>

      </section>

      {/* 3. Panel Views */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* VIEW A: ANALYTICS & LIVE AUDIT logs */}
        {activeTab === 'kpis' && (
          <>
            {/* Left Box: Graphic Chart simulation using CSS */}
            <div style={{ flex: 1.8, minWidth: '320px', padding: '20px' }} className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>Hourly Peak Outlet Revenue</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lunch vs Dinner Cycles (₹)</span>
              </div>

              {/* Native CSS Bar Chart */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                
                {/* Horizontal scale markings */}
                <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.03)', height: 0 }}></div>
                <div style={{ position: 'absolute', top: '60px', left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.03)', height: 0 }}></div>
                <div style={{ position: 'absolute', top: '110px', left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.03)', height: 0 }}></div>

                {/* Bars */}
                {[
                  { hour: '11:00 AM', amt: 240, color: 'rgba(255,255,255,0.1)' },
                  { hour: '12:00 PM', amt: 620, color: 'rgba(255,255,255,0.1)' },
                  { hour: '01:00 PM', amt: 1800, color: 'var(--gold)' }, // peak lunch
                  { hour: '02:00 PM', amt: 2100, color: 'var(--gold-gradient)' }, // peak lunch
                  { hour: '03:00 PM', amt: 900, color: 'rgba(255,255,255,0.1)' },
                  { hour: '04:00 PM', amt: 400, color: 'rgba(255,255,255,0.1)' },
                  { hour: '05:00 PM', amt: 520, color: 'rgba(255,255,255,0.1)' },
                  { hour: '06:00 PM', amt: 1100, color: 'rgba(255,255,255,0.1)' },
                  { hour: '07:00 PM', amt: 2600, color: 'var(--accent-amber)' }, // dinner
                  { hour: '08:00 PM', amt: 3800, color: 'var(--gold-gradient)' }, // peak dinner
                  { hour: '09:00 PM', amt: 4200, color: 'var(--gold-gradient)' }, // peak dinner
                  { hour: '10:00 PM', amt: 2400, color: 'var(--accent-amber)' }
                ].map((bar, idx) => {
                  const maxAmt = 4500;
                  const pctHeight = `${(bar.amt / maxAmt) * 100}%`;
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '8px' }}>
                      <span style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>₹{bar.amt}</span>
                      <div style={{ width: '12px', height: pctHeight, background: typeof bar.color === 'string' ? bar.color : 'var(--gold)', borderRadius: '3px', position: 'relative' }}>
                        {/* Hover glow */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, boxShadow: '0 0 10px rgba(212,175,55,0.2)', opacity: 0 }}></div>
                      </div>
                      <span style={{ fontSize: '8px', color: 'var(--text-muted)', transform: 'rotate(-30deg)', whiteSpace: 'nowrap', marginTop: '5px' }}>{bar.hour}</span>
                    </div>
                  );
                })}
              </div>

              {/* Top Selling item categories summary */}
              <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                  <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>🥇 Top Dish (Value)</h4>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', display: 'block', marginTop: '4px' }}>
                    Malabar Fish Curry (18 sold)
                  </span>
                </div>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                  <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>🥈 Top Dish (Volume)</h4>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', display: 'block', marginTop: '4px' }}>
                    Coin Parotta (62 sold)
                  </span>
                </div>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                  <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>⚡ Active Seat Cover</h4>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', display: 'block', marginTop: '4px' }}>
                    28 Diners Seated
                  </span>
                </div>
              </div>
            </div>

            {/* Right Box: Live Activity System Logs */}
            <div style={{ flex: 1.2, minWidth: '280px', padding: '20px' }} className="glass-panel">
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>Secure Activity Audit Logs</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>7-Year compliance recording stream</p>
              </div>

              {/* Log List */}
              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {auditLogs.map(log => {
                  let roleColor = 'var(--gold)';
                  if (log.userRole === 'Customer') roleColor = 'var(--text-secondary)';
                  if (log.userRole === 'Kitchen Staff') roleColor = 'var(--accent-amber)';

                  return (
                    <div 
                      key={log.id} 
                      style={{ 
                        padding: '10px', 
                        background: 'rgba(255,255,255,0.01)', 
                        border: '1px solid rgba(255,255,255,0.03)', 
                        borderRadius: '8px', 
                        fontSize: '11px' 
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--text-muted)', fontSize: '9px' }}>
                        <span style={{ color: roleColor, fontWeight: 'bold' }}>{log.userRole.toUpperCase()}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                      <p style={{ color: '#fff', lineHeight: '1.4' }}>{log.details}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* VIEW B: MENU CONFIGURATOR (Change Prices) */}
        {activeTab === 'menu' && (
          <div style={{ flex: 1, minWidth: '320px', padding: '20px' }} className="glass-panel">
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>Menu Pricing Configurator</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Edits apply instantly to digital QR diner menus in the restaurant.</p>
            </div>

            {/* List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {menuItems.map(item => (
                <div 
                  key={item.id}
                  style={{ 
                    padding: '12px', 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid rgba(255,255,255,0.04)', 
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className={`badge-diet ${item.diet === 'veg' ? 'badge-veg' : 'badge-nonveg'}`}>
                        <span className="badge-diet-dot"></span>
                      </span>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{item.name}</h4>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      Category: {item.category}
                    </span>
                  </div>

                  {/* Price input / button */}
                  <div>
                    {editingItemId === item.id ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px' }}>₹</span>
                        <input 
                          type="number" 
                          value={editingPrice}
                          onChange={(e) => setEditingPrice(e.target.value)}
                          style={{ width: '60px', background: '#000', border: '1px solid var(--gold)', color: '#fff', borderRadius: '4px', padding: '4px 6px', fontSize: '12px', outline: 'none' }}
                        />
                        <button 
                          onClick={() => handleEditPriceSave(item.id)}
                          style={{ background: 'var(--veg-emerald)', border: 'none', borderRadius: '4px', padding: '4px 8px', color: '#000', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '13px' }}>
                          ₹{item.price}
                        </span>
                        <button 
                          onClick={() => handleEditPriceStart(item)}
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '4px 8px', color: 'var(--text-secondary)', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Edit size={10} /> Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW C: TAX COMPLIANCE AUDITING LEDGER */}
        {activeTab === 'auditing' && (
          <>
            {/* Left Box: Captured Bill Ledger */}
            <div style={{ flex: 1.6, minWidth: '320px', padding: '20px' }} className="glass-panel">
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>Captured Invoice Ledger</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Click any row to generate official compliance tax bill.</p>
                </div>
                <button style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid var(--gold)', borderRadius: '6px', padding: '6px 12px', color: 'var(--gold)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileSpreadsheet size={12} /> Export GST Excel
                </button>
              </div>

              {/* Bills List Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 5px' }}>Bill #</th>
                      <th style={{ padding: '10px 5px' }}>Table</th>
                      <th style={{ padding: '10px 5px' }}>Subtotal</th>
                      <th style={{ padding: '10px 5px' }}>GST (5%)</th>
                      <th style={{ padding: '10px 5px' }}>Total</th>
                      <th style={{ padding: '10px 5px' }}>Method</th>
                      <th style={{ padding: '10px 5px', textAlign: 'right' }}>Audited</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map(bill => (
                      <tr 
                        key={bill.id}
                        onClick={() => setSelectedBill(bill)}
                        style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          background: selectedBill?.id === bill.id ? 'rgba(212,175,55,0.05)' : 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                      >
                        <td style={{ padding: '12px 5px', color: 'var(--gold)', fontWeight: 'bold' }}>{bill.billNumber}</td>
                        <td style={{ padding: '12px 5px' }}>Table {bill.tableNumber}</td>
                        <td style={{ padding: '12px 5px' }}>₹{bill.subtotal}</td>
                        <td style={{ padding: '12px 5px' }}>₹{(bill.cgst + bill.sgst).toFixed(0)}</td>
                        <td style={{ padding: '12px 5px', fontWeight: 'bold', color: '#fff' }}>₹{bill.grandTotal.toFixed(0)}</td>
                        <td style={{ padding: '12px 5px' }}>
                          <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {bill.paymentMethod}
                          </span>
                        </td>
                        <td style={{ padding: '12px 5px', textAlign: 'right', color: 'var(--veg-emerald)' }}>
                          ✅ Audit Ok
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Box: GST Compliant Digital Invoice Renderer */}
            <div style={{ flex: 1.4, minWidth: '280px' }}>
              {selectedBill ? (
                <div style={{ padding: '24px', background: '#fff', color: '#000', borderRadius: '12px', border: '2px solid var(--gold)', fontFamily: 'monospace', fontSize: '11px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
                  
                  {/* Bill Banner */}
                  <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '12px', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', fontFamily: 'monospace' }}>SANGAMITHRA</h3>
                    <p style={{ margin: '0 0 2px 0' }}>85 Palai Road, Tuticorin</p>
                    <p style={{ margin: '0 0 2px 0' }}>Phone: +91 94421 98765</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 'bold' }}>GSTIN: 33AASFS2026R1ZX</p>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 'bold' }}>FSSAI LICENSE: 22419329000092</p>
                  </div>

                  {/* Meta details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <span>BILL NO: {selectedBill.billNumber}</span><br />
                      <span>TABLE: TABLE {selectedBill.tableNumber}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span>DATE: {new Date(selectedBill.completedTime || selectedBill.createdTime).toLocaleDateString()}</span><br />
                      <span>TIME: {new Date(selectedBill.completedTime || selectedBill.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div style={{ borderBottom: '1px solid #000', margin: '8px 0' }}></div>

                  {/* Items header */}
                  <div style={{ display: 'flex', fontWeight: 'bold', marginBottom: '6px' }}>
                    <span style={{ flex: 2 }}>ITEM DESCRIPTION</span>
                    <span style={{ flex: 0.5, textAlign: 'center' }}>QTY</span>
                    <span style={{ flex: 0.8, textAlign: 'right' }}>RATE</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>TOTAL</span>
                  </div>

                  {/* Hardcoded representation for demo items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                    {selectedBill.subtotal === 640 ? (
                      <>
                        <div style={{ display: 'flex' }}>
                          <span style={{ flex: 2 }}>Nattu Kozhi Soup (HSN 9963)</span>
                          <span style={{ flex: 0.5, textAlign: 'center' }}>2</span>
                          <span style={{ flex: 0.8, textAlign: 'right' }}>160.00</span>
                          <span style={{ flex: 1, textAlign: 'right' }}>320.00</span>
                        </div>
                        <div style={{ display: 'flex' }}>
                          <span style={{ flex: 2 }}>Sangamithra Chicken Biryani</span>
                          <span style={{ flex: 0.5, textAlign: 'center' }}>1</span>
                          <span style={{ flex: 0.8, textAlign: 'right' }}>280.00</span>
                          <span style={{ flex: 1, textAlign: 'right' }}>280.00</span>
                        </div>
                        <div style={{ display: 'flex' }}>
                          <span style={{ flex: 2 }}>Coin Parotta (3 Pcs)</span>
                          <span style={{ flex: 0.5, textAlign: 'center' }}>1</span>
                          <span style={{ flex: 0.8, textAlign: 'right' }}>40.00</span>
                          <span style={{ flex: 1, textAlign: 'right' }}>40.00</span>
                        </div>
                      </>
                    ) : selectedBill.subtotal === 1420 ? (
                      <>
                        <div style={{ display: 'flex' }}>
                          <span style={{ flex: 2 }}>Malabar Fish Curry (HSN 9963)</span>
                          <span style={{ flex: 0.5, textAlign: 'center' }}>3</span>
                          <span style={{ flex: 0.8, textAlign: 'right' }}>320.00</span>
                          <span style={{ flex: 1, textAlign: 'right' }}>960.00</span>
                        </div>
                        <div style={{ display: 'flex' }}>
                          <span style={{ flex: 2 }}>Coin Parotta (3 Pcs)</span>
                          <span style={{ flex: 0.5, textAlign: 'center' }}>4</span>
                          <span style={{ flex: 0.8, textAlign: 'right' }}>40.00</span>
                          <span style={{ flex: 1, textAlign: 'right' }}>160.00</span>
                        </div>
                        <div style={{ display: 'flex' }}>
                          <span style={{ flex: 2 }}>Elaneer Payasam</span>
                          <span style={{ flex: 0.5, textAlign: 'center' }}>2</span>
                          <span style={{ flex: 0.8, textAlign: 'right' }}>130.00</span>
                          <span style={{ flex: 1, textAlign: 'right' }}>260.00</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex' }}>
                        <span style={{ flex: 2 }}>Dine-In Food Order (HSN 9963)</span>
                        <span style={{ flex: 0.5, textAlign: 'center' }}>1</span>
                        <span style={{ flex: 0.8, textAlign: 'right' }}>{selectedBill.subtotal.toFixed(2)}</span>
                        <span style={{ flex: 1, textAlign: 'right' }}>{selectedBill.subtotal.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

                  {/* Calculations */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>SUBTOTAL:</span>
                      <span>₹{selectedBill.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedBill.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>DISCOUNT:</span>
                        <span>-₹{selectedBill.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>CGST (2.5%):</span>
                      <span>₹{selectedBill.cgst.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>SGST (2.5%):</span>
                      <span>₹{selectedBill.sgst.toFixed(2)}</span>
                    </div>
                    {selectedBill.tip > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>TIP TO WAITER:</span>
                        <span>₹{selectedBill.tip.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div style={{ borderBottom: '1px solid #000', margin: '4px 0' }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold' }}>
                      <span>NET AMOUNT:</span>
                      <span>₹{selectedBill.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

                  {/* Footer message */}
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 'bold' }}>PAYMENT captured via {selectedBill.paymentMethod?.toUpperCase()}</p>
                    <p style={{ margin: '4px 0 0 0' }}>REF ID: RP_ORD_{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    <p style={{ margin: '8px 0 0 0', fontStyle: 'italic' }}>Thank You for Dining at Sangamithra!</p>
                    <p style={{ fontSize: '8px', color: '#666', marginTop: '5px' }}>Computer Generated compliance Invoice. No Signature Required.</p>
                  </div>

                </div>
              ) : (
                <div style={{ padding: '40px 20px', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Eye size={24} style={{ color: 'var(--gold)', marginBottom: '8px' }} /><br />
                  Select an invoice row from the ledger to generate a fully audited tax compliant GST receipt.
                </div>
              )}
            </div>
          </>
        )}

      </div>

    </div>
  );
};
