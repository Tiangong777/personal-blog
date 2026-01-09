import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Sun, Moon, Menu, X } from 'lucide-react';

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'ARCHIVE', path: '/blog' },
    { name: 'AI_AGENT', path: '/chat' },
    { name: 'LOGS', path: '/about' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ${isScrolled ? 'pt-4' : 'pt-8'
        }`}
    >
      <div className={`
        relative px-6 py-3 flex items-center justify-between gap-12 rounded-full transition-all duration-500
        ${isScrolled ? 'glass shadow-2xl w-[90%] md:w-auto' : 'bg-transparent w-[90%] md:w-auto'}
      `}>
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-accent-blue/10 rounded-xl group-hover:bg-accent-blue/20 transition-colors">
            <Cpu size={20} className="text-accent-blue animate-pulse" />
          </div>
          <span className="font-outfit font-bold text-lg tracking-widest text-text-main group-hover:text-accent-blue transition-colors">
            NEO<span className="text-accent-blue">_</span>BLOG
          </span>
        </NavLink>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `
                relative px-4 py-2 text-xs font-bold tracking-widest transition-all
                ${isActive ? 'text-white' : 'text-text-dim hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-accent-blue/10 border border-accent-blue/20 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-accent-blue hover:bg-white/10 transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] text-green-500 font-mono tracking-tighter">SERVER_LIVE</span>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-2xl md:hidden flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-outfit font-bold tracking-tighter text-text-dim hover:text-accent-blue transition-all"
              >
                {link.name}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
