import React, { useState, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  Layers, 
  LayoutTemplate, 
  Sparkles, 
  Search, 
  Check, 
  Plus, 
  Copy, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  SurahMeta, 
  VerseItem, 
  PageDefinition, 
  LayoutPresetType, 
  ArabicStyle 
} from '../types';
import { SURAH_LIST } from '../data/surahList';
import { LAYOUT_PRESETS } from '../data/layoutPresets';
import { importCustomQuranJson } from '../services/quranApi';

interface LeftSidebarProps {
  selectedSurah: SurahMeta;
  onSelectSurah: (surahNumber: number) => Promise<void>;
  isLoadingSurah: boolean;
  surahError: string | null;
  onRetryLoadSurah: () => void;
  availableVerses: VerseItem[];
  selectedVerseNumbers: number[];
  onToggleVerseSelection: (verseNumber: number) => void;
  onSelectAllVerses: () => void;
  onSelectVerseRange: (start: number, end: number) => void;
  onApplyVersesToProject: () => void;
  pages: PageDefinition[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  layoutPreset: LayoutPresetType;
  onSelectLayoutPreset: (presetId: LayoutPresetType) => void;
  customFonts: { name: string; url: string }[];
  onUploadCustomFont: (name: string, fontUrl: string) => void;
  arabicStyle: ArabicStyle;
  onUpdateArabicStyle: (style: Partial<ArabicStyle>) => void;
  isMobileDrawer?: boolean;
  initialTab?: 'quran' | 'pages' | 'templates' | 'assets';
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  selectedSurah,
  onSelectSurah,
  isLoadingSurah,
  surahError,
  onRetryLoadSurah,
  availableVerses,
  selectedVerseNumbers,
  onToggleVerseSelection,
  onSelectAllVerses,
  onSelectVerseRange,
  onApplyVersesToProject,
  pages,
  activePageIndex,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
  layoutPreset,
  onSelectLayoutPreset,
  customFonts,
  onUploadCustomFont,
  arabicStyle,
  onUpdateArabicStyle,
  isMobileDrawer = false,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'quran' | 'pages' | 'templates' | 'assets'>(initialTab || 'quran');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [surahSearch, setSurahSearch] = useState('');
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(Math.min(5, selectedSurah.totalVerses));
  const [showJsonImportModal, setShowJsonImportModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const fontFileInputRef = useRef<HTMLInputElement>(null);

  // Filter surahs based on search query
  const filteredSurahs = useMemo(() => {
    if (!surahSearch.trim()) return SURAH_LIST;
    const q = surahSearch.toLowerCase().trim();
    return SURAH_LIST.filter(
      (s) =>
        s.number.toString() === q ||
        s.nameLatin.toLowerCase().includes(q) ||
        s.nameIndonesian.toLowerCase().includes(q) ||
        s.nameArabic.includes(q)
    );
  }, [surahSearch]);

  const handleRangeApply = () => {
    const s = Math.max(1, Math.min(rangeStart, selectedSurah.totalVerses));
    const e = Math.max(s, Math.min(rangeEnd, selectedSurah.totalVerses));
    onSelectVerseRange(s, e);
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fontName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      try {
        const fontFace = new FontFace(fontName, `url(${result})`);
        const loadedFont = await fontFace.load();
        document.fonts.add(loadedFont);
        onUploadCustomFont(fontName, result);
        onUpdateArabicStyle({ fontFamily: fontName });
      } catch (err) {
        console.error('Failed loading custom font:', err);
        alert('Gagal memuat file font. Pastikan format file adalah .ttf, .otf, atau .woff2 yang valid.');
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleJsonImport = () => {
    try {
      setJsonError(null);
      const parsed = importCustomQuranJson(jsonInput);
      if (parsed && parsed.length > 0) {
        setShowJsonImportModal(false);
        setJsonInput('');
        alert(`Berhasil mengimpor ${parsed.length} ayat!`);
      }
    } catch (e: any) {
      setJsonError(e.message || 'Gagal membaca JSON');
    }
  };

  return (
    <aside className={`bg-[#edf2f7] flex flex-col h-full select-none ${isMobileDrawer ? 'w-full border-none' : 'w-80 md:w-88 border-r border-slate-300/60 shrink-0 z-20 shadow-[2px_0_10px_rgba(166,178,196,0.25)]'}`}>
      {/* Navigation Tabs Header in Neumorphic Debossed Well */}
      <div className="p-3 border-b border-slate-200/80 bg-[#edf2f7]">
        <div className="neu-segmented flex p-1 gap-1">
          <button
            onClick={() => setActiveTab('quran')}
            /* Transition: 0.22s cubic-bezier(0.16, 1, 0.3, 1) for tactile pill shift */
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              activeTab === 'quran'
                ? 'neu-segmented-btn-active'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Pilih Surah & Ayat Al-Qur'an"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Quran</span>
          </button>

          <button
            onClick={() => setActiveTab('pages')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              activeTab === 'pages'
                ? 'neu-segmented-btn-active'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Kelola Halaman & Slide"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Halaman</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-[#edf2f7] text-slate-700 shadow-[inset_1px_1px_2px_rgba(160,174,192,0.4)]">
              {pages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              activeTab === 'templates'
                ? 'neu-segmented-btn-active'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Preset Tata Letak Tipografi"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Preset</span>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              activeTab === 'assets'
                ? 'neu-segmented-btn-active'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Font Custom & Ornamen Ayat"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aset</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Quran Surah & Verse Selector */}
      {activeTab === 'quran' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Surah Search & Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Pilih Surah (114 Surah)</span>
              <span className="text-[11px] text-slate-500 font-medium">
                {selectedSurah.totalVerses} Ayat · {selectedSurah.revelationType}
              </span>
            </label>

            {/* Neumorphic Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari surah (misal: Al-Mulk, Yasin, 67)..."
                value={surahSearch}
                onChange={(e) => setSurahSearch(e.target.value)}
                className="neu-input w-full pl-9 pr-3 py-2 text-xs rounded-xl text-slate-800 placeholder-slate-400 font-medium"
              />
            </div>

            {/* Surah dropdown list with Staggered Entrance */}
            <div className="max-h-44 overflow-y-auto neu-inset rounded-xl divide-y divide-slate-200/50 p-1">
              {filteredSurahs.map((surah, idx) => {
                const isSelected = surah.number === selectedSurah.number;
                return (
                  <button
                    key={surah.number}
                    /* Choreography: Staggered Entrance delay = index * 0.04s, cubic-bezier(0.16, 1, 0.3, 1) */
                    style={{ animationDelay: `${Math.min(idx, 20) * 0.04}s` }}
                    onClick={() => {
                      onSelectSurah(surah.number);
                      setRangeStart(1);
                      setRangeEnd(Math.min(5, surah.totalVerses));
                    }}
                    className={`animate-stagger-item w-full px-3 py-2 text-left flex items-center justify-between rounded-lg transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isSelected
                        ? 'bg-white shadow-[2px_2px_5px_rgba(166,178,196,0.4),-2px_-2px_5px_rgba(255,255,255,0.9)] text-[#B89555] font-bold'
                        : 'hover:bg-white/60 text-slate-700 hover:translate-x-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-mono text-slate-400 w-5">
                        {surah.number}.
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                          <span>{surah.nameLatin}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({surah.nameIndonesian})
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="font-amiri text-sm text-slate-600 shrink-0 pr-1">
                      {surah.nameArabic}
                    </span>
                  </button>
                );
              })}
              {filteredSurahs.length === 0 && (
                <div className="p-3 text-center text-xs text-slate-400">
                  Tidak ada surah yang cocok dengan "{surahSearch}"
                </div>
              )}
            </div>
          </div>

          {/* Active Surah Card: Extruded Neumorphic Card with Gold Accents */}
          <div className="neu-flat p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">
                  Surah {selectedSurah.nameLatin}
                </span>
                <span className="text-[10px] font-bold text-[#B89555] px-1.5 py-0.5 rounded-md neu-inset-sm">
                  {selectedSurah.revelationType}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-1">
                Artinya: "{selectedSurah.nameIndonesian}" · {selectedSurah.totalVerses} Ayat
              </p>
            </div>
            <div className="font-amiri text-2xl font-bold text-[#B89555] drop-shadow-xs">
              {selectedSurah.nameArabic}
            </div>
          </div>

          {/* Verse Range Selection */}
          <div className="space-y-2.5 pt-2 border-t border-slate-300/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Rentang Ayat Proyek</span>
              <button
                onClick={onSelectAllVerses}
                className="text-[11px] text-[#B89555] hover:text-[#9E7D3F] font-bold transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:underline"
              >
                Pilih Semua ({selectedSurah.totalVerses})
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Dari Ayat:</label>
                <input
                  type="number"
                  min={1}
                  max={selectedSurah.totalVerses}
                  value={rangeStart}
                  onChange={(e) => setRangeStart(parseInt(e.target.value) || 1)}
                  className="neu-input w-full px-2.5 py-1.5 text-xs rounded-xl text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Sampai Ayat:</label>
                <input
                  type="number"
                  min={rangeStart}
                  max={selectedSurah.totalVerses}
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(parseInt(e.target.value) || rangeStart)}
                  className="neu-input w-full px-2.5 py-1.5 text-xs rounded-xl text-slate-800 font-semibold"
                />
              </div>
            </div>

            <button
              onClick={handleRangeApply}
              /* Micro-interaction: tactile neumorphic button with translateY on hover/press */
              className="neu-button w-full py-2 text-xs font-bold text-slate-700 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
            >
              Terapkan Rentang ({rangeStart} – {rangeEnd})
            </button>
          </div>

          {/* Individual Verse Checklist Preview with Staggered Entrance */}
          <div className="space-y-1.5 pt-2 border-t border-slate-300/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Pilih Tiap Ayat ({selectedVerseNumbers.length} dipilih)
              </span>
            </div>

            {isLoadingSurah ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                <RefreshCw className="w-5 h-5 text-[#B89555] animate-spin mx-auto" />
                <p>Memuat teks Al-Qur'an dan terjemahan Kemenag...</p>
              </div>
            ) : surahError ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Gagal memuat ayat online</span>
                </div>
                <p className="text-[11px] text-red-600">{surahError}</p>
                <button
                  onClick={onRetryLoadSurah}
                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded-lg text-[11px] transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto neu-inset rounded-xl divide-y divide-slate-200/60 p-1">
                {availableVerses.map((verse, idx) => {
                  const isChecked = selectedVerseNumbers.includes(verse.number);
                  return (
                    <div
                      key={verse.number}
                      /* Staggered entrance animation: 0.04s step delay */
                      style={{ animationDelay: `${Math.min(idx, 20) * 0.04}s` }}
                      onClick={() => onToggleVerseSelection(verse.number)}
                      className={`animate-stagger-item p-2.5 flex items-start gap-2.5 cursor-pointer rounded-lg transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isChecked 
                          ? 'bg-white shadow-[2px_2px_5px_rgba(166,178,196,0.35),-2px_-2px_5px_rgba(255,255,255,0.9)]' 
                          : 'hover:bg-white/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        className="mt-1 rounded text-[#B89555] focus:ring-[#B89555] cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-800">
                            Ayat {verse.number}
                          </span>
                        </div>
                        <p className="font-amiri text-base text-right text-slate-900 leading-relaxed mb-1" dir="rtl">
                          {verse.textArabic}
                        </p>
                        <p className="text-[11px] text-slate-600 italic line-clamp-1 font-medium">
                          {verse.transliteration}
                        </p>
                        <p className="text-[11px] text-slate-700 line-clamp-1 mt-0.5">
                          {verse.translationId}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Primary Button to Apply into Canvas: Neumorphic Gold Primary */}
          <button
            onClick={onApplyVersesToProject}
            disabled={selectedVerseNumbers.length === 0 || isLoadingSurah}
            /* Micro-interaction: hover translateY -1.5px and expand shadow */
            className="neu-button-primary w-full py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Masukkan {selectedVerseNumbers.length} Ayat ke Proyek</span>
          </button>

          {/* Attribution & JSON import option */}
          <div className="pt-2 border-t border-slate-300/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Data: Kemenag RI / Quran API</span>
            <button
              onClick={() => setShowJsonImportModal(true)}
              className="text-slate-600 hover:text-slate-900 font-semibold underline"
            >
              Impor JSON
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Pages Manager */}
      {activeTab === 'pages' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Daftar Halaman ({pages.length})
            </span>
            <button
              onClick={onAddPage}
              className="neu-button flex items-center gap-1 text-xs text-[#B89555] font-bold px-2.5 py-1 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {pages.map((page, idx) => {
              const isActive = idx === activePageIndex;
              return (
                <div
                  key={page.id}
                  /* Choreography: Staggered slide up 18px with 0.04s delay step */
                  style={{ animationDelay: `${idx * 0.04}s` }}
                  onClick={() => onSelectPage(idx)}
                  className={`animate-stagger-item p-3.5 rounded-2xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                    isActive
                      ? 'neu-flat ring-2 ring-[#B89555] bg-white'
                      : 'neu-flat-sm hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#B89555] text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Halaman {page.pageNumber}
                      </span>
                    </div>

                    {/* Page Actions */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onMovePage(idx, Math.max(0, idx - 1))}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded-md transition-colors"
                        title="Geser ke Atas"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onMovePage(idx, Math.min(pages.length - 1, idx + 1))}
                        disabled={idx === pages.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded-md transition-colors"
                        title="Geser ke Bawah"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDuplicatePage(idx)}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded-md transition-colors"
                        title="Duplikat Halaman"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeletePage(idx)}
                        disabled={pages.length <= 1}
                        className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-20 rounded-md transition-colors"
                        title="Hapus Halaman"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Verses inside this page badge */}
                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                    <span className="text-slate-500">Ayat:</span>
                    {page.verseNumbers.length > 0 ? (
                      <span className="font-mono neu-inset-sm px-2 py-0.5 rounded-md text-[10px] text-slate-700 font-bold">
                        {page.verseNumbers.join(', ')}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Kosong</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Layout Presets */}
      {activeTab === 'templates' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs font-bold text-slate-700 mb-1">
            Preset Tata Letak
          </div>
          <p className="text-[11px] text-slate-500 font-medium mb-3">
            Pilih tata letak visual. Menukar preset tetap menjaga ayat dan konten Anda.
          </p>

          <div className="space-y-3">
            {LAYOUT_PRESETS.map((preset, idx) => {
              const isSelected = preset.id === layoutPreset;
              return (
                <div
                  key={preset.id}
                  /* Staggered entrance for layout preset cards */
                  style={{ animationDelay: `${idx * 0.04}s` }}
                  onClick={() => onSelectLayoutPreset(preset.id)}
                  className={`animate-stagger-item p-3.5 rounded-2xl text-left cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSelected
                      ? 'neu-flat ring-2 ring-[#B89555] bg-white'
                      : 'neu-flat-sm hover:-translate-y-1'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span className={isSelected ? 'text-[#B89555]' : 'text-slate-800'}>
                        {preset.name}
                      </span>
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#B89555]" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Assets & Custom Fonts */}
      {activeTab === 'assets' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Custom Font Upload */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Unggah Font Arab Sendiri
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              Gunakan font kaligrafi kustom (.ttf, .otf, atau .woff2) untuk gaya video khas Anda.
            </p>

            <input
              type="file"
              ref={fontFileInputRef}
              accept=".ttf,.otf,.woff2"
              onChange={handleFontUpload}
              className="hidden"
            />

            <button
              onClick={() => fontFileInputRef.current?.click()}
              className="neu-button w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#B89555]" />
              <span>Pilih File Font (.ttf / .otf / .woff2)</span>
            </button>

            {customFonts.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-600 block">
                  Font Terpasang:
                </span>
                {customFonts.map((font, idx) => (
                  <div
                    key={idx}
                    className="neu-flat-sm p-2.5 rounded-xl flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800">{font.name}</span>
                    <button
                      onClick={() => onUpdateArabicStyle({ fontFamily: font.name })}
                      className="text-[11px] text-[#B89555] hover:underline font-bold"
                    >
                      Gunakan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verse Marker Style Picker */}
          <div className="space-y-2 pt-2 border-t border-slate-300/60">
            <span className="text-xs font-bold text-slate-700 block">
              Model Penanda Nomor Ayat (Waqf)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onUpdateArabicStyle({ showVerseMarker: true, markerStyle: 'standard' })}
                className={`p-2.5 rounded-xl text-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  arabicStyle.markerStyle === 'standard' && arabicStyle.showVerseMarker
                    ? 'neu-flat ring-2 ring-[#B89555] text-slate-900 font-bold'
                    : 'neu-button text-slate-600'
                }`}
              >
                <div className="font-amiri text-lg">۝ 1</div>
                <span className="text-[10px] text-slate-500 font-medium">Standar Al-Qur'an</span>
              </button>

              <button
                onClick={() => onUpdateArabicStyle({ showVerseMarker: true, markerStyle: 'ornament' })}
                className={`p-2.5 rounded-xl text-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  arabicStyle.markerStyle === 'ornament' && arabicStyle.showVerseMarker
                    ? 'neu-flat ring-2 ring-[#B89555] text-slate-900 font-bold'
                    : 'neu-button text-slate-600'
                }`}
              >
                <div className="font-amiri text-lg">﴿ 1 ﴾</div>
                <span className="text-[10px] text-slate-500 font-medium">Kurung Ornamen</span>
              </button>

              <button
                onClick={() => onUpdateArabicStyle({ showVerseMarker: true, markerStyle: 'simple' })}
                className={`p-2.5 rounded-xl text-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  arabicStyle.markerStyle === 'simple' && arabicStyle.showVerseMarker
                    ? 'neu-flat ring-2 ring-[#B89555] text-slate-900 font-bold'
                    : 'neu-button text-slate-600'
                }`}
              >
                <div className="font-mono text-xs py-1 font-bold">[1]</div>
                <span className="text-[10px] text-slate-500 font-medium">Sederhana</span>
              </button>

              <button
                onClick={() => onUpdateArabicStyle({ showVerseMarker: false, markerStyle: 'none' })}
                className={`p-2.5 rounded-xl text-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  !arabicStyle.showVerseMarker || arabicStyle.markerStyle === 'none'
                    ? 'neu-flat ring-2 ring-[#B89555] text-slate-900 font-bold'
                    : 'neu-button text-slate-600'
                }`}
              >
                <div className="text-xs py-1 font-bold">Polos</div>
                <span className="text-[10px] text-slate-500 font-medium">Tanpa Penanda</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import JSON */}
      {showJsonImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="neu-flat bg-[#edf2f7] rounded-3xl max-w-md w-full p-5 space-y-3 shadow-2xl animate-sheet-up">
            <h3 className="text-sm font-bold text-slate-900">Impor Data Al-Qur'an (JSON)</h3>
            <p className="text-xs text-slate-600 font-medium">
              Tempelkan array JSON dengan format `[&#123; number: 1, textArabic: "...", transliteration: "...", translationId: "..." &#125;]`.
            </p>
            <textarea
              rows={6}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[{"number": 1, "textArabic": "بِسْمِ اللَّهِ ...", "transliteration": "...", "translationId": "..."}]'
              className="neu-input w-full p-3 text-xs font-mono rounded-xl"
            />
            {jsonError && <p className="text-xs text-red-600">{jsonError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowJsonImportModal(false)}
                className="neu-button px-3.5 py-1.5 text-xs text-slate-600 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleJsonImport}
                className="neu-button-primary px-4 py-1.5 text-xs font-bold rounded-xl"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
