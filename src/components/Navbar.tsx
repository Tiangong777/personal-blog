import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
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

      <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 'var(--space-xl)', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
          <Link to="/" style={{ transition: 'var(--transition-fast)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>HOME</Link>
          <Link to="/blog" style={{ transition: 'var(--transition-fast)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>ARCHIVE</Link>
          <Link to="/chat" style={{ transition: 'var(--transition-fast)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>AI_AGENT</Link>
          <Link to="/about" style={{ transition: 'var(--transition-fast)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>LOGS</Link>
        </div>

        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '50%',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--accent-blue)',
            transition: 'var(--transition-fast)'
          }}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div style={{ height: '10px', width: '10px', borderRadius: '50%', background: 'var(--accent-blue)', boxShadow: '0 0 10px var(--accent-blue)' }}></div>
      </div>
    </nav>
  );
};

export default Navbar;
