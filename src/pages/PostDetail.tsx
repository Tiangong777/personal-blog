import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Tag, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import matter from 'gray-matter';
import { Buffer } from 'buffer';
import postsIndex from '../posts-index.json';
import 'katex/dist/katex.min.css';

// Fix for gray-matter environment
if (typeof window !== 'undefined') {
    (window as any).Buffer = Buffer;
}

const PostDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [content, setContent] = useState<string>('');
    const [postInfo, setPostInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const post = postsIndex.find(p => p.id === Number(id));
        if (post) {
            setPostInfo(post);
            fetch(`/${post.path}`)
                .then(res => res.text())
                .then(text => {
                    const { content: markdownContent } = matter(text);
                    setContent(markdownContent);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error loading post:', err);
                    setLoading(false);
                });
        }
    }, [id]);

    if (loading) {
        return <div className="container" style={{ paddingTop: 'var(--space-xxl)', color: 'var(--accent-blue)' }}>ACCESSING_DATABASE...</div>;
    }

    if (!postInfo) {
        return <div className="container" style={{ paddingTop: 'var(--space-xxl)' }}>Post Not Found.</div>;
    }

    return (
        <div className="container" style={{ paddingTop: 'var(--space-xxl)', maxWidth: '900px' }}>
            <Link to="/blog" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                color: 'var(--accent-blue)',
                fontSize: '0.8rem',
                marginBottom: 'var(--space-xl)',
                letterSpacing: '1px'
            }}>
                <ArrowLeft size={16} /> BACK_TO_ARCHIVE
            </Link>

            <motion.article
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <header style={{ marginBottom: 'var(--space-xxl)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: 'var(--space-md)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {postInfo.date}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={14} /> {postInfo.category}</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: 'var(--space-md)' }}>{postInfo.title}</h1>
                </header>

                <div className="markdown-content" style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: 1.8 }}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                    >
                        {content}
                    </ReactMarkdown>
                </div>

                <footer style={{ marginTop: 'var(--space-xxl)', padding: 'var(--space-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>END_OF_TRANSMISSION</span>
                    <button style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Share2 size={16} /> SHARE
                    </button>
                </footer>
            </motion.article>
        </div>
    );
};

export default PostDetail;
