import JSZip from 'jszip';

export interface ImageFileToPackage {
  file: File;
  customName?: string;
}

export async function packageImagesToCBZ(
  files: File[],
  archiveName: string = 'custom_comic.cbz'
): Promise<{ blob: Blob; fileName: string }> {
  if (files.length === 0) {
    throw new Error('Please select at least one image file to package.');
  }

  const zip = new JSZip();

  // Natural sort the input files by name
  const sortedFiles = [...files].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  );

  for (let i = 0; i < sortedFiles.length; i++) {
    const file = sortedFiles[i];
    const paddedIndex = String(i + 1).padStart(3, '0');
    const ext = file.name.split('.').pop() || 'jpg';
    const entryName = `page_${paddedIndex}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    zip.file(entryName, arrayBuffer);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const finalFileName = archiveName.toLowerCase().endsWith('.cbz')
    ? archiveName
    : `${archiveName}.cbz`;

  return { blob, fileName: finalFileName };
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
