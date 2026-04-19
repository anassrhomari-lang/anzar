import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Search, X, ChevronRight, Library } from 'lucide-react';
import { BMC_JOURNALS } from '../data/journals';

interface JournalsDirectoryViewProps {
  onClose: () => void;
}

export const JournalsDirectoryView: React.FC<JournalsDirectoryViewProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredJournals = BMC_JOURNALS.filter(journal => 
    journal.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    journal.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    journal.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(BMC_JOURNALS.map(j => j.category))).sort();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="flex-none px-6 py-6 border-b border-surface">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-subtle hover:bg-surface flex items-center justify-center transition-colors text-foreground"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          
          <div>
            <h1 className="text-2xl font-serif font-black tracking-tight text-foreground flex items-center gap-3">
              <Library size={24} className="text-blue-500" />
              BMC Health Sciences Journals
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                Database
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Springer Nature</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search journals or specialties..."
            className="w-full h-12 bg-surface-subtle border border-surface rounded-xl px-4 pl-12 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-foreground placeholder:text-muted-foreground"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto w-full h-full no-scrollbar px-6 py-8">
        <div className="max-w-[1600px] mx-auto">
          {filteredJournals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <BookOpen className="w-16 h-16 text-foreground/20 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No journals found</h3>
              <p className="text-sm text-foreground/50 max-w-sm">No BMC journals match your search query. Try searching for a different specialty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredJournals.map((journal) => (
                <a 
                  key={journal.id}
                  href={journal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-3xl border border-foreground/10 bg-foreground/[0.02] overflow-hidden flex flex-col hover:bg-foreground/[0.05] hover:border-foreground/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5 block cursor-pointer"
                >
                  <div className="w-full aspect-[4/3] relative border-b border-foreground/10 overflow-hidden bg-gradient-to-b from-white/5 to-white/[0.01] flex items-center justify-center p-8">
                    <img 
                      src={journal.imageUrl} 
                      alt={journal.title}
                      className="max-w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-700 ease-out"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none opacity-80" />
                    
                    <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                      <span className="px-3 py-1.5 rounded-md bg-background/60 backdrop-blur-md border border-foreground/10 text-[10px] font-black text-foreground uppercase tracking-widest shadow-xl">
                        {journal.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col relative z-10 bg-background text-left">
                    <h3 className="text-xl font-serif font-black text-foreground group-hover:text-blue-400 transition-colors mb-3 leading-tight tracking-tight">
                      {journal.title}
                    </h3>
                    <p className="text-xs text-foreground/60 font-medium leading-relaxed mb-6 line-clamp-3 flex-1">
                      {journal.description}
                    </p>
                    
                    <div
                      className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm"
                    >
                      <BookOpen size={14} />
                      Access Journal Database
                      <ExternalLink size={14} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
