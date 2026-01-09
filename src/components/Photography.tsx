import React from 'react';
import { motion } from 'framer-motion';

const photos = [
    { id: 1, url: '/photos/cyberpunk.png', title: 'Neon Pulse', category: 'Street' },
    { id: 2, url: '/photos/tech.png', title: 'Minimal Flow', category: 'Interior' },
    { id: 3, url: '/photos/abstract.png', title: 'Urban Geometry', category: 'Architecture' },
];

const Photography: React.FC = () => {
    return (
        <section>
            <div className="flex justify-between items-end mb-12 border-l-4 border-accent-blue pl-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-outfit font-black tracking-tighter uppercase">Photo_Gallery</h2>
                    <p className="text-text-dim font-mono text-xs mt-2 font-bold tracking-widest opacity-50 uppercase">Visual Archive</p>
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-text-dim uppercase">Captured Moment</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {photos.map((photo, index) => (
                    <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative glass-card rounded-3xl overflow-hidden cursor-crosshair"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <img
                                src={photo.url}
                                alt={photo.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                <span className="px-6 py-2 border border-white/20 rounded-full text-white text-xs font-bold backdrop-blur-md">
                                    VIEW_FULL_FRAME
                                </span>
                            </div>
                            <div className="absolute top-4 right-4 px-3 py-1 bg-accent-blue/80 backdrop-blur-md rounded-full text-[10px] text-black font-black">
                                {photo.category.toUpperCase()}
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg font-outfit font-bold group-hover:text-accent-blue transition-colors">{photo.title}</h3>
                            <p className="text-xs text-text-dim mt-1 font-mono tracking-tighter opacity-50">Neo_Capture // {new Date().getFullYear()}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Photography;
