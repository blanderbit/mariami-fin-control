import React from 'react';
import logoIcon from './most final .png';

interface LogoIconProps {
    className?: string;
    width?: string | number;
    height?: string | number;
}

const LogoIcon: React.FC<LogoIconProps> = ({ className, width = 24, height = 24 }) => {
    return (
        <img 
            src={logoIcon} 
            alt="FinclAI Logo Icon" 
            width={width}
            height={height}
            className={className}
        />
    );
};

export default LogoIcon;
