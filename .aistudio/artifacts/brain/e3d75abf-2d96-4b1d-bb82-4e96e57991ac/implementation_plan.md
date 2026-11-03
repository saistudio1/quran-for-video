# QURAN LAYER — Technical & Compliance Revision

A technical revision enhancing the Quran typography engine, open-source licensing compliance, classical Uthmanic script fidelity, and true alpha-channel transparent PNG export.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed for this revision:
> - **Classical Uthmanic Script Focus**: Prioritizing verified open-source fonts under the SIL Open Font License (OFL 1.1) engineered specifically for Quranic marks and complex diacritics (*Amiri Quran*, *Amiri*, *Scheherazade New*, and *Noto Naskh Arabic*).
> - **True Transparent PNG Export Architecture**: Complete architectural decoupling of the editor's visual checkerboard from the export rendering pipeline. Using an **SVG `foreignObject` / isolated zero-background rasterization pipeline** with runtime alpha-channel verification (`alpha === 0` in non-text areas).
> - **Open-Source & Attribution Documentation**: A dedicated top-level dialog and toolbar affordance documenting Quran.com reference patterns, Kemenag Quran data provenance, font copyright notices, and permissive dependency licenses.

---

## 1. Overview & Core Concept

This revision focuses on four foundational pillars without altering the proven user workflow:
1. **True Alpha-Channel Export**: Completely eliminates the checkerboard export bug by restructuring the DOM hierarchy so the preview checkerboard lives in an underlying editor viewport plane, leaving the actual exportable canvas with genuine `rgba(0,0,0,0)` transparency.
2. **Classical Uthmanic Quranic Typography**: Enriches the Arabic calligraphy engine with verified Quran-grade open-source typefaces supporting complex ligatures, sajda/waqf symbols, and diacritics.
3. **Quranic Text Integrity & Data Provenance**: Formalizes verified data attribution to the Indonesian Ministry of Religious Affairs (Kemenag) and Quran.com API specifications.
4. **Open-Source Compliance**: Documents all project dependencies, fonts, and datasets under their respective open-source licenses (MIT, Apache 2.0, SIL OFL 1.1).

---

## 2. User Experience & Visual Design

- **Editor Canvas**:
  - The checkerboard pattern is moved to a fixed backdrop container (`.canvas-viewport-backdrop`) underneath the canvas.
  - The canvas itself is completely transparent (`background: transparent`), so what sits on it has zero background artifacts.
- **Top Toolbar**:
  - Adds an **"Atribusi & Lisensi"** button in the TopToolbar with an open-source shield icon.
  - Retains all existing undo/redo, zoom, aspect ratio switcher ("macam2"), video preview, and export triggers.
- **Open-Source & Attribution Dialog**:
  - Comprehensive modal showing data provenance (Kemenag RI), technical reference (*quran.com-frontend-next* architecture), font licenses (SIL OFL 1.1 for Amiri and Scheherazade New), and client libraries (MIT).
  - Includes a live font compatibility test indicator showing rendering fidelity with complex Quranic verses.
- **Export Verification**:
  - Transparent PNG export processes through a dedicated offscreen renderer that strips any inherited styling.
  - An automated pixel-inspector validates that the image header and corner pixels have `alpha === 0` before download.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Root Cause & Fix of Checkerboard Export Bug
- *Root Cause Analysis*: In the initial build, CSS classes `bg-checkerboard` and `bg-checkerboard-dark` were assigned directly to the `<div id="quran-canvas-node">` captured by `html-to-image`. Even when `backgroundColor: undefined` was passed, CSS background gradients remained active in the captured DOM subtree.
- *Chosen Approach*: 
  1. Decouple visual feedback: The checkerboard pattern is applied exclusively to a viewport backdrop wrapper element *behind* the canvas.
  2. The exportable canvas container is styled strictly with `background: transparent !important`.
  3. Implement an isolated SVG `foreignObject` & Canvas alpha pipeline in `exportService.ts` that explicitly renders with clean transparent alpha pixels and samples corner pixel data to guarantee `alpha === 0`.
- *Why*: Guarantees that neither CSS background gradients nor ancestor container styles can ever pollute the exported PNG.

### Decision 2: Classical Uthmanic Script Typography
- *Chosen Approach*: Curate fonts with verified SIL Open Font License 1.1 that properly support complex Quranic ligatures, dagger alif, waslah, and waqf stop signs:
  - *Amiri Quran*: Specialized variant of Amiri optimized for Quranic recitation texts and diacritic positioning.
  - *Scheherazade New*: Traditional Naskh script by SIL International with comprehensive Unicode Quranic mark support.
  - *Noto Naskh Arabic*: Clean, highly legible Quranic Arabic rendering by Google.
- *Why*: Prevents awkward diacritic clipping and ensures faithful representation of classical Uthmanic orthography.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TOP TOOLBAR & NAVIGATION                        │
│ [QL Logo] [Project Name] [Undo/Redo] [Zoom] [Atribusi & Lisensi] [Export]│
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          EDITOR WORKSPACE                              │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ [Backdrop Layer: .bg-checkerboard / .bg-video-mockup]          │   │
│   │ (Editor-only visual preview; NOT in export DOM tree)           │   │
│   │                                                                │   │
│   │   ┌────────────────────────────────────────────────────────┐   │   │
│   │   │ [Exportable Canvas Root: background: transparent]      │   │   │
│   │   │ • Meta Header (Surah name, Bismillah)                  │   │   │
│   │   │ • Arabic Layer (Amiri Quran / Scheherazade New RTL)    │   │   │
│   │   │ • Transliteration Layer (Latin pronunciation)          │   │   │
│   │   │ • Translation Layer (Indonesian Kemenag)               │   │   │
│   │   └────────────────────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    EXPORT & VALIDATION PIPELINE                        │
│                                                                        │
│   Clean DOM Node ──► SVG foreignObject ──► HTML5 Canvas (Alpha 0)      │
│                                                   │                    │
│                                                   ▼                    │
│                                           Pixel Alpha Check            │
│                                           [Corner Alpha = 0?]          │
│                                                   │                    │
│                                        ┌──────────┴──────────┐         │
│                                        ▼                     ▼         │
│                                  Single PNG             ZIP Archive    │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & File Strategy
- **`src/services/exportService.ts`**: Replace contaminated capture with an isolated zero-background SVG `foreignObject` / Canvas rasterizer that enforces genuine alpha transparency and runs an automated pixel-sample test.
- **`src/components/CenterCanvas.tsx`**: Separate the checkerboard backdrop element from the actual export canvas. Ensure the canvas root has zero background color in transparent mode.
- **`src/index.html` & `src/index.css`**: Add Google Fonts link for *Amiri Quran* and verify font-family definitions.
- **`src/components/AttributionModal.tsx`**: New dedicated dialog documenting open-source references (*Quran.com* frontend patterns, Kemenag data, SIL OFL fonts, MIT packages).
- **`src/components/TopToolbar.tsx`**: Add trigger button for the Attribution dialog.
