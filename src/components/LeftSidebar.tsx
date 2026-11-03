import React, { useState, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  Layers, 
  LayoutTemplate, 
  Sparkles, 
  Search, 
  Check, 
  ChevronRight, 
  Plus, 
  Copy, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  FileText, 
  AlertCircle,
  RefreshCw,
  Sliders,
  Type
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
}) => {
  const [activeTab, setActiveTab] = useState<'quran' | 'pages' | 'templates' | 'assets'>('quran');
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
        // Successfully parsed, we can apply
        setShowJsonImportModal(false);
        setJsonInput('');
        alert(`Berhasil mengimpor ${parsed.length} ayat!`);
      }
    } catch (e: any) {
      setJsonError(e.message || 'Gagal membaca JSON');
    }
  };

  return (
    <aside className="w-80 md:w-88 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none z-20 shadow-xs">
      {/* Navigation Tabs Header */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 p-1 gap-1">
        <button
          onClick={() => setActiveTab('quran')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'quran'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 text-[#B89555]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
          title="Pilih Surah & Ayat Al-Qur'an"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Quran</span>
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'pages'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 text-[#B89555]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
          title="Kelola Halaman & Slide"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Halaman</span>
          <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded-full font-mono text-slate-600">
            {pages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'templates'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 text-[#B89555]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
          title="Preset Tata Letak Tipografi"
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          <span>Preset</span>
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'assets'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 text-[#B89555]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
          title="Font Custom & Ornamen Ayat"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Aset</span>
        </button>
      </div>

      {/* Tab 1: Quran Surah & Verse Selector */}
      {activeTab === 'quran' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Surah Search & Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Pilih Surah (114 Surah)</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {selectedSurah.totalVerses} Ayat · {selectedSurah.revelationType}
              </span>
            </label>

            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari surah (misal: Al-Mulk, Yasin, 67)..."
                value={surahSearch}
                onChange={(e) => setSurahSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#B89555] focus:bg-white text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Surah dropdown list */}
            <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
              {filteredSurahs.map((surah) => {
                const isSelected = surah.number === selectedSurah.number;
                return (
                  <button
                    key={surah.number}
                    onClick={() => {
                      onSelectSurah(surah.number);
                      setRangeStart(1);
                      setRangeEnd(Math.min(5, surah.totalVerses));
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-amber-50/70 text-slate-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-mono text-slate-400 w-5">
                        {surah.number}.
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-medium truncate flex items-center gap-1.5">
                          <span className={isSelected ? 'text-[#B89555] font-semibold' : ''}>
                            {surah.nameLatin}
                          </span>
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

          {/* Active Surah Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">
                  Surah {selectedSurah.nameLatin}
                </span>
                <span className="text-[10px] text-[#B89555] bg-amber-50 border border-amber-200 px-1.5 rounded">
                  {selectedSurah.revelationType}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Artinya: "{selectedSurah.nameIndonesian}" · {selectedSurah.totalVerses} Ayat
              </p>
            </div>
            <div className="font-amiri text-2xl font-bold text-[#B89555]">
              {selectedSurah.nameArabic}
            </div>
          </div>

          {/* Verse Range Selection */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Rentang Ayat Proyek</span>
              <button
                onClick={onSelectAllVerses}
                className="text-[11px] text-[#B89555] hover:underline font-medium"
              >
                Pilih Semua ({selectedSurah.totalVerses})
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Dari Ayat:</label>
                <input
                  type="number"
                  min={1}
                  max={selectedSurah.totalVerses}
                  value={rangeStart}
                  onChange={(e) => setRangeStart(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#B89555]"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Sampai Ayat:</label>
                <input
                  type="number"
                  min={rangeStart}
                  max={selectedSurah.totalVerses}
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(parseInt(e.target.value) || rangeStart)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#B89555]"
                />
              </div>
            </div>

            <button
              onClick={handleRangeApply}
              className="w-full py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/80"
            >
              Terapkan Rentang ({rangeStart} – {rangeEnd})
            </button>
          </div>

          {/* Individual Verse Checklist Preview */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Pilih Tiap Ayat ({selectedVerseNumbers.length} dipilih)
              </span>
            </div>

            {isLoadingSurah ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                <RefreshCw className="w-5 h-5 text-[#B89555] animate-spin mx-auto" />
                <p>Memuat teks Al-Qur'an dan terjemahan Kemenag...</p>
              </div>
            ) : surahError ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Gagal memuat ayat online</span>
                </div>
                <p className="text-[11px] text-red-600">{surahError}</p>
                <button
                  onClick={onRetryLoadSurah}
                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded text-[11px] transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                {availableVerses.map((verse) => {
                  const isChecked = selectedVerseNumbers.includes(verse.number);
                  return (
                    <div
                      key={verse.number}
                      onClick={() => onToggleVerseSelection(verse.number)}
                      className={`p-2.5 flex items-start gap-2.5 cursor-pointer transition-colors ${
                        isChecked ? 'bg-amber-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        className="mt-0.5 rounded text-[#B89555] focus:ring-[#B89555] cursor-pointer"
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
                        <p className="text-[11px] text-slate-500 italic line-clamp-1">
                          {verse.transliteration}
                        </p>
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                          {verse.translationId}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Primary Button to Apply into Canvas */}
          <button
            onClick={onApplyVersesToProject}
            disabled={selectedVerseNumbers.length === 0 || isLoadingSurah}
            className="w-full py-2.5 text-xs font-bold text-white bg-[#0F172A] hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-[#0F172A] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-[#B89555]" />
            <span>Masukkan {selectedVerseNumbers.length} Ayat ke Proyek</span>
          </button>

          {/* Attribution & JSON import option */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Data: Kemenag RI / Quran API</span>
            <button
              onClick={() => setShowJsonImportModal(true)}
              className="text-slate-500 hover:text-slate-800 underline"
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
            <span className="text-xs font-semibold text-slate-700">
              Daftar Halaman ({pages.length})
            </span>
            <button
              onClick={onAddPage}
              className="flex items-center gap-1 text-xs text-[#B89555] hover:text-[#97783f] font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>

          <div className="space-y-2">
            {pages.map((page, idx) => {
              const isActive = idx === activePageIndex;
              return (
                <div
                  key={page.id}
                  onClick={() => onSelectPage(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#B89555] bg-amber-50/40 shadow-xs ring-1 ring-[#B89555]/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        Halaman {page.pageNumber}
                      </span>
                    </div>

                    {/* Page Actions */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onMovePage(idx, Math.max(0, idx - 1))}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                        title="Geser ke Atas"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onMovePage(idx, Math.min(pages.length - 1, idx + 1))}
                        disabled={idx === pages.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                        title="Geser ke Bawah"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDuplicatePage(idx)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="Duplikat Halaman"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeletePage(idx)}
                        disabled={pages.length <= 1}
                        className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-20 rounded"
                        title="Hapus Halaman"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Verses inside this page badge */}
                  <div className="text-[11px] text-slate-600 flex items-center gap-1">
                    <span className="font-medium text-slate-500">Ayat:</span>
                    {page.verseNumbers.length > 0 ? (
                      <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
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
          <div className="text-xs font-semibold text-slate-700 mb-1">
            Preset Tata Letak
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Pilih tata letak visual. Menukar preset tetap menjaga ayat dan konten Anda.
          </p>

          <div className="space-y-2.5">
            {LAYOUT_PRESETS.map((preset) => {
              const isSelected = preset.id === layoutPreset;
              return (
                <div
                  key={preset.id}
                  onClick={() => onSelectLayoutPreset(preset.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#B89555] bg-amber-50/50 shadow-xs ring-1 ring-[#B89555]/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className={isSelected ? 'text-[#B89555]' : 'text-slate-700'}>
                        {preset.name}
                      </span>
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#B89555]" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
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
            <span className="text-xs font-semibold text-slate-700 block">
              Unggah Font Arab Sendiri
            </span>
            <p className="text-[11px] text-slate-500">
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
              className="w-full py-2.5 border border-dashed border-slate-300 hover:border-[#B89555] rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-amber-50/30 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#B89555]" />
              <span>Pilih File Font (.ttf / .otf / .woff2)</span>
            </button>

            {customFonts.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  Font Terpasang:
                </span>
                {customFonts.map((font, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-slate-800">{font.name}</span>
                    <button
                      onClick={() => onUpdateArabicStyle({ fontFamily: font.name })}
                      className="text-[11px] text-[#B89555] hover:underline font-semibold"
                    >
                      Gunakan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verse Marker Style Picker */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block">
              Model Penanda Nomor Ayat (Waqf)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onUpdateArabicStyle({ showVerseMarker: true, markerStyle: 'standard' })}
                className={`p-2 rounded-lg border text-center transition-colors ${
                  arabicStyle.markerStyle === 'standard' && arabicStyle.showVerseMarker
                    ? 'border-[#B89555] bg-amber-50 text-slate-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-amiri text-lg">۝ 1</div>
                <span className="text-[10px] text-slate-500">Standar Al-Qur'an</span>
              </button>

              <button
                onClick={() => onUpdateArabicStyle({ showVerseMarker: true, markerStyle: 'ornament' })}
                className={`p-2 rounded-lg border text-center transition-colors ${
                  arabicStyle.markerStyle === 'ornament' && arabicStyle.showVerseMarker
                    ? 'border-[#B89555] bg-amber-50 text-slate-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-amiri text-lg">﴿ 1 ﴾</div>
                <span className="text-[10px] text-slate-500">Kurung Ornamen</span>
              </button>

              <button
                onClick={() => onUpdateArabicStyle({ showVerseMarker: true, markerStyle: 'simple' })}
                className={`p-2 rounded-lg border text-center transition-colors ${
                  arabicStyle.markerStyle === 'simple' && arabicStyle.showVerseMarker
                    ? 'border-[#B89555] bg-amber-50 text-slate-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-mono text-xs py-1">[1]</div>
                <span className="text-[10px] text-slate-500">Sederhana</span>
              </button>

              <button
                onClick={() => onUpdateArabicStyle({ showVerseMarker: false, markerStyle: 'none' })}
                className={`p-2 rounded-lg border text-center transition-colors ${
                  !arabicStyle.showVerseMarker || arabicStyle.markerStyle === 'none'
                    ? 'border-[#B89555] bg-amber-50 text-slate-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="text-xs py-1">Polos</div>
                <span className="text-[10px] text-slate-500">Tanpa Penanda</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import JSON */}
      {showJsonImportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">Impor Data Al-Qur'an (JSON)</h3>
            <p className="text-xs text-slate-500">
              Tempelkan array JSON dengan format `[&#123; number: 1, textArabic: "...", transliteration: "...", translationId: "..." &#125;]`.
            </p>
            <textarea
              rows={6}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[{"number": 1, "textArabic": "بِسْمِ اللَّهِ ...", "transliteration": "...", "translationId": "..."}]'
              className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#B89555]"
            />
            {jsonError && <p className="text-xs text-red-600">{jsonError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowJsonImportModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleJsonImport}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0F172A] hover:bg-slate-800 rounded-lg"
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
