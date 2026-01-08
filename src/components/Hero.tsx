import React from 'react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    return (
        <section style={{
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 var(--space-lg)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
                opacity: 0.1,
                zIndex: -1
            }}></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 style={{
                    fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                    fontWeight: 700,
                    marginBottom: 'var(--space-md)',
                    lineHeight: 1.1,
                    letterSpacing: '-2px'
                }}>
                    Code <span className="glow-text" style={{ color: 'var(--accent-blue)' }}>&</span> Content
                </h1>
                <p style={{
                    color: 'var(--text-dim)',
                    maxWidth: '600px',
                    fontSize: '1.1rem',
                    margin: '0 auto var(--space-xl) auto'
                }}>
                    探索科技边界，记录简约生活。一个致力于将复杂逻辑转化为优雅体验的数字空间。
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                style={{
                    padding: 'var(--space-md) var(--space-xl)',
                    border: '1px solid var(--accent-blue)',
                    color: 'var(--accent-blue)',
                    fontSize: '0.8rem',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    position: 'relative'
                }}
            >
                INITIALIZING SYSTEM...
                <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    borderRight: '2px solid var(--accent-blue)',
                    borderBottom: '2px solid var(--accent-blue)'
                }}></div>
            </motion.div>
        </section>
    );
};

export default Hero;
