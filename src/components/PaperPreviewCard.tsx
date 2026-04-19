import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Paper } from '../types';
import { SPECIALTIES } from '../constants';
import { Play, ExternalLink, X, ChevronRight, Bookmark } from 'lucide-react';
import { MedicalBookCover } from './MedicalBookCover';
import ShinyButton from './ui/shiny-button';

interface PaperPreviewCardProps {
  paper: Paper | null;
  onClose: () => void;
  onFullView: (paper: Paper) => void;
}

export const PaperPreviewCard: React.FC<PaperPreviewCardProps> = ({ paper, onClose, onFullView }) => {
  if (!paper) return null;

  const specialty = SPECIALTIES.find(s => s.id === paper.specialtyId);

  return (
    <AnimatePresence>
      {paper && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-20 lg:bottom-24 left-4 right-4 lg:left-auto lg:right-8 lg:w-[340px] z-50 glass-card rounded-[28px] lg:rounded-[36px] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-foreground/10"
        >
          <div className="relative aspect-[4/5] w-full">
            <MedicalBookCover paper={paper} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent rounded-[28px] lg:rounded-[36px] pointer-events-none" />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-foreground/70 hover:text-foreground transition-all hover:scale-110 active:scale-90 z-50"
            >
              <X size={18} />
            </button>
            <div className="absolute bottom-4 left-4 right-4">
               <span 
                className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] mb-2 inline-block shadow-lg"
                style={{ backgroundColor: `${specialty?.color}dd`, color: '#fff' }}
              >
                {specialty?.name}
              </span>
            </div>
          </div>

          <div className="p-5 lg:p-6 space-y-4 lg:space-y-5">
            <div className="space-y-1 lg:space-y-1.5">
              <h3 className="text-[15px] lg:text-[17px] font-serif font-bold text-foreground leading-[1.2] line-clamp-2 tracking-tight">
                {paper.title}
              </h3>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-70">
                {paper.authors[0]} {paper.authors.length > 1 ? `& ${paper.authors.length - 1} others` : ''} • {paper.journal}
              </p>
            </div>

            <div className="flex gap-2">
              <ShinyButton 
                onClick={() => onFullView(paper)}
                className="flex-1 h-9 lg:h-10 rounded-full lg:rounded-full text-[10px] lg:text-xs font-bold flex items-center justify-center gap-1.5 lg:gap-2 active:scale-95 transition-transform shadow-black/20"
              >
                <Play size={12} className="lg:w-[14px] lg:h-[14px]" fill="currentColor" />
                Listen
              </ShinyButton>
              <button 
                onClick={() => {
                  if (paper.pmid) {
                    window.open(`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`, '_blank');
                  }
                }}
                className="flex-1 h-9 lg:h-10 rounded-full lg:rounded-full bg-muted border border-foreground/5 text-foreground/80 text-[10px] lg:text-xs font-bold flex items-center justify-center gap-1.5 lg:gap-2 hover:bg-foreground/10 active:scale-95 transition-transform"
              >
                <ExternalLink size={12} className="lg:w-[14px] lg:h-[14px]" />
                Original
              </button>
              <button className="w-9 h-9 lg:w-10 lg:h-10 rounded-full lg:rounded-full glass-card flex items-center justify-center text-muted-foreground active:scale-95 transition-transform">
                <Bookmark size={16} className="lg:w-[18px] lg:h-[18px]" />
              </button>
            </div>

            <button 
              onClick={() => onFullView(paper)}
              className="w-full py-1.5 flex items-center justify-between text-[9px] lg:text-[10px] font-bold text-blue-500 uppercase tracking-widest group"
            >
              Full Summary & Quiz
              <ChevronRight size={12} className="lg:w-[14px] lg:h-[14px] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
