import React, { forwardRef } from 'react';
import { 
  ProjectState, 
  PageDefinition, 
  VerseItem 
} from '../types';

interface CenterCanvasProps {
  project: ProjectState;
  activePage: PageDefinition | undefined;
  activePageVerses: VerseItem[];
  zoom: number;
  showSafeMargins: boolean;
  selectedLayerId: 'arabic' | 'transliteration' | 'translation' | 'meta' | 'canvas' | null;
  onSelectLayer: (layerId: 'arabic' | 'transliteration' | 'translation' | 'meta' | 'canvas' | null) => void;
  isExporting?: boolean;
}

export const CenterCanvas = forwardRef<HTMLDivElement, CenterCanvasProps>(({
  project,
  activePage,
  activePageVerses,
  zoom,
  showSafeMargins,
  selectedLayerId,
  onSelectLayer,
  isExporting = false,
}, ref) => {
  const { canvas, styles } = project;

  // Editor-only visual backdrop (lives BEHIND the canvas, never inside the export canvas element)
  const getEditorBackdropClass = () => {
    switch (canvas.backgroundMode) {
      case 'checkerboard':
        return 'bg-checkerboard-dark';
      case 'video_dark':
        return 'bg-gradient-to-b from-[#0B0F19] via-[#020617] to-[#0A0D14]';
      case 'video_nature':
        return 'bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#090D16]';
      case 'solid':
        return '';
      case 'transparent':
      default:
        return 'bg-checkerboard';
    }
  };

  // Verse marker formatter
  const renderVerseMarker = (verseNum: number) => {
    if (!styles.arabic.showVerseMarker || styles.arabic.markerStyle === 'none') {
      return null;
    }
    if (styles.arabic.markerStyle === 'ornament') {
      return <span className="inline-block mx-2 text-[#B89555] font-amiri select-none">﴿{verseNum}﴾</span>;
    }
    if (styles.arabic.markerStyle === 'simple') {
      return <span className="inline-block mx-1.5 text-xs font-mono text-slate-400 select-none">[{verseNum}]</span>;
    }
    // standard: ۝
    return <span className="inline-block mx-2 text-[#B89555] font-amiri select-none">۝ {verseNum}</span>;
  };

  const isFirstPage = !activePage || activePage.pageNumber === 1;
  const surahNumber = project.selectedSurah.number;
  const isAlFatihah = surahNumber === 1;
  const isAtTaubah = surahNumber === 9;
  const hasVerseOne = activePage ? activePage.verseNumbers.includes(1) : isFirstPage;

  // Bismillah Rules:
  // 1. Surah At-Taubah (9): NEVER has Bismillah
  // 2. Surah Al-Fatihah (1): Verse 1 IS already Bismillah itself with full translation & transliteration.
  //    Never show a duplicate header Bismillah in Al-Fatihah.
  // 3. Other Surahs (2..114 except 9): Bismillah is an OPTIONAL opening invocation.
  //    Only shown if showBismillah is enabled AND this page contains verse 1 (opening of surah),
  //    unless explicitly configured to show on every page.
  const shouldShowBismillah = 
    !isAtTaubah && 
    !isAlFatihah && 
    styles.meta.showBismillah && 
    (styles.meta.bismillahPlacement === 'every_page' ? true : hasVerseOne);

  return (
    <div 
      className="flex-1 bg-[#F1F5F9] overflow-auto flex items-center justify-center p-6 relative select-none"
      onClick={() => onSelectLayer('canvas')}
    >
      {/* Zoom transform container */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
        className="flex items-center justify-center"
      >
        {/*
          CRITICAL FIX: 
          Outer container hosts the editor preview backdrop (checkerboard, video gradient, or shadow).
          The inner #quran-canvas-node captured for export has ZERO background classes and is 100% transparent.
        */}
        <div
          style={{
            width: `${canvas.width}px`,
            height: `${canvas.height}px`,
            backgroundColor: canvas.backgroundMode === 'solid' ? canvas.solidColor : undefined,
          }}
          className={`relative rounded-none shadow-2xl transition-colors overflow-hidden ${
            !isExporting ? getEditorBackdropClass() : ''
          }`}
        >
          {/* Nature video overlay aesthetic backdrop preview (Editor-only) */}
          {canvas.backgroundMode === 'video_nature' && !isExporting && (
            <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
              <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-black/60" />
            </div>
          )}

          {/* Safe Margins Guide Overlay (Editor-only) */}
          {showSafeMargins && !isExporting && (
            <div
              style={{
                top: `${canvas.safeMarginPercent}%`,
                bottom: `${canvas.safeMarginPercent}%`,
                left: `${canvas.safeMarginPercent}%`,
                right: `${canvas.safeMarginPercent}%`,
              }}
              className="absolute pointer-events-none safe-guide border border-dashed border-[#B89555]/40 z-20 flex flex-col justify-between p-2"
            >
              <span className="text-[10px] text-[#B89555]/70 font-mono">SAFE AREA</span>
              <span className="text-[10px] text-[#B89555]/70 font-mono text-right">
                {canvas.width} × {canvas.height}
              </span>
            </div>
          )}

          {/*
            ACTUAL EXPORTABLE CANVAS NODE:
            Has background: transparent (unless user explicitly configured solid background mode).
            No checkerboard classes are ever applied here.
          */}
          <div
            ref={ref}
            id="quran-canvas-node"
            style={{
              width: `${canvas.width}px`,
              height: `${canvas.height}px`,
              backgroundColor: canvas.backgroundMode === 'solid' ? canvas.solidColor : 'transparent',
              padding: `${canvas.padding}px`,
            }}
            className={`relative flex flex-col w-full h-full z-10 ${
              selectedLayerId === 'canvas' && !isExporting ? 'ring-2 ring-[#B89555]/50' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectLayer('canvas');
            }}
          >
            {/* Main Canvas Content Box */}
            <div 
              className={`w-full h-full flex flex-col ${
                canvas.verticalAlign === 'top' 
                  ? 'justify-start' 
                  : canvas.verticalAlign === 'bottom' 
                  ? 'justify-end' 
                  : 'justify-center'
              } relative z-10`}
            >
              {/* Meta Header Layer: Surah Name & Bismillah */}
              {(styles.meta.showSurahName || shouldShowBismillah) && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLayer('meta');
                  }}
                  className={`mb-8 p-3 rounded-xl transition-all cursor-pointer ${
                    selectedLayerId === 'meta' && !isExporting
                      ? 'ring-2 ring-[#B89555] bg-white/5'
                      : 'hover:bg-white/5'
                  }`}
                  style={{ textAlign: styles.meta.textAlign }}
                >
                  {styles.meta.showSurahName && (
                    <div 
                      className="font-medium tracking-wider uppercase mb-3 flex items-center justify-center gap-2"
                      style={{
                        fontSize: `${styles.meta.fontSize}px`,
                        color: styles.meta.color,
                        fontFamily: styles.meta.fontFamily,
                      }}
                    >
                      <span>QS. {project.selectedSurah.nameLatin}</span>
                      <span>·</span>
                      <span>
                        {activePage?.verseNumbers.length === 1 
                          ? `Ayat ${activePage.verseNumbers[0]}`
                          : `Ayat ${activePage?.verseNumbers.join(', ')}`}
                      </span>
                    </div>
                  )}

                  {shouldShowBismillah && (
                    <div
                      className="font-amiri-quran font-amiri text-center font-bold tracking-normal leading-relaxed my-2"
                      style={{
                        fontSize: `${Math.round(styles.arabic.fontSize * 0.95)}px`,
                        color: styles.arabic.color,
                      }}
                      dir="rtl"
                    >
                      {styles.meta.bismillahArabic}
                    </div>
                  )}
                </div>
              )}

              {/* Verses Container */}
              <div 
                className="flex flex-col"
                style={{ gap: `${project.pagination.verseSpacing}px` }}
              >
                {activePageVerses.map((verse) => (
                  <div 
                    key={verse.number} 
                    className="flex flex-col space-y-4"
                  >
                    {/* Layer 1: Quranic Arabic Typography */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLayer('arabic');
                      }}
                      className={`p-3 rounded-xl transition-all cursor-pointer ${
                        selectedLayerId === 'arabic' && !isExporting
                          ? 'ring-2 ring-[#B89555] bg-white/5'
                          : 'hover:bg-white/5'
                      }`}
                      style={{ textAlign: styles.arabic.textAlign }}
                      dir="rtl"
                    >
                      <span
                        style={{
                          fontFamily: styles.arabic.fontFamily,
                          fontSize: `${styles.arabic.fontSize}px`,
                          fontWeight: styles.arabic.fontWeight,
                          color: styles.arabic.color,
                          lineHeight: styles.arabic.lineHeight,
                          letterSpacing: `${styles.arabic.letterSpacing}px`,
                          wordSpacing: '4px',
                        }}
                        className="inline leading-relaxed selection:bg-amber-400/20"
                      >
                        {verse.textArabic}
                        {renderVerseMarker(verse.number)}
                      </span>
                    </div>

                    {/* Layer 2: Latin Transliteration */}
                    {styles.transliteration.show && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLayer('transliteration');
                        }}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                          selectedLayerId === 'transliteration' && !isExporting
                            ? 'ring-2 ring-[#B89555] bg-white/5'
                            : 'hover:bg-white/5'
                        }`}
                        style={{ textAlign: styles.transliteration.textAlign }}
                      >
                        <p
                          style={{
                            fontFamily: styles.transliteration.fontFamily,
                            fontSize: `${styles.transliteration.fontSize}px`,
                            fontWeight: styles.transliteration.fontWeight === 'bold' ? '700' : styles.transliteration.fontWeight === 'semibold' ? '600' : styles.transliteration.fontWeight === 'medium' ? '500' : '400',
                            fontStyle: styles.transliteration.fontStyle,
                            color: styles.transliteration.color,
                            lineHeight: styles.transliteration.lineHeight,
                            letterSpacing: `${styles.transliteration.letterSpacing}px`,
                          }}
                          className="leading-relaxed selection:bg-amber-400/20"
                        >
                          {verse.transliteration}
                        </p>
                      </div>
                    )}

                    {/* Layer 3: Indonesian Translation */}
                    {styles.translation.show && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLayer('translation');
                        }}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                          selectedLayerId === 'translation' && !isExporting
                            ? 'ring-2 ring-[#B89555] bg-white/5'
                            : 'hover:bg-white/5'
                        }`}
                        style={{ textAlign: styles.translation.textAlign }}
                      >
                        <p
                          style={{
                            fontFamily: styles.translation.fontFamily,
                            fontSize: `${styles.translation.fontSize}px`,
                            fontWeight: styles.translation.fontWeight === 'bold' ? '700' : styles.translation.fontWeight === 'semibold' ? '600' : styles.translation.fontWeight === 'medium' ? '500' : '400',
                            color: styles.translation.color,
                            lineHeight: styles.translation.lineHeight,
                            letterSpacing: `${styles.translation.letterSpacing}px`,
                          }}
                          className="leading-relaxed selection:bg-amber-400/20"
                        >
                          "{verse.translationId}"
                        </p>
                      </div>
                    )}

                    {/* Separator Ornament if more than 1 verse */}
                    {activePageVerses.length > 1 && 
                     verse.number !== activePageVerses[activePageVerses.length - 1].number && 
                     project.pagination.separatorStyle !== 'none' && (
                      <div className="py-2 flex items-center justify-center opacity-60">
                        {project.pagination.separatorStyle === 'ornament' && (
                          <span className="text-[#B89555] font-amiri text-lg">۞</span>
                        )}
                        {project.pagination.separatorStyle === 'dot' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#B89555]" />
                        )}
                        {project.pagination.separatorStyle === 'line' && (
                          <div className="w-16 h-px bg-[#B89555]/40" />
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {activePageVerses.length === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-sm">Tidak ada ayat di halaman ini.</p>
                    <p className="text-xs mt-1">Pilih ayat dari bilah samping untuk menambahkan.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CenterCanvas.displayName = 'CenterCanvas';
