import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => (
    <section className="min-h-[75vh] flex flex-col justify-center items-center text-center px-6">
        <div className="max-w-3xl mx-auto animate-in">
            <h1 className="mb-8">
                思考，创造，<br /><span className="text-accent">分享</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-12 max-w-xl mx-auto">
                AI、数学、摄影与生活。一个记录思考和创造的个人空间。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/blog"
                    className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors">
                    阅读文章
                </Link>
                <Link to="/ai-manage"
                    className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-accent transition-colors">
                    项目管理
                </Link>
            </div>
        </div>
    </section>
);

export default Hero;
