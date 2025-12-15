/**
 * Truncates a filename if it's too long, keeping the extension visible
 * @param filename - The full filename
 * @param maxLength - Maximum length before truncation (default: 30)
 * @returns Truncated filename with ellipsis if needed
 */
export const truncateFilename = (filename: string, maxLength: number = 30): string => {
  if (filename.length <= maxLength) return filename;
  
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    // No extension, just truncate
    return filename.substring(0, maxLength - 3) + '...';
  }
  
  const name = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex);
  
  if (extension.length >= maxLength - 3) {
    // Extension is too long, just show it
    return '...' + extension;
  }
  
  const availableLength = maxLength - extension.length - 3; // 3 for "..."
  return name.substring(0, availableLength) + '...' + extension;
};

