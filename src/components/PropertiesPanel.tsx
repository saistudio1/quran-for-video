import React from 'react';
import { 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Layers, 
  Eye, 
  EyeOff, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { 
  ProjectState, 
  ArabicStyle, 
  LatinStyle, 
  TranslationStyle, 
  HeaderStyle, 
  CanvasConfig, 
  PaginationConfig
} from '../types';
import { CANVAS_PRESETS } from '../data/canvasPresets';

interface PropertiesPanelProps {
  project: ProjectState;
  selectedLayerId: 'arabic' | 'transliteration' | 'translation' | 'meta' | 'canvas' | null;
  onSelectLayer: (layerId: 'arabic' | 'transliteration' | 'translation' | 'meta' | 'canvas' | null) => void;
  onUpdateArabicStyle: (style: Partial<ArabicStyle>) => void;
  onUpdateTransliterationStyle: (style: Partial<LatinStyle>) => void;
  onUpdateTranslationStyle: (style: Partial<TranslationStyle>) => void;
  onUpdateMetaStyle: (style: Partial<HeaderStyle>) => void;
  onUpdateCanvasConfig: (config: Partial<CanvasConfig>) => void;
  onUpdatePaginationConfig: (config: Partial<PaginationConfig>) => void;
  isMobileDrawer?: boolean;
}

const COLOR_SWATCHES = [
  { name: 'Putih Murni', value: '#FFFFFF' },
  { name: 'Emas Elegan', value: '#B89555' },
  { name: 'Krem Lembut', value: '#F8FAFC' },
  { name: 'Abu Terang', value: '#CBD5E1' },
  { name: 'Abu Gelap', value: '#64748B' },
  { name: 'Hitam Pekat', value: '#0F172A' },
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  project,
  selectedLayerId,
  onSelectLayer,
  onUpdateArabicStyle,
  onUpdateTransliterationStyle,
  onUpdateTranslationStyle,
  onUpdateMetaStyle,
  onUpdateCanvasConfig,
  onUpdatePaginationConfig,
  isMobileDrawer = false,
}) => {
  const { canvas, styles, pagination } = project;

  return (
    <aside className={`bg-[#edf2f7] flex flex-col h-full select-none ${isMobileDrawer ? 'w-full border-none' : 'w-80 border-l border-slate-300/60 shrink-0 z-20 shadow-[-2px_0_10px_rgba(166,178,196,0.25)]'}`}>
      {/* Layer Selection Segmented Bar in Debossed Neumorphic Well */}
      <div className="p-3 border-b border-slate-200/80 bg-[#edf2f7]">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
          Elemen Terpilih
        </label>
        <div className="neu-segmented grid grid-cols-5 gap-1 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => onSelectLayer('arabic')}
            /* Micro-interaction: anti-linear transition 0.2s cubic-bezier(0.16, 1, 0.3, 1) */
            className={`py-1.5 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] text-center ${
              selectedLayerId === 'arabic'
                ? 'neu-segmented-btn-active'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Arab
          </button>
          <button
            onClick={() => onSelectLayer('transliteration')}
            className={`py-1.5 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] text-center ${
              selectedLayerId === 'transliteration'
                ? 'neu-segmented-btn-active'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Latin
          </button>
          <button
            onClick={() => onSelectLayer('translation')}
            className={`py-1.5 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] text-center ${
              selectedLayerId === 'translation'
                ? 'neu-segmented-btn-active'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Arti
          </button>
          <button
            onClick={() => onSelectLayer('meta')}
            className={`py-1.5 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] text-center ${
              selectedLayerId === 'meta'
                ? 'neu-segmented-btn-active'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Header
          </button>
          <button
            onClick={() => onSelectLayer('canvas')}
            className={`py-1.5 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] text-center ${
              selectedLayerId === 'canvas' || selectedLayerId === null
                ? 'neu-segmented-btn-active'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kanvas
          </button>
        </div>
      </div>

      {/* Properties Scrollable Area with Neumorphic Card Containers */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ===================== ARABIC PROPERTIES ===================== */}
        {selectedLayerId === 'arabic' && (
          <div className="neu-flat p-4 rounded-2xl space-y-4 animate-sheet-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-[#B89555]" />
                <span>Tipografi Teks Arab (RTL)</span>
              </span>
            </div>

            {/* Font Family Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Jenis Huruf Arab
              </label>
              <select
                value={styles.arabic.fontFamily}
                onChange={(e) => onUpdateArabicStyle({ fontFamily: e.target.value })}
                className="neu-input w-full px-3 py-2 text-xs rounded-xl text-slate-800 font-semibold"
              >
                <option value="Amiri Quran">Amiri Quran (Utsmani Mushaf · SIL OFL 1.1)</option>
                <option value="Amiri">Amiri (Klasik Naskh · SIL OFL 1.1)</option>
                <option value="Scheherazade New">Scheherazade New (Naskh Tradisional · SIL OFL 1.1)</option>
                <option value="Noto Naskh Arabic">Noto Naskh Arabic (Jernih & Presisi · OFL)</option>
                <option value="Noto Sans Arabic">Noto Sans Arabic (Modern Kontemporer)</option>
                {project.customFonts.map((f, i) => (
                  <option key={i} value={f.name}>{f.name} (Font Kustom)</option>
                ))}
              </select>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Ukuran Huruf (Font Size)</span>
                <span className="font-mono text-[#B89555] font-bold">{styles.arabic.fontSize} px</span>
              </div>
              <input
                type="range"
                min={26}
                max={84}
                value={styles.arabic.fontSize}
                onChange={(e) => onUpdateArabicStyle({ fontSize: parseInt(e.target.value) })}
                className="neu-range w-full cursor-pointer"
              />
            </div>

            {/* Line Height Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Jarak Baris (Line Height)</span>
                <span className="font-mono text-slate-600 font-bold">{styles.arabic.lineHeight.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={1.6}
                max={3.0}
                step={0.1}
                value={styles.arabic.lineHeight}
                onChange={(e) => onUpdateArabicStyle({ lineHeight: parseFloat(e.target.value) })}
                className="neu-range w-full cursor-pointer"
              />
            </div>

            {/* Bottom Spacing Slider to Latin */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Jarak ke Teks Latin (Bawah)</span>
                <span className="font-mono text-[#B89555] font-bold">{styles.arabic.bottomSpacing ?? 28} px</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={2}
                value={styles.arabic.bottomSpacing ?? 28}
                onChange={(e) => onUpdateArabicStyle({ bottomSpacing: parseInt(e.target.value) })}
                className="neu-range w-full cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block font-medium">
                Memberikan ruang bebas di bawah harakat kasrah agar tidak menumpuk dengan latin.
              </span>
            </div>

            {/* Font Weight */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Ketebalan</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onUpdateArabicStyle({ fontWeight: 'normal' })}
                  className={`py-1.5 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    styles.arabic.fontWeight === 'normal'
                      ? 'neu-flat ring-2 ring-[#B89555] text-slate-900 font-bold'
                      : 'neu-button text-slate-600'
                  }`}
                >
                  Reguler
                </button>
                <button
                  onClick={() => onUpdateArabicStyle({ fontWeight: 'bold' })}
                  className={`py-1.5 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    styles.arabic.fontWeight === 'bold'
                      ? 'neu-flat ring-2 ring-[#B89555] text-slate-900 font-bold'
                      : 'neu-button text-slate-600'
                  }`}
                >
                  Tebal (Bold)
                </button>
              </div>
            </div>

            {/* Text Alignment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Perataan Teks</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateArabicStyle({ textAlign: 'right' })}
                  className={`py-1.5 flex items-center justify-center rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    styles.arabic.textAlign === 'right'
                      ? 'neu-flat ring-2 ring-[#B89555] text-[#B89555]'
                      : 'neu-button text-slate-600'
                  }`}
                  title="Rata Kanan (Alami Arab)"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onUpdateArabicStyle({ textAlign: 'center' })}
                  className={`py-1.5 flex items-center justify-center rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    styles.arabic.textAlign === 'center'
                      ? 'neu-flat ring-2 ring-[#B89555] text-[#B89555]'
                      : 'neu-button text-slate-600'
                  }`}
                  title="Rata Tengah"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onUpdateArabicStyle({ textAlign: 'left' })}
                  className={`py-1.5 flex items-center justify-center rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    styles.arabic.textAlign === 'left'
                      ? 'neu-flat ring-2 ring-[#B89555] text-[#B89555]'
                      : 'neu-button text-slate-600'
                  }`}
                  title="Rata Kiri"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Warna Teks Arab</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styles.arabic.color}
                  onChange={(e) => onUpdateArabicStyle({ color: e.target.value })}
                  className="w-9 h-9 p-0.5 rounded-xl neu-flat cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.arabic.color}
                  onChange={(e) => onUpdateArabicStyle({ color: e.target.value })}
                  className="neu-input flex-1 px-3 py-1.5 text-xs font-mono uppercase rounded-xl text-slate-800 font-semibold"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.value}
                    onClick={() => onUpdateArabicStyle({ color: swatch.value })}
                    style={{ backgroundColor: swatch.value }}
                    /* Micro-interaction: scale 1.15 on hover with smooth cubic-bezier */
                    className={`w-6 h-6 rounded-full border border-slate-300 shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-115 ${
                      styles.arabic.color.toUpperCase() === swatch.value.toUpperCase()
                        ? 'ring-2 ring-[#B89555] ring-offset-2'
                        : ''
                    }`}
                    title={swatch.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TRANSLITERATION PROPERTIES ===================== */}
        {selectedLayerId === 'transliteration' && (
          <div className="neu-flat p-4 rounded-2xl space-y-4 animate-sheet-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-[#B89555]" />
                <span>Layer Transliterasi Latin</span>
              </span>
              <button
                onClick={() => onUpdateTransliterationStyle({ show: !styles.transliteration.show })}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  styles.transliteration.show
                    ? 'neu-flat ring-1 ring-[#B89555] text-[#B89555]'
                    : 'neu-button text-slate-400'
                }`}
                title="Tampilkan / Sembunyikan"
              >
                {styles.transliteration.show ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{styles.transliteration.show ? 'Aktif' : 'Tersembunyi'}</span>
              </button>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Ukuran Huruf Latin</span>
                <span className="font-mono text-[#B89555] font-bold">{styles.transliteration.fontSize} px</span>
              </div>
              <input
                type="range"
                min={14}
                max={36}
                value={styles.transliteration.fontSize}
                onChange={(e) => onUpdateTransliterationStyle({ fontSize: parseInt(e.target.value) })}
                className="neu-range w-full cursor-pointer"
              />
            </div>

            {/* Bottom Spacing Slider to Translation */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Jarak ke Terjemahan (Bawah)</span>
                <span className="font-mono text-[#B89555] font-bold">{styles.transliteration.bottomSpacing ?? 18} px</span>
              </div>
              <input
                type="range"
                min={6}
                max={60}
                step={2}
                value={styles.transliteration.bottomSpacing ?? 18}
                onChange={(e) => onUpdateTransliterationStyle({ bottomSpacing: parseInt(e.target.value) })}
                className="neu-range w-full cursor-pointer"
              />
            </div>

            {/* Font Style: Italic vs Normal */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Gaya Huruf</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onUpdateTransliterationStyle({ fontStyle: 'italic' })}
                  className={`py-1.5 rounded-xl italic transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    styles.transliteration.fontStyle === 'italic'
                      ? 'neu-flat ring-2 ring-[#B89555] text-slate-900 font-bold'
                      : 'neu-button text-slate-600'
                  }`}
                >
                  Italic (Miring)
                </button>
                <button
                  onClick={() => onUpdateTransliterationStyle({ fontStyle: 'normal' })}
                  className={`py-1.5 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    styles.transliteration.fontStyle === 'normal'
                      ? 'neu-flat ring-2 ring-[#B89555] text-slate-900 font-bold'
                      : 'neu-button text-slate-600'
                  }`}
                >
                  Normal (Tegak)
                </button>
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Warna Huruf Latin</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styles.transliteration.color}
                  onChange={(e) => onUpdateTransliterationStyle({ color: e.target.value })}
                  className="w-9 h-9 p-0.5 rounded-xl neu-flat cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.transliteration.color}
                  onChange={(e) => onUpdateTransliterationStyle({ color: e.target.value })}
                  className="neu-input flex-1 px-3 py-1.5 text-xs font-mono uppercase rounded-xl text-slate-800 font-semibold"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.value}
                    onClick={() => onUpdateTransliterationStyle({ color: swatch.value })}
                    style={{ backgroundColor: swatch.value }}
                    className={`w-6 h-6 rounded-full border border-slate-300 shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-115 ${
                      styles.transliteration.color.toUpperCase() === swatch.value.toUpperCase()
                        ? 'ring-2 ring-[#B89555] ring-offset-2'
                        : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TRANSLATION PROPERTIES ===================== */}
        {selectedLayerId === 'translation' && (
          <div className="neu-flat p-4 rounded-2xl space-y-4 animate-sheet-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-[#B89555]" />
                <span>Layer Terjemahan (Indonesia)</span>
              </span>
              <button
                onClick={() => onUpdateTranslationStyle({ show: !styles.translation.show })}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  styles.translation.show
                    ? 'neu-flat ring-1 ring-[#B89555] text-[#B89555]'
                    : 'neu-button text-slate-400'
                }`}
                title="Tampilkan / Sembunyikan"
              >
                {styles.translation.show ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{styles.translation.show ? 'Aktif' : 'Tersembunyi'}</span>
              </button>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Ukuran Terjemahan</span>
                <span className="font-mono text-[#B89555] font-bold">{styles.translation.fontSize} px</span>
              </div>
              <input
                type="range"
                min={14}
                max={36}
                value={styles.translation.fontSize}
                onChange={(e) => onUpdateTranslationStyle({ fontSize: parseInt(e.target.value) })}
                className="neu-range w-full cursor-pointer"
              />
            </div>

            {/* Line Height Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Jarak Baris</span>
                <span className="font-mono text-slate-600 font-bold">{styles.translation.lineHeight.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={1.3}
                max={2.4}
                step={0.1}
                value={styles.translation.lineHeight}
                onChange={(e) => onUpdateTranslationStyle({ lineHeight: parseFloat(e.target.value) })}
                className="neu-range w-full cursor-pointer"
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Warna Terjemahan</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styles.translation.color}
                  onChange={(e) => onUpdateTranslationStyle({ color: e.target.value })}
                  className="w-9 h-9 p-0.5 rounded-xl neu-flat cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.translation.color}
                  onChange={(e) => onUpdateTranslationStyle({ color: e.target.value })}
                  className="neu-input flex-1 px-3 py-1.5 text-xs font-mono uppercase rounded-xl text-slate-800 font-semibold"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.value}
                    onClick={() => onUpdateTranslationStyle({ color: swatch.value })}
                    style={{ backgroundColor: swatch.value }}
                    className={`w-6 h-6 rounded-full border border-slate-300 shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-115 ${
                      styles.translation.color.toUpperCase() === swatch.value.toUpperCase()
                        ? 'ring-2 ring-[#B89555] ring-offset-2'
                        : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== META & BASMALAH PROPERTIES ===================== */}
        {selectedLayerId === 'meta' && (
          <div className="neu-flat p-4 rounded-2xl space-y-4 animate-sheet-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#B89555]" />
                <span>Nama Surah & Basmalah (Bismillah)</span>
              </span>
            </div>

            {/* Surah Status Banner */}
            {project.selectedSurah.number === 9 ? (
              <div className="neu-inset-sm p-3.5 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Surah At-Taubah (Surat ke-9)</span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Berdasarkan kaidah qira'at dan ijma' ulama mushaf, Surah At-Taubah <strong>tidak diawali dengan Basmalah</strong>. Opsi Basmalah dinonaktifkan secara otomatis.
                </p>
              </div>
            ) : project.selectedSurah.number === 1 ? (
              <div className="neu-inset-sm p-3.5 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Surah Al-Fatihah (Surat ke-1)</span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Dalam Surah Al-Fatihah, kalimat <em>Bismillāhir-raḥmānir-raḥīm</em> sudah merupakan <strong>Ayat 1 mandiri</strong> yang memiliki terjemahan dan transliterasi lengkap. Basmalah header ditiadakan agar tidak terjadi pengulangan ganda pada slide.
                </p>
              </div>
            ) : (
              /* Settings for all other surahs */
              <div className="space-y-3 p-3.5 rounded-xl neu-flat-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Basmalah di Awal Surah</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Sebagai opsi pembuka sebelum ayat 1
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={styles.meta.showBismillah}
                    onChange={(e) => onUpdateMetaStyle({ showBismillah: e.target.checked })}
                    className="w-4 h-4 rounded text-[#B89555] focus:ring-[#B89555] cursor-pointer"
                  />
                </div>

                {styles.meta.showBismillah && (
                  <div className="space-y-2 pt-2 border-t border-slate-300/60">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Aturan Penempatan Basmalah:
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2 p-2.5 rounded-xl neu-button cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="bismillahPlacement"
                          value="first_page"
                          checked={styles.meta.bismillahPlacement === 'first_page'}
                          onChange={() => onUpdateMetaStyle({ bismillahPlacement: 'first_page' })}
                          className="mt-0.5 text-[#B89555] focus:ring-[#B89555]"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">Hanya di Awal Surah (Rekomendasi)</span>
                          <span className="text-[10px] text-slate-500 block font-medium">
                            Hanya muncul pada slide pembuka (Ayat 1). Tidak berulang di setiap ayat pertengahan.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2 p-2.5 rounded-xl neu-button cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="bismillahPlacement"
                          value="every_page"
                          checked={styles.meta.bismillahPlacement === 'every_page'}
                          onChange={() => onUpdateMetaStyle({ bismillahPlacement: 'every_page' })}
                          className="mt-0.5 text-[#B89555] focus:ring-[#B89555]"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">Di Setiap Slide (Opsional)</span>
                          <span className="text-[10px] text-slate-500 block font-medium">
                            Tampilkan Basmalah di seluruh halaman video recitation.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Surah Name Toggle */}
            <div className="p-3.5 rounded-xl neu-flat-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Tampilkan Nama Surah & Ayat</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Label info di bagian atas kanvas (contoh: QS. Al-Mulk · Ayat 1)
                </span>
              </div>
              <input
                type="checkbox"
                checked={styles.meta.showSurahName}
                onChange={(e) => onUpdateMetaStyle({ showSurahName: e.target.checked })}
                className="w-4 h-4 rounded text-[#B89555] focus:ring-[#B89555] cursor-pointer"
              />
            </div>

            {/* Header Font Size Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Ukuran Teks Header</span>
                <span className="font-mono text-[#B89555] font-bold">{styles.meta.fontSize} px</span>
              </div>
              <input
                type="range"
                min={12}
                max={28}
                value={styles.meta.fontSize}
                onChange={(e) => onUpdateMetaStyle({ fontSize: parseInt(e.target.value) })}
                className="neu-range w-full cursor-pointer"
              />
            </div>

            {/* Header Text Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Warna Teks Header</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styles.meta.color}
                  onChange={(e) => onUpdateMetaStyle({ color: e.target.value })}
                  className="w-9 h-9 p-0.5 rounded-xl neu-flat cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.meta.color}
                  onChange={(e) => onUpdateMetaStyle({ color: e.target.value })}
                  className="neu-input flex-1 px-3 py-1.5 text-xs font-mono uppercase rounded-xl text-slate-800 font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== CANVAS & PAGINATION PROPERTIES ===================== */}
        {(selectedLayerId === 'canvas' || selectedLayerId === null) && (
          <div className="neu-flat p-4 rounded-2xl space-y-4 animate-sheet-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#B89555]" />
                <span>Pengaturan Kanvas & Video</span>
              </span>
            </div>

            {/* Aspect Ratio Presets ("macam2") */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Format Rasio Video ("macam2")
              </label>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {CANVAS_PRESETS.map((p) => {
                  const isSelected = canvas.preset === p.preset;
                  return (
                    <button
                      key={p.preset}
                      onClick={() =>
                        onUpdateCanvasConfig({
                          width: p.width,
                          height: p.height,
                          preset: p.preset,
                        })
                      }
                      className={`p-3 rounded-xl text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isSelected
                          ? 'neu-flat ring-2 ring-[#B89555] font-bold text-slate-900'
                          : 'neu-button text-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{p.preset.toUpperCase()}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-medium">
                        {p.width} × {p.height}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Dimensions */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Lebar (px):</label>
                <input
                  type="number"
                  value={canvas.width}
                  onChange={(e) =>
                    onUpdateCanvasConfig({
                      width: parseInt(e.target.value) || 1080,
                      preset: 'custom',
                    })
                  }
                  className="neu-input w-full px-2.5 py-1.5 font-mono text-xs rounded-xl text-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Tinggi (px):</label>
                <input
                  type="number"
                  value={canvas.height}
                  onChange={(e) =>
                    onUpdateCanvasConfig({
                      height: parseInt(e.target.value) || 1920,
                      preset: 'custom',
                    })
                  }
                  className="neu-input w-full px-2.5 py-1.5 font-mono text-xs rounded-xl text-slate-800 font-bold"
                />
              </div>
            </div>

            {/* Canvas Padding */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Batas Tepi (Padding)</span>
                <span className="font-mono text-[#B89555] font-bold">{canvas.padding} px</span>
              </div>
              <input
                type="range"
                min={20}
                max={140}
                value={canvas.padding}
                onChange={(e) => onUpdateCanvasConfig({ padding: parseInt(e.target.value) })}
                className="neu-range w-full cursor-pointer"
              />
            </div>

            {/* Safe Area Percent */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Safe Margin Guideline</span>
                <span className="font-mono text-[#B89555] font-bold">{canvas.safeMarginPercent}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={15}
                value={canvas.safeMarginPercent}
                onChange={(e) => onUpdateCanvasConfig({ safeMarginPercent: parseInt(e.target.value) })}
                className="neu-range w-full cursor-pointer"
              />
            </div>

            {/* Vertical Alignment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Posisi Vertikal Teks</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => onUpdateCanvasConfig({ verticalAlign: 'top' })}
                  className={`py-2 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    canvas.verticalAlign === 'top'
                      ? 'neu-flat ring-2 ring-[#B89555] text-[#B89555] font-bold'
                      : 'neu-button text-slate-600'
                  }`}
                >
                  Atas
                </button>
                <button
                  onClick={() => onUpdateCanvasConfig({ verticalAlign: 'center' })}
                  className={`py-2 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    canvas.verticalAlign === 'center'
                      ? 'neu-flat ring-2 ring-[#B89555] text-[#B89555] font-bold'
                      : 'neu-button text-slate-600'
                  }`}
                >
                  Tengah
                </button>
                <button
                  onClick={() => onUpdateCanvasConfig({ verticalAlign: 'bottom' })}
                  className={`py-2 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    canvas.verticalAlign === 'bottom'
                      ? 'neu-flat ring-2 ring-[#B89555] text-[#B89555] font-bold'
                      : 'neu-button text-slate-600'
                  }`}
                >
                  Bawah
                </button>
              </div>
            </div>

            {/* ===================== PAGINATION ENGINE SETTINGS ===================== */}
            <div className="pt-3 border-t border-slate-300/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#B89555]" />
                  <span>Sistem Paginasi Otomatis</span>
                </span>
              </div>

              {/* Pagination Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Distribusi Ayat ke Halaman
                </label>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <button
                    onClick={() => onUpdatePaginationConfig({ mode: 'single_verse' })}
                    className={`p-2.5 rounded-xl text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      pagination.mode === 'single_verse'
                        ? 'neu-flat ring-2 ring-[#B89555] font-bold text-slate-900'
                        : 'neu-button text-slate-600'
                    }`}
                  >
                    <div className="font-bold">1 Ayat / Slide</div>
                    <div className="text-[10px] text-slate-500 font-medium">Tiap ayat 1 gambar PNG</div>
                  </button>

                  <button
                    onClick={() => onUpdatePaginationConfig({ mode: 'fixed_count' })}
                    className={`p-2.5 rounded-xl text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      pagination.mode === 'fixed_count'
                        ? 'neu-flat ring-2 ring-[#B89555] font-bold text-slate-900'
                        : 'neu-button text-slate-600'
                    }`}
                  >
                    <div className="font-bold">Jumlah Tetap</div>
                    <div className="text-[10px] text-slate-500 font-medium">{pagination.fixedCount} ayat per slide</div>
                  </button>

                  <button
                    onClick={() => onUpdatePaginationConfig({ mode: 'auto_fit' })}
                    className={`p-2.5 rounded-xl text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      pagination.mode === 'auto_fit'
                        ? 'neu-flat ring-2 ring-[#B89555] font-bold text-slate-900'
                        : 'neu-button text-slate-600'
                    }`}
                  >
                    <div className="font-bold">Auto Fit</div>
                    <div className="text-[10px] text-slate-500 font-medium">Pecah otomatis jika penuh</div>
                  </button>

                  <button
                    onClick={() => onUpdatePaginationConfig({ mode: 'manual' })}
                    className={`p-2.5 rounded-xl text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      pagination.mode === 'manual'
                        ? 'neu-flat ring-2 ring-[#B89555] font-bold text-slate-900'
                        : 'neu-button text-slate-600'
                    }`}
                  >
                    <div className="font-bold">Manual</div>
                    <div className="text-[10px] text-slate-500 font-medium">Atur ayat per slide manual</div>
                  </button>
                </div>
              </div>

              {/* If Fixed Count is selected */}
              {pagination.mode === 'fixed_count' && (
                <div className="space-y-1.5 p-3 rounded-xl neu-inset-sm">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Ayat Per Halaman</span>
                    <span className="font-mono text-[#B89555] font-bold">{pagination.fixedCount} Ayat</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={pagination.fixedCount}
                    onChange={(e) => onUpdatePaginationConfig({ fixedCount: parseInt(e.target.value) || 2 })}
                    className="neu-range w-full cursor-pointer"
                  />
                </div>
              )}

              {/* Verse Spacing */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Jarak Antar Ayat</span>
                  <span className="font-mono text-[#B89555] font-bold">{pagination.verseSpacing} px</span>
                </div>
                <input
                  type="range"
                  min={16}
                  max={80}
                  value={pagination.verseSpacing}
                  onChange={(e) => onUpdatePaginationConfig({ verseSpacing: parseInt(e.target.value) })}
                  className="neu-range w-full cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
