// Theme color definitions
// Colors are defined as RGB tuples [r, g, b] for CSS variables
// Gradients are defined as hex color arrays

export interface CustomTheme {
  bgPrimary: [number, number, number];
  bgSecondary: [number, number, number];
  bgTertiary: [number, number, number];
  bgHover: [number, number, number];
  textPrimary: [number, number, number];
  textSecondary: [number, number, number];
  textTertiary: [number, number, number];
  border: [number, number, number];
  borderLight: [number, number, number];
  accent: [number, number, number];
  accentLight: [number, number, number];
  accentHover: [number, number, number];
  accentGradient: [string, string]; // [from, to] hex colors
  success: [number, number, number];
  successLight: [number, number, number];
  error: [number, number, number];
  errorLight: [number, number, number];
  warning: [number, number, number];
  warningLight: [number, number, number];
}

export interface AnimationConfig {
  // Complete React component code as string
  // The code should be a complete React component function: ({ config }) => { ... }
  // It has access to useTheme() hook and receives { config } as parameter
  code: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  light: CustomTheme;
  dark: CustomTheme;
  animation?: AnimationConfig;
}

// Default theme (purple/blue)
const defaultLight: CustomTheme = {
  bgPrimary: [249, 250, 251],      // gray-50
  bgSecondary: [255, 255, 255],    // white
  bgTertiary: [243, 244, 246],     // gray-100
  bgHover: [229, 231, 235],        // gray-200
  textPrimary: [17, 24, 39],       // gray-900
  textSecondary: [75, 85, 99],     // gray-600
  textTertiary: [156, 163, 175],   // gray-400
  border: [229, 231, 235],          // gray-200
  borderLight: [243, 244, 246],    // gray-100
  accent: [147, 51, 234],           // purple-600 (couleur originale)
  accentLight: [243, 232, 255],    // purple-50
  accentHover: [126, 34, 206],     // purple-700
  accentGradient: ['#9333ea', '#2563eb'], // purple-600 to blue-600
  success: [22, 163, 74],           // green-600
  successLight: [240, 253, 244],   // green-50
  error: [220, 38, 38],             // red-600
  errorLight: [254, 242, 242],     // red-50
  warning: [234, 179, 8],           // yellow-500
  warningLight: [254, 252, 232],    // yellow-50
};

const defaultDark: CustomTheme = {
  bgPrimary: [17, 24, 39],         // gray-900
  bgSecondary: [31, 41, 55],       // gray-800
  bgTertiary: [55, 65, 81],        // gray-700
  bgHover: [75, 85, 99],           // gray-600
  textPrimary: [249, 250, 251],    // gray-50
  textSecondary: [209, 213, 219],  // gray-300
  textTertiary: [156, 163, 175],   // gray-400
  border: [75, 85, 99],             // gray-600
  borderLight: [55, 65, 81],       // gray-700
  accent: [168, 85, 247],           // purple-500
  accentLight: [88, 28, 135],      // purple-900
  accentHover: [192, 132, 252],    // purple-400
  accentGradient: ['#a855f7', '#3b82f6'], // purple-500 to blue-500
  success: [34, 197, 94],           // green-500
  successLight: [20, 83, 45],       // green-900
  error: [239, 68, 68],             // red-500
  errorLight: [127, 29, 29],        // red-900
  warning: [250, 204, 21],          // yellow-400
  warningLight: [113, 63, 18],     // yellow-900
};

// Christmas theme (red/green)
const christmasLight: CustomTheme = {
  bgPrimary: [254, 242, 242],      // red-50
  bgSecondary: [255, 255, 255],    // white
  bgTertiary: [254, 226, 226],     // red-100
  bgHover: [254, 202, 202],        // red-200
  textPrimary: [127, 29, 29],      // red-900
  textSecondary: [153, 27, 27],    // red-800
  textTertiary: [185, 28, 28],     // red-700
  border: [254, 202, 202],         // red-200
  borderLight: [254, 226, 226],   // red-100
  accent: [220, 38, 38],           // red-600
  accentLight: [254, 242, 242],   // red-50
  accentHover: [185, 28, 28],      // red-700
  accentGradient: ['#dc2626', '#16a34a'], // red-600 to green-600
  success: [22, 163, 74],           // green-600
  successLight: [240, 253, 244],   // green-50
  error: [220, 38, 38],             // red-600
  errorLight: [254, 242, 242],     // red-50
  warning: [234, 179, 8],           // yellow-500
  warningLight: [254, 252, 232],    // yellow-50
};

const christmasDark: CustomTheme = {
  bgPrimary: [17, 24, 39],         // gray-900 (noir)
  bgSecondary: [31, 41, 55],       // gray-800
  bgTertiary: [55, 65, 81],        // gray-700
  bgHover: [75, 85, 99],           // gray-600
  textPrimary: [254, 242, 242],    // red-50 (texte clair)
  textSecondary: [254, 202, 202],  // red-200
  textTertiary: [252, 165, 165],  // red-300
  border: [75, 85, 99],            // gray-600
  borderLight: [55, 65, 81],      // gray-700
  accent: [239, 68, 68],           // red-500
  accentLight: [20, 83, 45],       // green-900 (pour contraste)
  accentHover: [248, 113, 113],   // red-400
  accentGradient: ['#ef4444', '#22c55e'], // red-500 to green-500
  success: [34, 197, 94],          // green-500
  successLight: [20, 83, 45],      // green-900
  error: [239, 68, 68],            // red-500
  errorLight: [127, 29, 29],        // red-900
  warning: [250, 204, 21],         // yellow-400
  warningLight: [113, 63, 18],     // yellow-900
};

export const themes: ThemeDefinition[] = [
  {
    id: 'default',
    name: 'Default',
    light: defaultLight,
    dark: defaultDark,
    // No animation config = uses DefaultWave
  },
  {
    id: 'christmas',
    name: 'Christmas',
    light: christmasLight,
    dark: christmasDark,
    // Note: animation.code will be automatically added when exported
  },
];

export function getAllThemes(): ThemeDefinition[] {
  return themes;
}

export function getThemeById(id: string): ThemeDefinition | undefined {
  return themes.find((theme) => theme.id === id);
}

export function getDefaultTheme(): ThemeDefinition {
  return themes[0];
}

