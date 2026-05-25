import React from 'react';

const photos = [
    { id: 1, url: '/photos/cyberpunk.png', title: 'Neon Pulse', category: 'Street' },
    { id: 2, url: '/photos/tech.png', title: 'Minimal Flow', category: 'Interior' },
    { id: 3, url: '/photos/abstract.png', title: 'Urban Geometry', category: 'Architecture' },
];

const Photography: React.FC = () => (
    <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {photos.map((photo) => (
                <div key={photo.id} className="group relative overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden">
                        <img src={photo.url} alt={photo.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="text-white font-semibold">{photo.title}</h3>
                        <p className="text-xs text-white/70">{photo.category}</p>
                    </div>
                </div>
            ))}
        </div>
    </section>
);

export default Photography;
