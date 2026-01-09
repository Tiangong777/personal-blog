import React from 'react';
import { Github, Twitter, Mail, ArrowUp } from 'lucide-react';

const Footer: React.FC = () => {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <footer className="relative mt-32 border-t border-border-color bg-bg-card">
            {/* Gradient Line Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent" />

            <div className="container py-16 flex flex-col items-center gap-12">
                <div className="flex gap-8">
                    {[
                        { icon: Github, href: '#' },
                        { icon: Twitter, href: '#' },
                        { icon: Mail, href: '#' }
                    ].map((item, index) => (
                        <a
                            key={index}
                            href={item.href}
                            className="p-3 rounded-full bg-white/5 text-text-dim hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 border border-white/5"
                        >
                            <item.icon size={20} />
                        </a>
                    ))}
                </div>

                <div className="text-center space-y-4">
                    <p className="text-[10px] font-bold tracking-[0.4em] text-text-dim/50 uppercase">
                        © 2026 NEO_BLOG <span className="mx-2">⬩</span> ALL SYSTEMS OPERATIONAL
                    </p>
                    <p className="text-[9px] text-accent-blue/40 font-mono">
                        DESIGNED BY <span className="hover:text-accent-blue transition-colors cursor-crosshair tracking-widest font-black uppercase">Antigravity AI</span>
                    </p>
                </div>

                <button
                    onClick={scrollToTop}
                    className="group p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-accent-blue hover:text-black transition-all duration-500"
                >
                    <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform" />
                </button>
            </div>
        </footer>
    );
};

export default Footer;
