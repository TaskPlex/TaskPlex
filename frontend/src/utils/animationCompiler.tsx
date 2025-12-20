import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
// @ts-ignore - @babel/standalone doesn't have TypeScript definitions
import { transform } from '@babel/standalone';

/**
 * Compiles animation code string into a React component
 * WARNING: This uses Function() to execute code, only use with trusted theme sources
 * 
 * The codeString should be a complete React component function, e.g.:
 * ```
 * () => {
 *   const { resolvedTheme } = useTheme();
 *   const color = resolvedTheme === 'light' 
 *     ? 'rgba(37, 99, 235, 0.9)'
 *     : 'rgba(255, 255, 255, 0.9)';
 *   return (
 *     <svg className="absolute inset-0 w-full h-full">
 *       // Your animation JSX here
 *     </svg>
 *   );
 * }
 * ```
 * 
 * @param codeString The complete React component code as string (can contain JSX)
 * @returns A React component or null if compilation fails
 */
export function compileAnimationCode(
  codeString: string
): React.FC | null {
  try {
    // Wrap the code in a function that has access to React and useTheme
    const wrappedCode = `
      (function(React, useTheme) {
        ${codeString}
      })
    `;

    // Compile JSX to JavaScript using Babel
    const compiledCode = transform(wrappedCode, {
      presets: ['react'],
      plugins: [],
    }).code;

    if (!compiledCode) {
      console.error('Failed to compile animation code');
      return null;
    }

    // Create a function that returns the component
    const createComponent = new Function(
      'React',
      'useTheme',
      `return ${compiledCode}`
    );

    // Create a wrapper component that uses the compiled code
    const CompiledComponent: React.FC = () => {
      const theme = useTheme();
      
      try {
        // Execute the compiled code to get the component function
        const componentFunction = createComponent(React, theme);
        
        // Call the component function
        const result = componentFunction();
        
        // Return the JSX result
        return result;
      } catch (error) {
        console.error('Error executing animation code:', error);
        return null;
      }
    };

    return CompiledComponent;
  } catch (error) {
    console.error('Error compiling animation code:', error);
    return null;
  }
}

/**
 * Extracts the function body from a complete function string
 * Useful when exporting complete functions
 */
export function extractFunctionBody(functionString: string): string {
  // Remove function declaration and extract body
  const match = functionString.match(/(?:export\s+const\s+\w+\s*[:=]\s*)?(?:React\.FC)?\s*[=:]\s*\([^)]*\)\s*=>\s*\{([\s\S]*)\}\s*;?$/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no match, try to extract content between first { and last }
  const firstBrace = functionString.indexOf('{');
  const lastBrace = functionString.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return functionString.substring(firstBrace + 1, lastBrace).trim();
  }
  
  // If all else fails, return the original string
  return functionString;
}

