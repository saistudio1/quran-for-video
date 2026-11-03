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
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  Square,
  Sparkles,
  Scale
} from 'lucide-react';
import { CanvasDimensions, CanvasPreset, BackgroundMode } from '../types';
import { CANVAS_PRESETS } from '../data/canvasPresets';

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
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-4 select-none shrink-0 z-30 shadow-xs">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-[#B89555] shadow-xs">
            <span className="font-bold text-sm tracking-tighter">QL</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 tracking-tight">QURAN LAYER</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-[#B89555] border border-amber-200/50">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Project Name & Save Status */}
        <div className="hidden sm:flex items-center gap-2">
          <input
            type="text"
            value={projectName}
            onChange={(e) => onUpdateProjectName(e.target.value)}
            className="text-xs font-semibold text-slate-800 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-[#B89555] px-2 py-1 rounded transition-colors border border-transparent hover:border-slate-200 max-w-[150px] md:max-w-[200px] truncate"
            title="Klik untuk mengubah nama proyek"
          />
          <div className="flex items-center gap-1 text-[11px] text-slate-400" title="Proyek tersimpan otomatis di perangkat Anda">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline">Tersimpan</span>
          </div>

          <button
            onClick={onOpenProjectsModal}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2 py-1 rounded transition-colors ml-1"
            title="Buka / Kelola Proyek"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Proyek</span>
          </button>

          <button
            onClick={onOpenAttributionModal}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-[#B89555] hover:bg-slate-100 px-2 py-1 rounded transition-colors"
            title="Atribusi Open-Source, Lisensi Font & Integritas Al-Qur'an"
          >
            <Scale className="w-3.5 h-3.5 text-[#B89555]" />
            <span className="hidden xl:inline">Atribusi</span>
          </button>
        </div>

        {/* Mobile Undo/Redo placed right in top bar for quick thumb reach */}
        <div className="flex lg:hidden items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200/60 ml-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Tool Controls: Undo/Redo, Zoom, Aspect Ratio, Backdrop */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200/60">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 rounded transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 rounded transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200/60 text-xs">
          <button
            onClick={() => onZoomChange(Math.max(0.2, zoom - 0.1))}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono text-[11px] font-medium text-slate-700 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2.5, zoom + 0.1))}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onFitToScreen}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded transition-colors ml-0.5 border-l border-slate-200"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Aspect Ratio Switcher ("macam2") */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200/60">
          <button
            onClick={() => onSelectDimensionPreset('vertical')}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
              currentDimensions.preset === 'vertical'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="9:16 Vertical (Reels / TikTok / Shorts) - 1080x1920"
          >
            <Smartphone className="w-3 h-3 text-[#B89555]" />
            <span>9:16</span>
          </button>
          <button
            onClick={() => onSelectDimensionPreset('landscape')}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
              currentDimensions.preset === 'landscape'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="16:9 Landscape (YouTube) - 1920x1080"
          >
            <Monitor className="w-3 h-3 text-[#B89555]" />
            <span>16:9</span>
          </button>
          <button
            onClick={() => onSelectDimensionPreset('square')}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
              currentDimensions.preset === 'square'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="1:1 Square (Instagram Feed) - 1080x1080"
          >
            <Square className="w-3 h-3 text-[#B89555]" />
            <span>1:1</span>
          </button>
        </div>

        {/* Backdrop Switcher for Previewing Overlay */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200/60 text-xs">
          <button
            onClick={() => onChangeBackgroundMode('checkerboard')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
              backgroundMode === 'checkerboard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Latar Transparan (Papan Catur)"
          >
            Transparan
          </button>
          <button
            onClick={() => onChangeBackgroundMode('video_dark')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
              backgroundMode === 'video_dark' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Simulasi Video Gelap (Murattal)"
          >
            Video Gelap
          </button>
          <button
            onClick={() => onChangeBackgroundMode('video_nature')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
              backgroundMode === 'video_nature' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Simulasi Video Alam"
          >
            Video Alam
          </button>
        </div>

        {/* Safe Margin Guide Toggle */}
        <button
          onClick={onToggleSafeMargins}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
            showSafeMargins
              ? 'bg-amber-50 text-[#B89555] border-amber-300'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
          }`}
          title="Tampilkan / Sembunyikan Garis Batas Aman (Safe Margins)"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[11px]">Safe Margin</span>
        </button>
      </div>

      {/* Right Primary Actions: Video Mockup, Export PNG, Batch ZIP */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Safe Margin Guide Toggle */}
        <button
          onClick={onToggleSafeMargins}
          className={`lg:hidden p-1.5 rounded-lg border text-xs flex items-center transition-colors ${
            showSafeMargins
              ? 'bg-amber-50 text-[#B89555] border-amber-300'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
          title="Safe Margin Guide"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenVideoPreviewModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/80"
          title="Uji tampilan overlay dengan simulasi video recitation aktif"
        >
          <Tv className="w-3.5 h-3.5 text-[#B89555]" />
          <span className="hidden md:inline">Pratinjau Video</span>
        </button>

        <button
          onClick={() => onOpenExportModal('single')}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg shadow-xs transition-colors"
          title="Ekspor Halaman Aktif sebagai PNG Transparan"
        >
          <Download className="w-3.5 h-3.5 text-[#B89555]" />
          <span className="inline sm:hidden">Ekspor</span>
          <span className="hidden sm:inline">Ekspor PNG</span>
        </button>

        <button
          onClick={() => onOpenExportModal('batch')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          title="Ekspor Semua Halaman dalam satu file ZIP"
        >
          <FolderArchive className="w-3.5 h-3.5 text-[#B89555]" />
          <span>Ekspor ZIP</span>
        </button>
      </div>
    </header>
  );
};
