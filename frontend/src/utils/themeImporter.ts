import type { ThemeDefinition, CustomTheme, AnimationConfig } from '../config/themes';
import { ChristmasAnimation } from '../components/ui/ThemeAnimations';
import { extractAnimationCode } from './animationExporter';

/**
 * Validates if an object matches the CustomTheme interface
 */
function isValidCustomTheme(obj: any): obj is CustomTheme {
  if (!obj || typeof obj !== 'object') return false;

  const requiredFields: (keyof CustomTheme)[] = [
    'bgPrimary',
    'bgSecondary',
    'bgTertiary',
    'bgHover',
    'textPrimary',
    'textSecondary',
    'textTertiary',
    'border',
    'borderLight',
    'accent',
    'accentLight',
    'accentHover',
    'accentGradient',
    'success',
    'successLight',
    'error',
    'errorLight',
    'warning',
    'warningLight',
  ];

  for (const field of requiredFields) {
    if (!(field in obj)) return false;

    if (field === 'accentGradient') {
      // accentGradient should be an array of 2 strings
      if (!Array.isArray(obj[field]) || obj[field].length !== 2) return false;
      if (typeof obj[field][0] !== 'string' || typeof obj[field][1] !== 'string') return false;
    } else {
      // All other fields should be RGB tuples [number, number, number]
      if (!Array.isArray(obj[field]) || obj[field].length !== 3) return false;
      if (
        typeof obj[field][0] !== 'number' ||
        typeof obj[field][1] !== 'number' ||
        typeof obj[field][2] !== 'number'
      ) {
        return false;
      }
      // Validate RGB values are in range 0-255
      if (
        obj[field][0] < 0 || obj[field][0] > 255 ||
        obj[field][1] < 0 || obj[field][1] > 255 ||
        obj[field][2] < 0 || obj[field][2] > 255
      ) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates if an object matches the AnimationConfig interface
 */
function isValidAnimationConfig(obj: any): obj is AnimationConfig {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.code !== 'string' || obj.code.trim() === '') return false;
  return true;
}

/**
 * Validates if an object matches the ThemeDefinition interface
 */
function isValidThemeDefinition(obj: any): obj is ThemeDefinition {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.id !== 'string' || obj.id.trim() === '') return false;
  if (typeof obj.name !== 'string' || obj.name.trim() === '') return false;
  if (!isValidCustomTheme(obj.light)) return false;
  if (!isValidCustomTheme(obj.dark)) return false;
  // Animation is optional, but if present, must be valid
  if (obj.animation !== undefined && !isValidAnimationConfig(obj.animation)) return false;
  return true;
}

/**
 * Imports a theme from a JSON string
 * @param json JSON string containing theme definition
 * @returns ThemeDefinition if valid, throws error otherwise
 */
export function importTheme(json: string): ThemeDefinition {
  try {
    const parsed = JSON.parse(json);
    
    if (!isValidThemeDefinition(parsed)) {
      throw new Error('Invalid theme structure. Theme must have id, name, light, and dark properties with valid color values.');
    }

    // Validate gradient colors are valid hex
    const validateGradient = (gradient: [string, string]) => {
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexRegex.test(gradient[0]) || !hexRegex.test(gradient[1])) {
        throw new Error('Invalid gradient colors. Must be valid hex colors (e.g., #ff0000).');
      }
    };

    validateGradient(parsed.light.accentGradient);
    validateGradient(parsed.dark.accentGradient);

    return parsed;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse theme JSON. Please check the file format.');
  }
}

/**
 * Exports a theme to a JSON string
 * Automatically includes animation code for built-in animations
 * @param theme ThemeDefinition to export
 * @returns JSON string
 */
export function exportTheme(theme: ThemeDefinition): string {
  // Create a copy of the theme to avoid mutating the original
  const themeToExport: ThemeDefinition = JSON.parse(JSON.stringify(theme));
  
  // If the theme has an animation but no code, try to extract it from built-in components
  if (themeToExport.animation && !themeToExport.animation.code) {
    // Map theme IDs to their corresponding animation components
    const themeAnimationMap: Record<string, Function> = {
      'christmas': ChristmasAnimation,
    };
    
    const component = themeAnimationMap[themeToExport.id];
    if (component) {
      // Extract the code from the component
      themeToExport.animation.code = extractAnimationCode(component);
    }
  }
  
  // Clean up: ensure only 'code' is in animation (remove any legacy fields)
  if (themeToExport.animation) {
    const { code } = themeToExport.animation as any;
    if (code) {
      themeToExport.animation = { code };
    } else {
      // If no code, remove animation entirely
      delete themeToExport.animation;
    }
  }
  
  return JSON.stringify(themeToExport, null, 2);
}

/**
 * Validates a theme file before import
 * @param file File object to validate
 * @returns Promise that resolves to ThemeDefinition if valid
 */
export async function validateThemeFile(file: File): Promise<ThemeDefinition> {
  if (!file.name.endsWith('.json')) {
    throw new Error('Theme file must be a JSON file (.json)');
  }

  const text = await file.text();
  return importTheme(text);
}

