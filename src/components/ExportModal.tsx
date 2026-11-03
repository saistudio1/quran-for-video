import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FolderArchive, 
  CheckCircle2, 
  AlertCircle
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Choreography: Smooth Scale-in entrance with cubic-bezier(0.16, 1, 0.3, 1) */}
      <div className="neu-flat animate-sheet-up bg-[#edf2f7] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white/80">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-300/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-flat flex items-center justify-center text-[#B89555]">
              {exportMode === 'single' ? <Download className="w-5 h-5" /> : <FolderArchive className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {exportMode === 'single' ? 'Ekspor PNG Halaman Aktif' : 'Ekspor Batch ZIP Seluruh Slide'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Format PNG Transparan resolusi tinggi untuk CapCut, Premiere, & DaVinci
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="neu-button p-2 rounded-full text-slate-400 hover:text-slate-800 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector in Sunken Well */}
        <div className="neu-segmented grid grid-cols-2 gap-1.5 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setExportMode('single')}
            disabled={isExporting}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              exportMode === 'single'
                ? 'neu-segmented-btn-active'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1 Halaman PNG</span>
          </button>
          <button
            onClick={() => setExportMode('batch')}
            disabled={isExporting}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              exportMode === 'batch'
                ? 'neu-segmented-btn-active'
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
            <label className="font-bold text-slate-700 block">Resolusi Ekspor</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setScale(1)}
                disabled={isExporting}
                className={`p-3 rounded-2xl text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  scale === 1
                    ? 'neu-flat ring-2 ring-[#B89555] font-bold text-slate-900'
                    : 'neu-button text-slate-600'
                }`}
              >
                <div className="font-bold">1x Standard ({project.canvas.width} × {project.canvas.height})</div>
                <div className="text-[10px] text-slate-500 font-medium">Ukuran video standar</div>
              </button>
              <button
                onClick={() => setScale(2)}
                disabled={isExporting}
                className={`p-3 rounded-2xl text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  scale === 2
                    ? 'neu-flat ring-2 ring-[#B89555] font-bold text-slate-900'
                    : 'neu-button text-slate-600'
                }`}
              >
                <div className="font-bold">2x Ultra Crisp ({project.canvas.width * 2} × {project.canvas.height * 2})</div>
                <div className="text-[10px] text-slate-500 font-medium">High-DPI / 4K jernih</div>
              </button>
            </div>
          </div>

          {/* Transparency Switch */}
          <div className="neu-flat-sm p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">Latar Belakang Transparan (Alpha Channel)</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md neu-inset-sm text-emerald-700">
                  Alpha = 0
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1 font-medium">
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
              <label className="font-bold text-slate-700 block">Cakupan Halaman</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedPagesMode('all')}
                  disabled={isExporting}
                  className={`p-2.5 rounded-xl text-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    selectedPagesMode === 'all'
                      ? 'neu-flat ring-2 ring-[#B89555] font-bold text-slate-900'
                      : 'neu-button text-slate-600'
                  }`}
                >
                  Semua Halaman ({project.pages.length} File)
                </button>
                <button
                  onClick={() => setSelectedPagesMode('current')}
                  disabled={isExporting}
                  className={`p-2.5 rounded-xl text-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    selectedPagesMode === 'current'
                      ? 'neu-flat ring-2 ring-[#B89555] font-bold text-slate-900'
                      : 'neu-button text-slate-600'
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
          <div className="neu-flat-sm p-3.5 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>
                {progress.status === 'rendering' 
                  ? `Merender slide ${progress.currentPage} dari ${progress.totalPages}...` 
                  : 'Mengompres file ke ZIP...'}
              </span>
              <span className="font-mono text-[#B89555]">
                {Math.round((progress.currentPage / Math.max(1, progress.totalPages)) * 100)}%
              </span>
            </div>
            <div className="w-full neu-inset-sm h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-[#c5a059] to-[#b08a46] h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full"
                style={{
                  width: `${(progress.currentPage / Math.max(1, progress.totalPages)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Success or Error Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-300/60">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="neu-button px-4 py-2 text-xs font-bold text-slate-600 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
          >
            Tutup
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="neu-button-primary px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5 flex items-center gap-2"
          >
            {exportMode === 'single' ? (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>Unduh PNG Transparan</span>
              </>
            ) : (
              <>
                <FolderArchive className="w-4 h-4 text-white" />
                <span>Unduh Paket ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
