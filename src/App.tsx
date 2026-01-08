import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import PostDetail from './pages/PostDetail';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        <main style={{ flex: 1, paddingTop: '64px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:id" element={<PostDetail />} />
            <Route path="/about" element={<div className="container" style={{ paddingTop: 'var(--space-xxl)' }}><h1>SYSTEM_INFO</h1><p style={{ color: 'var(--text-dim)', marginTop: '20px' }}>NeoBlog v1.0.0 - A minimalist tech space.</p></div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
