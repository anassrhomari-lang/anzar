import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Paper } from '../types';
import { Search, Filter, ChevronRight, ExternalLink, Globe, BookOpen, Clock, Star, ArrowUpDown, FileText, User, GraduationCap, ChevronDown } from 'lucide-react';
import { SPECIALTIES } from '../constants';

interface GuidelineExplorerViewProps {
  papers: Paper[];
  onPaperClick: (paper: Paper) => void;
}

const CustomSelect = ({ 
  label, 
  value, 
  options, 
  onChange, 
  icon: Icon 
}: { 
  label: string; 
  value: string; 
  options: { id: string; name: string }[]; 
  onChange: (val: string) => void;
  icon: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedName = options.find(o => o.id === value)?.name || label;

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-14 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 flex items-center justify-between group hover:bg-foreground/10 transition-all text-foreground/80 hover:text-foreground"
      >
        <div className="flex items-center gap-3">
          <Icon className="text-foreground/20 group-hover:text-blue-500 transition-colors" size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">{selectedName}</span>
        </div>
        <ChevronDown className={`text-foreground/20 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 z-[100] bg-[#1a1a1a] border border-foreground/10 rounded-2xl shadow-2xl p-2 max-h-[300px] overflow-y-auto no-scrollbar backdrop-blur-xl"
          >
            <div className="space-y-1">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-4 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-all ${
                    value === option.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const GuidelineExplorerView: React.FC<GuidelineExplorerViewProps> = ({
  papers,
  onPaperClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedSociety, setSelectedSociety] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'relevance'>('relevance');

  const guidelines = useMemo(() => {
    return papers.filter(p => p.contentType === 'guideline');
  }, [papers]);

  const societies = useMemo(() => {
    const allSocieties = guidelines.flatMap(g => g.issuingSocieties || []);
    const uniqueSocieties = Array.from(new Set(allSocieties)).sort();
    return [{ id: 'all', name: 'All Societies' }, ...uniqueSocieties.map(s => ({ id: s, name: s }))];
  }, [guidelines]);

  const specialtyOptions = useMemo(() => {
    return [{ id: 'all', name: 'All Specialties' }, ...SPECIALTIES.map(s => ({ id: s.id, name: s.name }))];
  }, []);

  const filteredGuidelines = useMemo(() => {
    let result = guidelines.filter(g => {
      const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           g.topicCluster?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSpecialty = selectedSpecialty === 'all' || g.specialtyId === selectedSpecialty;
      
      const matchesSociety = selectedSociety === 'all' || 
                            (g.issuingSocieties && g.issuingSocieties.includes(selectedSociety));
      
      return matchesSearch && matchesSpecialty && matchesSociety;
    });

    if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      result.sort((a, b) => (b.clinicalWeight || 0) - (a.clinicalWeight || 0));
    }

    return result;
  }, [guidelines, searchQuery, selectedSpecialty, selectedSociety, sortBy]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Search & Global Controls */}
      <header className="px-6 lg:px-12 pt-16 pb-8 border-b border-foreground/5 space-y-8 bg-surface-subtle/50 backdrop-blur-3xl shrink-0 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em]">Global Repository</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-serif font-black text-foreground tracking-tighter italic">Guideline Central</h1>
            <p className="text-foreground/40 text-[12px] font-medium tracking-wide max-w-xl leading-relaxed">
              Explore the most recent clinical practice recommendations, structured for rapid point-of-care implementation.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-foreground/5 p-1.5 rounded-[20px] border border-foreground/10 shadow-inner">
            <button 
              onClick={() => setSortBy('relevance')}
              className={`px-6 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'relevance' ? 'bg-white text-black shadow-xl scale-105' : 'text-foreground/40 hover:text-foreground'}`}
            >
              Relevance
            </button>
            <button 
              onClick={() => setSortBy('date')}
              className={`px-6 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'date' ? 'bg-white text-black shadow-xl scale-105' : 'text-foreground/40 hover:text-foreground'}`}
            >
              Newest
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px_240px] gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Recherche par pathologie ou mots-clés..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 bg-foreground/5 border border-foreground/10 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-foreground placeholder:text-foreground/20"
            />
          </div>
          
          <CustomSelect 
            label="Specialties"
            value={selectedSpecialty}
            options={specialtyOptions}
            onChange={setSelectedSpecialty}
            icon={Filter}
          />

          <CustomSelect 
            label="Societies"
            value={selectedSociety}
            options={societies}
            onChange={setSelectedSociety}
            icon={Globe}
          />
        </div>
      </header>

      {/* Results area */}
      <main className="flex-1 overflow-y-auto px-6 lg:px-12 pb-12 no-scrollbar scroll-smooth">
        <div className="hidden lg:block w-full">
          {/* Table-like Header */}
          <div className="grid grid-cols-[1fr_200px_150px_120px_150px] gap-6 px-6 pt-8 pb-4 border-b border-foreground/5 text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] sticky top-0 bg-background z-10 w-full mb-2">
            <span>Guideline Title & Societies</span>
            <span>Document Types</span>
            <span>Date</span>
            <span>Access</span>
            <span className="text-right">Action</span>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredGuidelines.map((g, idx) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => onPaperClick(g)}
                className="grid grid-cols-[1fr_200px_150px_120px_150px] gap-6 px-6 py-8 border-b border-foreground/5 hover:bg-foreground/[0.02] transition-all cursor-pointer group items-center"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                      {SPECIALTIES.find(s => s.id === g.specialtyId)?.name}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                      Grade {g.recommendationGrade}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-black text-foreground leading-tight group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                    {g.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {g.issuingSocieties?.map(soc => (
                      <span key={soc} className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.1em] flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-foreground/20" />
                        {soc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {g.availableResources?.map(res => (
                    <div key={res} className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/40 group-hover:text-white transition-all hover:scale-110 hover:bg-blue-600/20 hover:border-blue-500/30" title={res}>
                      {res === 'pocket-guide' && <BookOpen size={18} />}
                      {res === 'summary' && <Star size={18} />}
                      {res === 'patient-guide' && <User size={18} />}
                      {res === 'quiz' && <GraduationCap size={18} />}
                    </div>
                  ))}
                </div>

                <div className="text-[11px] font-black text-foreground/40 group-hover:text-foreground transition-colors tracking-widest uppercase">
                  {new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                <div>
                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${g.accessStatus === 'free' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                     {g.accessStatus === 'free' ? 'Open Access' : 'Restricted'}
                   </span>
                </div>

                <div className="flex justify-end pr-4">
                   <button className="h-12 px-8 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-600/30">
                      Explorer
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile Grid */}
        <div className="lg:hidden grid grid-cols-1 gap-4 pt-8 pb-20">
           {filteredGuidelines.map((g) => (
             <motion.div
               key={g.id}
               onClick={() => onPaperClick(g)}
               className="p-6 rounded-3xl bg-foreground/[0.03] border border-foreground/5 space-y-4 active:scale-95 transition-all hover:bg-foreground/[0.05]"
             >
               <div className="flex items-center justify-between">
                 <div className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
                    {SPECIALTIES.find(s => s.id === g.specialtyId)?.name}
                 </div>
                 <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">
                   {new Date(g.date).getFullYear()}
                 </span>
               </div>
               
               <h3 className="text-xl sm:text-2xl font-serif font-black text-foreground uppercase leading-[1.15] tracking-tight">
                 {g.title}
               </h3>
               
               <div className="flex items-center gap-3">
                 <div className="flex -space-x-2">
                    {g.availableResources?.slice(0, 3).map(res => (
                       <div key={res} className="w-8 h-8 rounded-xl bg-surface-subtle border border-foreground/10 flex items-center justify-center text-foreground/40 shadow-xl">
                         {res === 'pocket-guide' && <BookOpen size={14} />}
                         {res === 'summary' && <Star size={14} />}
                         {res === 'quiz' && <GraduationCap size={14} />}
                       </div>
                    ))}
                 </div>
                 <div className="w-px h-5 bg-foreground/10" />
                 <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Resources</span>
               </div>

               <div className="flex items-center justify-between pt-4 border-t border-foreground/5">
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${g.accessStatus === 'free' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                    <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{g.accessStatus}</span>
                 </div>
                 <button className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    Open <ChevronRight size={14} />
                 </button>
               </div>
             </motion.div>
           ))}
        </div>

        {filteredGuidelines.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-30 space-y-6">
            <div className="w-24 h-24 rounded-full bg-foreground/5 flex items-center justify-center">
              <Search size={48} className="text-foreground/20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-serif font-black text-foreground">Aucun résultat</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Ajustez vos filtres ou vos mots-clés.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
