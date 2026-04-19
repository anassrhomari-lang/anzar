import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Search, X, ChevronRight, Clock, Tag, BookOpenText } from 'lucide-react';
import { HEALIO_NEWS, NewsItem } from '../data/news';
import { SummaryOverlay } from './SummaryOverlay';

interface LatestNewsViewProps {
  onClose: () => void;
}

export const LatestNewsView: React.FC<LatestNewsViewProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSummary, setSelectedSummary] = useState<NewsItem | null>(null);
  
  const filteredNews = HEALIO_NEWS.filter(news => 
    news.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    news.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Newspaper size={24} className="text-blue-500" />
              Latest Medical News
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                Live Feed
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Powered by Healio</span>
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
            placeholder="Search news, topics, or specialties..."
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
          {filteredNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <Newspaper className="w-16 h-16 text-foreground/20 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No news found</h3>
              <p className="text-sm text-foreground/50 max-w-sm">No recent news matches your query. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNews.map((news) => (
                <div 
                  key={news.id}
                  className="group relative rounded-3xl border border-transparent bg-foreground/[0.02] overflow-hidden flex flex-col hover:bg-foreground/[0.05] hover:border-foreground/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5"
                >
                  <div className="w-full aspect-[16/9] relative overflow-hidden bg-gradient-to-b from-white/5 to-white/[0.01] flex flex-col items-center justify-center">
                    <a 
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-full"
                    >
                      <img 
                        src={news.imageUrl} 
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out opacity-80 mix-blend-screen"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </a>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
                    
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                      <span className="px-3 py-1.5 rounded-md bg-blue-500/90 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest shadow-xl">
                        {news.specialty}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-foreground/90 text-[10px] uppercase font-black tracking-widest drop-shadow-md">
                      <Clock size={12} className="text-blue-400" />
                      {news.publishDate}
                      <span className="opacity-50 mx-1">•</span>
                      {news.source}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col relative z-10 bg-background text-left">
                    <h3 className="text-xl font-serif font-black text-foreground group-hover:text-blue-400 transition-colors mb-3 leading-tight tracking-tight">
                      {news.title}
                    </h3>
                    <p className="text-xs lg:text-sm text-foreground/70 font-medium leading-relaxed mb-6 line-clamp-3 lg:line-clamp-4 italic border-l-2 border-blue-500/30 pl-4 py-1">
                      <em>{news.summary}</em>
                    </p>
                    
                    <div className="mt-auto flex flex-wrap items-center gap-3">
                      <div className="flex flex-wrap gap-2">
                        {news.tags.map(tag => (
                          <span key={tag} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-surface text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <Tag size={10} /> {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex w-full items-center gap-2 mt-2">
                        <button
                          onClick={() => setSelectedSummary(news)}
                          className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface text-muted-foreground hover:text-foreground hover:border-surface-active transition-all active:scale-95"
                        >
                          <BookOpenText size={18} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Summarize</span>
                        </button>
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-[2] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-sm active:scale-95 text-xs font-black uppercase tracking-widest"
                        >
                          Read Post
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <SummaryOverlay news={selectedSummary} onClose={() => setSelectedSummary(null)} />
    </motion.div>
  );
};
