import { VerseItem, SurahMeta } from '../types';
import { BUNDLED_SURAHS } from '../data/bundledSurahs';
import { SURAH_LIST } from '../data/surahList';

const CACHE_PREFIX = 'quran_layer_surah_';

/**
 * Clean up Arabic text to ensure standard Quranic representation
 */
function cleanArabicText(raw: string): string {
  if (!raw) return '';
  return raw.trim();
}

/**
 * Fetch verses for a surah using the hybrid strategy:
 * 1. In-memory bundled verified dataset
 * 2. Local browser cache (localStorage)
 * 3. Live verified API (equran.id / quran.gading.dev)
 */
export async function getSurahVerses(surahNumber: number): Promise<VerseItem[]> {
  const surahMeta = SURAH_LIST.find((s) => s.number === surahNumber) || {
    number: surahNumber,
    nameArabic: '',
    nameLatin: `Surah ${surahNumber}`,
    nameIndonesian: '',
    totalVerses: 0,
    revelationType: 'Makkiyyah' as const,
  };

  // 1. Check bundled surahs
  if (BUNDLED_SURAHS[surahNumber] && BUNDLED_SURAHS[surahNumber].length > 0) {
    return BUNDLED_SURAHS[surahNumber];
  }

  // 2. Check local storage cache
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${surahNumber}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed reading Quran cache from localStorage:', e);
  }

  // 3. Fetch from live verified API
  try {
    // Primary API: equran.id (standard Kemenag API)
    const response = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const json = await response.json();
    if (json.code === 200 && json.data && json.data.ayat) {
      const verses: VerseItem[] = json.data.ayat.map((item: any) => ({
        number: item.nomorAyat,
        surahNumber,
        surahNameArabic: json.data.nama || surahMeta.nameArabic,
        surahNameLatin: json.data.namaLatin || surahMeta.nameLatin,
        textArabic: cleanArabicText(item.teksArab),
        transliteration: item.teksLatin || '',
        translationId: item.teksIndonesia || '',
      }));

      // Cache locally
      try {
        localStorage.setItem(`${CACHE_PREFIX}${surahNumber}`, JSON.stringify(verses));
      } catch (storageErr) {
        console.warn('Could not cache surah in localStorage:', storageErr);
      }

      return verses;
    }
  } catch (primaryErr) {
    console.warn(`Primary Quran API failed for surah ${surahNumber}, trying secondary...`, primaryErr);
  }

  // Secondary fallback: api.quran.gading.dev
  try {
    const response = await fetch(`https://api.quran.gading.dev/surah/${surahNumber}`);
    if (!response.ok) {
      throw new Error(`Secondary HTTP error ${response.status}`);
    }
    const json = await response.json();
    if (json.code === 200 && json.data && json.data.verses) {
      const verses: VerseItem[] = json.data.verses.map((item: any) => ({
        number: item.number.inSurah,
        surahNumber,
        surahNameArabic: json.data.name?.short || surahMeta.nameArabic,
        surahNameLatin: json.data.name?.transliteration?.id || surahMeta.nameLatin,
        textArabic: cleanArabicText(item.text.arab),
        transliteration: item.text.transliteration?.en || item.text.transliteration?.id || '',
        translationId: item.translation?.id || '',
      }));

      try {
        localStorage.setItem(`${CACHE_PREFIX}${surahNumber}`, JSON.stringify(verses));
      } catch (storageErr) {
        console.warn('Could not cache surah in localStorage:', storageErr);
      }

      return verses;
    }
  } catch (secondaryErr) {
    console.error('Secondary Quran API also failed:', secondaryErr);
  }

  // If both APIs fail and we have partial bundled or fallback
  throw new Error(`Gagal mengambil data Surah ke-${surahNumber}. Silakan periksa koneksi internet atau gunakan impor JSON.`);
}

/**
 * Validate and import custom JSON Quran data provided by user
 */
export function importCustomQuranJson(jsonString: string): VerseItem[] {
  const data = JSON.parse(jsonString);
  if (!Array.isArray(data)) {
    throw new Error('Data JSON harus berupa array ayat.');
  }

  const validated: VerseItem[] = data.map((item, index) => {
    if (!item.textArabic) {
      throw new Error(`Ayat indeks ${index} tidak memiliki teks Arab (textArabic).`);
    }
    return {
      number: item.number || index + 1,
      surahNumber: item.surahNumber || 1,
      surahNameArabic: item.surahNameArabic || '',
      surahNameLatin: item.surahNameLatin || 'Custom Surah',
      textArabic: item.textArabic,
      transliteration: item.transliteration || '',
      translationId: item.translationId || item.translation || '',
    };
  });

  return validated;
}
