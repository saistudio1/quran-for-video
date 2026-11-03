import { PageDefinition, PaginationConfig, VerseItem, CanvasConfig, ArabicStyle, LatinStyle, TranslationStyle } from '../types';

/**
 * Calculates page distributions according to the chosen pagination mode
 */
export function calculatePagination(
  verses: VerseItem[],
  config: PaginationConfig,
  canvas: CanvasConfig,
  styles: {
    arabic: ArabicStyle;
    transliteration: LatinStyle;
    translation: TranslationStyle;
  },
  existingPages?: PageDefinition[]
): PageDefinition[] {
  if (!verses || verses.length === 0) {
    return [{ id: 'page-1', pageNumber: 1, verseNumbers: [] }];
  }

  // If in manual mode and we already have valid existing pages that cover the verses
  if (config.mode === 'manual' && existingPages && existingPages.length > 0) {
    return existingPages;
  }

  // Mode A: One verse per page
  if (config.mode === 'single_verse') {
    return verses.map((v, idx) => ({
      id: `page-${idx + 1}-${v.number}`,
      pageNumber: idx + 1,
      verseNumbers: [v.number],
    }));
  }

  // Mode B: Fixed number of verses per page
  if (config.mode === 'fixed_count') {
    const count = Math.max(1, config.fixedCount || 2);
    const pages: PageDefinition[] = [];
    let pageNum = 1;

    for (let i = 0; i < verses.length; i += count) {
      const slice = verses.slice(i, i + count);
      pages.push({
        id: `page-${pageNum}`,
        pageNumber: pageNum,
        verseNumbers: slice.map((v) => v.number),
      });
      pageNum++;
    }

    return pages;
  }

  // Mode C: Auto Fit
  // Calculate dynamic capacity based on available height and estimated text lines
  if (config.mode === 'auto_fit') {
    const availableHeight = canvas.height * (1 - (canvas.safeMarginPercent * 2) / 100) - canvas.padding * 2;
    const pages: PageDefinition[] = [];
    let currentBatch: number[] = [];
    let currentHeight = 0;
    let pageNum = 1;

    for (const verse of verses) {
      // Estimate height of this verse
      // Arabic line height & length estimation
      const arabicLines = Math.max(1, Math.ceil(verse.textArabic.length / 45));
      const arabicHeight = arabicLines * styles.arabic.fontSize * styles.arabic.lineHeight;

      // Transliteration line height
      const latinLines = styles.transliteration.show
        ? Math.max(1, Math.ceil(verse.transliteration.length / 55))
        : 0;
      const latinHeight = latinLines * styles.transliteration.fontSize * styles.transliteration.lineHeight;

      // Translation line height
      const transLines = styles.translation.show
        ? Math.max(1, Math.ceil(verse.translationId.length / 60))
        : 0;
      const transHeight = transLines * styles.translation.fontSize * styles.translation.lineHeight;

      const verseTotalEstimate = arabicHeight + latinHeight + transHeight + config.verseSpacing + 40;

      // If adding this verse overflows the page and we already have at least 1 verse in the batch
      if (currentHeight + verseTotalEstimate > availableHeight && currentBatch.length > 0) {
        pages.push({
          id: `page-${pageNum}`,
          pageNumber: pageNum,
          verseNumbers: [...currentBatch],
        });
        pageNum++;
        currentBatch = [verse.number];
        currentHeight = verseTotalEstimate;
      } else {
        currentBatch.push(verse.number);
        currentHeight += verseTotalEstimate;
      }
    }

    if (currentBatch.length > 0) {
      pages.push({
        id: `page-${pageNum}`,
        pageNumber: pageNum,
        verseNumbers: currentBatch,
      });
    }

    return pages.length > 0 ? pages : [{ id: 'page-1', pageNumber: 1, verseNumbers: [] }];
  }

  // Fallback default
  return verses.map((v, idx) => ({
    id: `page-${idx + 1}`,
    pageNumber: idx + 1,
    verseNumbers: [v.number],
  }));
}
