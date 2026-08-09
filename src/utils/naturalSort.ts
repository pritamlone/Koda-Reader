/**
 * Utility for natural sorting of file names/paths (e.g., page1.jpg, page2.jpg, page10.jpg)
 */

const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'bmp',
  'svg',
  'tiff',
  'avif',
]);

export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

export function isSupportedImageFile(path: string): boolean {
  const normalized = normalizePath(path);
  const segments = normalized.split('/');
  const filename = segments[segments.length - 1];

  // Ignore OS junk and hidden files
  if (!filename || filename.startsWith('.') || filename.startsWith('__MACOSX')) {
    return false;
  }

  const extParts = filename.split('.');
  if (extParts.length < 2) return false;
  const ext = extParts[extParts.length - 1].toLowerCase();

  return SUPPORTED_IMAGE_EXTENSIONS.has(ext);
}

/**
 * Natural comparison function comparing numbers inside strings as actual numbers
 */
export function naturalCompare(aPath: string, bPath: string): number {
  const normA = normalizePath(aPath);
  const normB = normalizePath(bPath);

  // Extract pure file names for sorting, or compare full paths if in different directories
  const fileA = normA.split('/').pop() || normA;
  const fileB = normB.split('/').pop() || normB;

  return fileA.localeCompare(fileB, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

/**
 * Sort array of file path strings naturally
 */
export function sortEntryPathsNaturally(paths: string[]): string[] {
  return [...paths].filter(isSupportedImageFile).sort(naturalCompare);
}
