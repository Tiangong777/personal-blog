import React from 'react';
import PostCard from '../components/PostCard';
import postsIndex from '../posts-index.json';

const BlogList: React.FC = () => (
    <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="mb-4">文章</h1>
        <p className="text-text-secondary mb-16">{postsIndex.length} 篇文章</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {postsIndex.map((post: any) => (
                <PostCard key={post.id} {...post} />
            ))}
        </div>
    </div>
);

export default BlogList;
