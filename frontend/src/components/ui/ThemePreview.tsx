import React from 'react';
import type { ThemeDefinition } from '../../config/themes';

interface ThemePreviewProps {
  theme: ThemeDefinition;
  isActive?: boolean;
  onClick?: () => void;
  showLabel?: boolean;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  isActive = false,
  onClick,
  showLabel = true,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200 text-left cursor-pointer
        ${isActive
          ? 'border-theme-accent bg-theme-accent-light shadow-md'
          : 'border-theme bg-theme-tertiary hover:border-theme hover:shadow-sm'
        }
      `}
    >
      {showLabel && (
        <div className="font-semibold text-theme-primary mb-3">
          {theme.name}
        </div>
      )}
      
      {/* Color preview */}
      <div className="space-y-2">
        {/* Light mode preview */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-theme-secondary w-12">Light:</span>
          <div className="flex-1 flex gap-1 h-6 rounded overflow-hidden">
            <div
              className="flex-1"
              style={{ backgroundColor: `rgb(${theme.light.bgPrimary.join(', ')})` }}
              title="Background Primary"
            />
            <div
              className="flex-1"
              style={{ backgroundColor: `rgb(${theme.light.bgSecondary.join(', ')})` }}
              title="Background Secondary"
            />
            <div
              className="flex-1"
              style={{ backgroundColor: `rgb(${theme.light.accent.join(', ')})` }}
              title="Accent"
            />
            <div
              className="flex-1"
              style={{ 
                background: `linear-gradient(to right, ${theme.light.accentGradient[0]}, ${theme.light.accentGradient[1]})` 
              }}
              title="Accent Gradient"
            />
          </div>
        </div>
        
        {/* Dark mode preview */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-theme-secondary w-12">Dark:</span>
          <div className="flex-1 flex gap-1 h-6 rounded overflow-hidden">
            <div
              className="flex-1"
              style={{ backgroundColor: `rgb(${theme.dark.bgPrimary.join(', ')})` }}
              title="Background Primary"
            />
            <div
              className="flex-1"
              style={{ backgroundColor: `rgb(${theme.dark.bgSecondary.join(', ')})` }}
              title="Background Secondary"
            />
            <div
              className="flex-1"
              style={{ backgroundColor: `rgb(${theme.dark.accent.join(', ')})` }}
              title="Accent"
            />
            <div
              className="flex-1"
              style={{ 
                background: `linear-gradient(to right, ${theme.dark.accentGradient[0]}, ${theme.dark.accentGradient[1]})` 
              }}
              title="Accent Gradient"
            />
          </div>
        </div>
      </div>

      {isActive && (
        <div className="mt-3 text-xs text-theme-accent font-medium">
          ✓ Active
        </div>
      )}
    </button>
  );
};

