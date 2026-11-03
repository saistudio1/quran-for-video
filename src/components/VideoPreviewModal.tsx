import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Tv, 
  Sun, 
  Moon, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { ProjectState, PageDefinition, VerseItem } from '../types';

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectState;
  activePageIndex: number;
  onSelectPageIndex: (index: number) => void;
  renderOverlayContent: (pageIndex: number) => React.ReactNode;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  isOpen,
  onClose,
  project,
  activePageIndex,
  onSelectPageIndex,
  renderOverlayContent,
}) => {
  const [videoTheme, setVideoTheme] = useState<'stars' | 'mountains' | 'ocean' | 'dark_minimal'>('stars');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  if (!isOpen) return null;

  const totalPages = project.pages.length;

  const getVideoBackgroundStyle = () => {
    switch (videoTheme) {
      case 'stars':
        return 'bg-gradient-to-b from-[#020617] via-[#0F172A] to-[#020617]';
      case 'mountains':
        return 'bg-gradient-to-b from-[#064E3B] via-[#022C22] to-[#01140F]';
      case 'ocean':
        return 'bg-gradient-to-b from-[#0C4A6E] via-[#075985] to-[#082F49]';
      case 'dark_minimal':
      default:
        return 'bg-black';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="h-14 px-5 border-b border-slate-800 flex items-center justify-between text-white shrink-0 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-[#B89555]" />
            <div>
              <h3 className="text-xs font-bold tracking-tight">Simulasi Pratinjau Video Murattal</h3>
              <p className="text-[10px] text-slate-400">
                Uji kontras dan keterbacaan overlay transparan pada video nyata
              </p>
            </div>
          </div>

          {/* Theme Toggles */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
              <button
                onClick={() => setVideoTheme('stars')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  videoTheme === 'stars' ? 'bg-[#B89555] text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Malam Berbintang
              </button>
              <button
                onClick={() => setVideoTheme('mountains')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  videoTheme === 'mountains' ? 'bg-[#B89555] text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Pemandangan Alam
              </button>
              <button
                onClick={() => setVideoTheme('dark_minimal')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  videoTheme === 'dark_minimal' ? 'bg-[#B89555] text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Latar Gelap Murni
              </button>
            </div>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Screen Viewport */}
        <div className="flex-1 relative flex items-center justify-center p-6 bg-slate-950 overflow-hidden select-none">
          {/* Simulated Video Frame with responsive aspect ratio */}
          <div 
            style={{
              aspectRatio: `${project.canvas.width} / ${project.canvas.height}`,
              maxHeight: '100%',
              maxWidth: '100%',
            }}
            className={`relative rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center transition-all ${getVideoBackgroundStyle()}`}
          >
            {/* Ambient motion effect simulation */}
            {isPlaying && (
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-transparent animate-pulse duration-1000" />
              </div>
            )}

            {/* Live Rendered Transparent Overlay Container */}
            <div className="relative z-10 w-full h-full p-8 flex flex-col justify-center">
              {renderOverlayContent(activePageIndex)}
            </div>

            {/* Watermark badge preview */}
            <div className="absolute bottom-4 right-4 text-[10px] text-white/30 font-mono tracking-wider">
              1080P RECORDER PREVIEW
            </div>
          </div>
        </div>

        {/* Video Player Bottom Controls */}
        <div className="h-16 px-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectPageIndex(Math.max(0, activePageIndex - 1))}
              disabled={activePageIndex === 0}
              className="p-2 text-slate-300 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800"
              title="Slide Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-[#B89555] text-slate-950 rounded-lg font-bold hover:bg-[#a68446] transition-colors"
              title={isPlaying ? 'Jeda Simulasi' : 'Putar Simulasi'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onSelectPageIndex(Math.min(totalPages - 1, activePageIndex + 1))}
              disabled={activePageIndex === totalPages - 1}
              className="p-2 text-slate-300 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800"
              title="Slide Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-slate-400 ml-2">
              Slide {activePageIndex + 1} dari {totalPages}
            </span>
          </div>

          <div className="text-xs text-slate-400">
            Tip: Overlay PNG yang diekspor akan transparan 100% dan langsung siap dimasukkan ke timeline editor video Anda.
          </div>
        </div>
      </div>
    </div>
  );
};
