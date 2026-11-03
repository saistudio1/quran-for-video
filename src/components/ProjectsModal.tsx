import React, { useState, useRef } from 'react';
import { 
  X, 
  FolderPlus, 
  FileDown, 
  FileUp, 
  FolderOpen, 
  Copy, 
  Trash2, 
  Calendar,
  CheckCircle2
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#B89555]">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Kelola Proyek Al-Qur'an</h3>
              <p className="text-[11px] text-slate-500">Tersimpan secara lokal di browser Anda</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleCreateNew}
            className="py-2 px-3 text-xs font-bold text-white bg-[#0F172A] hover:bg-slate-800 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#B89555]" />
            <span>Proyek Baru</span>
          </button>

          <button
            onClick={handleExportJson}
            className="py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
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
            className="py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
            title="Buka proyek dari file JSON backup"
          >
            <FileUp className="w-3.5 h-3.5 text-[#B89555]" />
            <span>Impor JSON</span>
          </button>
        </div>

        {/* Saved Projects List */}
        <div className="space-y-1.5 pt-2">
          <span className="text-xs font-semibold text-slate-700 block">Proyek Tersimpan</span>
          <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
            {projectsList.map((p) => {
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
                  onClick={() => handleSelectProject(p.id)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isCurrent ? 'bg-amber-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {p.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-[#B89555] bg-amber-100 font-semibold px-1.5 py-0.2 rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleDuplicate(p.id, e)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      title="Duplikat Proyek"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
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

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
