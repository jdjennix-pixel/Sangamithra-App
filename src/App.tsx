import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { DinerApp } from './components/DinerApp';
import { KitchenKDS } from './components/KitchenKDS';
import { WaiterApp } from './components/WaiterApp';
import { AdminDashboard } from './components/AdminDashboard';
import { LayoutGrid } from 'lucide-react';

type AppRole = 'diner' | 'kds' | 'waiter' | 'admin';



const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<AppRole>('diner');

  const renderActiveView = () => {
    switch (activeRole) {
      case 'diner':
        return <DinerApp />;
      case 'kds':
        return <KitchenKDS />;
      case 'waiter':
        return <WaiterApp />;
      case 'admin':
        return <AdminDashboard />;
    }
  };

  const getRoleHeaderColor = () => {
    switch (activeRole) {
      case 'diner': return 'var(--gold)';
      case 'kds': return 'var(--accent-amber)';
      case 'waiter': return '#3B82F6';
      case 'admin': return 'var(--veg-emerald)';
    }
  };

  return (
    <AppProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#070705' }}>
        
        {/* --- MAIN PORTAL SIMULATION CONTROLLER SHELL --- */}
        <div style={{ background: 'rgba(10, 10, 8, 0.95)', borderBottom: '1px solid rgba(212, 175, 55, 0.1)', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 1000, backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'var(--gold-gradient)', padding: '8px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LayoutGrid size={18} style={{ color: '#000' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 'bold', letterSpacing: '1px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                  SANGAMITHRA SUITE SIMULATOR
                </h2>
                <span style={{ fontSize: '9px', color: 'var(--gold)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>
                  Interactive Client Showcase
                </span>
              </div>
            </div>

            {/* Switchers */}
            <div style={{ display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '30px', padding: '4px', gap: '4px', maxWidth: '100%' }}>
              {[
                { id: 'diner', label: '📱 Diner Web App' },
                { id: 'kds', label: '🍳 Kitchen Tablet' },
                { id: 'waiter', label: '🤵 Waiter Feed' },
                { id: 'admin', label: '📊 Admin Panel' }
              ].map(role => {
                const isActive = activeRole === role.id;
                let activeBg = 'transparent';
                let labelColor = 'var(--text-secondary)';

                if (isActive) {
                  labelColor = '#000';
                  activeBg = 'var(--gold-gradient)';
                }

                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id as AppRole)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      background: activeBg,
                      border: 'none',
                      color: labelColor,
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      fontFamily: 'var(--font-heading)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Device Frame Alert */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getRoleHeaderColor(), display: 'inline-block' }}></span>
              <span style={{ textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold', color: '#fff' }}>
                Active: {activeRole.toUpperCase()} VIEW
              </span>
            </div>

          </div>
        </div>

        {/* --- MAIN PAGE LAYOUT PANEL SPLIT --- */}
        <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
          
          {/* Main App Canvas */}
          <div style={{ flex: 1.8, minWidth: '320px', borderRight: '1px solid rgba(255,255,255,0.03)' }}>
            {renderActiveView()}
          </div>



        </div>
      </div>
    </AppProvider>
  );
};

export default App;
