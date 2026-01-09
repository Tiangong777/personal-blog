import React from 'react';
import { motion } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-bg-dark transition-colors duration-500">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-blue/5 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-blue/5 rounded-full blur-[150px] animate-pulse-slow delay-1000" />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03] dark:invert"
                    style={{ backgroundImage: 'radial-gradient(circle, var(--text-main) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default Layout;
