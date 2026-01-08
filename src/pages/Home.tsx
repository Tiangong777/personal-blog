import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import PostCard from '../components/PostCard';
import postsIndex from '../posts-index.json';

// Take the latest 3 posts as featured
const featuredPosts = [...postsIndex]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

const Home: React.FC = () => {
    return (
        <>
            <Hero />
            <section className="container" style={{ marginTop: 'var(--space-xxl)' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 'var(--space-xl)',
                    borderLeft: '4px solid var(--accent-blue)',
                    paddingLeft: 'var(--space-md)'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>FEATURED_LOGS</h2>
                    <Link to="/blog" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', letterSpacing: '1px' }}>VIEW_ALL</Link>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 'var(--space-lg)'
                }}>
                    {featuredPosts.map((post) => (
                        <PostCard key={post.id} {...post} />
                    ))}
                </div>
            </section>
        </>
    );
};

export default Home;
