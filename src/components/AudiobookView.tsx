import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Paper } from '../types';
import { MOCK_PAPERS } from '../constants';
import { Play, Pause, SkipBack, SkipForward, List, Heart, ChevronDown, MoreHorizontal, Volume2, Search, Loader2 } from 'lucide-react';
import { MedicalBookCover } from './MedicalBookCover';
import { ttsService } from '../services/ttsService';
import { articleService } from '../services/articleService';

interface AudiobookViewProps {
  papers: Paper[];
}

export const AudiobookView: React.FC<AudiobookViewProps> = ({ papers }) => {
  const [currentPaper, setCurrentPaper] = useState<Paper | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  
  const [audioParts, setAudioParts] = useState<{ url: string, text: string }[]>([]);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [totalParts, setTotalParts] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentPaper, currentPartIndex]);

  const playlist = papers.filter(p => p.contentType === 'article' || p.contentType === 'review');
  const filteredPlaylist = playlist.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAudiobookClick = async (paper: Paper) => {
    setCurrentPaper(paper);
    setIsPreparing(true);
    setLoadingStep('Preparing narration...');
    
    let text = paper.fullContent || paper.description || '';
    let extractedSections: {title: string, content: string}[] = [];

    // Attempt to fetch actual full text if PMC ID is present, just like PaperCard
    if (paper.pmcid) {
        try {
            setLoadingStep("Fetching full text from PMC...");
            const pmcData = await articleService.getFullText(paper.pmcid);
            if (pmcData) {
                const docs = Array.isArray(pmcData) ? pmcData : (pmcData.documents || [pmcData]);
                if (Array.isArray(docs)) {
                    const passages = docs.flatMap((doc: any) => doc.passages || []);
                    if (passages.length > 0) {
                        let currentSection = "";
                        let currentContent: string[] = [];

                        passages.forEach((p: any) => {
                            const textStr = (p.text || "").trim();
                            if (!textStr) return;
                            const infons = p.infons || {};
                            const type = (infons['section_type'] || infons['type'] || "").toLowerCase();
                            const isTitle = type.includes('title') || type === 'heading';
                            
                            const looksLikeHeading = !isTitle && textStr.length < 120 && !textStr.includes('. ') && (
                                /^(Introduction|Methods|Results|Discussion|Conclusion|Background|References)/i.test(textStr) ||
                                (type !== 'paragraph' && type !== 'caption')
                            );

                            if (isTitle || looksLikeHeading) {
                                if (currentContent.length > 0) {
                                  extractedSections.push({ title: currentSection || "Introduction", content: currentContent.join('\n\n') });
                                }
                                currentSection = textStr;
                                currentContent = [];
                            } else {
                                currentContent.push(textStr);
                            }
                        });

                        if (currentContent.length > 0) {
                            extractedSections.push({ title: currentSection || "Summary", content: currentContent.join('\n\n') });
                        }

                        const allText = extractedSections.map(s => `[${s.title.toUpperCase()}]\n${s.content}`).join('\n\n');
                        if (allText.length > 500) {
                            text = allText;
                        } else {
                            setLoadingStep("Full text short, digitizing PDF...");
                            const pdfData = await articleService.getPdfData(paper.pmcid);
                            if (pdfData?.base64) {
                                const aiSections = await articleService.extractTextFromPdf(pdfData.base64);
                                if (aiSections && aiSections.length > 0) {
                                    text = aiSections.map(s => `[${s.title.toUpperCase()}]\n${s.content}`).join('\n\n');
                                }
                            }
                        }
                    } else {
                       const pdfData = await articleService.getPdfData(paper.pmcid);
                       if (pdfData?.base64) {
                           const aiSections = await articleService.extractTextFromPdf(pdfData.base64);
                           if (aiSections && aiSections.length > 0) {
                               text = aiSections.map(s => `[${s.title.toUpperCase()}]\n${s.content}`).join('\n\n');
                           }
                       }
                    }
                }
            }
        } catch(e) {
            console.error("Audiobook PMC fetch failed:", e);
        }
    }
    
    // Split into logical semantic parts for better "E-book" feel
    const MAX_LENGTH = 1500;
    const sentences = text.replace(/\n{2,}/g, '\n').split(/(?<=[.!?])\s+|\n+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = "";
    
    sentences.forEach(sentence => {
        if ((currentChunk + sentence).length > MAX_LENGTH && currentChunk.length > 0) {
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


    setTotalParts(chunks.length);
    let parts: { url: string, text: string }[] = [];
    
    try {
        console.log("Starting audiobook preparation...");
        for (let i = 0; i < chunks.length; i++) {
            setLoadingStep(`Generating part ${i + 1} of ${chunks.length}: "${chunks[i].substring(0, 30)}..."`);
            const audioBuffer = await ttsService.generateAudioChunk(chunks[i], ttsService.voices.professional_male);
            const blob = new Blob([audioBuffer], { type: 'audio/wav' });
            parts.push({ url: URL.createObjectURL(blob), text: chunks[i] });
        }
        console.log("Audio generation successful, parts:", parts.length);

        setAudioParts(parts);
        setIsPreparing(false);
        // Playback activation
        console.log("Attempting to activate playback...");
        setCurrentPartIndex(0);
        await playSequence(parts, 0);

    } catch (error) {
        console.error("Audio generation or playback failed:", error);
        setIsPreparing(false);
        setIsPlaying(false);
        alert("Failed to generate or play audio narration: " + error);
    }
  };

  const playSequence = async (parts: { url: string, text: string }[], index: number) => {
      if (index >= parts.length || !audioRef.current) {
          setIsPlaying(false);
          setCurrentPaper(null); 
          return;
      }
      
      setCurrentPartIndex(index);
      audioRef.current.src = parts[index].url;
      try {
          await audioRef.current.play();
          setIsPlaying(true);
      } catch (err) {
          console.error("Playback failed for part", index, err);
          setIsPlaying(false);
          // Auto-retry or wait for user interaction if auto-play blocked
      }
      audioRef.current.onended = () => playSequence(parts, index + 1);
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-y-auto no-scrollbar pb-[200px] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="p-5 lg:p-8 space-y-6 lg:space-y-8 relative z-10">
        <header className="px-1 space-y-4 lg:space-y-6">
          <h2 className="text-2xl font-serif font-black text-foreground tracking-tight">Audio Playlist</h2>
          
          <div className="relative group w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
              <input 
                  type="text"
                  placeholder="Search in playlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 bg-surface-subtle border border-surface rounded-xl px-4 pl-12 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-foreground placeholder:text-muted-foreground"
              />
          </div>
        </header>

        <section className="space-y-2 lg:space-y-3">
          {filteredPlaylist.map((paper, i) => (
            <div 
              key={paper.id} 
              onClick={() => handleAudiobookClick(paper)}
              className="flex items-center gap-4 lg:gap-6 p-3 lg:p-4 rounded-2xl lg:rounded-[24px] hover:bg-surface-subtle transition-all duration-300 cursor-pointer group border border-transparent hover:border-surface"
            >
              <span className="w-5 text-center text-muted-foreground/40 text-xs font-black">{i + 1}</span>
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg bg-surface-subtle">
                <MedicalBookCover paper={paper} hideDetails className="scale-[1.2] origin-center" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[14px] lg:text-[16px] font-serif font-bold text-foreground/90 line-clamp-1 tracking-tight group-hover:text-blue-500 transition-colors leading-tight">{paper.title}</h4>
                <p className="text-[10px] lg:text-[11px] text-muted-foreground font-black uppercase tracking-[0.15em] mt-1 opacity-80 truncate">{paper.journal || 'Anzar Clinical Review'}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-muted-foreground hover:text-blue-500 transition-colors">
                  <Play size={18} fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>

      <AnimatePresence>
        {currentPaper && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[80px] lg:bottom-6 left-4 right-4 lg:left-1/2 lg:-translate-x-1/2 lg:w-fit lg:min-w-[600px] lg:max-w-3xl z-50 rounded-[20px] p-2.5 lg:p-3 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-foreground/10"
            style={{ 
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)'
            }}
          >
            <audio ref={audioRef} className="hidden" />
            <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0 pr-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-lg bg-slate-900 border border-foreground/10">
                <MedicalBookCover paper={currentPaper} hideDetails className="scale-[0.8] origin-center -translate-y-[10%]" />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <h4 className="text-[13px] lg:text-[14px] font-sans font-bold text-foreground truncate leading-tight mb-0.5">{currentPaper.title}</h4>
                <p className="text-[9px] lg:text-[10px] text-foreground/50 font-bold uppercase tracking-widest truncate">{currentPaper.journal}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 pr-4 lg:pr-6 border-r border-foreground/10">
              {isPreparing ? (
                  <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-blue-500" />
                      <span className="text-[10px] font-bold text-blue-400 capitalize">{loadingStep.replace('...', '')}</span>
                  </div>
              ) : (
                <>
                    <div className="flex flex-col items-center gap-1.5 w-[140px] lg:w-[200px]">
                        <div className="flex items-center justify-between w-full text-[9px] text-foreground/40 font-medium font-mono px-1">
                            <span>{Math.floor(currentTime/60)}:{(Math.floor(currentTime%60)).toString().padStart(2, '0')}</span>
                            <span>Part {currentPartIndex + 1}/{totalParts}</span>
                        </div>
                        <div className="w-full h-1 bg-foreground/10 rounded-full overflow-hidden">
                            <div 
                               className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-100"
                               style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-foreground/40 hover:text-foreground transition-colors"><SkipBack size={18} fill="currentColor" /></button>
                        <button onClick={() => {
                            if (audioRef.current) {
                                if (isPlaying) audioRef.current.pause();
                                else audioRef.current.play();
                                setIsPlaying(!isPlaying);
                            }
                        }} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <button className="text-foreground/40 hover:text-foreground transition-colors"><SkipForward size={18} fill="currentColor" /></button>
                    </div>
                </>
              )}
            </div>

            <button onClick={() => setCurrentPaper(null)} className="pl-4 pr-1 text-foreground/40 hover:text-foreground transition-colors">
                <ChevronDown size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
