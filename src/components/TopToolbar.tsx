import React from 'react';
import { 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  FolderArchive, 
  Tv, 
  FolderOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  Square,
  Scale
} from 'lucide-react';
import { CanvasDimensions, CanvasPreset, BackgroundMode } from '../types';

interface TopToolbarProps {
  projectName: string;
  onUpdateProjectName: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitToScreen: () => void;
  currentDimensions: CanvasDimensions;
  onSelectDimensionPreset: (preset: CanvasPreset) => void;
  backgroundMode: BackgroundMode;
  onChangeBackgroundMode: (mode: BackgroundMode) => void;
  showSafeMargins: boolean;
  onToggleSafeMargins: () => void;
  onOpenExportModal: (mode: 'single' | 'batch') => void;
  onOpenProjectsModal: () => void;
  onOpenVideoPreviewModal: () => void;
  onOpenAttributionModal: () => void;
  uiMode: 'pc' | 'mobile';
  onChangeUiMode: (mode: 'pc' | 'mobile') => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  projectName,
  onUpdateProjectName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomChange,
  onFitToScreen,
  currentDimensions,
  onSelectDimensionPreset,
  backgroundMode,
  onChangeBackgroundMode,
  showSafeMargins,
  onToggleSafeMargins,
  onOpenExportModal,
  onOpenProjectsModal,
  onOpenVideoPreviewModal,
  onOpenAttributionModal,
  uiMode,
  onChangeUiMode,
}) => {
  return (
    <header className="h-14 bg-[#edf2f7] border-b border-slate-200/80 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 select-none shrink-0 z-30 shadow-[0_2px_8px_rgba(166,178,196,0.3)]">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-slate-300/60">
          {/* Neumorphic Brand Emblem: Soft extrusion with gold glyph */}
          <div className="w-8 h-8 rounded-xl bg-[#edf2f7] neu-interactive flex items-center justify-center text-[#B89555] shadow-[3px_3px_7px_rgba(166,178,196,0.5),-3px_-3px_7px_rgba(255,255,255,0.9)] border border-white/60">
            <span className="font-extrabold text-xs tracking-tighter">QL</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-slate-800 tracking-tight">QURAN LAYER</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#edf2f7] text-[#B89555] shadow-[inset_1.5px_1.5px_3px_rgba(166,178,196,0.4),inset_-1.5px_-1.5px_3px_rgba(255,255,255,0.9)] border border-slate-200/40">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Project Name & Save Status */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Sunken Neumorphic Input Slot */}
          <input
            type="text"
            value={projectName}
            onChange={(e) => onUpdateProjectName(e.target.value)}
            className="neu-input text-xs font-semibold text-slate-800 px-2.5 py-1 rounded-lg max-w-[130px] md:max-w-[180px] truncate transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]"
            title="Klik untuk mengubah nama proyek"
          />
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium" title="Proyek tersimpan otomatis di browser lokal">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Tersimpan</span>
          </div>

          {/* Micro-interaction: Projects button */}
          <button
            onClick={onOpenProjectsModal}
            className="neu-button flex items-center gap-1 text-xs text-slate-700 px-2.5 py-1 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5 ml-1"
            title="Buka / Kelola Proyek"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline font-medium">Proyek</span>
          </button>

          {/* Attribution & Open-Source Compliance modal trigger */}
          <button
            onClick={onOpenAttributionModal}
            className="neu-button flex items-center gap-1 text-xs text-slate-700 px-2.5 py-1 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
            title="Atribusi Open-Source, Lisensi Font & Integritas Al-Qur'an"
          >
            <Scale className="w-3.5 h-3.5 text-[#B89555]" />
            <span className="hidden xl:inline font-medium">Atribusi</span>
          </button>
        </div>

        {/* UI Mode Switcher (PC Studio vs Smartphone Mobile) in sunken segmented well */}
        <div className="neu-segmented flex items-center p-0.5 rounded-xl ml-1 sm:ml-2">
          <button
            onClick={() => onChangeUiMode('pc')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              uiMode === 'pc'
                ? 'neu-segmented-btn-active'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tampilan Mode PC (Studio 3 Kolom Lengkap)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mode PC</span>
          </button>
          <button
            onClick={() => onChangeUiMode('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              uiMode === 'mobile'
                ? 'neu-segmented-btn-active'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tampilan Mode Mobile (Canva Style Smartphone)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mode Mobile</span>
          </button>
        </div>

        {/* Mobile Undo/Redo in top bar for quick thumb reach */}
        <div className="flex md:hidden items-center neu-segmented rounded-xl p-0.5 ml-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Tool Controls: Undo/Redo, Zoom, Aspect Ratio, Backdrop (Active on PC / Large screens) */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Undo / Redo in Neumorphic Debossed Well */}
        <div className="flex items-center neu-segmented rounded-xl p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls with Neumorphic Touch */}
        <div className="flex items-center neu-segmented rounded-xl p-0.5 text-xs">
          <button
            onClick={() => onZoomChange(Math.max(0.2, zoom - 0.1))}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono text-[11px] font-semibold text-slate-700 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2.5, zoom + 0.1))}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onFitToScreen}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 ml-0.5 border-l border-slate-300/60"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Aspect Ratio Switcher */}
        <div className="flex items-center neu-segmented rounded-xl p-0.5">
          <button
            onClick={() => onSelectDimensionPreset('vertical')}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              currentDimensions.preset === 'vertical'
                ? 'neu-segmented-btn-active'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="9:16 Vertical (Reels / TikTok / Shorts) - 1080x1920"
          >
            <Smartphone className="w-3 h-3 text-[#B89555]" />
            <span>9:16</span>
          </button>
          <button
            onClick={() => onSelectDimensionPreset('landscape')}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              currentDimensions.preset === 'landscape'
                ? 'neu-segmented-btn-active'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="16:9 Landscape (YouTube) - 1920x1080"
          >
            <Monitor className="w-3 h-3 text-[#B89555]" />
            <span>16:9</span>
          </button>
          <button
            onClick={() => onSelectDimensionPreset('square')}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              currentDimensions.preset === 'square'
                ? 'neu-segmented-btn-active'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="1:1 Square (Instagram Feed) - 1080x1080"
          >
            <Square className="w-3 h-3 text-[#B89555]" />
            <span>1:1</span>
          </button>
        </div>

        {/* Backdrop Switcher for Previewing Overlay */}
        <div className="flex items-center neu-segmented rounded-xl p-0.5 text-xs">
          <button
            onClick={() => onChangeBackgroundMode('checkerboard')}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              backgroundMode === 'checkerboard' ? 'neu-segmented-btn-active' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Latar Transparan (Papan Catur)"
          >
            Transparan
          </button>
          <button
            onClick={() => onChangeBackgroundMode('video_dark')}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              backgroundMode === 'video_dark' ? 'neu-segmented-btn-active' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Simulasi Video Gelap (Murattal)"
          >
            Video Gelap
          </button>
          <button
            onClick={() => onChangeBackgroundMode('video_nature')}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              backgroundMode === 'video_nature' ? 'neu-segmented-btn-active' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Simulasi Video Alam"
          >
            Video Alam
          </button>
        </div>

        {/* Safe Margin Guide Toggle */}
        <button
          onClick={onToggleSafeMargins}
          className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5 ${
            showSafeMargins
              ? 'bg-[#edf2f7] text-[#B89555] shadow-[inset_2px_2px_4px_rgba(160,174,192,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] border border-[#B89555]/40 font-semibold'
              : 'neu-button text-slate-600'
          }`}
          title="Tampilkan / Sembunyikan Garis Batas Aman (Safe Margins)"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[11px]">Safe Margin</span>
        </button>
      </div>

      {/* Right Primary Actions: Video Mockup, Export PNG, Batch ZIP */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Mobile Safe Margin Guide Toggle */}
        <button
          onClick={onToggleSafeMargins}
          className={`lg:hidden p-2 rounded-xl text-xs flex items-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            showSafeMargins
              ? 'neu-inset text-[#B89555]'
              : 'neu-button text-slate-600'
          }`}
          title="Safe Margin Guide"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        {/* Video Preview Modal Trigger */}
        <button
          onClick={onOpenVideoPreviewModal}
          className="neu-button hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
          title="Uji tampilan overlay dengan simulasi video recitation aktif"
        >
          <Tv className="w-3.5 h-3.5 text-[#B89555]" />
          <span className="hidden md:inline">Pratinjau Video</span>
        </button>

        {/* Export Single PNG (Tactile Minimalist Neumorphic Button) */}
        <button
          onClick={() => onOpenExportModal('single')}
          className="neu-button flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-800 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
          title="Ekspor Halaman Aktif sebagai PNG Transparan"
        >
          <Download className="w-3.5 h-3.5 text-[#B89555]" />
          <span className="inline sm:hidden">Ekspor</span>
          <span className="hidden sm:inline">Ekspor PNG</span>
        </button>

        {/* Batch ZIP Export (Primary Neumorphic Gold Button) */}
        <button
          onClick={() => onOpenExportModal('batch')}
          className="neu-button-primary hidden md:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
          title="Ekspor Semua Halaman dalam satu file ZIP"
        >
          <FolderArchive className="w-3.5 h-3.5 text-amber-100" />
          <span>Ekspor ZIP</span>
        </button>
      </div>
    </header>
  );
};
