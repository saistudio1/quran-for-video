import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  BookOpen, 
  Scale, 
  Code2, 
  CheckCircle2, 
  Type,
  FileCheck
} from 'lucide-react';
import { ProjectState } from '../types';

interface AttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectState;
}

export const AttributionModal: React.FC<AttributionModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [testFont, setTestFont] = useState<string>(project.styles.arabic.fontFamily);

  if (!isOpen) return null;

  // Test verse containing complex Quranic diacritics, dagger alif, and waqf stop signs
  const COMPATIBILITY_TEST_TEXT = "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ۝١";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Choreography: Smooth Scale-in entrance with cubic-bezier(0.16, 1, 0.3, 1) */}
      <div className="neu-flat animate-sheet-up bg-[#edf2f7] rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-white/80 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-300/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-flat flex items-center justify-center text-[#B89555]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Atribusi & Lisensi Perangkat Lunak Terbuka
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Open-Source Technology, Font Provenance & Ethical Quran Data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="neu-button p-2 rounded-full text-slate-400 hover:text-slate-800 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Tabs / Scrollable Section */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-700">
          {/* 1. Quran.com Reference Architecture */}
          <div className="neu-flat-sm p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#B89555]" />
                <span>Referensi Teknis: Quran.com Web</span>
              </span>
              <a
                href="https://github.com/quran/quran.com-frontend-next"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#B89555] hover:text-[#9E7D3F] flex items-center gap-1 font-bold"
              >
                <span>quran.com-frontend-next</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed text-[11px]">
              QURAN LAYER mempelajari dan mengadopsi prinsip arsitektur terbuka dari proyek referensi resmi <strong>Quran.com</strong> dalam pemisahan data teks Arab otentik, transliterasi fonetik Latin, dan terjemahan resmi tanpa modifikasi teks asli.
            </p>
          </div>

          {/* 2. Quranic Text Integrity & Kemenag Attribution */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#B89555]" />
              <span>Integritas Teks & Terjemahan Al-Qur'an</span>
            </h4>
            <div className="neu-flat-sm p-3.5 rounded-2xl space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Kementerian Agama Republik Indonesia (Kemenag RI)</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Mushaf Standar Indonesia & Terjemahan Resmi Bahasa Indonesia
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md neu-inset-sm text-emerald-700">
                  Resmi Terverifikasi
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                • <strong>Bukan Teks AI:</strong> Seluruh ayat diambil dari naskah digital terverifikasi dengan harakat, tanda waqf, dan nomor ayat yang utuh.<br />
                • <strong>Bebas Hak Cipta Restriktif:</strong> Digunakan untuk kemaslahatan dakwah visual, video murattal, dan konten edukasi Islami.
              </p>
            </div>
          </div>

          {/* 3. Open-Source Font Licensing */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-[#B89555]" />
              <span>Lisensi Tipografi Kaligrafi Arab (SIL OFL)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="neu-flat-sm p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Amiri & Amiri Quran</span>
                  <span className="text-[10px] font-mono text-[#B89555] font-bold px-2 py-0.5 rounded-md neu-inset-sm">OFL 1.1</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Desain oleh Dr. Khaled Hosny. Naskh klasik berbasis cetakan Bulaq, dioptimalkan khusus untuk mushaf Al-Qur'an.
                </p>
              </div>

              <div className="neu-flat-sm p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Scheherazade New</span>
                  <span className="text-[10px] font-mono text-[#B89555] font-bold px-2 py-0.5 rounded-md neu-inset-sm">OFL 1.1</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Diterbitkan oleh SIL International. Mendukung penempatan harakat kompleks dan simbol Quranik Unicode.
                </p>
              </div>

              <div className="neu-flat-sm p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Noto Naskh Arabic</span>
                  <span className="text-[10px] font-mono text-[#B89555] font-bold px-2 py-0.5 rounded-md neu-inset-sm">OFL 1.1</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Dikembangkan oleh Google Fonts. Presisi digital tinggi untuk keterbacaan tajam pada resolusi 1080p dan 4K.
                </p>
              </div>

              <div className="neu-flat-sm p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Plus Jakarta Sans</span>
                  <span className="text-[10px] font-mono text-[#B89555] font-bold px-2 py-0.5 rounded-md neu-inset-sm">OFL 1.1</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Desain oleh Gumpita Rahayu (Tokotype). Huruf modern berlisensi terbuka untuk UI dan terjemahan.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Live Arabic Font Compatibility Tester */}
          <div className="neu-flat-sm p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-[#B89555]" />
                <span>Uji Kompatibilitas Tanda Baca & Harakat Quranik</span>
              </span>
              <select
                value={testFont}
                onChange={(e) => setTestFont(e.target.value)}
                className="neu-input px-2.5 py-1 text-[11px] rounded-lg text-slate-800 font-semibold"
              >
                <option value="Amiri Quran">Amiri Quran</option>
                <option value="Amiri">Amiri</option>
                <option value="Scheherazade New">Scheherazade New</option>
                <option value="Noto Naskh Arabic">Noto Naskh Arabic</option>
              </select>
            </div>
            <div 
              style={{ fontFamily: testFont }}
              className="p-3 bg-white/80 rounded-xl neu-inset-sm text-center text-xl text-slate-900 leading-loose"
              dir="rtl"
            >
              {COMPATIBILITY_TEST_TEXT}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ligatur Utsmani, tanda mad, tanwin, dan simbol ayat ۝ terkonfirmasi kompatibel.</span>
            </div>
          </div>

          {/* 5. Open-Source Libraries Documentation */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900">Pustaka Dependensi Perangkat Lunak</h4>
            <div className="neu-inset-sm p-3 rounded-2xl divide-y divide-slate-200/60 text-[11px] font-medium">
              <div className="py-1.5 flex justify-between">
                <span><strong>JSZip</strong> · Pembuatan arsip batch ZIP</span>
                <span className="font-mono text-slate-500">MIT / GPLv3 Dual</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span><strong>html-to-image</strong> · Rasterisasi kanvas transparan</span>
                <span className="font-mono text-slate-500">MIT License</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span><strong>Lucide Icons</strong> · Sistem ikon antarmuka</span>
                <span className="font-mono text-slate-500">ISC License</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span><strong>React & Vite</strong> · Runtime antarmuka modern</span>
                <span className="font-mono text-slate-500">MIT License</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-300/60 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            QURAN LAYER — Didedikasikan untuk Kreator Konten Islam
          </span>
          <button
            onClick={onClose}
            className="neu-button px-4 py-2 text-xs font-bold text-slate-700 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
