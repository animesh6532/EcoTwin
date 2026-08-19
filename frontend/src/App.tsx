import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Simulation from './pages/Simulation';
import Analytics from './pages/Analytics';
import Scenarios from './pages/Scenarios';
import { useWebSocket } from './hooks/useWebSocket';
import { LayoutDashboard, Radio, BarChart3, Sliders, Leaf } from 'lucide-react';

type Page = 'dashboard' | 'simulation' | 'analytics' | 'scenarios';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  // Connect to websocket backend automatically
  useWebSocket();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'simulation':
        return <Simulation />;
      case 'analytics':
        return <Analytics />;
      case 'scenarios':
        return <Scenarios />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="nav-sidebar">
        <div className="brand-header">
          <Leaf size={28} color="var(--accent-cyan)" fill="var(--accent-cyan)" />
          <span>EcoTwin</span>
        </div>
        
        <nav className="nav-links">
          <div 
            onClick={() => setCurrentPage('dashboard')} 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>

          <div 
            onClick={() => setCurrentPage('simulation')} 
            className={`nav-item ${currentPage === 'simulation' ? 'active' : ''}`}
          >
            <Radio size={18} />
            <span>Simulation</span>
          </div>

          <div 
            onClick={() => setCurrentPage('analytics')} 
            className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </div>

          <div 
            onClick={() => setCurrentPage('scenarios')} 
            className={`nav-item ${currentPage === 'scenarios' ? 'active' : ''}`}
          >
            <Sliders size={18} />
            <span>Scenarios</span>
          </div>
        </nav>
        
        {/* Footnotes */}
        <div style={{ marginTop: 'auto', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          <div>Digital Twin Environment v1.0</div>
          <div>SUMO 1.16 Client Connected</div>
        </div>
      </aside>

      {/* Main Pages Workspace */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
