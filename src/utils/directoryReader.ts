import { naturalCompare } from './naturalSort';

export interface DirectoryComicItem {
  id: string;
  fileName: string;
  filePath?: string;
  file?: File;
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
 * Scans the parent directory (in Electron) or processes selected files (in Web)
 * to build a naturally sorted list of comic archive episodes.
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
    filesArray.sort((a, b) => naturalCompare(a.name, b.name));

    return filesArray.map((file) => ({
      id: (file as any).path || file.name,
      fileName: file.name,
      filePath: (file as any).path,
      file,
    }));
  }

  const singleFile = fileOrFiles as File;
  const filePath = (singleFile as any).path;

  // Electron environment: scan the entire directory containing this CBZ file
  if (node && filePath) {
    try {
      const dir = node.path.dirname(filePath);
      const filesInDir: string[] = node.fs.readdirSync(dir);
      const cbzNames = filesInDir
        .filter((name) => /\.(cbz|zip|cbr)$/i.test(name))
        .sort(naturalCompare);

      return cbzNames.map((fileName) => {
        const fullPath = node.path.join(dir, fileName);
        return {
          id: fullPath,
          fileName,
          filePath: fullPath,
          file: fileName === singleFile.name ? singleFile : undefined,
        };
      });
    } catch (err) {
      console.warn('Failed to read parent directory via Node fs:', err);
    }
  }

  // Single file fallback
  return [
    {
      id: filePath || singleFile.name,
      fileName: singleFile.name,
      filePath,
      file: singleFile,
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
