import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Paper, UserProfile, LearningPath } from '../types';
import { SPECIALTIES, MOCK_PAPERS } from '../constants';
import { X, User, BookOpen, CheckCircle2, Bookmark, Share2, Brain, ChevronDown, ExternalLink, Play, Pause, GraduationCap, ArrowLeft, Upload, Star, MessageSquare, Download, ChevronRight, Quote, Zap, Trophy, RotateCcw, FastForward, Loader2, Globe, Headset, AlertCircle, FileText, Heart, Volume2, VolumeX } from 'lucide-react';
import { MedicalBookCover } from './MedicalBookCover';
import { RelatedPathView } from './RelatedPathView';
import ShinyButton from './ui/shiny-button';
import { ttsService } from '../services/ttsService';
import { articleService } from '../services/articleService';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getImageUrl } from '../utils/imageUtils';

import { CommentsSection } from './CommentsSection';

interface PaperCardProps {
  paper: Paper | null;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onPaperSelect?: (paper: Paper) => void;
  onArticlesLoaded?: (articles: Paper[]) => void;
}

type DetailTab = 'info' | 'findings' | 'authors' | 'fulltext' | 'path';

const StructuredOverview = ({ paper }: { paper: Paper }) => {
  const parseDescription = (desc: string) => {
    if (!desc) return null;
    
    // Look for capitalized headers followed by colon
    const regex = /(?:^|\n|\s)([A-Z]+(?:\s[A-Z]+)*?):/g;
    const matches = Array.from(desc.matchAll(regex));
    
    if (matches.length > 0 && matches[0].index !== undefined) {
      const parts: {header: string, content: string}[] = [];
      let lastIndex = 0;
      let currentHeader = "ABSTRACT";
      
      matches.forEach((match) => {
        const textBefore = desc.substring(lastIndex, match.index).trim();
        if (textBefore && lastIndex > 0) {
           parts.push({ header: currentHeader, content: textBefore });
        } else if (textBefore && lastIndex === 0) {
           parts.push({ header: currentHeader, content: textBefore });
        }
        currentHeader = match[1].trim(); 
        lastIndex = match.index! + match[0].length;
      });
      
      const remaining = desc.substring(lastIndex).trim();
      if (remaining) {
        parts.push({ header: currentHeader, content: remaining });
      }
      
      if (parts.length > 0) {
        return (
          <div className="space-y-8">
            {parts.map((p, i) => (
              <div key={i} className="space-y-3">
                <h4 className="text-[12px] font-black tracking-[0.2em] text-blue-400 uppercase">{p.header}</h4>
                <p className="text-[15px] sm:text-base text-foreground/80 leading-relaxed font-light">{p.content}</p>
              </div>
            ))}
          </div>
        );
      }
    }
    
    // Fallback if no structured headers
    return (
      <p className="text-[15px] sm:text-base text-foreground/80 leading-relaxed font-light">
        {desc}
      </p>
    );
  };

  return (
    <div className="space-y-10 pb-4">
      {parseDescription(paper.description)}
      
      {(paper.targetPopulation || (paper.interventions && paper.interventions.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paper.targetPopulation && (
            <div className="glass-card rounded-[24px] p-6 bg-foreground/[0.02] border-foreground/5 space-y-3">
              <h4 className="text-[11px] font-black tracking-widest text-foreground/40 uppercase mb-1">Target Population</h4>
              <p className="text-[14px] sm:text-[15px] text-foreground/90 font-light leading-relaxed">{paper.targetPopulation}</p>
            </div>
          )}
          {paper.interventions && paper.interventions.length > 0 && (
            <div className="glass-card rounded-[24px] p-6 bg-foreground/[0.02] border-foreground/5 space-y-3">
              <h4 className="text-[11px] font-black tracking-widest text-foreground/40 uppercase mb-1">Key Interventions</h4>
              <ul className="space-y-2">
                {paper.interventions.map((int, idx) => (
                  <li key={idx} className="text-[14px] text-foreground/80 flex items-start gap-2 leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 opacity-50" />
                    <span>{int}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {paper.clinical_significance && (
        <div className="glass-card rounded-[24px] p-8 bg-blue-500/[0.05] border-blue-500/10 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 text-blue-400 relative z-10">
            <Zap size={16} fill="currentColor" />
            <h4 className="text-[12px] font-black tracking-widest uppercase">Clinical Significance</h4>
          </div>
          <p className="text-[15px] sm:text-[16px] text-foreground/90 leading-relaxed font-light relative z-10">
             {paper.clinical_significance}
          </p>
        </div>
      )}

      {paper.summaryPoints && paper.summaryPoints.length > 0 && (
        <div className="glass-card rounded-[32px] p-8 bg-foreground/[0.02] border-foreground/5 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                 <CheckCircle2 size={20} />
               </div>
               <h4 className="text-lg font-serif font-bold text-foreground">Recommendations</h4>
            </div>
            {paper.recommendationGrade && (
              <span className="text-[11px] font-black tracking-widest text-emerald-400 border border-emerald-400/20 bg-emerald-500/10 px-4 py-1.5 rounded-full uppercase">
                Grade {paper.recommendationGrade}
              </span>
            )}
          </div>
          <ul className="space-y-4">
             {paper.summaryPoints.map((pt, i) => (
               <li key={i} className="flex gap-4 text-[14px] sm:text-[15px] text-foreground/70 leading-relaxed">
                 <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                   {i + 1}
                 </span>
                 <span>{pt}</span>
               </li>
             ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const PaperCard: React.FC<PaperCardProps> = ({ paper, onClose, userProfile, onPaperSelect, onArticlesLoaded }) => {
  const [view, setView] = useState<'details' | 'quiz'>('details');
  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const [relatedPath, setRelatedPath] = useState<LearningPath | null>(null);
  const [isLoadingPath, setIsLoadingPath] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLearningOpen, setIsLearningOpen] = useState(false);
  
  const [isAudiobookListened, setIsAudiobookListened] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (userProfile?.savedPaperIds && paper) {
      setIsSaved(userProfile.savedPaperIds.includes(paper.id));
    }
  }, [userProfile?.savedPaperIds, paper?.id]);

  const handleSaveToLibrary = async () => {
    if (!auth.currentUser || !paper || !userProfile) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const savedIds = userProfile.savedPaperIds || [];
      let newIds;
      if (isSaved) {
        newIds = savedIds.filter(id => id !== paper.id);
      } else {
        newIds = [...savedIds, paper.id];
      }
      
      await updateDoc(userRef, { savedPaperIds: newIds });
      setIsSaved(!isSaved);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };
  const [fullText, setFullText] = useState<string>("");
  const [sections, setSections] = useState<{title: string, content: string}[]>([]);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [showGoToTop, setShowGoToTop] = useState(false);
  const [showMobileVolume, setShowMobileVolume] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'loading' | 'success' | 'fallback'>('idle');
  const [loadingStep, setLoadingStep] = useState<string>("Analyzing databases...");
  
  // Audiobook States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (paper) {
      setRelatedPath(null);
      setIsLoadingPath(true);
      articleService.generateRelatedPath(paper).then(path => {
        setRelatedPath(path);
        setIsLoadingPath(false);
        
        // If real articles were found in the path, notify the parent
        if (path && onArticlesLoaded) {
          const newArticles = path.lessons
            .map((l: any) => l.article)
            .filter(Boolean)
            .map((a: any) => ({
              id: a.pmid,
              pmid: a.pmid,
              pmcid: a.pmcid,
              doi: a.doi,
              title: a.title,
              description: a.clinical_significance || a.abstract_summary || a.abstract || "Analyzing clinical data...",
              fullContent: a.abstract,
              specialtyId: paper.specialtyId,
              passedExam: false,
              date: a.publicationDate,
              authors: a.authors,
              imageUrl: getImageUrl(a.title, a.pmid, 'cover'),
              generatedIllustrationUrl: getImageUrl(a.title, a.pmid, 'illustration'),
              readTime: '8 min',
              journal: a.journal,
              contentType: 'article',
              clinicalWeight: a.impact_score || 50,
              clinical_significance: a.clinical_significance,
              masteryLevel: 'unread',
              bookCover: {
                title: a.title,
                subtitle: a.journal,
                edition: 2024,
                keyPoints: a.key_takeaways || ["Clinical insights pending..."],
                primaryColor: '#3b82f6',
              }
            } as Paper));
          
          if (newArticles.length > 0) {
            onArticlesLoaded(newArticles);
          }
        }
      });
    }
  }, [paper?.id]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audiobookParts, setAudiobookParts] = useState<string[]>([]);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [partErrors, setPartErrors] = useState<Record<number, boolean>>({});
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const specialty = paper ? SPECIALTIES.find((s) => s.id === paper.specialtyId) : null;
  const relatedPapers = paper ? MOCK_PAPERS.filter(p => p.specialtyId === paper.specialtyId && p.id !== paper.id).slice(0, 6) : [];

  useEffect(() => {
    if (paper) {
      // Reset states for new paper
      setView('details');
      setActiveTab('info');
      setAudiobookParts([]);
      setCurrentPartIndex(0);
      setPartErrors({});
      setProgress(0);
      setCurrentTime(0);
      setIsPlaying(false);
      setFullText("");
      setIsAudiobookListened(false);
      setExtractionStatus('loading');
      setLoadingStep("Connecting to PubMed Central...");
      
      // Initialize with fallback sections immediately so it's never empty
      const initialDesc = paper.fullContent || paper.description || "";
      setSections([
        { title: "Executive Summary", content: initialDesc },
        { title: "Clinical Insights", content: paper.clinical_significance || "Analyzing clinical data..." }
      ]);
      
      // Auto-switch to overview for better engagement
      setActiveTab('info');

      setIsPreparing(true);
      const prepareParts = async () => {
        try {
          // Priority: extracted PMC > fullContent > description
          let text = paper.fullContent || paper.description || "";
          let extractedSections: {title: string, content: string}[] = [];

          if (paper.pmcid) {
            try {
              setLoadingStep("Fetching BioC structured data...");
              console.log(`[Reader] Fetching full text for PMC${paper.pmcid}...`);
              const pmcData = await articleService.getFullText(paper.pmcid);
              
              if (pmcData) {
                // BioC JSON can be an array or an object with 'documents'
                const docs = Array.isArray(pmcData) ? pmcData : (pmcData.documents || [pmcData]);
                
                if (Array.isArray(docs)) {
                  const passages = docs.flatMap((doc: any) => doc.passages || []);
                  
                  if (passages.length > 0) {
                    let currentSection = "Front Matter";
                    let currentContent: string[] = [];

                    passages.forEach((p: any) => {
                      const textStr = (p.text || "").trim();
                      if (!textStr) return;

                      const infons = p.infons || {};
                      const type = (infons['section_type'] || infons['type'] || "").toLowerCase();
                      
                      // Identify true structure headers, avoid treating refs/lists as headers
                      const isTitleOrHeading = type === 'title' || type === 'heading';
                      
                      // Sometimes 'section_type' is useful like 'INTRO', 'METHODS', 'RESULTS', 'CONCL', 'REF'
                      const isRef = type === 'ref' || type.includes('reference');
                      const isList = type === 'list' || type.includes('item');

                      // Fallback heading detection for poorly structured BioC
                      const looksLikeHeading = !isTitleOrHeading && !isRef && !isList && 
                        textStr.length > 2 && textStr.length < 100 && !textStr.includes('. ') && 
                        /^(Abstract|Introduction|Background|Methods|Materials|Results|Discussion|Conclusion|Limitations|Acknowledgements|References)$/i.test(textStr);

                      if (isTitleOrHeading || looksLikeHeading) {
                        // Avoid pushing empty sections or treating figure captions as new main sections
                        if (currentContent.length > 0 && textStr.length < 150) {
                          extractedSections.push({
                            title: currentSection,
                            content: currentContent.join('\n\n')
                          });
                          currentSection = textStr;
                          currentContent = [];
                        } else if (currentContent.length === 0) {
                          // Just update the title if we haven't added content yet
                          currentSection = textStr;
                        }
                      } else {
                        // Prefix references with bullet points
                        if (isRef) {
                          currentContent.push(`• ${textStr}`);
                        } else {
                          currentContent.push(textStr);
                        }
                      }
                    });

                    if (currentContent.length > 0) {
                      extractedSections.push({
                        title: currentSection,
                        content: currentContent.join('\n\n')
                      });
                    }

                    const allText = extractedSections.map(s => `[${s.title.toUpperCase()}]\n${s.content}`).join('\n\n');
                    
                    // If content is too short, BioC might be restricted. Try smart PDF extraction.
                    if (allText.length < 500) {
                      setLoadingStep("Bypassing paywall via PDF Smart Extraction...");
                      console.log("[Reader] BioC content too short, trying smart PDF extraction...");
                      const pdfData = await articleService.getPdfData(paper.pmcid);
                      if (pdfData?.base64) {
                        setLoadingStep("AI is digitizing full PDF manuscript...");
                        const aiSections = await articleService.extractTextFromPdf(pdfData.base64);
                        if (aiSections && aiSections.length > 0) {
                          setSections(aiSections);
                          text = aiSections.map(s => `[${s.title.toUpperCase()}]\n${s.content}`).join('\n\n');
                          setExtractionStatus('success');
                        } else {
                          setExtractionStatus('fallback');
                        }
                      } else {
                        setExtractionStatus('fallback');
                      }
                    } else {
                      text = allText;
                      setSections(extractedSections);
                      setExtractionStatus('success');
                    }
                  } else {
                    // Try PDF fallback even if passages is empty
                    const pdfData = await articleService.getPdfData(paper.pmcid);
                    if (pdfData?.base64) {
                      const aiSections = await articleService.extractTextFromPdf(pdfData.base64);
                      if (aiSections && aiSections.length > 0) {
                        setSections(aiSections);
                        text = aiSections.map(s => `[${s.title.toUpperCase()}]\n${s.content}`).join('\n\n');
                        setExtractionStatus('success');
                      } else {
                        setExtractionStatus('fallback');
                      }
                    } else {
                      setExtractionStatus('fallback');
                    }
                  }
                }
              }
            } catch (e) {
              console.error("[Reader] PMC fetch failed:", e);
              setExtractionStatus('fallback');
            }
          } else {
            setExtractionStatus('fallback');
          }
          
          setFullText(text);
          
          const sentences = text.split(/(?<=[.!?])\s+|\n+/).filter(s => s.trim().length > 0);
          const chunks: string[] = [];
          let currentChunk = "";
          const MAX_CHUNK_LENGTH = 1500; 

          sentences.forEach(sentence => {
            if ((currentChunk + sentence).length > MAX_CHUNK_LENGTH && currentChunk.length > 0) {
              chunks.push(currentChunk.trim());
              currentChunk = sentence;
            } else {
              currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
            }
          });
          if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
          }
          
          if (chunks.length === 0 && text.trim().length > 0) {
            chunks.push(text.trim());
          }
          
          setAudiobookParts(chunks);
        } catch (err) {
          console.error("[Audiobook] Preparation error:", err);
          setAudiobookParts([paper.description || "Content unavailable."]);
        } finally {
          setIsPreparing(false);
        }
      };
      prepareParts();
    }
  }, [paper]);

  const handleListenAudiobook = async (index: number = 0) => {
    if (audioRef.current && isPlaying && currentPartIndex === index) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current && audioRef.current.src && !isPlaying && currentPartIndex === index) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    setCurrentPartIndex(index);
    setPartErrors(prev => ({ ...prev, [index]: false }));
    try {
      if (!audiobookParts[index]) {
        throw new Error("Content for this part is missing.");
      }

      const audioBuffer = await ttsService.generateAudioChunk(audiobookParts[index], ttsService.voices.professional_male);

      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
        setIsAudiobookListened(true);
      }
    } catch (error: any) {
      console.error('Error generating audiobook part:', error);
      setPartErrors(prev => ({ ...prev, [index]: true }));
      let errorMessage = 'Failed to generate audio. ';
      if (error.message?.includes('500')) {
        errorMessage += 'The AI server is temporarily busy. Please try again in a moment.';
      } else if (error.message?.includes('429')) {
        errorMessage += 'Rate limit exceeded. Please wait a few seconds.';
      } else {
        errorMessage += 'Please try again.';
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartEnded = () => {
    const hasError = partErrors[currentPartIndex];
    setIsPlaying(false);
    
    // Only auto-advance if the current part finished successfully
    if (!hasError && currentPartIndex < audiobookParts.length - 1) {
      const nextIndex = currentPartIndex + 1;
      // Small delay to ensure state is settled before starting next part
      setTimeout(() => {
        // We check if the user hasn't manually started another part or paused
        // by checking if we are still on the "expected" next index transition
        handleListenAudiobook(nextIndex);
      }, 500);
    } else if (currentPartIndex === audiobookParts.length - 1) {
      setIsAudiobookListened(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(current);
      setDuration(dur);
      setProgress((current / dur) * 100);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFullTextScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const progress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    setReadingProgress(progress);

    if (target.scrollTop > 500) {
      setShowGoToTop(true);
    } else {
      setShowGoToTop(false);
    }

    if (activeTab === 'fulltext') {
      const sectionElements = target.querySelectorAll('[data-section-index]');
      let currentSectionIndex = activeSection;

      sectionElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Since the scrolling container's top is approx at viewport top,
        // sections with rect.top <= 400 are clearly taking up the top/middle space
        if (rect.top <= 400) {
          const index = parseInt(el.getAttribute('data-section-index') || '0');
          currentSectionIndex = index;
        }
      });
      if (currentSectionIndex !== activeSection) {
        setActiveSection(currentSectionIndex);
      }
    }
  };

  const scrollToTop = () => {
    const container = document.getElementById('paper-card-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: paper?.title,
        text: paper?.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSave = () => {
    handleSaveToLibrary();
  };

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
  };

  const resetQuiz = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setView('details');
  };

  if (!paper) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="paper-card-scroll-container"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-50 bg-background overflow-y-auto no-scrollbar scroll-smooth"
        onScroll={handleFullTextScroll}
      >
        {/* Top Navigation Bar - Simplified */}
        <div className="hidden lg:flex sticky top-0 z-50 px-4 lg:px-8 py-3 lg:py-4 justify-end items-center bg-background/80 backdrop-blur-xl border-b border-foreground/5">
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={handleSaveToLibrary}
              className={`flex items-center gap-2 px-5 h-10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isSaved ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-foreground/5 text-muted-foreground hover:bg-foreground/10 border border-foreground/10'}`}
            >
              <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
              {isSaved ? 'Saved in Library' : 'Save to Library'}
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 lg:py-12 pb-32 lg:pb-24">
          
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-[320px_1fr] gap-12 items-start mb-16">
            {/* Left: Portrait Image */}
            <div className="sticky top-28 space-y-6">
              <div className="relative aspect-[3/4] rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all duration-500 group">
                <MedicalBookCover paper={paper} noEffect={true} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px] pointer-events-none" />
                <button 
                  onClick={() => { onClose(); resetQuiz(); }}
                  className="absolute top-6 left-6 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-foreground hover:bg-black/60 transition-all hover:scale-110 active:scale-90 z-50"
                >
                  <ArrowLeft size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <audio
                  ref={audioRef}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handlePartEnded}
                  onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                  className="hidden"
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">E-Book Contents</h4>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{sections.length} Sections</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar relative">
                    {isPreparing && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-2 rounded-xl">
                        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Loading E-Book...</span>
                      </div>
                    )}
                    {sections.map((section, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveSection(idx);
                          setActiveTab('fulltext');
                        }}
                        className={`w-full h-12 rounded-xl border flex items-center justify-between px-4 transition-all ${activeSection === idx ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-foreground/5 border-foreground/5 text-foreground/70 hover:bg-foreground/10'}`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${activeSection === idx ? 'bg-blue-500 text-white' : 'bg-foreground/10 text-muted-foreground'}`}>
                            {idx + 1}
                          </div>
                          <span className="text-xs font-bold truncate">{section.title}</span>
                        </div>
                        <ChevronRight size={14} className={activeSection === idx ? 'opacity-100' : 'opacity-30'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audiobook Controls (Minimized) */}
                <div className="pt-4 border-t border-foreground/5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Audio Narration</h4>
                    {isPlaying && (
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => (
                          <motion.div
                            key={i}
                            animate={{ height: [4, 12, 4] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                            className="w-0.5 bg-blue-500"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleListenAudiobook(currentPartIndex)}
                    disabled={isLoading || isPreparing}
                    className={`w-full h-12 rounded-xl flex items-center justify-center gap-3 transition-all ${isPlaying ? 'bg-[#00356B] text-foreground shadow-lg shadow-blue-500/20' : 'bg-surface-subtle text-foreground/80 hover:bg-foreground/10 border border-surface'}`}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : isPlaying ? (
                      <Pause size={18} fill="currentColor" />
                    ) : (
                      <Play size={18} fill="currentColor" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {isPlaying ? 'Pause Narration' : 'Listen to E-Book'}
                    </span>
                  </button>
                </div>
                
                <button 
                  disabled={!isAudiobookListened}
                  onClick={() => setView('quiz')}
                  className={`w-full h-14 rounded-full text-base font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all duration-500 ${isAudiobookListened ? 'bg-foreground text-background shadow-2xl shadow-black/30 hover:scale-[1.02] active:scale-95' : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'}`}
                >
                  <GraduationCap size={20} />
                  Take a Quiz
                </button>
              </div>
            </div>

            {/* Right: Info/Fulltext Section */}
            <div className="space-y-10">
              <div id="desktop-tabs" className="flex gap-8 border-b border-surface overflow-x-auto no-scrollbar">
                {[
                  { id: 'info', label: 'Overview' },
                  { id: 'path', label: 'Mastery Path' },
                  { id: 'fulltext', label: 'E-Book Reader' },
                  { id: 'findings', label: 'Key Findings' },
                  { id: 'authors', label: 'Authors' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as DetailTab)}
                    className={`pb-3 text-sm font-serif font-bold transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div layoutId="desktop-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'info' && (
                  <motion.div 
                    key="info"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                  >
                    {paper.contentType === 'guideline' ? (
                      <div className="space-y-10">
                        {/* Header Badge Row */}
                        <div className="flex flex-wrap items-center gap-4 py-4 border-y border-foreground/5">
                          <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                            Preuve Grade {paper.recommendationGrade || 'A'}
                          </div>
                          {paper.evidenceLevelDescription && (
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                              <BookOpen size={12} />
                              {paper.evidenceLevelDescription}
                            </div>
                          )}
                          <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                            {paper.accessStatus === 'free' ? 'Accès Gratuit' : 'Accès Restreint'}
                          </div>
                        </div>

                        {/* Structured Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                          {/* Points Clés */}
                          <div className="space-y-5">
                            <h3 className="text-lg font-serif font-bold text-foreground/90 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <CheckCircle2 size={18} />
                              </div>
                              Points Clés
                            </h3>
                            <ul className="space-y-4">
                              {(paper.summaryPoints || paper.bookCover?.keyPoints || []).map((point, i) => (
                                <li key={i} className="text-sm text-muted-foreground leading-relaxed flex items-start gap-3 group">
                                  <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    {i + 1}
                                  </span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Population Cible */}
                          <div className="space-y-5">
                            <h3 className="text-lg font-serif font-bold text-foreground/90 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <User size={18} />
                              </div>
                              Population Cible
                            </h3>
                            <div className="p-5 rounded-2xl bg-foreground/5 border border-foreground/5 text-sm text-muted-foreground leading-relaxed italic">
                              {paper.targetPopulation || "Professionnels de santé et patients concernés par cette pathologie."}
                            </div>
                          </div>
                        </div>

                        {/* Interventions & Counter-indications */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-4 hover:bg-emerald-500/10 transition-colors">
                            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                              <Zap size={14} fill="currentColor" />
                              Interventions Recomendées
                            </h4>
                            <ul className="space-y-2.5">
                              {(paper.interventions || []).map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                  {item}
                                </li>
                              ))}
                              {(!paper.interventions || paper.interventions.length === 0) && (
                                <li className="text-sm text-muted-foreground italic">Détails thérapeutiques en cours d'analyse...</li>
                              )}
                            </ul>
                          </div>

                          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-4 hover:bg-red-500/10 transition-colors">
                            <h4 className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                              <AlertCircle size={14} />
                              Mises en Garde / Vigilance
                            </h4>
                            <ul className="space-y-2.5">
                              {(paper.contraindications || []).map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                  {item}
                                </li>
                              ))}
                               {(!paper.contraindications || paper.contraindications.length === 0) && (
                                <li className="text-sm text-muted-foreground italic">Contre-indications standards de la pathologie.</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Resources Section */}
                        <div className="space-y-6">
                          <h3 className="text-lg font-serif font-bold text-foreground/90">Ressources & Guides</h3>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                              { id: 'pocket-guide', label: 'Pocket Guide', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                              { id: 'summary', label: 'Résumé Exec.', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                              { id: 'patient-guide', label: 'Guide Patient', icon: User, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                              { id: 'quiz', label: 'Auto-évaluation', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
                            ].map((res) => {
                              const isAvailable = paper.availableResources?.includes(res.id as any);
                              return (
                                <button 
                                  key={res.id}
                                  disabled={!isAvailable}
                                  className={`flex flex-col items-center justify-center p-6 rounded-[24px] border transition-all gap-4 group ${isAvailable ? 'bg-foreground/5 border-foreground/5 hover:bg-foreground/10 hover:border-foreground/20 hover:scale-[1.03] active:scale-95 shadow-xl hover:shadow-blue-500/5' : 'bg-transparent border-foreground/5 opacity-30 cursor-not-allowed'}`}
                                >
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white duration-500 ${res.bg} ${res.color}`}>
                                    <res.icon size={28} />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-center leading-tight">{res.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Source Credit & Link */}
                        <div className="pt-10 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-10 bg-foreground/[0.02] -mx-8 px-10 pb-8 rounded-b-[40px] mt-8">
                          <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-[11px] font-black shadow-lg shadow-blue-500/40">GC</div>
                              <span className="text-sm font-black text-foreground uppercase tracking-widest">Partenaire Guideline Central</span>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Référence Source</p>
                               <a 
                                 href={paper.sourceUrl} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className="text-xs text-blue-500 hover:text-blue-400 font-bold underline decoration-blue-500/30 underline-offset-4 transition-colors break-all flex items-center gap-2 group"
                               >
                                 {paper.sourceUrl || 'www.guidelinecentral.com'}
                                 <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                               </a>
                            </div>
                          </div>
                          <button 
                             onClick={() => window.open(paper.sourceUrl || 'https://www.guidelinecentral.com', '_blank')}
                             className="w-full md:w-auto px-12 h-16 rounded-[24px] bg-blue-600 text-white font-black text-[12px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/40 active:scale-95 flex items-center justify-center gap-4 group"
                          >
                             Consulter l'original
                             <ExternalLink size={20} className="group-hover:rotate-45 transition-transform duration-500" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-10">
                        <div className="space-y-6">
                      <div className="space-y-2">
                        <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.25em]">
                          {specialty?.name}
                        </span>
                        <h1 className="text-4xl xl:text-5xl font-serif font-bold text-foreground leading-[1.1] tracking-tight">
                          {paper.title}
                        </h1>
                        {paper.issuingSocieties && paper.issuingSocieties.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {paper.issuingSocieties.map((society, i) => (
                              <React.Fragment key={society}>
                                <span className="text-sm font-bold text-muted-foreground">{society}</span>
                                {i < paper.issuingSocieties.length - 1 && <span className="text-muted-foreground/30">•</span>}
                              </React.Fragment>
                            ))}
                            <span className="mx-2 text-muted-foreground/30">|</span>
                            <span className="text-xs text-muted-foreground">{new Date(paper.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                            {paper.authors[0][0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{paper.authors[0]}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Lead Author</p>
                          </div>
                        </div>
                        <div className="w-px h-8 bg-surface-border" />
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <Star size={16} fill="currentColor" />
                          <Star size={16} fill="currentColor" />
                          <Star size={16} fill="currentColor" />
                          <Star size={16} fill="currentColor" />
                          <Star size={16} className="text-muted-foreground/20" />
                          <span className="ml-2 text-xs font-black text-muted-foreground uppercase tracking-widest">4.3 (2.5k)</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {['Clinical Trial', 'Breakthrough', 'Peer Reviewed', specialty?.name].filter(Boolean).map((tag) => (
                          <span key={tag} className="px-4 py-2 rounded-full bg-surface-subtle border border-surface text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em] hover:bg-foreground/10 transition-colors cursor-default">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={() => {
                          if (paper.pmcid) {
                            window.open(`https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${paper.pmcid}/pdf/`, '_blank');
                          }
                        }}
                        disabled={!paper.pmcid}
                        className={`h-12 px-6 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors ${
                          paper.pmcid 
                            ? 'bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20' 
                            : 'bg-muted border border-foreground/5 text-muted-foreground opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <Download size={18} />
                        Download Full PDF
                      </button>
                      <button 
                        onClick={() => {
                          if (paper.pmid) {
                            window.open(`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`, '_blank');
                          }
                        }}
                        className="h-12 px-6 rounded-xl bg-muted border border-foreground/5 flex items-center gap-2 text-sm font-bold text-foreground hover:bg-foreground/10 transition-colors"
                      >
                        <ExternalLink size={18} />
                        View on Publisher
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-6 py-6 border-y border-foreground/5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">DOI</p>
                        <p className="text-sm text-foreground/80 font-mono">{paper.doi || "10.1056/NEJMoa2115561"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Citations</p>
                        <p className="text-sm text-foreground/80">1,240+</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Methodology</p>
                        <p className="text-sm text-foreground/80">Double-blind RCT</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-serif font-bold text-foreground/90">Abstract & Impact</h3>
                        {paper.pmcid && (
                          <button 
                            onClick={() => setActiveTab('fulltext')}
                            className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 hover:opacity-70"
                          >
                            Explore Full E-Book <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                      <StructuredOverview paper={paper} />
                    </div>

                    {/* New Peer Review / Comments Section */}
                    <CommentsSection paperId={paper.id} userProfile={userProfile || null} />
                  </div>
                )}
              </motion.div>
            )}

                {activeTab === 'path' && (
                  <motion.div
                    key="path"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {isLoadingPath ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse">Mapping related clinical intelligence...</p>
                      </div>
                    ) : relatedPath ? (
                      <RelatedPathView 
                        path={relatedPath} 
                        onLessonClick={(lesson) => {
                          if (lesson.article && onPaperSelect) {
                            // Map the lesson article to a proper Paper object
                            const mappedPaper: Paper = {
                              id: lesson.article.pmid,
                              pmid: lesson.article.pmid,
                              pmcid: lesson.article.pmcid,
                              doi: lesson.article.doi,
                              title: lesson.article.title,
                              description: lesson.article.clinical_significance || lesson.article.abstract_summary || lesson.article.abstract || "Analyzing clinical data...",
                              fullContent: lesson.article.abstract,
                              specialtyId: paper?.specialtyId || 'cardiology',
                              passedExam: false,
                              date: lesson.article.publicationDate,
                              authors: lesson.article.authors,
                              imageUrl: getImageUrl(lesson.article.title, lesson.article.pmid, 'cover'),
                              generatedIllustrationUrl: getImageUrl(lesson.article.title, lesson.article.pmid, 'illustration'),
                              readTime: '8 min',
                              journal: lesson.article.journal,
                              contentType: 'article',
                              clinicalWeight: lesson.article.impact_score || 50,
                              clinical_significance: lesson.article.clinical_significance,
                              masteryLevel: 'unread',
                              bookCover: {
                                title: lesson.article.title,
                                subtitle: lesson.article.journal,
                                edition: 2024,
                                keyPoints: lesson.article.key_takeaways || ["Clinical insights pending..."],
                                primaryColor: '#3b82f6',
                              }
                            };
                            onPaperSelect(mappedPaper);
                          }
                        }}
                      />
                    ) : (
                      <div className="p-8 text-center glass-card rounded-2xl border-foreground/5">
                        <p className="text-sm text-muted-foreground">Unable to generate a specialized path for this topic at this time.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'fulltext' && (
                  <motion.div 
                    key="fulltext"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-12"
                  >
                    {extractionStatus === 'loading' && (
                      <div className="flex flex-col items-center justify-center py-32 gap-6 bg-foreground/[0.02] rounded-[40px] border border-dashed border-foreground/10 text-center">
                        <div className="relative">
                          <Loader2 className="animate-spin text-blue-500" size={56} />
                          <div className="absolute inset-0 blur-2xl bg-blue-500/20" />
                        </div>
                        <motion.div 
                          key={loadingStep}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-2"
                        >
                          <h4 className="text-xl font-serif font-bold text-foreground">Loading</h4>
                        </motion.div>
                      </div>
                    )}

                    {extractionStatus === 'fallback' && (
                      <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                          <Brain size={20} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Abstract-Only Mode</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">The publisher has restricted the full manuscript behind a paywall. We've enhanced the available abstract for a structured reading experience.</p>
                        </div>
                      </div>
                    )}

                    {sections.length > 0 && extractionStatus !== 'loading' && (
                      sections.map((section, i) => (
                        <div 
                          key={i}
                          data-section-index={i}
                          className={`space-y-8 p-10 lg:p-16 rounded-[40px] transition-all duration-700 relative group/section ${activeSection === i ? 'bg-foreground/[0.04] border border-foreground/10 shadow-2xl ring-1 ring-blue-500/20' : 'opacity-40 grayscale-[0.3]'}`}
                        >
                          <div className="absolute top-8 right-10 flex items-center gap-3">
                            <span className="text-[10px] font-black text-blue-500/40 group-hover/section:text-blue-500 transition-colors uppercase tracking-[0.4em]">Index 0{i + 1}</span>
                          </div>
                          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-foreground leading-tight tracking-tight max-w-2xl border-l-4 border-blue-500 pl-6">
                            {section.title}
                          </h2>
                          <div className="prose prose-invert prose-xl max-w-none text-foreground/90 font-serif">
                            {section.content.split('\n\n').map((para, j) => (
                              <p key={j} className={`text-xl lg:text-2xl leading-[1.7] mb-8 ${j === 0 ? 'first-letter:text-6xl lg:first-letter:text-7xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-blue-500 first-letter:leading-none pt-2 drop-shadow-lg' : 'opacity-90'}`}>
                                {para.split('\n').map((line, k) => (
                                  <React.Fragment key={k}>
                                    {line}
                                    {k < para.split('\n').length - 1 && <br />}
                                  </React.Fragment>
                                ))}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {(activeTab === 'findings' || activeTab === 'authors') && (
                  <motion.div 
                    key="other"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-10 rounded-[40px] bg-foreground/[0.04] border border-foreground/10"
                  >
                    {activeTab === 'findings' && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-serif font-bold text-foreground">Statistical Outcomes</h3>
                        <p className="text-lg text-foreground/80 leading-relaxed">The primary outcome occurred in 16.3% of patients in the treatment group vs 21.2% in the placebo group.</p>
                        <ul className="list-disc pl-5 space-y-3 text-lg text-muted-foreground">
                          <li>26% relative risk reduction (Hazard Ratio 0.74, 95% CI 0.65-0.85)</li>
                          <li>Significant reduction in CV death and sudden cardiac arrest</li>
                          <li>Consistency maintained across age, sex, and baseline ejection fraction</li>
                        </ul>
                      </div>
                    )}
                    {activeTab === 'authors' && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-serif font-bold text-foreground">Investigators</h3>
                        <div className="grid grid-cols-1 gap-6">
                          {paper.authors.map(author => (
                            <div key={author} className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                <User size={24} />
                              </div>
                              <div>
                                <p className="text-lg text-foreground font-bold">{author}</p>
                                <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest">Principal Research Fellow</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Layout (Full Overhaul) */}
          <div className="lg:hidden flex flex-col bg-background pb-56">
            
            {/* 1. Hero Content */}
            <div className="relative min-h-[calc(100dvh-100px)] flex flex-col justify-end pt-20 pb-0 shrink-0">
              
              {/* Background Cover Image with Gradient Fade */}
              <div className="absolute inset-x-0 top-0 bottom-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="w-full h-full absolute inset-0"
                >
                  <img 
                    src={paper.generatedIllustrationUrl || paper.imageUrl} 
                    alt={paper.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Top subtle shadow for back button */}
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-10" />
                  {/* Base dimming layer over the whole image */}
                  <div className="absolute inset-0 bg-black/10 dark:bg-black/30 mix-blend-multiply pointer-events-none z-10" />
                </motion.div>
                {/* Advanced Gradients for perfect blending & high contrast text readability */}
                <div className="absolute inset-x-0 bottom-0 h-[70vh] bg-gradient-to-t from-background via-background/80 to-background/0 pointer-events-none z-20" />
                <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-background via-background/95 to-background/0 pointer-events-none z-20" />
                <div className="absolute inset-x-0 bottom-0 h-[10vh] bg-background pointer-events-none z-20" />
              </div>

              {/* Top Navigation (Back Button & Actions) */}
              <div className="absolute top-4 inset-x-4 flex justify-between items-start z-50">
                <button 
                  onClick={() => { onClose(); resetQuiz(); }}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-xl active:scale-90 transition-transform"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="flex flex-col gap-3">
                  <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-xl active:scale-90 transition-transform">
                    <Share2 size={16} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-red-400 border border-white/10 shadow-xl active:scale-90 transition-all">
                    <Heart size={16} fill="none" />
                  </button>
                </div>
              </div>

              {/* Title, Metadata & Badges (Pushed entirely to bottom) */}
              <div className="px-4 lg:px-6 relative z-10 flex flex-col space-y-4 pb-6">
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="p-5 lg:p-6 rounded-[28px] bg-background/70 dark:bg-black/40 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-white/10"
                >
                  {/* Title */}
                  <h1 className="text-2xl sm:text-4xl font-serif font-bold text-foreground leading-[1.15] tracking-tight text-balance mb-4">
                    {paper.title}
                  </h1>

                  {/* Subtitle / Meta Information */}
                  <div className="space-y-1">
                    <div className="text-[14px] text-foreground/90 font-bold tracking-wide line-clamp-1">
                      {paper.authors[0]}
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-foreground/80 dark:text-foreground/70 tracking-wide font-medium">
                      <span>{paper.date.split(' ').pop()}</span>
                      <span className="w-px h-3 bg-foreground/30" />
                      <span>{paper.readTime} Read</span>
                    </div>
                  </div>
                </motion.div>

                {/* Badges / Tags (Now at the bottom) */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  <span className="px-3 py-1.5 rounded-full bg-foreground/5 backdrop-blur-md border border-foreground/20 text-[10px] font-medium text-foreground/90 uppercase tracking-widest shadow-lg">
                    {specialty?.name || 'Medical'}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-foreground/5 backdrop-blur-md border border-foreground/20 text-[10px] font-medium text-foreground/90 uppercase tracking-widest shadow-lg">
                    Peer Reviewed
                  </span>
                </motion.div>
              </div>

              {/* Tabs Navigation (Firmly anchored above the bottom text boundary) */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="px-6 relative z-10 w-full"
              >
                <div className="flex gap-6 border-b border-foreground/10 overflow-x-auto no-scrollbar scroll-smooth pb-0">
                  {[
                    { id: 'info', label: 'Overview' },
                    { id: 'fulltext', label: 'Full Text' },
                    { id: 'path', label: 'Mastery' },
                    { id: 'findings', label: 'Findings' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as DetailTab)}
                      className={`pb-3 text-sm font-serif font-black transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-foreground' : 'text-foreground/40 hover:text-foreground/70'}`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div layoutId="mobile-tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* 2. Scrollable Content Below Header */}
            <div className="px-6 space-y-8 pt-8">
              {/* Main Text Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'info' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key="mobile-info"
                    className="space-y-8"
                  >
                    {/* Action Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => {
                          if (paper.pmcid) {
                            window.open(`https://www.ncbi.nlm.nih.gov/pmc/articles/${paper.pmcid}/pdf/`, '_blank');
                          }
                        }}
                        disabled={!paper.pmcid}
                        className={`h-12 px-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                          paper.pmcid 
                            ? 'bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20' 
                            : 'bg-muted border border-foreground/5 text-muted-foreground opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <Download size={14} />
                        Download PDF
                      </button>
                      <button 
                        onClick={() => {
                          if (paper.pmid) {
                            window.open(`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`, '_blank');
                          }
                        }}
                        className="h-12 px-2 rounded-xl bg-muted border border-foreground/5 flex items-center justify-center gap-2 text-xs font-bold text-foreground hover:bg-foreground/10 transition-colors"
                      >
                        <ExternalLink size={14} />
                        View on Publisher
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-6 border-y border-foreground/5">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">DOI</p>
                        <p className="text-xs text-foreground/80 font-mono truncate">{paper.doi || "10.1056/NEJMoa2115561"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Citations</p>
                        <p className="text-xs text-foreground/80">1,240+</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Methodology</p>
                        <p className="text-xs text-foreground/80">Double-blind RCT</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-serif font-bold text-foreground/90">Abstract & Impact</h3>
                        {paper.pmcid && (
                          <button 
                            onClick={() => setActiveTab('fulltext')}
                            className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 hover:opacity-70"
                          >
                            Explore Full E-Book <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                      <StructuredOverview paper={paper} />
                    </div>

                    {/* New Peer Review / Comments Section */}
                    <div className="pt-2">
                       <CommentsSection paperId={paper.id} userProfile={userProfile || null} />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'fulltext' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    {extractionStatus === 'loading' && (
                      <div className="flex flex-col items-center justify-center py-16 gap-4 bg-foreground/[0.02] rounded-2xl border border-dashed border-foreground/10 text-center">
                        <div className="relative">
                          <Loader2 className="animate-spin text-blue-500" size={40} />
                          <div className="absolute inset-0 blur-xl bg-blue-500/20" />
                        </div>
                        <motion.div 
                          key={loadingStep}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-1"
                        >
                          <h4 className="text-base font-serif font-bold text-foreground">Loading</h4>
                        </motion.div>
                      </div>
                    )}
                    {extractionStatus === 'fallback' && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Brain size={16} className="text-amber-500" />
                          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Abstract-Only Mode</h4>
                        </div>
                        <p className="text-xs text-foreground/60 leading-relaxed">The publisher has restricted the full manuscript behind a paywall. Extracting structure from available abstracts.</p>
                      </div>
                    )}
                    {sections.map((section, idx) => (
                      <div key={idx} className="space-y-4">
                        <h3 className="text-xl font-serif font-black text-foreground tracking-tight">{section.title}</h3>
                        <div className="space-y-4">
                          {section.content.split('\n\n').map((para, j) => (
                            <p key={j} className="text-base text-foreground/70 leading-relaxed font-light">
                              {para.split('\n').map((line, k) => (
                                <React.Fragment key={k}>
                                  {line}
                                  {k < para.split('\n').length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'path' && relatedPath && (
                   <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <RelatedPathView 
                      path={relatedPath}
                      onLessonClick={(lesson) => {
                        if (lesson.article && onPaperSelect) {
                           // Mapping logic same as desktop
                           const mapped = { ...lesson.article, id: lesson.article.pmid } as any;
                           onPaperSelect(mapped);
                        }
                      }}
                    />
                  </motion.div>
                )}

                 {activeTab === 'findings' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card rounded-3xl p-6 bg-foreground/5 border-foreground/5 space-y-4"
                  >
                    <h3 className="text-lg font-serif font-black text-foreground tracking-tight">Key Findings</h3>
                    <ul className="space-y-3">
                      {paper.bookCover?.keyPoints.map((point, i) => (
                        <li key={i} className="text-sm text-foreground/70 flex gap-3">
                          <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Best Quote Section */}
          <section className="mt-16 lg:mt-24">
            <h3 className="text-xl lg:text-2xl font-serif font-bold text-foreground/90 mb-8">
              Best quote from {paper.title}
            </h3>
            <div className="glass-card rounded-3xl p-8 lg:p-12 relative overflow-hidden">
              <Quote className="absolute top-8 left-8 text-blue-500/20 w-16 h-16 lg:w-24 lg:h-24 -z-10" />
              <div className="space-y-6 relative z-10">
                <p className="text-xl lg:text-3xl font-serif italic text-foreground/90 leading-relaxed text-center max-w-3xl mx-auto">
                  "{(paper.clinical_significance || paper.description).split('. ')[0]}."
                </p>
                <div className="w-12 h-0.5 bg-blue-500 mx-auto" />
              </div>
              <Quote className="absolute bottom-8 right-8 text-blue-500/20 w-16 h-16 lg:w-24 lg:h-24 -z-10 rotate-180" />
            </div>
          </section>

          {/* Users also liked Section */}
          <section className="mt-16 lg:mt-24 pb-8">
            <h3 className="text-xl lg:text-2xl font-serif font-bold text-foreground/90 mb-6 lg:mb-8 px-6 lg:px-0">
              Users also liked
            </h3>
            <div className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-4 lg:gap-8 no-scrollbar px-6 lg:px-0 scroll-smooth">
              {relatedPapers.map((p) => (
                <motion.div 
                  key={p.id}
                  whileHover={{ y: -5 }}
                  className="space-y-3 cursor-pointer group w-[160px] min-w-[160px] lg:w-auto lg:min-w-0 flex-shrink-0"
                >
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden glass-card border-foreground/5 bg-gradient-to-b from-blue-500/20 to-transparent shadow-lg">
                    <MedicalBookCover paper={p} hideDetails />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[12px] lg:text-[14px] font-serif font-bold text-foreground group-hover:text-blue-500 transition-colors line-clamp-2 leading-snug tracking-tight">{p.title}</h4>
                    <p className="text-[9px] lg:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{p.authors[0]}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

        </div>

        {/* Quiz Overlay (Full Page) */}
        <AnimatePresence>
          {view === 'quiz' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[60] bg-background flex flex-col"
            >
              <div className="px-4 lg:px-6 py-3 lg:py-4 flex justify-between items-center border-b border-foreground/5">
                <button onClick={resetQuiz} className="text-foreground/60 hover:text-foreground">
                  <X size={20} className="lg:w-[24px] lg:h-[24px]" />
                </button>
                <div className="flex gap-1">
                  <div className="w-8 lg:w-12 h-1 lg:h-1.5 rounded-full bg-blue-500" />
                  <div className="w-8 lg:w-12 h-1 lg:h-1.5 rounded-full bg-foreground/10" />
                  <div className="w-8 lg:w-12 h-1 lg:h-1.5 rounded-full bg-foreground/10" />
                </div>
                <div className="w-6" />
              </div>

              <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
                <div className="max-w-2xl w-full space-y-6 lg:space-y-10">
                  <div className="space-y-2 lg:space-y-4 text-center">
                    <p className="text-blue-400 text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em]">Question 1 of 3</p>
                    <h3 className="text-xl lg:text-3xl font-serif font-bold text-foreground leading-tight">
                      {paper.quiz?.[0].question || "What was the primary endpoint reduction observed in the study?"}
                    </h3>
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    {(paper.quiz?.[0].options || ['15%', '25%', '35%', '45%']).map((option, i) => {
                      const isCorrect = i === (paper.quiz?.[0].correctAnswer || 1);
                      const isSelected = selectedOption === i;
                      
                      let bgColor = 'bg-foreground/5';
                      let borderColor = 'border-foreground/10';
                      let textColor = 'text-foreground/80';

                      if (isAnswered) {
                        if (isCorrect) {
                          bgColor = 'bg-emerald-500/20';
                          borderColor = 'border-emerald-500/40';
                          textColor = 'text-emerald-400';
                        } else if (isSelected) {
                          bgColor = 'bg-red-500/20';
                          borderColor = 'border-red-500/40';
                          textColor = 'text-red-400';
                        }
                      } else if (isSelected) {
                        borderColor = 'border-blue-500';
                        bgColor = 'bg-blue-500/5';
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(i)}
                          className={`w-full p-4 lg:p-6 rounded-xl lg:rounded-2xl border ${borderColor} ${bgColor} text-left transition-all active:scale-[0.98] group`}
                        >
                          <div className="flex justify-between items-center">
                            <p className={`text-base lg:text-lg font-medium ${textColor}`}>{option}</p>
                            {isAnswered && isCorrect && <CheckCircle2 size={18} className="text-emerald-400 lg:w-[20px] lg:h-[20px]" />}
                            {isAnswered && isSelected && !isCorrect && <X size={18} className="text-red-400 lg:w-[20px] lg:h-[20px]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 lg:space-y-6 text-center"
                    >
                      <ShinyButton 
                        onClick={resetQuiz}
                        className="px-8 lg:px-10 h-12 lg:h-14 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-transform"
                      >
                        Continue Learning
                      </ShinyButton>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Mobile Audio Nav (Glassmorphism & Enhanced) */}
        <div className="lg:hidden fixed bottom-6 left-4 right-4 z-[55]">
          <div className="bg-background/80 backdrop-blur-2xl border border-foreground/10 rounded-2xl p-3 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col gap-3 relative overflow-visible">
             {/* Top info row: Part X/Y */}
             {audiobookParts.length > 0 && (
               <div className="flex justify-between items-center px-1">
                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                   Part {currentPartIndex + 1}/{audiobookParts.length}
                 </span>
                 {isLoading && <Loader2 size={12} className="animate-spin text-blue-400" />}
               </div>
             )}

             {/* Track Info & Main Controls */}
             <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-xl overflow-hidden bg-foreground/5 border border-foreground/10 shrink-0 shadow-lg">
                      <MedicalBookCover paper={paper} hideDetails className="scale-[0.8] origin-center -translate-y-[10%]" />
                   </div>
                   <div className="flex flex-col min-w-0 pr-2 max-w-[140px]">
                       <h4 className="text-[13px] font-bold text-foreground leading-tight line-clamp-1">{paper.title}</h4>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-widest line-clamp-1 truncate">{paper.journal || 'Audio Nav'}</p>
                   </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="relative">
                      <button 
                        onClick={() => setShowMobileVolume(!showMobileVolume)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-2"
                      >
                        {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>

                      <AnimatePresence>
                        {showMobileVolume && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-10 h-32 bg-background/95 backdrop-blur-3xl border border-foreground/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] flex items-center justify-center origin-bottom"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="w-[100px] flex items-center justify-center -rotate-90">
                              <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-[100px] h-1.5 bg-foreground/20 rounded-full appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button 
                      onClick={() => handlePlaybackRateChange(playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1)}
                      className="text-[11px] font-black text-muted-foreground hover:text-foreground w-6 text-center transition-colors"
                    >
                      {playbackRate}x
                    </button>
                    <button 
                      onClick={() => handleListenAudiobook(currentPartIndex)}
                      disabled={isLoading || isPreparing}
                      className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground/5"
                    >
                      {isLoading || isPreparing ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : isPlaying ? (
                        <Pause size={18} fill="currentColor" />
                      ) : (
                        <Play size={18} fill="currentColor" className="ml-1" />
                      )}
                    </button>
                </div>
             </div>

             <div className="flex flex-col gap-2 w-full mt-0">
               {/* Progress Bar & Timestamps */}
               <div className="flex flex-col gap-1.5 px-1">
                 <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden w-full relative">
                   <div 
                     className="absolute top-0 left-0 bottom-0 bg-blue-500 rounded-full transition-all duration-100 ease-linear"
                     style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                   />
                 </div>
                 <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                   <span>{formatTime(currentTime)}</span>
                   <span>{formatTime(duration)}</span>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Go to Top Button */}
        <AnimatePresence>
          {showGoToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={scrollToTop}
              className="fixed bottom-24 lg:bottom-12 right-6 lg:right-12 z-[60] w-12 h-12 rounded-full bg-blue-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.4)] flex items-center justify-center hover:bg-blue-500 hover:-translate-y-1 transition-all active:scale-95 border border-foreground/20"
              aria-label="Go to Top"
            >
              <ArrowLeft size={24} className="rotate-90" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
