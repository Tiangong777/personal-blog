import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
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
                .catch(() => setLoading(false));
        }
    }, [id]);

    if (loading) {
        return (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!postInfo) {
        return <div className="py-40 text-center text-text-secondary">文章未找到</div>;
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-16">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors mb-12">
                <ArrowLeft size={14} /> 返回文章列表
            </Link>

            <article className="animate-in">
                <header className="mb-12 pb-8 border-b border-border">
                    <div className="flex flex-wrap gap-3 text-xs text-text-secondary mb-6">
                        <span className="flex items-center gap-1"><Clock size={12} /> {postInfo.date}</span>
                        <span>·</span>
                        <span className="text-accent">{postInfo.category}</span>
                    </div>
                    <h1>{postInfo.title}</h1>
                </header>

                <div className="markdown-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </article>
        </div>
    );
};

export default PostDetail;
