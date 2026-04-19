import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Paper, UserProfile, Folder } from '../types';
import { Bookmark, Folder as FolderIcon, Plus, ChevronRight, MoreVertical, Trash, Bell, ExternalLink, Search, Filter, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { SPECIALTIES } from '../constants';
import { MedicalBookCover } from './MedicalBookCover';

interface GuidelineLibraryViewProps {
  userProfile: UserProfile | null;
  savedPapers: Paper[];
  onPaperClick: (paper: Paper) => void;
  onRemovePaper: (paperId: string) => void;
  onUpdateFolder: (folders: Folder[]) => void;
}

export const GuidelineLibraryView: React.FC<GuidelineLibraryViewProps> = ({
  userProfile,
  savedPapers,
  onPaperClick,
  onRemovePaper,
  onUpdateFolder,
}) => {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const folders = userProfile?.folders || [];
  const savedPaperIds = userProfile?.savedPaperIds || [];
  
  const filteredPapers = savedPapers.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolderId 
      ? folders.find(f => f.id === activeFolderId)?.paperIds.includes(p.id)
      : true;
    return matchesSearch && matchesFolder;
  });

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFolderName,
      paperIds: [],
      createdAt: new Date().toISOString()
    };
    onUpdateFolder([...folders, newFolder]);
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <header className="flex-none px-6 py-6 border-b border-surface">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif font-black text-foreground tracking-tight">Guideline Library</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mt-1">
              Clinical Depository
            </p>
          </div>
          
          <button className="relative w-12 h-12 rounded-2xl bg-surface-subtle border border-surface flex items-center justify-center text-foreground hover:text-blue-500 transition-all group overflow-hidden">
             <Bell size={20} />
             {savedPapers.some(p => p.isUpdateAvailable) && (
               <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] z-20" />
             )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
          <input 
            type="text"
            placeholder="Search in library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-surface-subtle border border-surface rounded-xl px-4 pl-12 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Folders Sidebar */}
        <aside className="w-64 border-r border-foreground/5 p-6 space-y-8 overflow-y-auto no-scrollbar hidden lg:block">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Folders</h3>
              <button 
                onClick={() => setIsAddingFolder(true)}
                className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setActiveFolderId(null)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${!activeFolderId ? 'bg-blue-500/10 text-white border border-blue-500/20' : 'text-foreground/40 hover:bg-foreground/5'}`}
              >
                <Bookmark size={18} className={!activeFolderId ? 'text-blue-500' : 'text-foreground/20'} />
                <span className="text-sm font-bold">All Guidelines</span>
                <span className="ml-auto text-[10px] opacity-40">{savedPaperIds.length}</span>
              </button>

              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolderId(folder.id)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${activeFolderId === folder.id ? 'bg-blue-500/10 text-white border border-blue-500/20' : 'text-foreground/40 hover:bg-foreground/5'}`}
                >
                  <FolderIcon size={18} className={activeFolderId === folder.id ? 'text-blue-500' : 'text-foreground/20'} />
                  <span className="text-sm font-bold truncate">{folder.name}</span>
                  <span className="ml-auto text-[10px] opacity-40">{folder.paperIds.length}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
             <div className="flex items-center gap-2 text-amber-500">
               <AlertCircle size={14} />
               <span className="text-[9px] font-black uppercase tracking-widest">Update Alerts</span>
             </div>
             <p className="text-[10px] text-foreground/60 leading-relaxed font-medium">
               Anzar Academy is monitoring your library for version changes.
             </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto w-full h-full no-scrollbar px-6 py-8">
          <div className="max-w-[1600px] mx-auto space-y-8">
            <AnimatePresence mode="wait">
              {filteredPapers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPapers.map((paper, idx) => (
                    <motion.div
                      key={paper.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative rounded-3xl border border-surface bg-surface-subtle overflow-hidden flex flex-col hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/5 cursor-pointer"
                      onClick={() => onPaperClick(paper)}
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                         <MedicalBookCover paper={paper} />
                         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                         
                         {paper.isUpdateAvailable && (
                           <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                             Next Version Available
                           </div>
                         )}

                         <div className="absolute bottom-4 left-6 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
                              {SPECIALTIES.find(s => s.id === paper.specialtyId)?.name || 'Medical'}
                            </span>
                            <span className="text-muted-foreground text-[8px] font-black uppercase tracking-widest">{paper.date}</span>
                         </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <h3 className="text-lg font-serif font-black text-foreground leading-tight uppercase line-clamp-2 transition-colors group-hover:text-blue-400">
                          {paper.title}
                        </h3>
                        
                        <div className="space-y-2">
                          {paper.summaryPoints?.slice(0, 3).map((point, i) => (
                            <div key={i} className="flex gap-2 text-[11px] text-muted-foreground/80 leading-relaxed font-medium">
                              <span className="text-blue-500 text-xs font-black">•</span>
                              <span className="line-clamp-1">{point}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-surface flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <button 
                               onClick={(e) => { e.stopPropagation(); window.open(paper.sourceUrl, '_blank'); }}
                               className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                             >
                               <ExternalLink size={14} />
                               <span className="text-[9px] font-black uppercase tracking-widest">Source</span>
                             </button>
                           </div>
                           <button 
                             onClick={(e) => { e.stopPropagation(); onRemovePaper(paper.id); }}
                             className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                           >
                             <MoreVertical size={16} />
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-30">
                  <div className="relative">
                    <Bookmark size={80} className="text-blue-500/20" />
                    <Plus size={24} className="absolute bottom-2 right-2 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-black text-foreground">Your Library is Empty</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2">Browse Guideline Central to save structured recommendations.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Add Folder Overlay */}
      <AnimatePresence>
        {isAddingFolder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingFolder(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm glass-card rounded-[32px] p-8 space-y-6 border-foreground/10"
            >
              <h3 className="text-xl font-serif font-black text-foreground tracking-tight">Create Folder</h3>
              <input 
                autoFocus
                type="text"
                placeholder="Folder Name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full h-12 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none text-foreground"
              />
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsAddingFolder(false)}
                  className="flex-1 h-12 rounded-2xl bg-foreground/5 text-foreground/60 text-xs font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddFolder}
                  className="flex-1 h-12 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
