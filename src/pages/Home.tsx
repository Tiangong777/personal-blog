import React from 'react';
import Hero from '../components/Hero';
import Photography from '../components/Photography';
import TravelMap from '../components/TravelMap';
import { Link } from 'react-router-dom';
import postIndex from '../posts-index.json';

const recentPosts = [...postIndex]
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

const Home: React.FC = () => (
    <div>
        <Hero />

        {/* Recent Posts */}
        <section className="max-w-5xl mx-auto px-6 py-24">
            <div className="text-center mb-14">
                <h2 className="mb-2">最新文章</h2>
                <p className="text-sm text-text-secondary">技术分享与思考</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentPosts.map((post: any, i: number) => (
                    <Link key={post.id} to={`/blog/${post.id}`}
                        className="group card-glass p-6 cursor-pointer flex flex-col gap-4 animate-rise"
                        style={{ animationDelay: `${i * 0.1}s` }}>
                        <span className="text-xs text-accent font-semibold">{post.category}</span>
                        <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">{post.title}</h3>
                        <p className="text-sm text-text-secondary/80 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                        <span className="text-xs text-text-secondary mt-auto">{post.date}</span>
                    </Link>
                ))}
            </div>
            <div className="text-center mt-10">
                <Link to="/blog" className="text-sm text-accent hover:text-accent-hover transition-colors">查看全部文章 →</Link>
            </div>
        </section>

        {/* Photography */}
        <section className="py-24 bg-bg-surface/30">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-14">
                    <h2 className="mb-2">摄影作品</h2>
                    <p className="text-sm text-text-secondary">用镜头记录世界</p>
                </div>
                <Photography />
            </div>
        </section>

        {/* Travel Map */}
        <section className="max-w-6xl mx-auto px-6 py-24">
            <TravelMap />
        </section>

        {/* Toolbox */}
        <section className="py-24 bg-bg-surface/30">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-14">
                    <h2 className="mb-2">工具箱</h2>
                    <p className="text-sm text-text-secondary">AI 驱动的实用工具集</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {[
                        { label: '项目管理', desc: 'AI驱动的项目资源管理器', path: '/ai-manage' },
                        { label: '招聘AI', desc: '简历智能匹配与评估', path: '/talent' },
                        { label: '量化分析', desc: '股票数据与市场洞察', path: '/stock' },
                        { label: '文章', desc: '技术分享与思考', path: '/blog' },
                    ].map((item, i) => (
                        <Link key={item.label} to={item.path}
                            className="card-glass p-6 text-center animate-rise"
                            style={{ animationDelay: `${i * 0.1}s` }}>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-accent">{item.label}</h3>
                            <p className="text-xs text-text-secondary">{item.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    </div>
);

export default Home;
