/**
 * Mihon & Tachiyomi-style Chapter & Episode Parser
 * Parses volume numbers, chapter numbers, episode tags, and decimal chapters
 * to enable accurate natural ranking and display indexing for comics, manga, and manhua.
 */

export interface ParsedChapterInfo {
  volumeNumber?: number;
  chapterNumber?: number;
  formattedBadge: string;
  cleanTitle: string;
}

/**
 * Extracts volume and chapter numbers from a file name or title string.
 */
export function parseChapterInfo(fileName: string): ParsedChapterInfo {
  // Strip file extension (.cbz, .zip, .cbr, .rar, etc.)
  const baseName = fileName.replace(/\.(cbz|zip|cbr|rar|7z)$/i, '');

  // Normalize delimiters (replace underscores/dashes with spaces where appropriate)
  const normalized = baseName.replace(/_/g, ' ').trim();

  let volumeNumber: number | undefined;
  let chapterNumber: number | undefined;

  // Match Volume (e.g., "Vol. 1", "Vol 02", "v3", "Volume 10")
  const volMatch = normalized.match(/(?:vol(?:ume)?|v)\.?\s*(\d+(?:\.\d+)?)/i);
  if (volMatch) {
    volumeNumber = parseFloat(volMatch[1]);
  }

  // Match Chapter / Episode (e.g., "Ch. 10", "Chapter 10.5", "Ep 05", "Episode 12", "c01", "#005")
  const chMatch = normalized.match(
    /(?:ch(?:apter)?|ep(?:isode)?|c|#)\.?\s*(\d+(?:\.\d+)?)/i
  );

  if (chMatch) {
    chapterNumber = parseFloat(chMatch[1]);
  } else {
    // Fallback: Remove brackets metadata [Group] or (1080p) and look for numbers
    const strippedMeta = normalized
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .trim();

    // Look for standalone numbers or numbers preceded by dash e.g. "Solo Leveling - 015.5"
    const numberMatch = strippedMeta.match(/(?:^|\s|-)(\d+(?:\.\d+)?)(?:\s|$|-)/);
    if (numberMatch) {
      chapterNumber = parseFloat(numberMatch[1]);
    }
  }

  // Build clean display badge label (Mihon style)
  let formattedBadge = '';
  if (volumeNumber !== undefined && chapterNumber !== undefined) {
    formattedBadge = `Vol. ${volumeNumber} Ch. ${chapterNumber}`;
  } else if (chapterNumber !== undefined) {
    formattedBadge = `Ch. ${chapterNumber}`;
  } else if (volumeNumber !== undefined) {
    formattedBadge = `Vol. ${volumeNumber}`;
  } else {
    formattedBadge = 'File';
  }

  return {
    volumeNumber,
    chapterNumber,
    formattedBadge,
    cleanTitle: baseName,
  };
}

/**
 * Mihon Natural Chapter Comparator Function
 * Orders chapters logically:
 * 1. By Volume Number (if present)
 * 2. By Chapter Number (e.g., Ch 1 < Ch 1.5 < Ch 2 < Ch 10 < Ch 100)
 * 3. Fallback to Natural Alphanumeric Comparison
 */
export function compareMihonChapters(aName: string, bName: string): number {
  const infoA = parseChapterInfo(aName);
  const infoB = parseChapterInfo(bName);

  // 1. Compare Volumes if both have volume numbers
  if (infoA.volumeNumber !== undefined && infoB.volumeNumber !== undefined) {
    if (infoA.volumeNumber !== infoB.volumeNumber) {
      return infoA.volumeNumber - infoB.volumeNumber;
    }
  }

  // 2. Compare Chapter/Episode numbers if both have chapter numbers
  if (infoA.chapterNumber !== undefined && infoB.chapterNumber !== undefined) {
    if (infoA.chapterNumber !== infoB.chapterNumber) {
      return infoA.chapterNumber - infoB.chapterNumber;
    }
  }

  // 3. If one has a chapter number and the other does not, prioritize the numbered one
  if (infoA.chapterNumber !== undefined && infoB.chapterNumber === undefined) {
    return -1;
  }
  if (infoA.chapterNumber === undefined && infoB.chapterNumber !== undefined) {
    return 1;
  }

  // 4. Fallback: Natural Alphanumeric String Comparison
  return aName.localeCompare(bName, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}
