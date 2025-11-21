import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de l'API Tauri si nécessaire pour les composants qui l'utilisent directement
// (Ici on utilise surtout axios via api.ts, donc on mockera axios)

// Mock window.matchMedia pour certains composants UI
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

