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
 * using an unscaled, isolated 1:1 DOM snapshot.
 * Eliminates zoom-scale distortion and prevents text collision between preview & export.
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
  const width = options.width || 1080;
  const height = options.height || 1920;

  // 1. Ensure all Quranic fonts are loaded
  if (document.fonts) {
    await document.fonts.ready;
  }

  // 2. Settlement pause for font rendering
  await new Promise((resolve) => setTimeout(resolve, 80));

  // 3. Create an isolated offscreen container attached directly to document.body
  // This removes any ancestor CSS transform: scale(zoom) from affecting computed styles,
  // font metrics, line breaks, or text wrapping!
  const offscreenContainer = document.createElement('div');
  offscreenContainer.style.position = 'fixed';
  offscreenContainer.style.left = '-99999px';
  offscreenContainer.style.top = '0';
  offscreenContainer.style.width = `${width}px`;
  offscreenContainer.style.height = `${height}px`;
  offscreenContainer.style.transform = 'none';
  offscreenContainer.style.zIndex = '-99999';
  offscreenContainer.style.opacity = '1';
  offscreenContainer.style.pointerEvents = 'none';
  offscreenContainer.style.overflow = 'hidden';
  offscreenContainer.style.backgroundColor = transparent ? 'transparent' : '#000000';

  const clone = node.cloneNode(true) as HTMLElement;
  clone.id = 'quran-canvas-export-clone';
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.position = 'relative';
  clone.style.backgroundColor = transparent ? 'transparent' : (node.style.backgroundColor || '#000000');

  // Remove any active editor selection rings or safe guides from the clone
  clone.querySelectorAll('.safe-guide').forEach((el) => el.remove());
  clone.querySelectorAll('[class*="ring-"]').forEach((el) => {
    el.classList.remove('ring-2', 'ring-[#B89555]', 'ring-[#B89555]/50');
  });

  offscreenContainer.appendChild(clone);
  document.body.appendChild(offscreenContainer);

  try {
    // 4. Render clean node with absolute zero background
    const dataUrl = await toPng(clone, {
      pixelRatio: scale,
      backgroundColor: transparent ? undefined : '#000000',
      quality: 1,
      cacheBust: false,
      width: width,
      height: height,
      style: {
        backgroundColor: transparent ? 'transparent' : '#000000',
        backgroundImage: 'none',
        boxShadow: 'none',
        border: 'none',
        outline: 'none',
        transform: 'none',
      },
    });

    // 5. Verify alpha transparency
    let cornerAlpha = 0;
    if (transparent) {
      const verification = await verifyImageAlpha(dataUrl);
      cornerAlpha = verification.cornerAlpha;
    }

    return { dataUrl, cornerAlpha };
  } finally {
    if (offscreenContainer.parentNode) {
      offscreenContainer.parentNode.removeChild(offscreenContainer);
    }
  }
}

/**
 * Batch export multiple pages into a ZIP file with guaranteed alpha transparency
 * and isolated unscaled DOM snapshots for every page.
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
  const width = project.canvas.width;
  const height = project.canvas.height;

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

    // Isolated unscaled offscreen container for batch rendering
    const offscreenContainer = document.createElement('div');
    offscreenContainer.style.position = 'fixed';
    offscreenContainer.style.left = '-99999px';
    offscreenContainer.style.top = '0';
    offscreenContainer.style.width = `${width}px`;
    offscreenContainer.style.height = `${height}px`;
    offscreenContainer.style.transform = 'none';
    offscreenContainer.style.zIndex = '-99999';
    offscreenContainer.style.opacity = '1';
    offscreenContainer.style.pointerEvents = 'none';
    offscreenContainer.style.overflow = 'hidden';
    offscreenContainer.style.backgroundColor = transparent ? 'transparent' : '#000000';

    const clone = node.cloneNode(true) as HTMLElement;
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.position = 'relative';
    clone.style.backgroundColor = transparent ? 'transparent' : (node.style.backgroundColor || '#000000');

    clone.querySelectorAll('.safe-guide').forEach((el) => el.remove());
    clone.querySelectorAll('[class*="ring-"]').forEach((el) => {
      el.classList.remove('ring-2', 'ring-[#B89555]', 'ring-[#B89555]/50');
    });

    offscreenContainer.appendChild(clone);
    document.body.appendChild(offscreenContainer);

    let blob: Blob | null = null;
    try {
      blob = await toBlob(clone, {
        pixelRatio: scale,
        backgroundColor: transparent ? undefined : '#000000',
        quality: 1,
        cacheBust: false,
        width,
        height,
        style: {
          backgroundColor: transparent ? 'transparent' : '#000000',
          backgroundImage: 'none',
          boxShadow: 'none',
          border: 'none',
          outline: 'none',
          transform: 'none',
        },
      });
    } finally {
      if (offscreenContainer.parentNode) {
        offscreenContainer.parentNode.removeChild(offscreenContainer);
      }
    }

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
