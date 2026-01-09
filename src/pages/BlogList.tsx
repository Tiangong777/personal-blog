import React from 'react';
import PostCard from '../components/PostCard';
import postsIndex from '../posts-index.json';
import { motion } from 'framer-motion';

const BlogList: React.FC = () => {
    return (
        <div className="container py-24 min-h-[80vh]">
            <header className="mb-20 border-l-4 border-accent-blue pl-6">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-5xl font-outfit font-black tracking-tighter"
                >
                    EXPLORE_LOGS
                </motion.h1>
                <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-dim opacity-50 uppercase tracking-widest">System Archive:</span>
                    <span className="text-accent-blue font-bold font-mono">{postsIndex.length}</span>
                    <span className="text-[10px] font-mono text-text-dim opacity-50 uppercase tracking-widest">entries indexed</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {postsIndex.map((post, index) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <PostCard {...post} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default BlogList;
