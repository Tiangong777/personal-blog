import React from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div onClick={() => id && navigate(`/blog/${id}`)}
            className="group card-glass p-6 cursor-pointer animate-rise flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <span className="text-xs text-accent font-semibold">{category}</span>
                <span className="text-xs text-text-secondary">{date}</span>
            </div>
            <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">{title}</h3>
            <p className="text-sm text-text-secondary/80 line-clamp-3 leading-relaxed">{excerpt}</p>
            <span className="text-xs text-text-secondary/0 group-hover:text-accent transition-all duration-300 flex items-center gap-1">阅读 →</span>
        </div>
    );
};

export default PostCard;
