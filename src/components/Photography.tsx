import React from 'react';

const photos = [
    { id: 1, url: '/photos/cyberpunk.png', title: 'Neon Pulse', category: 'Street' },
    { id: 2, url: '/photos/tech.png', title: 'Minimal Flow', category: 'Interior' },
    { id: 3, url: '/photos/abstract.png', title: 'Urban Geometry', category: 'Architecture' },
];

const Photography: React.FC = () => {
    return (
        <section style={{ marginTop: 'var(--space-xxl)' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 'var(--space-xl)',
                borderLeft: '4px solid var(--accent-blue)',
                paddingLeft: 'var(--space-md)'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>PHOTO_GALLERY</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>CAPTURED_MOMENTS</span>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-lg)'
            }}>
                {photos.map((photo) => (
                    <div
                        key={photo.id}
                        className="glass"
                        style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            transition: 'transform var(--transition-fast)',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                            <img
                                src={photo.url}
                                alt={photo.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'var(--transition-slow)'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                padding: '4px 12px',
                                background: 'var(--accent-glow)',
                                backdropFilter: 'blur(5px)',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                color: 'white',
                                fontWeight: 600
                            }}>
                                {photo.category}
                            </div>
                        </div>
                        <div style={{ padding: 'var(--space-md)' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{photo.title}</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Neo_Capture {new Date().getFullYear()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Photography;
