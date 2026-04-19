import React from 'react';
import { motion } from 'motion/react';
import { LearningPath, Paper } from '../types';
import { Lock, CheckCircle2, ChevronLeft, Play } from 'lucide-react';
import { MedicalBookCover } from './MedicalBookCover';
import ShinyButton from './ui/shiny-button';

interface LearningPathViewProps {
  path: LearningPath;
  onClose: () => void;
  onPaperClick: (paper: Paper) => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({ path, onClose, onPaperClick }) => {
  const papers = (window as any).MOCK_PAPERS || [];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
    >
      {/* Header - Simplified */}
      <div className="px-6 py-8 flex flex-col gap-2 border-b border-foreground/5 bg-background/40 backdrop-blur-2xl pl-24 relative">
        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full -z-10" />
        <button 
          onClick={onClose}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90 z-50 shadow-2xl border-foreground/10"
        >
          <ChevronLeft size={28} />
        </button>
        <h2 className="text-2xl lg:text-3xl font-serif font-bold text-foreground tracking-tight">{path.title}</h2>
        <div className="flex items-center gap-3">
          <div className="h-px w-6 bg-blue-500/50" />
          <p className="text-blue-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.25em]">{path.subtitle}</p>
        </div>
      </div>

      {/* Path Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-xl mx-auto relative">
          {/* Path Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500/80 via-blue-500/20 to-transparent -translate-x-1/2 z-0 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.2)]" />

          <div className="space-y-16 lg:space-y-20 relative z-10 py-10">
            {path.lessons.map((lesson, index) => {
              const paper = papers.find((p: Paper) => p.id === lesson.paperId);
              if (!paper) return null;

              return (
                <div key={lesson.id} className="flex flex-col items-center">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className={`relative w-full glass-card rounded-[32px] p-5 lg:p-6 flex gap-6 bg-gradient-to-br from-white/5 via-transparent to-transparent border-foreground/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${lesson.isLocked ? 'opacity-40 grayscale' : ''} group hover:shadow-blue-500/10 transition-all duration-500`}
                  >
                    <div className="w-24 h-32 lg:w-28 lg:h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                      <MedicalBookCover paper={paper} hideDetails className="scale-[1.2] origin-center" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-2">
                        <h4 className="text-base lg:text-lg font-serif font-bold text-foreground line-clamp-2 leading-tight group-hover:text-blue-500 transition-colors">{paper.title}</h4>
                        <p className="text-[10px] lg:text-[11px] text-muted-foreground font-black uppercase tracking-[0.15em] opacity-60">{paper.journal} • {paper.readTime}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        {lesson.isCompleted ? (
                          <div className="h-10 px-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                            <CheckCircle2 size={14} />
                            Completed
                          </div>
                        ) : lesson.isLocked ? (
                          <div className="flex items-center gap-2 text-muted-foreground/30 text-[10px] font-black uppercase tracking-widest">
                            <Lock size={16} />
                            Locked
                          </div>
                        ) : (
                          <ShinyButton 
                            onClick={() => onPaperClick(paper)}
                            className="h-10 px-6 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/20"
                          >
                            <Play size={12} fill="currentColor" />
                            Start Lesson
                          </ShinyButton>
                        )}
                      </div>
                    </div>

                    {/* Connector Node */}
                    <div className={`absolute left-1/2 -bottom-10 lg:-bottom-12 w-8 h-8 rounded-full border-4 border-[#02020a] -translate-x-1/2 z-20 flex items-center justify-center transition-all duration-500 ${lesson.isCompleted ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]' : lesson.isLocked ? 'bg-muted' : 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.7)]'}`}>
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
