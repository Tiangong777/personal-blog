import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import PostDetail from './pages/PostDetail';
import StockPortal from './pages/StockPortal';
import TalentAI from './pages/TalentAI';
import AiManageChat from './pages/AiManageChat';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppContent() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-text-primary transition-colors duration-500">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-1 pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<PostDetail />} />
          <Route path="/planner" element={<Navigate to="/" replace />} />
          <Route path="/stock" element={<StockPortal />} />
          <Route path="/talent" element={<TalentAI />} />
          <Route path="/ai-manage" element={<AiManageChat />} />
          <Route path="/about" element={
            <div className="max-w-2xl mx-auto px-6 py-32 text-center">
              <p className="text-6xl mb-8">🍉</p>
              <h1 className="mb-6">关于</h1>
              <p className="text-text-secondary leading-relaxed">
                一个关于 AI、数学、摄影与生活的个人博客。记录思考，分享创造。
              </p>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
