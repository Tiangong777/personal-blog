import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';

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
    { name: '首页', path: '/' },
    { name: '文章', path: '/blog' },
    { name: '量化', path: '/stock' },
    { name: '招聘AI', path: '/talent' },
    { name: '项目管理', path: '/ai-manage' },
    { name: '关于', path: '/about' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ${isScrolled ? 'pt-2' : 'pt-6'}`}>
      <div className={`relative px-6 py-3 flex items-center justify-between gap-8 rounded-full transition-all duration-500 ${isScrolled ? 'bg-bg-base/80 backdrop-blur-xl border border-border shadow-sm w-[95%] md:w-auto' : 'bg-transparent w-[95%] md:w-auto'}`}>
        <NavLink to="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-2xl group-hover:scale-110 transition-transform">🍉</span>
          <span className="text-base font-bold tracking-tight hover:text-accent transition-colors">的博客</span>
        </NavLink>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path}
              className={({ isActive }) =>
                `relative px-3 py-1.5 text-sm transition-colors duration-300 ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`
              }
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent rounded-full" />}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-bg-surface transition-colors text-text-secondary hover:text-text-primary">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="md:hidden text-text-secondary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-bg-base/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center gap-6">
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)}
              className="text-xl font-medium text-text-secondary hover:text-accent transition-colors">
              {link.name}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
