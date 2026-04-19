import React from 'react';
import { motion } from 'motion/react';
import { Paper } from '../types';
import { ArrowLeft, Search, Filter, Bookmark, Globe, ChevronRight } from 'lucide-react';
import { MedicalBookCover } from './MedicalBookCover';
import { SPECIALTIES } from '../constants';

interface ArticlesListViewProps {
  articles: Paper[];
  onClose: () => void;
  onArticleClick: (paper: Paper) => void;
  categoryName: string;
}

export const ArticlesListView: React.FC<ArticlesListViewProps> = ({ 
  articles, 
  onClose, 
  onArticleClick,
  categoryName 
}) => {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
    >
      {/* Header */}
      <header className="px-6 py-4 border-b border-surface bg-background/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-subtle transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
            <div>
              <h2 className="text-2xl font-serif font-black text-foreground tracking-tight">{categoryName}</h2>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mt-1">
                {articles.length} Documents Found
              </p>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl bg-surface-subtle border border-surface text-muted-foreground hover:text-foreground transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </header>

      {/* Search Bar in List */}
      <div className="px-6 py-4 border-b border-surface bg-surface-subtle/30">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-blue-400 group-focus-within:drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all" size={18} />
          <input 
            type="text" 
            placeholder={`Search within ${categoryName}...`}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface-subtle border border-surface focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all outline-none"
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {articles.length > 0 ? (
          articles.map((paper) => (
            <motion.div 
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ x: 4 }}
              onClick={() => onArticleClick(paper)}
              className="glass-card rounded-[24px] p-5 flex gap-5 cursor-pointer border-surface hover:bg-[#00356B]/5 transition-all group active:scale-[0.98]"
            >
              <div className="w-24 h-32 lg:w-32 lg:h-44 flex-shrink-0 shadow-2xl rounded-lg lg:rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <MedicalBookCover paper={paper} />
              </div>
              
              <div className="flex-1 py-1 flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-[#00356B]/40 text-[#00356B] text-[10px] font-black uppercase tracking-widest border border-[#00356B]/50 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] brightness-150">
                    {SPECIALTIES.find(s => s.id === paper.specialtyId)?.name || 'General Medicine'}
                  </span>
                  <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                    {paper.date}
                  </span>
                </div>
                
                <h3 className="text-base lg:text-lg font-serif font-bold text-foreground leading-snug group-hover:text-blue-400 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all line-clamp-2 uppercase">
                  {paper.title}
                </h3>
                
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2 opacity-80 flex-1">
                  {paper.description}
                </p>
                
                <div className="mt-4 flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground p-2 rounded-lg border border-foreground/10 hover:bg-foreground/5 active:scale-95 transition-all">
                      <Bookmark size={14} />
                      <span className="hidden sm:inline">Save</span>
                    </button>
                    {paper.pmcid && (
                      <button className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 active:scale-95 transition-all">
                        <Globe size={14} />
                        <span className="hidden sm:inline">Open Access</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-[#00356B] drop-shadow-[0_0_1px_rgba(255,255,255,0.2)] font-black text-xs uppercase tracking-widest group-hover:gap-2 group-hover:text-blue-400 transition-all p-2 rounded-lg bg-blue-500/5">
                    Read Node <ChevronRight size={16} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-40">
            <div className="w-20 h-20 rounded-full border-4 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <Search size={32} />
            </div>
            <p className="text-lg font-serif font-bold">No results for this category</p>
            <p className="max-w-xs text-xs uppercase tracking-widest font-black">Adjust your filters or try a different clinical specialty.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
