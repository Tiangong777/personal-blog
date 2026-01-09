import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, Hash } from 'lucide-react';

interface PostCardProps {
    id?: number;
    title: string;
    excerpt: string;
    date: string;
    category: string;
}

const PostCard: React.FC<PostCardProps> = ({ id, title, excerpt, date, category }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={{ y: -8 }}
            onClick={() => id && navigate(`/blog/${id}`)}
            className="group relative cursor-pointer"
        >
            {/* Glow Background */}
            <div className="absolute inset-0 bg-accent-blue/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative h-full glass-card p-8 rounded-3xl flex flex-col gap-6 overflow-hidden">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20">
                        <Hash size={12} className="text-accent-blue" />
                        <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">{category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-text-dim">
                        <Calendar size={12} />
                        {date}
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-2xl font-outfit font-bold leading-tight group-hover:text-accent-blue transition-colors">
                        {title}
                    </h3>
                    <p className="text-text-dim text-sm leading-relaxed line-clamp-3">
                        {excerpt}
                    </p>
                </div>

                <div className="mt-auto flex items-center gap-2 text-xs font-bold tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    READ_FULL_LOG <ArrowUpRight size={14} className="text-accent-blue" />
                </div>

                {/* Decorative border glow */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
        </motion.div>
    );
};

export default PostCard;
