import React, { useState, useRef } from 'react';
import { 
  X, 
  FolderPlus, 
  FileDown, 
  FileUp, 
  FolderOpen, 
  Copy, 
  Trash2, 
  Calendar
} from 'lucide-react';
import { ProjectState } from '../types';
import { 
  listProjects, 
  loadProject, 
  createDefaultProject, 
  saveProject, 
  deleteProject, 
  exportProjectToJson, 
  importProjectFromJson 
} from '../services/storage';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: ProjectState;
  onLoadProject: (project: ProjectState) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  onLoadProject,
}) => {
  const [projectsList, setProjectsList] = useState(listProjects());
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCreateNew = () => {
    const newProj = createDefaultProject();
    newProj.name = `Proyek Baru ${new Date().toLocaleDateString('id-ID')}`;
    saveProject(newProj);
    onLoadProject(newProj);
    setProjectsList(listProjects());
    onClose();
  };

  const handleSelectProject = (id: string) => {
    const proj = loadProject(id);
    if (proj) {
      onLoadProject(proj);
      onClose();
    }
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const proj = loadProject(id);
    if (proj) {
      const copy: ProjectState = {
        ...proj,
        id: `project-${Date.now()}`,
        name: `${proj.name} (Salinan)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      saveProject(copy);
      setProjectsList(listProjects());
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Yakin ingin menghapus proyek ini secara permanen dari perangkat Anda?')) {
      deleteProject(id);
      setProjectsList(listProjects());
    }
  };

  const handleExportJson = () => {
    const jsonStr = exportProjectToJson(currentProject);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProject.name.replace(/[^a-zA-Z0-9]/g, '-')}-backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importProjectFromJson(text);
        onLoadProject(imported);
        setProjectsList(listProjects());
        onClose();
        alert(`Berhasil mengimpor proyek "${imported.name}"!`);
      } catch (err: any) {
        alert(err.message || 'Gagal mengimpor file JSON proyek.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Choreography: Smooth Scale-in entrance with cubic-bezier(0.16, 1, 0.3, 1) */}
      <div className="neu-flat animate-sheet-up bg-[#edf2f7] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-white/80">
        <div className="flex items-center justify-between pb-3 border-b border-slate-300/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-flat flex items-center justify-center text-[#B89555]">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Kelola Proyek Al-Qur'an</h3>
              <p className="text-[11px] text-slate-500 font-medium">Tersimpan secara lokal di browser Anda</p>
            </div>
          </div>
          <button onClick={onClose} className="neu-button p-2 rounded-full text-slate-400 hover:text-slate-800 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={handleCreateNew}
            className="neu-button-primary py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
          >
            <FolderPlus className="w-3.5 h-3.5 text-white" />
            <span>Proyek Baru</span>
          </button>

          <button
            onClick={handleExportJson}
            className="neu-button py-2.5 px-3 text-xs font-bold text-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
            title="Cadangkan proyek saat ini ke file JSON"
          >
            <FileDown className="w-3.5 h-3.5 text-[#B89555]" />
            <span>Backup JSON</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="neu-button py-2.5 px-3 text-xs font-bold text-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
            title="Buka proyek dari file JSON backup"
          >
            <FileUp className="w-3.5 h-3.5 text-[#B89555]" />
            <span>Impor JSON</span>
          </button>
        </div>

        {/* Saved Projects List with Staggered Entrance */}
        <div className="space-y-1.5 pt-2">
          <span className="text-xs font-bold text-slate-700 block">Proyek Tersimpan</span>
          <div className="max-h-56 overflow-y-auto neu-inset rounded-2xl divide-y divide-slate-200/60 p-1.5">
            {projectsList.map((p, idx) => {
              const isCurrent = p.id === currentProject.id;
              const dateStr = new Date(p.updatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={p.id}
                  /* Choreography: Staggered entrance 0.04s delay step */
                  style={{ animationDelay: `${idx * 0.04}s` }}
                  onClick={() => handleSelectProject(p.id)}
                  className={`animate-stagger-item p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isCurrent 
                      ? 'bg-white shadow-[2px_2px_6px_rgba(166,178,196,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] text-[#B89555]' 
                      : 'hover:bg-white/60 hover:translate-x-0.5'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {p.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-[#B89555] neu-inset-sm font-bold px-2 py-0.5 rounded-md">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => handleDuplicate(p.id, e)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors"
                      title="Duplikat Proyek"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Hapus Proyek"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {projectsList.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada proyek tersimpan.
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-300/60 flex justify-end">
          <button
            onClick={onClose}
            className="neu-button px-4 py-2 text-xs font-bold text-slate-600 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0.5"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
