import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ProjectState, 
  PageDefinition, 
  VerseItem, 
  ArabicStyle, 
  LatinStyle, 
  TranslationStyle, 
  HeaderStyle, 
  CanvasConfig, 
  PaginationConfig, 
  LayoutPresetType,
  CanvasPreset,
  BackgroundMode
} from './types';
import { 
  createDefaultProject, 
  saveProject, 
  loadProject 
} from './services/storage';
import { getSurahVerses } from './services/quranApi';
import { SURAH_LIST } from './data/surahList';
import { LAYOUT_PRESETS } from './data/layoutPresets';
import { CANVAS_PRESETS } from './data/canvasPresets';
import { calculatePagination } from './utils/pagination';

import { TopToolbar } from './components/TopToolbar';
import { LeftSidebar } from './components/LeftSidebar';
import { CenterCanvas } from './components/CenterCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ExportModal } from './components/ExportModal';
import { ProjectsModal } from './components/ProjectsModal';
import { VideoPreviewModal } from './components/VideoPreviewModal';
import { AttributionModal } from './components/AttributionModal';

export default function App() {
  // Main Project State
  const [project, setProject] = useState<ProjectState>(() => {
    return createDefaultProject();
  });

  // Undo / Redo History
  const [past, setPast] = useState<ProjectState[]>([]);
  const [future, setFuture] = useState<ProjectState[]>([]);

  // Workspace Viewport Controls
  const [zoom, setZoom] = useState<number>(0.42);
  const [showSafeMargins, setShowSafeMargins] = useState<boolean>(true);

  // Quran Loading State
  const [availableVerses, setAvailableVerses] = useState<VerseItem[]>([]);
  const [selectedVerseNumbers, setSelectedVerseNumbers] = useState<number[]>([]);
  const [isLoadingSurah, setIsLoadingSurah] = useState<boolean>(false);
  const [surahError, setSurahError] = useState<string | null>(null);

  // Modals
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportMode, setExportMode] = useState<'single' | 'batch'>('single');
  const [projectsModalOpen, setProjectsModalOpen] = useState<boolean>(false);
  const [videoPreviewModalOpen, setVideoPreviewModalOpen] = useState<boolean>(false);
  const [attributionModalOpen, setAttributionModalOpen] = useState<boolean>(false);

  // Canvas DOM ref for PNG export
  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto-fit initial zoom calculation based on window size
  const calculateInitialFitZoom = useCallback(() => {
    const availableWidth = window.innerWidth - 320 - 320 - 64; // Sub sidebar widths and padding
    const availableHeight = window.innerHeight - 56 - 64; // Sub toolbar height and padding
    const scaleX = availableWidth / project.canvas.width;
    const scaleY = availableHeight / project.canvas.height;
    const bestFit = Math.min(scaleX, scaleY, 0.85);
    setZoom(Math.max(0.2, Math.min(1.2, Number(bestFit.toFixed(2)))));
  }, [project.canvas.width, project.canvas.height]);

  useEffect(() => {
    calculateInitialFitZoom();
  }, [calculateInitialFitZoom]);

  // Load verses for the current selected surah on startup
  useEffect(() => {
    let isMounted = true;
    const fetchInitial = async () => {
      try {
        setIsLoadingSurah(true);
        setSurahError(null);
        const verses = await getSurahVerses(project.selectedSurah.number);
        if (isMounted) {
          setAvailableVerses(verses);
          // Default selected checkboxes match project verses
          setSelectedVerseNumbers(project.verses.map((v) => v.number));
        }
      } catch (err: any) {
        if (isMounted) {
          setSurahError(err.message || 'Gagal memuat surah.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingSurah(false);
        }
      }
    };
    fetchInitial();
    return () => {
      isMounted = false;
    };
  }, [project.selectedSurah.number]);

  // Push state to undo history before mutating
  const updateProjectWithHistory = useCallback((newProject: ProjectState) => {
    setPast((prev) => [...prev.slice(-25), project]);
    setFuture([]);
    setProject(newProject);
    saveProject(newProject);
  }, [project]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setFuture((prev) => [project, ...prev]);
    setPast(newPast);
    setProject(previous);
    saveProject(previous);
  }, [past, project]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast((prev) => [...prev, project]);
    setFuture(newFuture);
    setProject(next);
    saveProject(next);
  }, [future, project]);

  // Keyboard shortcut listener (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Select new Surah from LeftSidebar
  const handleSelectSurah = async (surahNumber: number) => {
    const surahMeta = SURAH_LIST.find((s) => s.number === surahNumber);
    if (!surahMeta) return;

    try {
      setIsLoadingSurah(true);
      setSurahError(null);
      const verses = await getSurahVerses(surahNumber);
      setAvailableVerses(verses);

      // Default select first 1 to 5 verses
      const defaultCount = Math.min(5, verses.length);
      const defaultNumbers = verses.slice(0, defaultCount).map((v) => v.number);
      setSelectedVerseNumbers(defaultNumbers);

      // Apply to project
      const updatedProject: ProjectState = {
        ...project,
        selectedSurah: surahMeta,
        selectedVerseRange: { start: 1, end: defaultCount },
        verses: verses.slice(0, defaultCount),
        activePageIndex: 0,
      };

      updatedProject.pages = calculatePagination(
        updatedProject.verses,
        updatedProject.pagination,
        updatedProject.canvas,
        updatedProject.styles
      );

      updateProjectWithHistory(updatedProject);
    } catch (err: any) {
      setSurahError(err.message || 'Gagal mengambil data ayat Al-Qur\'an.');
    } finally {
      setIsLoadingSurah(false);
    }
  };

  const handleRetryLoadSurah = () => {
    handleSelectSurah(project.selectedSurah.number);
  };

  // Toggle individual verse selection
  const handleToggleVerseSelection = (verseNumber: number) => {
    setSelectedVerseNumbers((prev) => {
      if (prev.includes(verseNumber)) {
        return prev.filter((n) => n !== verseNumber);
      } else {
        return [...prev, verseNumber].sort((a, b) => a - b);
      }
    });
  };

  // Select all verses in current surah
  const handleSelectAllVerses = () => {
    if (availableVerses.length === 0) return;
    const all = availableVerses.map((v) => v.number);
    setSelectedVerseNumbers(all);
  };

  // Select verse range
  const handleSelectVerseRange = (start: number, end: number) => {
    const s = Math.min(start, end);
    const e = Math.max(start, end);
    const range: number[] = [];
    for (let i = s; i <= e; i++) {
      range.push(i);
    }
    setSelectedVerseNumbers(range);
  };

  // Apply selected verses into the project and recalculate pages
  const handleApplyVersesToProject = () => {
    const selectedVerses = availableVerses.filter((v) =>
      selectedVerseNumbers.includes(v.number)
    );
    if (selectedVerses.length === 0) return;

    const updatedProject: ProjectState = {
      ...project,
      verses: selectedVerses,
      activePageIndex: 0,
    };

    updatedProject.pages = calculatePagination(
      updatedProject.verses,
      updatedProject.pagination,
      updatedProject.canvas,
      updatedProject.styles
    );

    updateProjectWithHistory(updatedProject);
  };

  // Page Operations
  const handleSelectPage = (index: number) => {
    setProject((prev) => ({ ...prev, activePageIndex: index }));
  };

  const handleAddPage = () => {
    const newPageNum = project.pages.length + 1;
    const newPage: PageDefinition = {
      id: `page-${Date.now()}`,
      pageNumber: newPageNum,
      verseNumbers: [],
    };
    const updatedProject: ProjectState = {
      ...project,
      pages: [...project.pages, newPage],
      activePageIndex: project.pages.length,
      pagination: { ...project.pagination, mode: 'manual' },
    };
    updateProjectWithHistory(updatedProject);
  };

  const handleDuplicatePage = (index: number) => {
    const target = project.pages[index];
    if (!target) return;
    const clone: PageDefinition = {
      ...target,
      id: `page-${Date.now()}`,
      pageNumber: project.pages.length + 1,
    };
    const updatedPages = [...project.pages];
    updatedPages.splice(index + 1, 0, clone);
    // Re-index page numbers
    updatedPages.forEach((p, idx) => (p.pageNumber = idx + 1));

    const updatedProject: ProjectState = {
      ...project,
      pages: updatedPages,
      activePageIndex: index + 1,
      pagination: { ...project.pagination, mode: 'manual' },
    };
    updateProjectWithHistory(updatedProject);
  };

  const handleDeletePage = (index: number) => {
    if (project.pages.length <= 1) return;
    const updatedPages = project.pages.filter((_, idx) => idx !== index);
    updatedPages.forEach((p, idx) => (p.pageNumber = idx + 1));
    const nextActive = Math.max(0, Math.min(index, updatedPages.length - 1));

    const updatedProject: ProjectState = {
      ...project,
      pages: updatedPages,
      activePageIndex: nextActive,
      pagination: { ...project.pagination, mode: 'manual' },
    };
    updateProjectWithHistory(updatedProject);
  };

  const handleMovePage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const updatedPages = [...project.pages];
    const [moved] = updatedPages.splice(fromIndex, 1);
    updatedPages.splice(toIndex, 0, moved);
    updatedPages.forEach((p, idx) => (p.pageNumber = idx + 1));

    const updatedProject: ProjectState = {
      ...project,
      pages: updatedPages,
      activePageIndex: toIndex,
      pagination: { ...project.pagination, mode: 'manual' },
    };
    updateProjectWithHistory(updatedProject);
  };

  // Layout Preset Handler
  const handleSelectLayoutPreset = (presetId: LayoutPresetType) => {
    const presetDef = LAYOUT_PRESETS.find((p) => p.id === presetId);
    if (!presetDef) return;

    const updatedProject: ProjectState = {
      ...project,
      layoutPreset: presetId,
      styles: {
        arabic: { ...project.styles.arabic, ...presetDef.styles.arabic },
        transliteration: { ...project.styles.transliteration, ...presetDef.styles.transliteration },
        translation: { ...project.styles.translation, ...presetDef.styles.translation },
        meta: { ...project.styles.meta, ...presetDef.styles.meta },
      },
    };

    updatedProject.pages = calculatePagination(
      updatedProject.verses,
      updatedProject.pagination,
      updatedProject.canvas,
      updatedProject.styles,
      updatedProject.pagination.mode === 'manual' ? updatedProject.pages : undefined
    );

    updateProjectWithHistory(updatedProject);
  };

  // Canvas Dimension Preset Handler ("macam2")
  const handleSelectDimensionPreset = (presetName: CanvasPreset) => {
    const preset = CANVAS_PRESETS.find((p) => p.preset === presetName);
    if (!preset) return;

    const updatedProject: ProjectState = {
      ...project,
      canvas: {
        ...project.canvas,
        width: preset.width,
        height: preset.height,
        preset: preset.preset,
      },
    };

    updatedProject.pages = calculatePagination(
      updatedProject.verses,
      updatedProject.pagination,
      updatedProject.canvas,
      updatedProject.styles,
      updatedProject.pagination.mode === 'manual' ? updatedProject.pages : undefined
    );

    updateProjectWithHistory(updatedProject);
  };

  // Style Updates
  const handleUpdateArabicStyle = (style: Partial<ArabicStyle>) => {
    const updatedProject: ProjectState = {
      ...project,
      styles: {
        ...project.styles,
        arabic: { ...project.styles.arabic, ...style },
      },
    };
    updateProjectWithHistory(updatedProject);
  };

  const handleUpdateTransliterationStyle = (style: Partial<LatinStyle>) => {
    const updatedProject: ProjectState = {
      ...project,
      styles: {
        ...project.styles,
        transliteration: { ...project.styles.transliteration, ...style },
      },
    };
    updateProjectWithHistory(updatedProject);
  };

  const handleUpdateTranslationStyle = (style: Partial<TranslationStyle>) => {
    const updatedProject: ProjectState = {
      ...project,
      styles: {
        ...project.styles,
        translation: { ...project.styles.translation, ...style },
      },
    };
    updateProjectWithHistory(updatedProject);
  };

  const handleUpdateMetaStyle = (style: Partial<HeaderStyle>) => {
    const updatedProject: ProjectState = {
      ...project,
      styles: {
        ...project.styles,
        meta: { ...project.styles.meta, ...style },
      },
    };
    updateProjectWithHistory(updatedProject);
  };

  const handleUpdateCanvasConfig = (config: Partial<CanvasConfig>) => {
    const updatedProject: ProjectState = {
      ...project,
      canvas: { ...project.canvas, ...config },
    };

    updatedProject.pages = calculatePagination(
      updatedProject.verses,
      updatedProject.pagination,
      updatedProject.canvas,
      updatedProject.styles,
      updatedProject.pagination.mode === 'manual' ? updatedProject.pages : undefined
    );

    updateProjectWithHistory(updatedProject);
  };

  const handleUpdatePaginationConfig = (config: Partial<PaginationConfig>) => {
    const updatedPagination = { ...project.pagination, ...config };
    const updatedProject: ProjectState = {
      ...project,
      pagination: updatedPagination,
    };

    updatedProject.pages = calculatePagination(
      updatedProject.verses,
      updatedPagination,
      updatedProject.canvas,
      updatedProject.styles
    );

    updateProjectWithHistory(updatedProject);
  };

  // Font Upload Handler
  const handleUploadCustomFont = (name: string, url: string) => {
    const updatedProject: ProjectState = {
      ...project,
      customFonts: [...project.customFonts, { name, url }],
    };
    updateProjectWithHistory(updatedProject);
  };

  // Helper: Get verses belonging to a specific page
  const getVersesForPage = useCallback((pageIndex: number): VerseItem[] => {
    const page = project.pages[pageIndex];
    if (!page) return [];
    return project.verses.filter((v) => page.verseNumbers.includes(v.number));
  }, [project.pages, project.verses]);

  // Current active page and its verses
  const activePage = project.pages[project.activePageIndex] || project.pages[0];
  const activePageVerses = getVersesForPage(project.activePageIndex);

  // Helper to render any page on demand for batch export
  const renderPageByIndex = async (pageIndex: number): Promise<HTMLElement | null> => {
    // Switch active page
    setProject((prev) => ({ ...prev, activePageIndex: pageIndex }));
    // Wait for DOM re-render
    await new Promise((resolve) => setTimeout(resolve, 150));
    return canvasRef.current;
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      {/* 1. Top Navigation Bar */}
      <TopToolbar
        projectName={project.name}
        onUpdateProjectName={(name) => updateProjectWithHistory({ ...project, name })}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomChange={setZoom}
        onFitToScreen={calculateInitialFitZoom}
        currentDimensions={{
          width: project.canvas.width,
          height: project.canvas.height,
          name: project.canvas.preset,
          preset: project.canvas.preset,
        }}
        onSelectDimensionPreset={handleSelectDimensionPreset}
        backgroundMode={project.canvas.backgroundMode}
        onChangeBackgroundMode={(mode: BackgroundMode) =>
          handleUpdateCanvasConfig({ backgroundMode: mode })
        }
        showSafeMargins={showSafeMargins}
        onToggleSafeMargins={() => setShowSafeMargins(!showSafeMargins)}
        onOpenExportModal={(mode) => {
          setExportMode(mode);
          setExportModalOpen(true);
        }}
        onOpenProjectsModal={() => setProjectsModalOpen(true)}
        onOpenVideoPreviewModal={() => setVideoPreviewModalOpen(true)}
        onOpenAttributionModal={() => setAttributionModalOpen(true)}
      />

      {/* 2. Workspace Body: Left Sidebar + Center Canvas + Right Properties Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <LeftSidebar
          selectedSurah={project.selectedSurah}
          onSelectSurah={handleSelectSurah}
          isLoadingSurah={isLoadingSurah}
          surahError={surahError}
          onRetryLoadSurah={handleRetryLoadSurah}
          availableVerses={availableVerses}
          selectedVerseNumbers={selectedVerseNumbers}
          onToggleVerseSelection={handleToggleVerseSelection}
          onSelectAllVerses={handleSelectAllVerses}
          onSelectVerseRange={handleSelectVerseRange}
          onApplyVersesToProject={handleApplyVersesToProject}
          pages={project.pages}
          activePageIndex={project.activePageIndex}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          onMovePage={handleMovePage}
          layoutPreset={project.layoutPreset}
          onSelectLayoutPreset={handleSelectLayoutPreset}
          customFonts={project.customFonts}
          onUploadCustomFont={handleUploadCustomFont}
          arabicStyle={project.styles.arabic}
          onUpdateArabicStyle={handleUpdateArabicStyle}
        />

        {/* Center Canvas Viewport */}
        <CenterCanvas
          ref={canvasRef}
          project={project}
          activePage={activePage}
          activePageVerses={activePageVerses}
          zoom={zoom}
          showSafeMargins={showSafeMargins}
          selectedLayerId={project.selectedLayerId}
          onSelectLayer={(layerId) =>
            setProject((prev) => ({ ...prev, selectedLayerId: layerId }))
          }
        />

        {/* Right Sidebar: Properties Panel */}
        <PropertiesPanel
          project={project}
          selectedLayerId={project.selectedLayerId}
          onSelectLayer={(layerId) =>
            setProject((prev) => ({ ...prev, selectedLayerId: layerId }))
          }
          onUpdateArabicStyle={handleUpdateArabicStyle}
          onUpdateTransliterationStyle={handleUpdateTransliterationStyle}
          onUpdateTranslationStyle={handleUpdateTranslationStyle}
          onUpdateMetaStyle={handleUpdateMetaStyle}
          onUpdateCanvasConfig={handleUpdateCanvasConfig}
          onUpdatePaginationConfig={handleUpdatePaginationConfig}
        />
      </div>

      {/* 3. Modals */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        mode={exportMode}
        project={project}
        activePage={activePage}
        activePageIndex={project.activePageIndex}
        getCanvasNode={() => canvasRef.current}
        renderPageByIndex={renderPageByIndex}
      />

      <ProjectsModal
        isOpen={projectsModalOpen}
        onClose={() => setProjectsModalOpen(false)}
        currentProject={project}
        onLoadProject={(loaded) => {
          setPast([]);
          setFuture([]);
          setProject(loaded);
        }}
      />

      <VideoPreviewModal
        isOpen={videoPreviewModalOpen}
        onClose={() => setVideoPreviewModalOpen(false)}
        project={project}
        activePageIndex={project.activePageIndex}
        onSelectPageIndex={handleSelectPage}
        renderOverlayContent={(pageIndex) => {
          const verses = getVersesForPage(pageIndex);
          const { styles } = project;
          const isFirstPage = pageIndex === 0;
          const surahNumber = project.selectedSurah.number;
          const isAlFatihah = surahNumber === 1;
          const isAtTaubah = surahNumber === 9;
          const page = project.pages[pageIndex];
          const hasVerseOne = page ? page.verseNumbers.includes(1) : isFirstPage;
          const shouldShowBismillah = 
            !isAtTaubah && 
            !isAlFatihah && 
            styles.meta.showBismillah && 
            (styles.meta.bismillahPlacement === 'every_page' ? true : hasVerseOne);

          return (
            <div className="flex flex-col space-y-4 text-center">
              {styles.meta.showSurahName && (
                <div className="text-xs uppercase tracking-widest text-[#B89555] font-semibold">
                  QS. {project.selectedSurah.nameLatin}
                </div>
              )}
              {shouldShowBismillah && (
                <div 
                  className="font-amiri-quran font-amiri text-2xl font-bold text-white drop-shadow-md leading-relaxed my-1" 
                  dir="rtl"
                >
                  {styles.meta.bismillahArabic}
                </div>
              )}
              {verses.map((v) => (
                <div key={v.number} className="space-y-2">
                  <div 
                    className="font-amiri text-2xl font-bold text-white drop-shadow-md leading-relaxed" 
                    dir="rtl"
                  >
                    {v.textArabic}
                  </div>
                  {styles.transliteration.show && (
                    <div className="text-xs text-[#B89555] italic drop-shadow-xs">
                      {v.transliteration}
                    </div>
                  )}
                  {styles.translation.show && (
                    <div className="text-xs text-slate-200 drop-shadow-xs">
                      "{v.translationId}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }}
      />

      <AttributionModal
        isOpen={attributionModalOpen}
        onClose={() => setAttributionModalOpen(false)}
        project={project}
      />
    </div>
  );
}
