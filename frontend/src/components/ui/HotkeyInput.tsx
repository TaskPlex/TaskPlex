import React, { useState, useEffect, useRef } from 'react';
import { Keyboard } from 'lucide-react';
import { formatHotkey, parseHotkeyFromEvent, type Hotkey } from '../../utils/hotkeyParser';

interface HotkeyInputProps {
  value: Hotkey | null;
  onChange: (hotkey: Hotkey | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const HotkeyInput: React.FC<HotkeyInputProps> = ({
  value,
  onChange,
  placeholder = 'Press a key combination...',
  disabled = false,
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [displayValue, setDisplayValue] = useState<string>('');
  const inputRef = useRef<HTMLDivElement>(null);

  // Detect if running on Mac
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);

  // Update display value when value changes
  useEffect(() => {
    const updateDisplay = () => {
      if (value && value.key) {
        setDisplayValue(formatHotkey(value, isMac));
      } else {
        setDisplayValue('');
      }
    };
    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(updateDisplay, 0);
    return () => clearTimeout(timeoutId);
  }, [value, isMac]);

  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Don't record if only modifiers are pressed
      if (['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) {
        return;
      }

      const hotkey = parseHotkeyFromEvent(e);
      
      // Require at least one modifier
      if (!hotkey.ctrl && !hotkey.meta && !hotkey.alt && !hotkey.shift) {
        return;
      }

      onChange(hotkey);
      setIsRecording(false);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // If Escape is pressed, cancel recording
      if (e.key === 'Escape') {
        setIsRecording(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording, onChange]);

  const handleClick = () => {
    if (!disabled) {
      setIsRecording(true);
      inputRef.current?.focus();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setIsRecording(false);
  };

  return (
    <div
      ref={inputRef}
      onClick={handleClick}
      className={`
        relative
        flex items-center gap-2
        px-3 py-2
        bg-white dark:bg-gray-800
        border-2 rounded-lg
        cursor-pointer
        transition-all duration-200
        ${isRecording 
          ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-200 dark:ring-purple-800' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      tabIndex={disabled ? -1 : 0}
    >
      <Keyboard 
        size={16} 
        className={`flex-shrink-0 ${
          isRecording 
            ? 'text-purple-600 dark:text-purple-400' 
            : 'text-gray-400 dark:text-gray-500'
        }`} 
      />
      
      <div className="flex-1 min-w-0">
        {displayValue ? (
          <div className="flex items-center gap-2">
            <kbd className="
              px-2 py-1
              text-sm font-medium
              text-gray-700 dark:text-gray-300
              bg-gray-100 dark:bg-gray-700
              border border-gray-200 dark:border-gray-600
              rounded
            ">
              {displayValue}
            </kbd>
            {!disabled && (
              <button
                onClick={handleClear}
                className="
                  text-xs text-gray-400 hover:text-gray-600
                  dark:text-gray-500 dark:hover:text-gray-300
                  transition-colors
                "
                aria-label="Clear hotkey"
              >
                Clear
              </button>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {isRecording ? 'Press key combination...' : placeholder}
          </span>
        )}
      </div>

      {isRecording && (
        <div className="absolute -top-8 left-0 text-xs text-purple-600 dark:text-purple-400 font-medium">
          Recording... Press Escape to cancel
        </div>
      )}
    </div>
  );
};

