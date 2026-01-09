import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}) => {
    const baseStyles = "relative inline-flex items-center justify-center font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";

    const variants = {
        primary: "bg-accent-blue text-black shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:shadow-[0_0_30px_rgba(0,242,255,0.4)]",
        secondary: "bg-white/5 text-text-main border border-white/10 hover:bg-white/10",
        ghost: "bg-transparent text-text-dim hover:text-text-main hover:bg-white/5",
    };

    const sizes = {
        sm: "px-4 py-1.5 text-xs rounded-md",
        md: "px-6 py-2.5 text-sm rounded-lg",
        lg: "px-8 py-3 text-base rounded-xl",
    };

    return (
        <motion.button
            whileHover={{ y: -2 }}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            <span className="relative z-10">{children}</span>
            {variant === 'primary' && (
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 italic" />
            )}
        </motion.button>
    );
};

export default Button;
