import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="glass" style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1000,
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--space-xl)',
      borderBottom: '1px solid var(--glass-border)',
      justifyContent: 'space-between'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <Cpu size={24} color="var(--accent-blue)" />
        <span className="glow-text" style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '2px' }}>NEO_BLOG</span>
      </Link>

      <div style={{ display: 'flex', gap: 'var(--space-xl)', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
        <Link to="/" style={{ transition: 'var(--transition-fast)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>HOME</Link>
        <Link to="/blog" style={{ transition: 'var(--transition-fast)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>ARCHIVE</Link>
        <Link to="/about" style={{ transition: 'var(--transition-fast)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>LOGS</Link>
      </div>

      <div style={{ height: '10px', width: '10px', borderRadius: '50%', background: 'var(--accent-blue)', boxShadow: '0 0 10px var(--accent-blue)' }}></div>
    </nav>
  );
};

export default Navbar;
