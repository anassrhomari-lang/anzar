import React from 'react';
import { motion } from 'motion/react';
import { LearningPath } from '../types';
import { ChevronRight, GraduationCap, Lock, CheckCircle2, BookOpen, FileText, ClipboardList, BarChart } from 'lucide-react';

interface RelatedPathViewProps {
  path: LearningPath;
  onLessonClick?: (lesson: any) => void;
}

const IconMap: Record<string, any> = {
  'article': BookOpen,
  'review': FileText,
  'guideline': ClipboardList,
  'meta-analysis': BarChart,
};

export const RelatedPathView: React.FC<RelatedPathViewProps> = ({ path, onLessonClick }) => {
  return (
    <div className="mt-12 pt-8 border-t border-foreground/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
          <GraduationCap size={20} />
        </div>
        <div>
          <h3 className="text-xl font-serif font-black text-foreground tracking-tight uppercase">AI-Generated Mastery Path</h3>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">Strategic clinical intelligence sequence</p>
        </div>
      </div>

      <div className="glass-card rounded-[32px] p-8 border-surface bg-gradient-to-br from-[#00356B]/10 to-transparent">
        <div className="mb-8">
          <h4 className="text-lg font-serif font-black text-blue-400 uppercase tracking-tight mb-1">{path.title}</h4>
          <p className="text-xs text-muted-foreground font-medium italic opacity-80">{path.subtitle}</p>
        </div>

        <div className="relative space-y-4">
          {/* Vertical joining line */}
          <div className="absolute left-[21px] top-6 bottom-6 w-px bg-gradient-to-b from-blue-500/30 via-blue-500/10 to-transparent" />
          
          {path.lessons.map((lesson: any, index: number) => {
            const Icon = IconMap[lesson.contentType] || BookOpen;
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => !lesson.isLocked && onLessonClick?.(lesson)}
                className={`relative flex gap-6 group cursor-pointer ${lesson.isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="relative z-10">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    lesson.isCompleted 
                      ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : lesson.isLocked 
                        ? 'bg-slate-900 border-foreground/10 text-muted-foreground' 
                        : 'bg-[#00356B] border-blue-400/50 text-foreground shadow-[0_0_20px_rgba(0,53,107,0.4)] group-hover:scale-110'
                  }`}>
                    {lesson.isCompleted ? <CheckCircle2 size={18} /> : lesson.isLocked ? <Lock size={16} /> : <Icon size={18} />}
                  </div>
                </div>

                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500/60 leading-none">Step {index + 1}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-foreground/5 ${
                      lesson.contentType === 'guideline' ? 'bg-amber-500/10 text-amber-500' :
                      lesson.contentType === 'meta-analysis' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {lesson.contentType}
                    </span>
                  </div>
                  <h5 className="text-sm font-serif font-bold text-foreground group-hover:text-blue-400 transition-colors uppercase tracking-tight">{lesson.title}</h5>
                  <p className="text-[11px] text-muted-foreground font-medium opacity-70 mt-1 leading-relaxed line-clamp-2">{lesson.description}</p>
                </div>

                {!lesson.isLocked && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-muted-foreground group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all cursor-pointer">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
