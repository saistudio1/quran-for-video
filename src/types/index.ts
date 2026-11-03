export type CanvasPreset = 'vertical' | 'landscape' | 'square' | '4k' | 'custom';

export interface CanvasDimensions {
  width: number;
  height: number;
  name: string;
  preset: CanvasPreset;
}

export type BackgroundMode = 'transparent' | 'solid' | 'checkerboard' | 'video_dark' | 'video_nature';

export interface CanvasConfig {
  width: number;
  height: number;
  preset: CanvasPreset;
  backgroundMode: BackgroundMode;
  solidColor: string;
  padding: number;
  safeMarginPercent: number; // e.g. 10%
  verticalAlign: 'top' | 'center' | 'bottom';
}

export type ArabicFontFamily = 
  | 'Amiri Quran'
  | 'Amiri' 
  | 'Scheherazade New' 
  | 'Noto Naskh Arabic' 
  | 'Noto Sans Arabic'
  | string;

export interface ArabicStyle {
  fontFamily: ArabicFontFamily;
  fontSize: number; // px at 1080p scale
  fontWeight: 'normal' | 'bold' | '600' | '700';
  color: string;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'center' | 'right' | 'left';
  showVerseMarker: boolean;
  markerStyle: 'standard' | 'ornament' | 'simple' | 'none';
  bottomSpacing?: number; // Distance between Arabic text and Latin transliteration (px)
}

export interface LatinStyle {
  show: boolean;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: string;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'center' | 'right' | 'left';
  bottomSpacing?: number; // Distance between Latin transliteration and Indonesian translation (px)
}

export interface TranslationStyle {
  show: boolean;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  color: string;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'center' | 'right' | 'left';
}

export interface HeaderStyle {
  showSurahName: boolean;
  showVerseNumber: boolean;
  showBismillah: boolean;
  bismillahPlacement: 'first_page' | 'every_page';
  bismillahArabic: string;
  fontSize: number;
  color: string;
  textAlign: 'center' | 'right' | 'left';
  fontFamily: string;
}

export interface VerseItem {
  number: number; // Verse number in Surah (1, 2, ...)
  textArabic: string;
  transliteration: string;
  translationId: string; // Indonesian translation
  surahNumber: number;
  surahNameArabic: string;
  surahNameLatin: string;
}

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameLatin: string;
  nameIndonesian: string;
  totalVerses: number;
  revelationType: 'Makkiyyah' | 'Madaniyyah';
}

export type LayoutPresetType = 
  | 'three_layers' 
  | 'arabic_dominant' 
  | 'centered' 
  | 'minimal_subtitle' 
  | 'editorial';

export type PaginationMode = 
  | 'single_verse' 
  | 'fixed_count' 
  | 'auto_fit' 
  | 'manual';

export interface PaginationConfig {
  mode: PaginationMode;
  fixedCount: number; // e.g. 2 verses per page
  verseSpacing: number; // gap between verses
  separatorStyle: 'ornament' | 'line' | 'dot' | 'none';
}

export interface PageDefinition {
  id: string;
  pageNumber: number;
  verseNumbers: number[]; // Verses assigned to this page
  customOffset?: { x: number; y: number };
}

export interface ProjectState {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  canvas: CanvasConfig;
  selectedSurah: SurahMeta;
  selectedVerseRange: { start: number; end: number };
  verses: VerseItem[];
  pages: PageDefinition[];
  activePageIndex: number;
  selectedLayerId: 'arabic' | 'transliteration' | 'translation' | 'meta' | 'canvas' | null;
  layoutPreset: LayoutPresetType;
  pagination: PaginationConfig;
  styles: {
    arabic: ArabicStyle;
    transliteration: LatinStyle;
    translation: TranslationStyle;
    meta: HeaderStyle;
  };
  customFonts: { name: string; url: string }[];
}
