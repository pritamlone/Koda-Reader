import { parseChapterInfo, compareMihonChapters } from './chapterParser';

export interface DirectoryComicItem {
  id: string;
  fileName: string;
  filePath?: string;
  file?: File;
  parsedBadge?: string;
  chapterNumber?: number;
  volumeNumber?: number;
}

// Safely retrieve Node fs and path in Electron renderer process
export function getNodeModules() {
  try {
    if (typeof window !== 'undefined' && (window as any).require) {
      const fs = (window as any).require('fs');
      const path = (window as any).require('path');
      return { fs, path };
    }
  } catch {
    // Non-electron web environment
  }
  return null;
}

/**
 * HTML5 Drag & Drop Recursive Directory Scanner
 * Uses webkitGetAsEntry to recursively scan dropped folders/files in web browsers.
 */
export async function processDroppedDataTransfer(
  dataTransfer: DataTransfer
): Promise<File[]> {
  const items = Array.from(dataTransfer.items || []);

  const readEntry = (entry: any): Promise<File[]> => {
    return new Promise((resolve) => {
      if (!entry) return resolve([]);

      if (entry.isFile) {
        entry.file(
          (file: File) => {
            resolve(/\.(cbz|zip|cbr)$/i.test(file.name) ? [file] : []);
          },
          () => resolve([])
        );
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const readEntriesBatch = () => {
          dirReader.readEntries(
            async (entries: any[]) => {
              if (!entries || entries.length === 0) {
                resolve([]);
              } else {
                const subResults = await Promise.all(entries.map(readEntry));
                resolve(subResults.flat());
              }
            },
            () => resolve([])
          );
        };
        readEntriesBatch();
      } else {
        resolve([]);
      }
    });
  };

  const entryPromises = items
    .map((item) => (item.webkitGetAsEntry ? item.webkitGetAsEntry() : null))
    .filter(Boolean)
    .map(readEntry);

  if (entryPromises.length > 0) {
    const results = await Promise.all(entryPromises);
    const flattened = results.flat();
    if (flattened.length > 0) return flattened;
  }

  // Fallback to standard dataTransfer.files
  return Array.from(dataTransfer.files || []).filter((f) =>
    /\.(cbz|zip|cbr)$/i.test(f.name)
  );
}

/**
 * Scans the parent directory (in Electron / Node) or processes selected files/folders (in Web)
 * to build a naturally sorted Mihon-style chapter list of comic archive episodes.
 */
export function scanDirectoryForComics(
  fileOrFiles: File | File[] | FileList
): DirectoryComicItem[] {
  const node = getNodeModules();

  // Multi-file selection or folder upload in Web / Electron
  if (Array.isArray(fileOrFiles) || fileOrFiles instanceof FileList) {
    const filesArray = Array.from(fileOrFiles).filter((f) =>
      /\.(cbz|zip|cbr)$/i.test(f.name)
    );

    // Sort using Mihon Natural Chapter Comparator
    filesArray.sort((a, b) => compareMihonChapters(a.name, b.name));

    return filesArray.map((file) => {
      const chapterInfo = parseChapterInfo(file.name);
      return {
        id: (file as any).path || file.name,
        fileName: file.name,
        filePath: (file as any).path,
        file,
        parsedBadge: chapterInfo.formattedBadge,
        chapterNumber: chapterInfo.chapterNumber,
        volumeNumber: chapterInfo.volumeNumber,
      };
    });
  }

  const singleFile = fileOrFiles as File;
  const filePath = (singleFile as any).path;

  // Electron environment: IINA-style parent directory auto-discovery
  // Automatically scans the entire folder containing this opened CBZ file!
  if (node && filePath) {
    try {
      const dir = node.path.dirname(filePath);
      const filesInDir: string[] = node.fs.readdirSync(dir);
      const cbzNames = filesInDir
        .filter((name) => /\.(cbz|zip|cbr)$/i.test(name))
        .sort((a, b) => compareMihonChapters(a, b));

      return cbzNames.map((fileName) => {
        const fullPath = node.path.join(dir, fileName);
        const chapterInfo = parseChapterInfo(fileName);
        return {
          id: fullPath,
          fileName,
          filePath: fullPath,
          file: fileName === singleFile.name ? singleFile : undefined,
          parsedBadge: chapterInfo.formattedBadge,
          chapterNumber: chapterInfo.chapterNumber,
          volumeNumber: chapterInfo.volumeNumber,
        };
      });
    } catch (err) {
      console.warn('Failed to read parent directory via Node fs:', err);
    }
  }

  // Single file fallback in web browser
  const singleChapterInfo = parseChapterInfo(singleFile.name);
  return [
    {
      id: filePath || singleFile.name,
      fileName: singleFile.name,
      filePath,
      file: singleFile,
      parsedBadge: singleChapterInfo.formattedBadge,
      chapterNumber: singleChapterInfo.chapterNumber,
      volumeNumber: singleChapterInfo.volumeNumber,
    },
  ];
}

/**
 * Reads and returns the ArrayBuffer for a DirectoryComicItem across both Electron fs & Web File APIs.
 */
export async function loadDirectoryItemBuffer(
  item: DirectoryComicItem
): Promise<{ buffer: ArrayBuffer; fileName: string }> {
  const node = getNodeModules();

  if (item.file) {
    const buffer = await item.file.arrayBuffer();
    return { buffer, fileName: item.fileName };
  }

  if (node && item.filePath) {
    const nodeBuffer = node.fs.readFileSync(item.filePath);
    const arrayBuffer = nodeBuffer.buffer.slice(
      nodeBuffer.byteOffset,
      nodeBuffer.byteOffset + nodeBuffer.byteLength
    );
    return { buffer: arrayBuffer, fileName: item.fileName };
  }

  throw new Error(`Unable to read file contents for "${item.fileName}"`);
}
