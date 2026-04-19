import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Paper, Course, LearningPath, UserProfile } from '../types';
import { SPECIALTIES, USER_STATS, COURSES, CATEGORIES, LEARNING_PATHS } from '../constants';
import { Flame, BookOpen, Target, Trophy, Play, Bookmark, ChevronRight, GraduationCap, Brain, Zap, Bell, Rocket, Globe, Loader2, Sparkles, BarChart, FileText, Activity, ClipboardList, Files, Book } from 'lucide-react';
import ShinyButton from './ui/shiny-button';
import { MedicalBookCover } from './MedicalBookCover';
import { articleService, LiveArticle } from '../services/articleService';
import { ScrollButton } from './ui/ScrollButton';

import { getImageUrl } from '../utils/imageUtils';

interface HomeProps {
  onPaperClick: (paper: Paper) => void;
  userProfile: UserProfile | null;
  onArticlesLoaded?: (articles: Paper[]) => void;
  onCategoryClick?: (category: { id: string, name: string }) => void;
}

const mapLiveArticleToPaper = (article: LiveArticle): Paper => {
  const isGuideline = article.title.toLowerCase().includes('guideline') || 
                     article.journal.toLowerCase().includes('guideline') ||
                     article.title.toLowerCase().includes('consensus');

  return {
    id: article.pmid,
    pmid: article.pmid,
    pmcid: article.pmcid,
    doi: article.doi,
    title: article.title,
    description: article.clinical_significance || article.abstract_summary || article.abstract || "Analyzing clinical data...",
    fullContent: article.abstract,
    specialtyId: 'cardiology',
    passedExam: false,
    date: article.publicationDate,
    authors: article.authors,
    imageUrl: getImageUrl(article.title, article.pmid, 'cover'),
    generatedIllustrationUrl: getImageUrl(article.title, article.pmid, 'illustration'),
    readTime: '8 min',
    journal: article.journal,
    contentType: isGuideline ? 'guideline' : 'article',
    clinicalWeight: article.impact_score || 50,
    clinical_significance: article.clinical_significance,
    masteryLevel: 'unread',
    bookCover: {
      title: article.title,
      subtitle: article.journal,
      edition: 2024,
      keyPoints: article.key_takeaways || ["Clinical insights pending..."],
      primaryColor: isGuideline ? '#00356B' : '#3b82f6',
    },
    // Guideline Central Specifics
    sourceUrl: article.doi ? `https://doi.org/${article.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
    summaryPoints: article.key_takeaways || [],
    organization: article.journal,
    lastUpdated: article.publicationDate,
    recommendationGrade: 'A', // Defaulting for visual representation
  };
};

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-[50vw] lg:w-[200px] snap-center flex flex-col space-y-3">
    <div className="relative aspect-[3/4] rounded-xl lg:rounded-2xl overflow-hidden bg-foreground/5 animate-pulse border border-foreground/5">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
    <div className="space-y-2 px-1">
      <div className="h-3 bg-foreground/5 rounded w-3/4 animate-pulse" />
      <div className="h-2 bg-foreground/5 rounded w-1/2 animate-pulse" />
    </div>
  </div>
);

const IconMap: Record<string, any> = {
  Brain,
  Zap,
  Rocket,
  Globe,
  BarChart,
  FileText,
  Activity,
  ClipboardList,
  Files,
  Book
};

const ContributionGraph = () => {
  const rows = 3;
  const cols = 28;
  return (
    <div className="flex gap-1 mt-3 opacity-80 overflow-hidden">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1">
          {Array.from({ length: rows }).map((_, j) => {
            // GitHub-style varied intensity
            const levels = [0.05, 0.1, 0.2, 0.4, 0.7, 0.9];
            const level = levels[Math.floor(Math.random() * levels.length)];
            return (
              <div 
                key={j} 
                className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-[1px]" 
                style={{ 
                  backgroundColor: `rgba(59, 130, 246, ${level})` 
                }} 
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const Home: React.FC<HomeProps> = ({ onPaperClick, userProfile, onArticlesLoaded, onCategoryClick }) => {
  const [activeSpecialty, setActiveSpecialty] = useState(userProfile?.specialty || 'Cardiology');
  const [liveArticles, setLiveArticles] = useState<Paper[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const pubmedScrollRef = useRef<HTMLDivElement>(null);
  const pickScrollRef = useRef<HTMLDivElement>(null);

  const scrollPubMed = (direction: 'left' | 'right') => {
    if (pubmedScrollRef.current) {
      const scrollAmount = 400;
      pubmedScrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollPick = (direction: 'left' | 'right') => {
    if (pickScrollRef.current) {
      const scrollAmount = 400;
      pickScrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch Live Feed first
      setIsLoadingLive(true);
      try {
        const articles = await articleService.getLiveFeed(activeSpecialty.toLowerCase(), 12);
        const mapped = articles.map(mapLiveArticleToPaper);
        setLiveArticles(mapped);
        if (onArticlesLoaded) onArticlesLoaded(mapped);
      } catch (err) {
        console.error('Error fetching live feed:', err);
      } finally {
        setIsLoadingLive(false);
      }
    };

    fetchAllData();
  }, [activeSpecialty]);

  const handleFeaturePaper = (paper: Paper) => {
    // 1. Move the clicked paper to the front of liveArticles
    const newArticles = [paper, ...liveArticles.filter(a => a.id !== paper.id)];
    setLiveArticles(newArticles);
    
    // 2. Trigger the primary click handler (opens modal)
    onPaperClick(paper);
  };

  const featuredPapers: Paper[] = [];
  const continueReading: Paper[] = [];
  const todaysPicks = liveArticles.slice(3, 6);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 no-scrollbar">
      {/* Professional Academic Header - Integrated and Minimalist */}
      <header className="px-6 pt-6 pb-2 lg:pb-8 mb-0 relative overflow-hidden">
        {/* Background Atmospheric Glows */}
        <div className="absolute top-0 right-0 w-[40%] h-full bg-blue-500/5 blur-[120px] -z-10" />
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/5 blur-[80px] -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="flex flex-col items-start gap-4">
            {/* Logo Branding - Only visible on mobile */}
            <div className="flex lg:hidden items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-[#00356B] blur-2xl opacity-20" />
                <img 
                  src="https://framerusercontent.com/images/YPAzIjoMNrFadoMFFkX13J0nXrs.png?scale-down-to=512&width=3432&height=3432"
                  alt="Brand Logo" 
                  className="relative w-14 h-14 object-contain transition-transform duration-500 hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-[#00356B] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] brightness-125">Anzar Academy</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Medical Intelligence Hub</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] shadow-sm">Academic Portal</span>
                <span className="w-px h-3 bg-foreground/10" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Session Active</span>
              </div>
              
              <h1 className="text-4xl lg:text-7xl font-serif font-black text-foreground tracking-tighter leading-none">
                Welcome, <span className="text-blue-500">Dr. {userProfile?.name?.split(' ')[0] || 'User'}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/[0.03] shadow-sm transition-colors hover:bg-foreground/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                  <span className="text-[10px] lg:text-xs text-muted-foreground font-bold uppercase tracking-widest leading-none">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground font-medium italic opacity-50 max-w-sm hidden md:block border-l border-foreground/10 pl-4 leading-relaxed">
                  "Advancing clinical knowledge through AI-powered bibliographic intelligence."
                </p>
              </div>
            </div>
          </div>

          {/* Right side stats - Desktop only */}
          <div className="hidden lg:flex items-center gap-12 pr-4 mb-2">
            <div className="text-right group cursor-default">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1 group-hover:text-blue-500 transition-colors">Publications Read</p>
              <p className="text-3xl font-serif font-black text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] shadow-foreground/5">{userProfile?.readPaperIds?.length || 0}</p>
            </div>
            <div className="w-px h-12 bg-foreground/5" />
            <div className="text-right group cursor-default">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1 group-hover:text-blue-500 transition-colors">Impact Score</p>
              <p className="text-3xl font-serif font-black text-blue-500 tracking-tight drop-shadow-[0_0_12px_rgba(59,130,246,0.25)]">{userProfile?.impactScore ? (userProfile.impactScore >= 1000 ? `${(userProfile.impactScore / 1000).toFixed(1)}k` : userProfile.impactScore) : '0'}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Section (Moved Up) */}
      <section className="mt-2 mb-8 lg:mb-10 lg:px-6">
        <div className="px-6 lg:px-0 mb-4">
          <h2 className="text-2xl font-serif font-black text-foreground tracking-tight">Categories</h2>
          <p className="text-[10px] text-muted-foreground font-medium italic uppercase tracking-[0.2em] opacity-80">Browse by clinical document type</p>
        </div>
        <div className="px-6 lg:px-0 grid grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = IconMap[cat.icon] || Brain;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -2 }}
                onClick={() => onCategoryClick?.({ id: cat.id, name: cat.name })}
                className="flex items-center gap-4 p-4 rounded-xl lg:rounded-2xl bg-foreground/5 border border-transparent hover:bg-foreground/10 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-left group"
              >
                <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-inner flex-shrink-0">
                  <Icon size={20} className="lg:w-[18px] lg:h-[18px]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm lg:text-xs font-bold text-foreground group-hover:text-blue-400 transition-colors leading-tight">{cat.name}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Live PubMed Feed Hero Section (Moved Down) */}
      <section className="px-6 mb-10 relative group/hero overflow-hidden">
        <div className="mb-6 flex items-end justify-between">
          <div className="w-full">
            <div className="flex flex-col gap-1 mb-4">
              <h2 className="text-2xl font-serif font-black text-foreground tracking-tight">Recent Publications</h2>
              <div className="px-2 py-0.5 rounded-full bg-[#00356B]/15 border border-[#00356B]/30 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,53,107,0.1)] w-max">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00356B] animate-pulse shadow-[0_0_8px_rgba(0,53,107,0.5)]" />
                <span className="text-[10px] font-black text-[#00356B] uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] brightness-125">Real-Time Feed</span>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 mt-6 w-full">
              <div className="flex items-center gap-4 flex-1 min-w-0 w-full overflow-hidden">
                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Specialties</span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
                  {SPECIALTIES.map((spec) => (
                    <button
                      key={spec.id}
                      onClick={() => setActiveSpecialty(spec.name)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                        activeSpecialty.toLowerCase() === spec.id
                          ? 'bg-[#00356B] dark:bg-blue-600 border-transparent text-white shadow-lg dark:shadow-blue-500/30'
                          : 'bg-foreground/40 dark:bg-foreground/[0.03] border-black/5 dark:border-foreground/5 text-muted-foreground hover:bg-white dark:hover:bg-foreground/[0.08] hover:border-blue-500/30 hover:text-blue-500 dark:hover:text-blue-400'
                      }`}
                    >
                      {spec.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group/search w-full lg:w-48 flex-shrink-0">
                <input 
                  type="text"
                  placeholder="Universal Search..."
                  className="bg-foreground/40 dark:bg-foreground/[0.03] border border-black/5 dark:border-foreground/5 rounded-full px-4 py-1.5 pl-9 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/50 w-full transition-all text-foreground placeholder:text-muted-foreground/40"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const query = (e.currentTarget as HTMLInputElement).value;
                      if (query) {
                        setIsLoadingLive(true);
                        articleService.getLiveFeed(query, 10).then(articles => {
                          setLiveArticles(articles.map(mapLiveArticleToPaper));
                          setIsLoadingLive(false);
                        });
                      }
                    }
                  }}
                />
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within/search:text-[#00356B] transition-colors" size={12} />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Live Paper (Hero) */}
        <div className="relative min-h-[300px] lg:min-h-[400px]">
          {isLoadingLive ? (
            <div className="glass-card rounded-[32px] aspect-[16/9] lg:aspect-[3/1] animate-pulse bg-foreground/5 overflow-hidden flex flex-col items-center justify-center border border-foreground/5 gap-4">
              <Loader2 className="animate-spin text-blue-500/40" size={40} />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse">Accessing NIH Hub...</p>
            </div>
          ) : liveArticles.length > 0 ? (
            <div className="space-y-6">
              {/* Massive Hero Card for the latest paper */}
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={liveArticles[0].id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onClick={() => onPaperClick(liveArticles[0])}
                  className="glass-card rounded-[32px] p-6 lg:p-10 relative overflow-hidden bg-gradient-to-br from-[#00356B]/20 via-transparent to-transparent border-surface group cursor-pointer shadow-[0_30px_100px_rgba(0,0,0,0.5)] transition-all duration-700 hover:shadow-blue-500/20"
                >
                  <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-[#00356B]/10 to-transparent pointer-events-none" />
                  <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
                    <div className="w-40 lg:w-56 flex-shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-700">
                      <MedicalBookCover paper={liveArticles[0]} />
                    </div>
                    <div className="flex-1 text-center lg:text-left space-y-4">
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                        <span className="px-3 py-1 rounded-full bg-[#00356B]/30 text-[#00356B] text-[10px] font-black uppercase tracking-widest border border-[#00356B]/30 shadow-[0_0_20px_rgba(0,53,107,0.2)] drop-shadow-[0_0_1px_rgba(255,255,255,0.2)]">Featured Insight</span>
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-none">{liveArticles[0].journal} • {liveArticles[0].date}</span>
                      </div>
                      <h3 className="text-2xl lg:text-4xl font-serif font-black text-foreground leading-tight group-hover:text-blue-400 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 uppercase tracking-tight">{liveArticles[0].title}</h3>
                      <p className="text-muted-foreground text-sm lg:text-base line-clamp-2 max-w-2xl opacity-80">{liveArticles[0].description}</p>
                      <div className="pt-4 flex items-center justify-center lg:justify-start">
                        <ShinyButton className="px-8 h-12 rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                          <BookOpen size={16} strokeWidth={3} />
                          Start Reading
                        </ShinyButton>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Smaller Horizontal Scroll for the rest of live feed */}
              <div className="relative px-2 overflow-hidden py-2">
                <div 
                  ref={pubmedScrollRef}
                  className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory touch-pan-x"
                >
                  {isLoadingLive ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {liveArticles.slice(1).map((paper) => (
                        <motion.div 
                          key={paper.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={{ y: -8 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleFeaturePaper(paper)}
                          className="flex-shrink-0 w-[50vw] lg:w-[200px] cursor-pointer snap-center group"
                        >
                          <div className="relative aspect-[3/4] rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-blue-500/30">
                            <MedicalBookCover paper={paper} />
                            <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity" />
                            {paper.pmcid && (
                              <div className="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-sm border border-emerald-400/30 flex items-center gap-1 shadow-lg">
                                <Globe size={8} className="text-foreground" />
                                <span className="text-[7px] font-black text-foreground uppercase tracking-tighter">Open</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 px-1">
                            <h4 className="text-[11px] font-serif font-bold text-foreground line-clamp-1 group-hover:text-blue-500 transition-colors tracking-tight uppercase">{paper.title}</h4>
                            <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 truncate">{paper.journal}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
                {/* Scroll Buttons for horizontal part */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover/hero:opacity-100 transition-opacity hidden lg:block rotate-180">
                  <ScrollButton onClick={() => scrollPubMed('left')} />
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover/hero:opacity-100 transition-opacity hidden lg:block">
                  <ScrollButton onClick={() => scrollPubMed('right')} />
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-[32px] p-12 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500/40" size={32} />
              </div>
              <p className="text-muted-foreground font-medium">Listening to PubMed servers...</p>
            </div>
          )}
        </div>
      </section>



      {/* Continue Reading */}
      {continueReading.length > 0 && (
        <section className="mb-8 lg:mb-10">
          <div className="px-6 mb-4 flex justify-between items-center">
            <h3 className="text-base lg:text-lg font-serif font-black text-foreground">Continue Reading</h3>
            <button className="text-blue-500 text-[10px] lg:text-xs font-bold flex items-center gap-1">
              History <ChevronRight size={12} className="lg:w-[14px] lg:h-[14px]" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-6 pb-4 -mb-4 no-scrollbar snap-x snap-mandatory touch-pan-x">
            {continueReading.map((paper: Paper) => (
              <motion.div 
                key={paper.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPaperClick(paper)}
                className="flex-shrink-0 w-32 lg:w-40 cursor-pointer snap-center"
              >
                <div className="relative shadow-xl">
                  <MedicalBookCover paper={paper} />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-subtle">
                    <div className="h-full bg-[#00356B] w-2/3" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Today's Picks List */}
      {todaysPicks.length > 0 && (
        <section className="px-6">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-base lg:text-lg font-serif font-black text-foreground">Curated for You</h3>
          </div>
          <div className="space-y-3 lg:space-y-4">
            {todaysPicks.map((paper: Paper) => (
              <motion.div 
                key={paper.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPaperClick(paper)}
                className="rounded-lg lg:rounded-2xl p-3 lg:p-4 flex gap-4 cursor-pointer bg-surface-subtle border border-transparent hover:border-black/5 dark:hover:border-foreground/5 transition-colors shadow-sm"
              >
                <div className="w-16 h-16 lg:w-20 lg:h-20 overflow-hidden flex-shrink-0">
                    <MedicalBookCover paper={paper} className="scale-[1] origin-left" />
                </div>
                <div className="flex-1 py-0.5 flex flex-col justify-center">
                  <p className="text-[9px] lg:text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5 lg:mb-1">
                    {SPECIALTIES.find(s => s.id === paper.specialtyId)?.name}
                  </p>
                  <h4 className="text-sm font-serif font-bold text-slate-900 dark:text-foreground line-clamp-1">{paper.title}</h4>
                  <div className="text-[9px] lg:text-[10px] text-slate-500 dark:text-muted-foreground font-bold uppercase tracking-widest mt-1">
                    <span>{paper.readTime} read</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
