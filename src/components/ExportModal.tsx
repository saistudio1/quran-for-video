import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FolderArchive, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';
import { ProjectState, PageDefinition } from '../types';
import { renderNodeToPng, exportPagesToZip, downloadDataUrl, ExportProgress } from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'single' | 'batch';
  project: ProjectState;
  activePage: PageDefinition | undefined;
  activePageIndex: number;
  getCanvasNode: () => HTMLElement | null;
  renderPageByIndex: (index: number) => Promise<HTMLElement | null>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode,
  project,
  activePage,
  activePageIndex,
  getCanvasNode,
  renderPageByIndex,
}) => {
  const [exportMode, setExportMode] = useState<'single' | 'batch'>(initialMode);
  const [scale, setScale] = useState<number>(1); // 1x or 2x
  const [transparent, setTransparent] = useState<boolean>(true);
  const [selectedPagesMode, setSelectedPagesMode] = useState<'all' | 'current'>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (exportMode === 'single') {
        const node = getCanvasNode();
        if (!node) throw new Error('Elemen kanvas tidak ditemukan di DOM.');

        setProgress({
          currentPage: 1,
          totalPages: 1,
          status: 'rendering',
        });

        const { dataUrl, cornerAlpha } = await renderNodeToPng(node, {
          scale,
          transparent,
          width: project.canvas.width,
          height: project.canvas.height,
        });

        const filename = `${project.selectedSurah.nameLatin.replace(/[^a-zA-Z0-9]/g, '-')}-Halaman-${(activePageIndex + 1).toString().padStart(3, '0')}.png`;
        downloadDataUrl(dataUrl, filename);

        const alphaInfo = transparent && cornerAlpha === 0 ? ' (Alpha = 0 · Transparan Murni)' : '';
        setSuccessMessage(`Berhasil mengekspor "${filename}"${alphaInfo}!`);
        setProgress({
          currentPage: 1,
          totalPages: 1,
          status: 'complete',
          verifiedAlpha: cornerAlpha,
        });
      } else {
        // Batch export
        const pagesToExport = selectedPagesMode === 'all' 
          ? project.pages 
          : [activePage || project.pages[0]];

        await exportPagesToZip(
          project,
          pagesToExport,
          renderPageByIndex,
          {
            scale,
            transparent,
            onProgress: (prog) => setProgress(prog),
          }
        );

        setSuccessMessage(`Berhasil mengekspor file ZIP berisi ${pagesToExport.length} file PNG overlay!`);
      }
    } catch (err: any) {
      console.error('Export error:', err);
      setErrorMessage(err.message || 'Gagal mengekspor gambar.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#B89555]">
              {exportMode === 'single' ? <Download className="w-4 h-4" /> : <FolderArchive className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {exportMode === 'single' ? 'Ekspor PNG Halaman Aktif' : 'Ekspor Batch ZIP Seluruh Slide'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Format PNG Transparan resolusi tinggi untuk CapCut, Premiere, & DaVinci
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setExportMode('single')}
            disabled={isExporting}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              exportMode === 'single'
                ? 'bg-white text-slate-900 shadow-xs text-[#B89555]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1 Halaman PNG</span>
          </button>
          <button
            onClick={() => setExportMode('batch')}
            disabled={isExporting}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              exportMode === 'batch'
                ? 'bg-white text-slate-900 shadow-xs text-[#B89555]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Semua Slide (ZIP)</span>
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4 text-xs">
          {/* Resolution Scale */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Resolusi Ekspor</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setScale(1)}
                disabled={isExporting}
                className={`p-2.5 rounded-xl border text-left transition-colors ${
                  scale === 1
                    ? 'border-[#B89555] bg-amber-50/70 font-bold text-slate-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div>1x Standard ({project.canvas.width} × {project.canvas.height})</div>
                <div className="text-[10px] text-slate-400 font-normal">Ukuran video standar</div>
              </button>
              <button
                onClick={() => setScale(2)}
                disabled={isExporting}
                className={`p-2.5 rounded-xl border text-left transition-colors ${
                  scale === 2
                    ? 'border-[#B89555] bg-amber-50/70 font-bold text-slate-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div>2x Ultra Crisp ({project.canvas.width * 2} × {project.canvas.height * 2})</div>
                <div className="text-[10px] text-slate-400 font-normal">High-DPI / 4K jernih</div>
              </button>
            </div>
          </div>

          {/* Transparency Switch */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-800">Latar Belakang Transparan (Alpha Channel)</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Alpha = 0
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Murni transparan tanpa kotak-kotak papan catur. Teks menempel sempurna di atas timeline video Anda.
              </span>
            </div>
            <input
              type="checkbox"
              checked={transparent}
              disabled={isExporting}
              onChange={(e) => setTransparent(e.target.checked)}
              className="w-4 h-4 rounded text-[#B89555] focus:ring-[#B89555] cursor-pointer"
            />
          </div>

          {/* Page range for Batch */}
          {exportMode === 'batch' && (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Cakupan Halaman</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedPagesMode('all')}
                  disabled={isExporting}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    selectedPagesMode === 'all'
                      ? 'border-[#B89555] bg-amber-50 font-bold text-slate-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Semua Halaman ({project.pages.length} File)
                </button>
                <button
                  onClick={() => setSelectedPagesMode('current')}
                  disabled={isExporting}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    selectedPagesMode === 'current'
                      ? 'border-[#B89555] bg-amber-50 font-bold text-slate-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Halaman Aktif ({activePageIndex + 1}) Saja
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress or status bar */}
        {isExporting && progress && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>
                {progress.status === 'rendering' 
                  ? `Merender slide ${progress.currentPage} dari ${progress.totalPages}...` 
                  : 'Mengompres file ke ZIP...'}
              </span>
              <span className="font-mono text-[#B89555]">
                {Math.round((progress.currentPage / Math.max(1, progress.totalPages)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-amber-200/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#B89555] h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${(progress.currentPage / Math.max(1, progress.totalPages)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Success or Error Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2 text-xs font-bold text-white bg-[#0F172A] hover:bg-slate-800 disabled:opacity-40 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            {exportMode === 'single' ? (
              <>
                <Download className="w-4 h-4 text-[#B89555]" />
                <span>Unduh PNG Transparan</span>
              </>
            ) : (
              <>
                <FolderArchive className="w-4 h-4 text-[#B89555]" />
                <span>Unduh Paket ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
