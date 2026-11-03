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

import { 
  BookOpen, 
  Layers, 
  Type, 
  LayoutTemplate, 
  Sliders, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Maximize2 
} from 'lucide-react';

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

  // UI Mode: 'pc' (Studio 3 Kolom) vs 'mobile' (Canva Style Smartphone)
  const [uiMode, setUiMode] = useState<'pc' | 'mobile'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return 'mobile';
    }
    return 'pc';
  });

  // Mobile Bottom Drawer State
  const [mobileActiveDrawer, setMobileActiveDrawer] = useState<'quran' | 'pages' | 'templates' | 'assets' | 'properties' | 'canvas_settings' | null>(null);

  // Canvas DOM ref for PNG export
  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto-fit initial zoom calculation based on window size and active UI mode
  const calculateInitialFitZoom = useCallback(() => {
    const isMobile = uiMode === 'mobile';
    const availableWidth = isMobile
      ? Math.max(260, window.innerWidth - 32)
      : Math.max(300, window.innerWidth - 320 - 320 - 64);
    const availableHeight = isMobile
      ? Math.max(280, window.innerHeight - 56 - 64 - 56) // minus toolbar, mobile floating bar & bottom nav
      : Math.max(300, window.innerHeight - 56 - 64);
    const scaleX = availableWidth / project.canvas.width;
    const scaleY = availableHeight / project.canvas.height;
    const bestFit = Math.min(scaleX, scaleY, 0.85);
    setZoom(Math.max(0.18, Math.min(1.2, Number(bestFit.toFixed(2)))));
  }, [project.canvas.width, project.canvas.height, uiMode]);

  useEffect(() => {
    calculateInitialFitZoom();
    const handleResize = () => calculateInitialFitZoom();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
        uiMode={uiMode}
        onChangeUiMode={setUiMode}
      />

      {/* 2. Workspace Body: Left Sidebar + Center Canvas + Right Properties Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Active in PC Mode) */}
        {uiMode === 'pc' && (
          <div className="flex h-full shrink-0">
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
          </div>
        )}

        {/* Center Canvas Viewport */}
        <CenterCanvas
          ref={canvasRef}
          project={project}
          activePage={activePage}
          activePageVerses={activePageVerses}
          zoom={zoom}
          showSafeMargins={showSafeMargins}
          selectedLayerId={project.selectedLayerId}
          onSelectLayer={(layerId) => {
            setProject((prev) => ({ ...prev, selectedLayerId: layerId }));
            if (layerId && uiMode === 'mobile') {
              setMobileActiveDrawer('properties');
            }
          }}
        />

        {/* Right Sidebar: Properties Panel (Active in PC Mode) */}
        {uiMode === 'pc' && (
          <div className="flex h-full shrink-0">
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
        )}
      </div>

      {/* --- MOBILE CANVA-STYLE CONTROLS (Active in Mobile Mode) --- */}
      {uiMode === 'mobile' && (
        <>
          {/* Floating Quick Page Switcher & Zoom */}
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 text-white backdrop-blur-md rounded-full shadow-lg border border-slate-700/50 text-xs">
        <button
          onClick={() => handleSelectPage(Math.max(0, project.activePageIndex - 1))}
          disabled={project.activePageIndex === 0}
          className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => setMobileActiveDrawer('pages')}
          className="px-2 py-0.5 rounded font-medium hover:bg-white/10 text-slate-100 flex items-center gap-1"
        >
          <span>Hal {project.activePageIndex + 1}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-400">{project.pages.length}</span>
        </button>

        <button
          onClick={() => handleSelectPage(Math.min(project.pages.length - 1, project.activePageIndex + 1))}
          disabled={project.activePageIndex >= project.pages.length - 1}
          className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
          title="Halaman Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

        <button
          onClick={handleAddPage}
          className="p-1 rounded-full hover:bg-white/10 text-[#B89555] font-semibold"
          title="Tambah Halaman Baru"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={calculateInitialFitZoom}
          className="p-1 rounded-full hover:bg-white/10 text-slate-300"
          title="Reset Zoom Pas Layar"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-xl">
        <button
          onClick={() => setMobileActiveDrawer(mobileActiveDrawer === 'quran' ? null : 'quran')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
            mobileActiveDrawer === 'quran' ? 'text-[#B89555] font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>Ayat</span>
        </button>

        <button
          onClick={() => setMobileActiveDrawer(mobileActiveDrawer === 'pages' ? null : 'pages')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
            mobileActiveDrawer === 'pages' ? 'text-[#B89555] font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span>Halaman</span>
        </button>

        <button
          onClick={() => {
            if (!project.selectedLayerId || project.selectedLayerId === 'canvas') {
              setProject((prev) => ({ ...prev, selectedLayerId: 'arabic' }));
            }
            setMobileActiveDrawer(mobileActiveDrawer === 'properties' ? null : 'properties');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
            mobileActiveDrawer === 'properties' && project.selectedLayerId !== 'canvas' ? 'text-[#B89555] font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Type className="w-5 h-5 mb-0.5" />
          <span>Gaya Teks</span>
        </button>

        <button
          onClick={() => setMobileActiveDrawer(mobileActiveDrawer === 'templates' ? null : 'templates')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
            mobileActiveDrawer === 'templates' ? 'text-[#B89555] font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutTemplate className="w-5 h-5 mb-0.5" />
          <span>Template</span>
        </button>

        <button
          onClick={() => {
            setProject((prev) => ({ ...prev, selectedLayerId: 'canvas' }));
            setMobileActiveDrawer(mobileActiveDrawer === 'canvas_settings' ? null : 'canvas_settings');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
            mobileActiveDrawer === 'canvas_settings' ? 'text-[#B89555] font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-5 h-5 mb-0.5" />
          <span>Format</span>
        </button>
      </nav>

      {/* Mobile Drawer Bottom Sheet */}
      {mobileActiveDrawer && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileActiveDrawer(null)}
          />

          {/* Sheet Container */}
          <div className="relative w-full max-h-[82vh] bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden border-t border-slate-200">
            {/* Header / Grab Handle */}
            <div className="p-3 pb-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 relative">
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
              <div className="font-semibold text-xs text-slate-800 uppercase tracking-wider pt-2">
                {mobileActiveDrawer === 'quran' && 'Pilih Surah & Ayat'}
                {mobileActiveDrawer === 'pages' && 'Kelola Halaman & Urutan'}
                {mobileActiveDrawer === 'templates' && 'Pilihan Preset Template'}
                {mobileActiveDrawer === 'assets' && 'Aset & Font Kustom'}
                {mobileActiveDrawer === 'properties' && 'Gaya & Format Layer'}
                {mobileActiveDrawer === 'canvas_settings' && 'Pengaturan Kanvas & Margin'}
              </div>
              <button
                onClick={() => setMobileActiveDrawer(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto">
              {(mobileActiveDrawer === 'quran' || mobileActiveDrawer === 'pages' || mobileActiveDrawer === 'templates' || mobileActiveDrawer === 'assets') && (
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
                  onApplyVersesToProject={() => {
                    handleApplyVersesToProject();
                    setMobileActiveDrawer(null);
                  }}
                  pages={project.pages}
                  activePageIndex={project.activePageIndex}
                  onSelectPage={(index) => {
                    handleSelectPage(index);
                  }}
                  onAddPage={handleAddPage}
                  onDuplicatePage={handleDuplicatePage}
                  onDeletePage={handleDeletePage}
                  onMovePage={handleMovePage}
                  layoutPreset={project.layoutPreset}
                  onSelectLayoutPreset={(p) => {
                    handleSelectLayoutPreset(p);
                    setMobileActiveDrawer(null);
                  }}
                  customFonts={project.customFonts}
                  onUploadCustomFont={handleUploadCustomFont}
                  arabicStyle={project.styles.arabic}
                  onUpdateArabicStyle={handleUpdateArabicStyle}
                  isMobileDrawer={true}
                  initialTab={mobileActiveDrawer}
                />
              )}

              {(mobileActiveDrawer === 'properties' || mobileActiveDrawer === 'canvas_settings') && (
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
                  isMobileDrawer={true}
                />
              )}
            </div>
          </div>
        </div>
      )}
        </>
      )}

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
            <div className="flex flex-col text-center" style={{ gap: `${Math.round(project.pagination.verseSpacing * 0.7)}px` }}>
              {styles.meta.showSurahName && (
                <div 
                  className="uppercase tracking-widest font-semibold"
                  style={{
                    fontSize: `${Math.max(12, Math.round(styles.meta.fontSize * 0.75))}px`,
                    color: styles.meta.color,
                    fontFamily: styles.meta.fontFamily,
                  }}
                >
                  QS. {project.selectedSurah.nameLatin}
                </div>
              )}
              {shouldShowBismillah && (
                <div 
                  className="font-bold drop-shadow-md my-1" 
                  style={{
                    fontFamily: styles.arabic.fontFamily,
                    fontSize: `${Math.max(20, Math.round(styles.arabic.fontSize * 0.75))}px`,
                    color: styles.arabic.color,
                  }}
                  dir="rtl"
                >
                  {styles.meta.bismillahArabic}
                </div>
              )}
              {verses.map((v) => (
                <div key={v.number} className="flex flex-col items-center">
                  <div 
                    className="font-bold drop-shadow-md leading-relaxed" 
                    style={{
                      fontFamily: styles.arabic.fontFamily,
                      fontSize: `${Math.max(22, Math.round(styles.arabic.fontSize * 0.75))}px`,
                      color: styles.arabic.color,
                      lineHeight: styles.arabic.lineHeight,
                      paddingBottom: '8px',
                      marginBottom: styles.transliteration.show || styles.translation.show ? `${Math.round((styles.arabic.bottomSpacing ?? 28) * 0.6)}px` : '0px',
                    }}
                    dir="rtl"
                  >
                    {v.textArabic}
                  </div>
                  {styles.transliteration.show && (
                    <div 
                      className="italic drop-shadow-xs"
                      style={{
                        fontFamily: styles.transliteration.fontFamily,
                        fontSize: `${Math.max(12, Math.round(styles.transliteration.fontSize * 0.75))}px`,
                        color: styles.transliteration.color,
                        marginBottom: styles.translation.show ? `${Math.round((styles.transliteration.bottomSpacing ?? 18) * 0.6)}px` : '0px',
                      }}
                    >
                      {v.transliteration}
                    </div>
                  )}
                  {styles.translation.show && (
                    <div 
                      className="drop-shadow-xs"
                      style={{
                        fontFamily: styles.translation.fontFamily,
                        fontSize: `${Math.max(12, Math.round(styles.translation.fontSize * 0.75))}px`,
                        color: styles.translation.color,
                      }}
                    >
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
