import React from 'react';
import { useNavigate } from 'react-router-dom';
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
        <div onClick={() => id && navigate(`/blog/${id}`)}
            className="group card card-hover p-6 cursor-pointer animate-in flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <span className="text-xs text-accent font-medium">{category}</span>
                <span className="text-xs text-text-secondary">{date}</span>
            </div>
            <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">{title}</h3>
            <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">{excerpt}</p>
            <span className="text-xs text-text-secondary/0 group-hover:text-accent transition-all flex items-center gap-1">
                阅读 <ArrowUpRight size={12} />
            </span>
        </div>
    );
};

export default PostCard;
