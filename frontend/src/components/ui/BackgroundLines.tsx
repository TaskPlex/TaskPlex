import React, { useState, useEffect } from 'react';

interface BackgroundLinesProps {
  className?: string;
  svgOptions?: {
    duration?: number;
  };
  children?: React.ReactNode;
}

export const BackgroundLines: React.FC<BackgroundLinesProps> = ({
  className = '',
  svgOptions = { duration: 10 },
  children,
}) => {
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const strokeColor = isDark 
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(107, 114, 128, 0.12)';

  // Generate multiple wavy lines with smooth Bezier curves
  const lines = Array.from({ length: 6 }, (_, i) => {
    const baseY = 120 + i * 50;
    const waveLength = 400;
    const amplitude = 25 + i * 4;
    
    // Create smooth wavy path using quadratic Bezier curves
    let path = `M 0,${baseY}`;
    for (let x = 0; x <= 3000; x += waveLength) {
      const controlX = x + waveLength / 2;
      const controlY = baseY + (i % 2 === 0 ? -amplitude : amplitude);
      const endX = x + waveLength;
      const endY = baseY;
      path += ` Q ${controlX},${controlY} ${endX},${endY}`;
    }
    
    return {
      id: `line-${i}`,
      path,
      offset: i * 200,
    };
  });

  return (
    <div className={`relative w-full ${className}`}>
      {/* Background Lines SVG */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 3000 500"
        >
          {lines.map((line, index) => (
            <path
              key={line.id}
              d={line.path}
              stroke={strokeColor}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`${line.offset} 0; ${line.offset - 1000} 0; ${line.offset} 0`}
                dur={`${(svgOptions.duration || 10) + index * 2}s`}
                repeatCount="indefinite"
              />
            </path>
          ))}
        </svg>
      </div>

      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
};

