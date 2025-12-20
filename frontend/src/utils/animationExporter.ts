/**
 * Utility to extract animation code from a React component function
 * This allows exporting the complete animation code as a string for theme files
 */

/**
 * Extracts the complete function code from a component
 * Returns the entire function as a string that can be stored in theme JSON
 * 
 * Example usage:
 * ```typescript
 * const code = extractAnimationCode(ChristmasAnimation);
 * // Then store in theme.animation.code
 * ```
 */
export function extractAnimationCode(componentFunction: Function): string {
  const functionString = componentFunction.toString();
  
  // Extract the function body (everything after the arrow or function declaration)
  // For arrow functions: ({ config }) => { ... } or () => { ... }
  // For regular functions: function Component() { ... }
  
  // Try to extract just the body if it's an arrow function
  const arrowMatch = functionString.match(/\([^)]*\)\s*=>\s*\{([\s\S]*)\}\s*;?$/);
  if (arrowMatch && arrowMatch[1]) {
    // Return as a simple arrow function (no props needed)
    return `() => {${arrowMatch[1]}}`;
  }
  
  // Try to extract from regular function
  const functionMatch = functionString.match(/function[^{]*\{([\s\S]*)\}\s*;?$/);
  if (functionMatch && functionMatch[1]) {
    // Convert to arrow function format
    return `() => {${functionMatch[1]}}`;
  }
  
  // If we can't parse it, return the whole function
  // The user will need to format it manually
  return functionString;
}

/**
 * Creates a code string from a component function that can be stored in theme JSON
 * This wraps the function in a way that can be compiled later
 * 
 * The returned string should be a complete function that:
 * - Accepts { config } as parameter
 * - Has access to useTheme() hook
 * - Returns JSX
 */
export function createAnimationCodeString(componentFunction: Function): string {
  return extractAnimationCode(componentFunction);
}

