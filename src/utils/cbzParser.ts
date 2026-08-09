import JSZip from 'jszip';
import { ComicBook, ComicPageEntry } from '../types/comic';
import { sortEntryPathsNaturally, normalizePath } from './naturalSort';

export interface ParsedCBZResult {
  comic: ComicBook;
  zipInstance: JSZip;
}

export class CBZParser {
  /**
   * Parse a file or ArrayBuffer into a structured ComicBook object with lazy zip instance.
   */
  public static async parseCBZFile(
    file: File | ArrayBuffer,
    fileName: string = 'comic.cbz'
  ): Promise<ParsedCBZResult> {
    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
    const fileSize = file instanceof File ? file.size : arrayBuffer.byteLength;

    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(arrayBuffer);

    const allPaths: string[] = [];
    loadedZip.forEach((relativePath) => {
      allPaths.push(relativePath);
    });

    // Natural sort and filter for supported images
    const sortedImagePaths = sortEntryPathsNaturally(allPaths);

    if (sortedImagePaths.length === 0) {
      throw new Error('No valid image files (JPG, PNG, WebP) were found in this CBZ archive.');
    }

    const entries: ComicPageEntry[] = sortedImagePaths.map((path, index) => {
      const normalized = normalizePath(path);
      const fileNameOnly = normalized.split('/').pop() || normalized;
      return {
        index,
        entryPath: path,
        fileName: fileNameOnly,
      };
    });

    const title = fileName.replace(/\.(cbz|zip|cbr)$/i, '');

    const comic: ComicBook = {
      id: `cbz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fileName,
      title,
      totalPages: entries.length,
      entries,
      lastReadPage: 0,
      readingDirection: 'ltr',
      fileSize,
      createdAt: Date.now(),
      rawZipBuffer: arrayBuffer,
    };

    return {
      comic,
      zipInstance: loadedZip,
    };
  }

  /**
   * Lazily extract a single image entry from the loaded JSZip instance as a Blob.
   */
  public static async extractPageBlob(
    zip: JSZip,
    entryPath: string
  ): Promise<Blob> {
    const file = zip.file(entryPath);
    if (!file) {
      throw new Error(`Entry path "${entryPath}" not found in CBZ archive.`);
    }

    // Determine mime type
    const ext = entryPath.split('.').pop()?.toLowerCase() || 'jpg';
    let mimeType = 'image/jpeg';
    if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'webp') mimeType = 'image/webp';
    else if (ext === 'gif') mimeType = 'image/gif';
    else if (ext === 'svg') mimeType = 'image/svg+xml';

    const blob = await file.async('blob');
    return new Blob([blob], { type: mimeType });
  }
}
