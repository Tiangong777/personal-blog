import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import PostDetail from './pages/PostDetail';

import LegalChat from './pages/LegalChat';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', transition: 'background-color var(--transition-fast)' }}>
        <Navbar theme={theme} toggleTheme={toggleTheme} />

        <main style={{ flex: 1, paddingTop: '64px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:id" element={<PostDetail />} />
            <Route path="/chat" element={<LegalChat />} />
            <Route path="/about" element={<div className="container" style={{ paddingTop: 'var(--space-xxl)' }}><h1>SYSTEM_INFO</h1><p style={{ color: 'var(--text-dim)', marginTop: '20px' }}>NeoBlog v1.0.0 - A minimalist tech space.</p></div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
