import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Tag, Share2, BookOpen } from 'lucide-react';
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
        return (
            <div className="container py-40 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono font-bold tracking-widest text-accent-blue animate-pulse">ACCESSING_LOG_BUFFER...</span>
            </div>
        );
    }

    if (!postInfo) {
        return <div className="container py-40 text-center text-text-dim font-mono">CRITICAL_ERROR: LOG_NOT_FOUND</div>;
    }

    return (
        <div className="container py-12 md:py-24 max-w-4xl">
            <Link to="/blog" className="group inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-accent-blue hover:brightness-125 transition-all mb-12">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                BACK_TO_ARCHIVE
            </Link>

            <motion.article
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                {/* Header Decoration */}
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-accent-blue/5 rounded-full blur-3xl -z-10" />

                <header className="mb-16 pb-12 border-b border-white/5">
                    <div className="flex flex-wrap gap-4 text-[10px] font-mono font-bold tracking-tighter text-text-dim mb-6 uppercase">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <Clock size={12} className="text-accent-blue" /> {postInfo.date}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue">
                            <Tag size={12} /> {postInfo.category}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <BookOpen size={12} /> {Math.ceil(content.length / 500)} MIN_READ
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-outfit font-black tracking-tighter leading-[1.1]">
                        {postInfo.title}
                    </h1>
                </header>

                <div className="markdown-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                    >
                        {content}
                    </ReactMarkdown>
                </div>

                <footer className="mt-20 p-8 rounded-3xl glass border-accent-blue/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold tracking-widest text-text-dim/50">TRANSMISSION_ID</span>
                        <span className="text-xs font-mono text-accent-blue">UUID-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                            <Share2 size={14} /> SHARE_SIGNAL
                        </button>
                    </div>
                </footer>
            </motion.article>
        </div>
    );
};

export default PostDetail;
