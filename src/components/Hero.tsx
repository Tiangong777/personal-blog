import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from './Button';

const Hero: React.FC = () => {
    return (
        <section className="relative h-[85vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden">
            {/* Background Light Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />

            <div className="relative z-10 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-accent-blue animate-ping" />
                        <span className="text-[10px] font-bold tracking-[0.3em] text-accent-blue uppercase">Design System Active</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-outfit font-black tracking-tighter leading-tight mb-8 text-text-main">
                        CODE <span className="text-gradient">&</span> CONTENT
                    </h1>

                    <p className="max-w-xl mx-auto text-lg md:text-xl text-text-dim leading-relaxed mb-12">
                        探索科技边界，记录简约生活。一个致力于将复杂逻辑转化为优雅体验的数字空间。
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link to="/blog">
                            <Button size="lg" className="min-w-[200px] py-4">
                                EXPLORE_LOGS
                            </Button>
                        </Link>
                        <Link to="/chat">
                            <Button variant="secondary" size="lg" className="min-w-[200px] py-4">
                                LAUNCH_CORE_AI
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Vertical Line Deco */}
            <div className="absolute bottom-0 left-1/2 w-px h-24 bg-gradient-to-t from-accent-blue/50 to-transparent" />
        </section>
    );
};

export default Hero;
