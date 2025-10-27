import React from 'react';
import logoSvg from './most final .png';

interface LogoProps {
    className?: string;
    width?: string | number;
    height?: string | number;
}

const Logo: React.FC<LogoProps> = ({ className, width = 80, height = 80 }) => {
    return (
        <img 
            src={logoSvg} 
            alt="FinclAI Logo" 
            width={width}
            height={height}
            className={className}
        />
    );
};

export default Logo;
