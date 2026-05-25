import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => (
    <section className="relative min-h-[80vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto animate-rise">
            <p className="text-sm text-text-secondary mb-6 tracking-wide">个人博客 · 技术 · 摄影 · 生活</p>
            <h1 className="mb-8 leading-[1.1]">思考，创造，<br /><span className="text-accent italic">分享</span></h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-10 max-w-xl mx-auto">AI、数学、摄影与生活。一个记录思考和创造的个人空间。</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/blog" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20">阅读文章</Link>
                <Link to="/ai-manage" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-border hover:border-accent/40 text-text-secondary hover:text-text-primary text-sm transition-all card-glass">项目管理</Link>
            </div>
        </div>
    </section>
);

export default Hero;
