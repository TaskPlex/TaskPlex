import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Default wave animation
export const DefaultWave: React.FC = () => {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
      <path
        d="M 0,100 Q 250,20 500,100 T 1000,100 T 1500,100 T 2000,100 T 2500,100 T 3000,100"
        strokeWidth="2"
        fill="none"
        className="stroke-gray-600/30 dark:stroke-white/40"
        style={{ filter: 'blur(0.5px)' }}
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          from="0 0"
          to="-1000 0"
          dur="12s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
};


// Christmas animation with falling snowflakes
export const ChristmasAnimation: React.FC<{ config?: any }> = ({ config }) => {
  const { resolvedTheme } = useTheme();
  
  // Use config if provided, otherwise use defaults based on theme
  const defaultColor = resolvedTheme === 'light' 
    ? 'rgba(37, 99, 235, 0.9)'  // blue-600 for light mode (much more visible)
    : 'rgba(255, 255, 255, 0.9)'; // white for dark mode
  
  const snowflakeColor = config?.snowflakeColor || defaultColor;
  const snowflakeCount = config?.snowflakeCount ?? 25;
  const minSize = config?.minSize ?? 4;
  const maxSize = config?.maxSize ?? 7;
  const minDuration = config?.minDuration ?? 4;
  const maxDuration = config?.maxDuration ?? 5.6;
  
  const createSnowflake = (i: number) => {
    const x = (i * 48) % 1000;
    const delay = i * 0.25;
    const duration = minDuration + (i % 4) * ((maxDuration - minDuration) / 4);
    const size = minSize + (i % 3) * ((maxSize - minSize) / 2);
    const startY = -10 - (i % 3) * 10;
    
    return (
      <g key={`snowflake-${i}`} transform={`translate(${x}, ${startY})`}>
        {/* Snowflake shape - 6 branches */}
        <g>
          {/* Vertical and horizontal lines */}
          <line x1="0" y1={-size} x2="0" y2={size} stroke={snowflakeColor} strokeWidth="2" />
          <line x1={-size} y1="0" x2={size} y2="0" stroke={snowflakeColor} strokeWidth="2" />
          {/* Diagonal lines */}
          <line x1={-size * 0.7} y1={-size * 0.7} x2={size * 0.7} y2={size * 0.7} stroke={snowflakeColor} strokeWidth="2" />
          <line x1={size * 0.7} y1={-size * 0.7} x2={-size * 0.7} y2={size * 0.7} stroke={snowflakeColor} strokeWidth="2" />
          {/* Small branches on each arm */}
          {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
            <g key={idx} transform={`rotate(${angle})`}>
              <line x1="0" y1={-size} x2="0" y2={-size * 1.5} stroke={snowflakeColor} strokeWidth="1.8" />
              <line x1={-size * 0.3} y1={-size * 1.2} x2={size * 0.3} y2={-size * 1.2} stroke={snowflakeColor} strokeWidth="1.8" />
            </g>
          ))}
        </g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values={`${x},${startY}; ${x},220`}
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0;360"
          dur={`${duration * 0.8}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
          additive="sum"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      </g>
    );
  };

  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 200">
      {[...Array(snowflakeCount)].map((_, i) => createSnowflake(i))}
    </svg>
  );
};

