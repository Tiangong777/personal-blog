import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

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
            whileHover={{ y: -5 }}
            onClick={() => id && navigate(`/blog/${id}`)}
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                padding: 'var(--space-lg)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-sm)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', letterSpacing: '1px' }}>{category.toUpperCase()}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{date}</span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: 'var(--space-sm)' }}>{title}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: 'var(--space-md)' }}>{excerpt}</p>

            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                READ LOG <ArrowUpRight size={14} />
            </div>

            {/* Subtle corner accent */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '4px',
                height: '4px',
                background: 'var(--accent-blue)',
                opacity: 0,
                transition: 'opacity var(--transition-fast)'
            }} className="accent-dot"></div>
        </motion.div>
    );
};

export default PostCard;
