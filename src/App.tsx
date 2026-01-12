import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Layout from './components/Layout';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import PostDetail from './pages/PostDetail';
import LegalChat from './pages/LegalChat';
import YearEndPlanner from './pages/YearEndPlanner';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
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
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-500">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <Layout>
        <main className="flex-1 pt-24 pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:id" element={<PostDetail />} />
            <Route path="/chat" element={<LegalChat />} />
            <Route path="/planner" element={<YearEndPlanner />} />
            <Route path="/about" element={
              <div className="container py-20">
                <div className="glass p-12 rounded-3xl max-w-2xl mx-auto border-accent-blue/20">
                  <h1 className="text-4xl font-outfit font-bold mb-6 text-gradient">SYSTEM_STATUS</h1>
                  <p className="text-text-dim font-mono mb-4">Version: 2.1.0-PRO_MAX</p>
                  <p className="text-text-dim">Environment optimized for peak visual performance and smooth interaction logic.</p>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </Layout>

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
