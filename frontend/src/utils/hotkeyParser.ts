/**
 * Utility functions for parsing and formatting keyboard shortcuts
 */

export interface Hotkey {
  ctrl?: boolean;
  meta?: boolean; // Cmd on Mac, Windows key on Windows
  alt?: boolean;
  shift?: boolean;
  key: string; // The main key (e.g., 'k', 'Enter', 'Escape')
}

/**
 * Parses a keyboard event into a Hotkey object
 */
export function parseHotkeyFromEvent(event: KeyboardEvent): Hotkey {
  return {
    ctrl: event.ctrlKey,
    meta: event.metaKey,
    alt: event.altKey,
    shift: event.shiftKey,
    key: event.key.toLowerCase(),
  };
}

/**
 * Converts a Hotkey object to a string representation
 * Examples: "Ctrl+K", "Ctrl+Shift+K", "Cmd+K" (Mac)
 */
export function formatHotkey(hotkey: Hotkey, isMac: boolean = false): string {
  const parts: string[] = [];
  
  if (hotkey.ctrl && !isMac) {
    parts.push('Ctrl');
  }
  if (hotkey.meta || (hotkey.ctrl && isMac)) {
    parts.push(isMac ? 'Cmd' : 'Win');
  }
  if (hotkey.alt) {
    parts.push('Alt');
  }
  if (hotkey.shift) {
    parts.push('Shift');
  }
  
  // Format the key
  let keyDisplay = hotkey.key;
  if (keyDisplay.length === 1) {
    keyDisplay = keyDisplay.toUpperCase();
  } else {
    // Handle special keys
    const specialKeys: Record<string, string> = {
      ' ': 'Space',
      'arrowup': '↑',
      'arrowdown': '↓',
      'arrowleft': '←',
      'arrowright': '→',
      'enter': 'Enter',
      'escape': 'Esc',
      'tab': 'Tab',
      'backspace': 'Backspace',
      'delete': 'Delete',
    };
    keyDisplay = specialKeys[keyDisplay.toLowerCase()] || keyDisplay;
  }
  
  parts.push(keyDisplay);
  
  return parts.join('+');
}

/**
 * Converts a Hotkey object to a normalized string for storage/comparison
 * Format: "ctrl+meta+alt+shift+key"
 */
export function hotkeyToString(hotkey: Hotkey): string {
  const parts: string[] = [];
  if (hotkey.ctrl) parts.push('ctrl');
  if (hotkey.meta) parts.push('meta');
  if (hotkey.alt) parts.push('alt');
  if (hotkey.shift) parts.push('shift');
  parts.push(hotkey.key.toLowerCase());
  return parts.join('+');
}

/**
 * Parses a string representation back to a Hotkey object
 * Format: "ctrl+meta+alt+shift+key"
 */
export function parseHotkeyFromString(str: string): Hotkey | null {
  const parts = str.toLowerCase().split('+');
  if (parts.length === 0) return null;
  
  const hotkey: Hotkey = {
    key: parts[parts.length - 1], // Last part is always the key
  };
  
  for (let i = 0; i < parts.length - 1; i++) {
    const modifier = parts[i];
    switch (modifier) {
      case 'ctrl':
        hotkey.ctrl = true;
        break;
      case 'meta':
        hotkey.meta = true;
        break;
      case 'alt':
        hotkey.alt = true;
        break;
      case 'shift':
        hotkey.shift = true;
        break;
    }
  }
  
  return hotkey;
}

/**
 * Checks if two hotkeys are equal
 */
export function hotkeysEqual(a: Hotkey, b: Hotkey): boolean {
  return hotkeyToString(a) === hotkeyToString(b);
}

/**
 * Checks if a hotkey is valid (has at least one modifier and a key)
 */
export function isValidHotkey(hotkey: Hotkey): boolean {
  if (!hotkey || !hotkey.key || hotkey.key.length === 0) {
    return false;
  }
  const hasModifier = !!(hotkey.ctrl || hotkey.meta || hotkey.alt || hotkey.shift);
  return hasModifier;
}

