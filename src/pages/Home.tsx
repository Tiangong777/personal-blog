import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import PostCard from '../components/PostCard';
import Photography from '../components/Photography';
import TravelMap from '../components/TravelMap';
import postsIndex from '../posts-index.json';

// Take the latest 3 posts as featured
const featuredPosts = [...postsIndex]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

const Home: React.FC = () => {
    return (
        <div className="flex flex-col gap-24 md:gap-40">
            <Hero />

            <main className="container space-y-32 md:space-y-48">
                <Photography />
                <TravelMap />

                <section>
                    <div className="flex justify-between items-end mb-12 border-l-4 border-accent-blue pl-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-outfit font-black tracking-tighter">FEATURED_LOGS</h2>
                            <p className="text-text-dim font-mono text-sm mt-2 font-bold tracking-widest opacity-50 uppercase">Knowledge Base Update</p>
                        </div>
                        <Link
                            to="/blog"
                            className="text-xs font-bold tracking-widest text-accent-blue hover:underline underline-offset-8 decoration-2"
                        >
                            VIEW_ALL_INDEX
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredPosts.map((post) => (
                            <PostCard key={post.id} {...post} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
