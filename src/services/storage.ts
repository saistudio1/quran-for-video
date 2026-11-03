import { ProjectState } from '../types';
import { SURAH_LIST } from '../data/surahList';
import { BUNDLED_SURAHS } from '../data/bundledSurahs';
import { LAYOUT_PRESETS } from '../data/layoutPresets';
import { calculatePagination } from '../utils/pagination';

const PROJECTS_STORAGE_KEY = 'quran_layer_projects_v1';
const ACTIVE_PROJECT_KEY = 'quran_layer_active_id_v1';

export function createDefaultProject(): ProjectState {
  // Default to Surah 67 Al-Mulk (verses 1-4) or Al-Fatihah
  const surahMeta = SURAH_LIST.find((s) => s.number === 67) || SURAH_LIST[0];
  const verses = (BUNDLED_SURAHS[67] || BUNDLED_SURAHS[1]).slice(0, 4);

  const defaultPreset = LAYOUT_PRESETS.find((p) => p.id === 'three_layers') || LAYOUT_PRESETS[0];

  const project: ProjectState = {
    id: `project-${Date.now()}`,
    name: 'Al-Mulk Recitation Overlay',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    canvas: {
      width: 1080,
      height: 1920,
      preset: 'vertical',
      backgroundMode: 'checkerboard',
      solidColor: '#000000',
      padding: 60,
      safeMarginPercent: 8,
      verticalAlign: 'center',
    },
    selectedSurah: surahMeta,
    selectedVerseRange: { start: 1, end: Math.min(4, verses.length) },
    verses,
    pages: [],
    activePageIndex: 0,
    selectedLayerId: null,
    layoutPreset: 'three_layers',
    pagination: {
      mode: 'single_verse',
      fixedCount: 2,
      verseSpacing: 40,
      separatorStyle: 'ornament',
    },
    styles: {
      arabic: {
        fontFamily: 'Amiri',
        fontSize: 44,
        fontWeight: 'bold',
        color: '#FFFFFF',
        lineHeight: 2.2,
        letterSpacing: 0,
        textAlign: 'center',
        showVerseMarker: true,
        markerStyle: 'ornament',
        bottomSpacing: 28,
        ...defaultPreset.styles.arabic,
      },
      transliteration: {
        show: true,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 20,
        fontWeight: 'medium',
        fontStyle: 'italic',
        color: '#B89555',
        lineHeight: 1.6,
        letterSpacing: 0.2,
        textAlign: 'center',
        bottomSpacing: 18,
        ...defaultPreset.styles.transliteration,
      },
      translation: {
        show: true,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 20,
        fontWeight: 'normal',
        color: '#E2E8F0',
        lineHeight: 1.6,
        letterSpacing: 0,
        textAlign: 'center',
        ...defaultPreset.styles.translation,
      },
      meta: {
        showSurahName: true,
        showVerseNumber: true,
        showBismillah: true,
        bismillahPlacement: 'first_page',
        bismillahArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        fontSize: 16,
        color: '#B89555',
        textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans',
        ...defaultPreset.styles.meta,
      },
    },
    customFonts: [],
  };

  // Compute initial pages
  project.pages = calculatePagination(project.verses, project.pagination, project.canvas, project.styles);

  return project;
}

export function listProjects(): { id: string; name: string; updatedAt: number }[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: any) => ({
      id: p.id,
      name: p.name || 'Untitled Project',
      updatedAt: p.updatedAt || Date.now(),
    }));
  } catch (e) {
    console.error('Failed reading projects list:', e);
    return [];
  }
}

export function loadProject(id: string): ProjectState | null {
  try {
    const raw = localStorage.getItem(`${PROJECTS_STORAGE_KEY}_${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as ProjectState;
  } catch (e) {
    console.error(`Failed loading project ${id}:`, e);
    return null;
  }
}

export function saveProject(project: ProjectState): void {
  try {
    project.updatedAt = Date.now();
    // 1. Save project payload
    localStorage.setItem(`${PROJECTS_STORAGE_KEY}_${project.id}`, JSON.stringify(project));

    // 2. Update list
    const currentList = listProjects();
    const existingIndex = currentList.findIndex((item) => item.id === project.id);
    if (existingIndex >= 0) {
      currentList[existingIndex] = { id: project.id, name: project.name, updatedAt: project.updatedAt };
    } else {
      currentList.unshift({ id: project.id, name: project.name, updatedAt: project.updatedAt });
    }
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(currentList));

    // 3. Update active ID
    localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
  } catch (e) {
    console.error('Failed saving project to localStorage:', e);
  }
}

export function deleteProject(id: string): void {
  try {
    localStorage.removeItem(`${PROJECTS_STORAGE_KEY}_${id}`);
    const currentList = listProjects().filter((item) => item.id !== id);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(currentList));
  } catch (e) {
    console.error(`Failed deleting project ${id}:`, e);
  }
}

export function exportProjectToJson(project: ProjectState): string {
  return JSON.stringify(project, null, 2);
}

export function importProjectFromJson(jsonString: string): ProjectState {
  const parsed = JSON.parse(jsonString);
  if (!parsed.id || !parsed.canvas || !parsed.verses) {
    throw new Error('Format file proyek JSON tidak valid.');
  }
  // Assign new ID to prevent colliding with existing project
  parsed.id = `imported-${Date.now()}`;
  parsed.updatedAt = Date.now();
  saveProject(parsed);
  return parsed;
}
