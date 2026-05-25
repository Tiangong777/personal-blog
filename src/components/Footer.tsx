import React from 'react';

const Footer: React.FC = () => (
    <footer className="py-12 text-center">
        <div className="h-px w-16 bg-border mx-auto mb-8" />
        <p className="text-sm text-text-secondary">
            © {new Date().getFullYear()} 🍉的博客
        </p>
    </footer>
);

export default Footer;
