import React from 'react';
import PostCard from '../components/PostCard';
import postsIndex from '../posts-index.json';

const BlogList: React.FC = () => {
    return (
        <div className="container" style={{ paddingTop: 'var(--space-xxl)', minHeight: '80vh' }}>
            <header style={{ marginBottom: 'var(--space-xxl)' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>EXPLORE_LOGS</h1>
                <p style={{ color: 'var(--text-dim)', marginTop: 'var(--space-sm)' }}>
                    System Archive: <span className="glow-text" style={{ color: 'var(--accent-blue)' }}>{postsIndex.length}</span> entries found.
                </p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 'var(--space-lg)'
            }}>
                {postsIndex.map((post) => (
                    <PostCard key={post.id} {...post} />
                ))}
            </div>
        </div>
    );
};

export default BlogList;
