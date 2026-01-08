import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer style={{
            padding: 'var(--space-xxl) var(--space-xl) var(--space-xl)',
            borderTop: '1px solid var(--border-color)',
            marginTop: 'var(--space-xxl)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-lg)'
        }}>
            <div style={{ display: 'flex', gap: 'var(--space-xl)' }}>
                <a href="#" style={{ color: 'var(--text-dim)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-blue)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>
                    <Github size={20} />
                </a>
                <a href="#" style={{ color: 'var(--text-dim)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-blue)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>
                    <Twitter size={20} />
                </a>
                <a href="#" style={{ color: 'var(--text-dim)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-blue)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>
                    <Mail size={20} />
                </a>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                <p>© 2026 NEO_BLOG. ALL RIGHTS RESERVED.</p>
                <p style={{ marginTop: '4px', fontSize: '0.7rem' }}>ESTABLISHED: 2026.01.08 // STATUS: OPERATIONAL</p>
            </div>
        </footer>
    );
};

export default Footer;
