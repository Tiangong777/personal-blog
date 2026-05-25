import React from 'react';

const photos = [
    { id: 1, url: '/photos/cyberpunk.png', title: 'Neon Pulse', category: 'Street' },
    { id: 2, url: '/photos/tech.png', title: 'Minimal Flow', category: 'Interior' },
    { id: 3, url: '/photos/abstract.png', title: 'Urban Geometry', category: 'Architecture' },
];

const Photography: React.FC = () => (
    <section className="overflow-hidden rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
            {photos.map((photo) => (
                <div key={photo.id} className="group relative overflow-hidden bg-bg-base">
                    <div className="aspect-[4/3] overflow-hidden">
                        <img src={photo.url} alt={photo.title}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:saturate-110" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <h3 className="text-white font-semibold text-lg">{photo.title}</h3>
                        <p className="text-sm text-white/70">{photo.category}</p>
                    </div>
                </div>
            ))}
        </div>
    </section>
);

export default Photography;
