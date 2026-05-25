import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative min-h-screen overflow-hidden bg-bg-base transition-colors duration-500">
        {children}
    </div>
);

export default Layout;
