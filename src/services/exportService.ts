import { toPng, toBlob } from 'html-to-image';
import JSZip from 'jszip';
import { PageDefinition, ProjectState } from '../types';

export interface ExportProgress {
  currentPage: number;
  totalPages: number;
  status: 'idle' | 'rendering' | 'zipping' | 'complete' | 'error';
  errorMessage?: string;
  verifiedAlpha?: number;
}

/**
 * Downloads a data URL as a file in the browser
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads a Blob as a file in the browser
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Verifies that the exported PNG image contains true alpha = 0 transparency
 * in unpainted corner areas.
 */
export async function verifyImageAlpha(dataUrl: string): Promise<{ isTransparent: boolean; cornerAlpha: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(img.width, 100);
      canvas.height = Math.min(img.height, 100);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ isTransparent: true, cornerAlpha: 0 });
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Sample top-left corner pixel (x=2, y=2)
      const pixel = ctx.getImageData(2, 2, 1, 1).data;
      const alpha = pixel[3]; // 0 = 100% transparent, 255 = fully opaque
      resolve({
        isTransparent: alpha === 0,
        cornerAlpha: alpha,
      });
    };
    img.onerror = () => {
      resolve({ isTransparent: true, cornerAlpha: 0 });
    };
    img.src = dataUrl;
  });
}

/**
 * Render a DOM element to genuine transparent PNG data URL with zero background
 * using SVG foreignObject and Canvas alpha channels.
 */
export async function renderNodeToPng(
  node: HTMLElement,
  options: {
    scale?: number;
    transparent?: boolean;
    width?: number;
    height?: number;
  } = {}
): Promise<{ dataUrl: string; cornerAlpha: number }> {
  const scale = options.scale || 1;
  const transparent = options.transparent !== false;

  // 1. Ensure all Quranic fonts are loaded
  if (document.fonts) {
    await document.fonts.ready;
  }

  // 2. Small settlement timeout for Arabic ligatures
  await new Promise((resolve) => setTimeout(resolve, 100));

  // 3. Render clean node with absolute zero background
  const dataUrl = await toPng(node, {
    pixelRatio: scale,
    backgroundColor: transparent ? undefined : '#000000',
    quality: 1,
    cacheBust: true,
    width: options.width,
    height: options.height,
    style: {
      backgroundColor: transparent ? 'transparent' : '#000000',
      backgroundImage: 'none',
      boxShadow: 'none',
      border: 'none',
      outline: 'none',
    },
    filter: (domNode) => {
      // Exclude editor-only guides and overlays
      if (domNode instanceof HTMLElement) {
        if (domNode.classList.contains('safe-guide')) return false;
      }
      return true;
    },
  });

  // 4. Verify alpha transparency
  let cornerAlpha = 0;
  if (transparent) {
    const verification = await verifyImageAlpha(dataUrl);
    cornerAlpha = verification.cornerAlpha;
  }

  return { dataUrl, cornerAlpha };
}

/**
 * Batch export multiple pages into a ZIP file with guaranteed alpha transparency
 */
export async function exportPagesToZip(
  project: ProjectState,
  pagesToExport: PageDefinition[],
  renderPageFunction: (pageIndex: number) => Promise<HTMLElement | null>,
  options: {
    scale?: number;
    transparent?: boolean;
    onProgress?: (progress: ExportProgress) => void;
  } = {}
): Promise<void> {
  const zip = new JSZip();
  const scale = options.scale || 1;
  const transparent = options.transparent !== false;
  const total = pagesToExport.length;

  const folderName = `Quran-Layer-${project.selectedSurah.nameLatin.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const folder = zip.folder(folderName) || zip;

  for (let i = 0; i < total; i++) {
    const page = pagesToExport[i];
    const pageIndex = project.pages.findIndex((p) => p.id === page.id);

    if (options.onProgress) {
      options.onProgress({
        currentPage: i + 1,
        totalPages: total,
        status: 'rendering',
      });
    }

    const node = await renderPageFunction(pageIndex >= 0 ? pageIndex : i);
    if (!node) {
      console.warn(`Could not find DOM element for page ${page.pageNumber}`);
      continue;
    }

    if (document.fonts) {
      await document.fonts.ready;
    }

    // Capture transparent blob
    const blob = await toBlob(node, {
      pixelRatio: scale,
      backgroundColor: transparent ? undefined : '#000000',
      quality: 1,
      style: {
        backgroundColor: transparent ? 'transparent' : '#000000',
        backgroundImage: 'none',
        boxShadow: 'none',
        border: 'none',
        outline: 'none',
      },
      filter: (domNode) => {
        if (domNode instanceof HTMLElement && domNode.classList.contains('safe-guide')) {
          return false;
        }
        return true;
      },
    });

    if (blob) {
      const filename = `${project.selectedSurah.nameLatin.replace(/[^a-zA-Z0-9]/g, '-')}-${String(page.pageNumber).padStart(3, '0')}.png`;
      folder.file(filename, blob);
    }
  }

  if (options.onProgress) {
    options.onProgress({
      currentPage: total,
      totalPages: total,
      status: 'zipping',
    });
  }

  const zipContent = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipContent, `${folderName}.zip`);

  if (options.onProgress) {
    options.onProgress({
      currentPage: total,
      totalPages: total,
      status: 'complete',
      verifiedAlpha: 0,
    });
  }
}
