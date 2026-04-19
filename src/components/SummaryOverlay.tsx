import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Clock, Tag } from 'lucide-react';
import { NewsItem } from '../data/news';

interface SummaryOverlayProps {
  news: NewsItem | null;
  onClose: () => void;
}

export const SummaryOverlay: React.FC<SummaryOverlayProps> = ({ news, onClose }) => {
  if (!news) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        className="fixed inset-0 z-[60] bg-background flex flex-col"
      >
        {/* Upper UI - Header */}
        <header className="flex-none px-6 py-8 border-b border-surface">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-surface-subtle hover:bg-surface flex items-center justify-center transition-colors text-foreground"
            >
              <X size={20} />
            </button>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">News Summary</span>
          </div>
          <h1 className="text-3xl font-serif font-black tracking-tight text-foreground">
            {news.title}
          </h1>
        </header>

        {/* Lower UI - Summary Content */}
        <div className="flex-1 overflow-y-auto w-full h-full no-scrollbar px-6 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 text-muted-foreground text-xs font-medium mb-6">
              <span className="flex items-center gap-1.5"><Clock size={14} /> {news.publishDate}</span>
              <span className="flex items-center gap-1.5"><Tag size={14} /> {news.specialty}</span>
            </div>
            
            <div className="prose prose-invert prose-lg">
              <p className="text-xl text-foreground font-medium leading-relaxed">
                {news.summary}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
