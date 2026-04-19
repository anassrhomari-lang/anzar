import React from 'react';
import { motion } from 'motion/react';
import { Paper } from '../types';
import { ShieldCheck, Heart, Brain, Activity, Stethoscope, Microscope, Zap, Pill, Thermometer, Syringe, Clipboard, FileText, FlaskConical, Dna } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

interface MedicalBookCoverProps {
  paper: Paper;
  className?: string;
  hideDetails?: boolean;
  isOpen?: boolean;
  noEffect?: boolean;
}

// Fixed seeds/icons for specialties to ensure 100% consistency
const SPECIALTY_ICONS: Record<string, any> = {
  'cardiology': { icon: Heart, color: '#EF4444' },
  'neurology': { icon: Brain, color: '#8B5CF6' },
  'oncology': { icon: Microscope, color: '#10B981' },
  'pediatrics': { icon: Activity, color: '#F59E0B' },
  'radiology': { icon: Zap, color: '#3B82F6' },
  'emergency': { icon: Activity, color: '#EF4444' },
  'pharmacology': { icon: Pill, color: '#EC4899' },
  'genetics': { icon: Dna, color: '#8B5CF6' },
  'default': { icon: Stethoscope, color: '#3B82F6' }
};

const KEYWORD_ICONS = [
  { keywords: ['cancer', 'tumor', 'oncology'], icon: Microscope },
  { keywords: ['heart', 'cardiac', 'cardio', 'vessel'], icon: Heart },
  { keywords: ['brain', 'neuro', 'mental', 'sleep'], icon: Brain },
  { keywords: ['drug', 'medicine', 'pill', 'pharma'], icon: Pill },
  { keywords: ['dna', 'gene', 'genetic'], icon: Dna },
  { keywords: ['test', 'lab', 'flask'], icon: FlaskConical },
  { keywords: ['surgery', 'operation', 'surgical'], icon: Syringe },
  { keywords: ['fever', 'temperature', 'virus'], icon: Thermometer },
  { keywords: ['report', 'study', 'clinical'], icon: FileText },
];

export const MedicalBookCover: React.FC<MedicalBookCoverProps> = ({ 
  paper, 
  className = "", 
  hideDetails = false, 
  isOpen = false,
  noEffect = false
}) => {
  const [imgError, setImgError] = React.useState(false);
  const specialtyKey = paper.specialtyId?.toLowerCase() || 'default';
  const config = SPECIALTY_ICONS[specialtyKey] || SPECIALTY_ICONS.default;
  
  // Try to find a more specific icon based on keywords in title
  const titleLower = paper.title.toLowerCase();
  const keywordMatch = KEYWORD_ICONS.find(item => 
    item.keywords.some(kw => titleLower.includes(kw))
  );
  
  const Icon = keywordMatch ? keywordMatch.icon : config.icon;
  const illustrationUrl = paper.generatedIllustrationUrl || paper.imageUrl || getImageUrl(paper.title, paper.id, 'cover');

  return (
    <div className={`group perspective-1000 ${className}`} style={{ containerType: 'inline-size' }}>
      <div className="relative aspect-[3/4.2] w-full transform-style-3d transition-transform duration-500">
        
        {/* The Stacked Pages (To give it volume) */}
        <div className="absolute inset-0 ml-[12.5%] bg-white shadow-inner rounded-r-sm z-0 border border-black/5" />
        <div className="absolute inset-0 ml-[12.25%] translate-x-[1px] bg-[#fdfcf0] shadow-inner rounded-r-sm z-0 border border-black/5" />
        
        {/* The Inside Page (Primary revealed page - Always show details if not explicitly hidden to allow preview) */}
        <div className={`absolute inset-0 ml-[12%] bg-[#fdfcf0] shadow-inner rounded-r-sm z-0 flex flex-col p-6 lg:p-8 overflow-hidden border border-black/5 ${hideDetails ? 'opacity-0' : 'opacity-100'}`}>
          {/* Academic Branding Header */}
          <div className="border-b-[0.5px] border-black/10 pb-2 mb-4">
            <p className="text-[6px] lg:text-[7px] font-black text-black/40 uppercase tracking-[0.3em]">Scientific Journal • Vol 24</p>
          </div>

          {/* Title Page Content */}
          <div className="flex-1 flex flex-col justify-center py-4">
            <h3 className="text-[10px] lg:text-[12px] font-serif font-bold text-black/80 leading-tight mb-2 line-clamp-4">
              {paper.title}
            </h3>
            <div className="w-6 h-[0.5px] bg-black/20 mb-3" />
            <p className="text-[7px] lg:text-[8px] font-medium text-black/60 italic font-serif">
              {paper.authors.join(', ')}
            </p>
          </div>
          
          {/* Secondary faint text content to simulate a real page bottom */}
          <div className="space-y-1 opacity-[0.08]">
            <div className="w-full h-[1px] bg-black" />
            <div className="w-[90%] h-[1px] bg-black" />
            <div className="w-[95%] h-[1px] bg-black" />
          </div>

          <div className="mt-auto flex justify-between items-end opacity-20">
            <Icon size={24} strokeWidth={1} className="text-black" />
            <span className="text-[6px] lg:text-[7px] font-serif italic text-black">Anzar Academy Press</span>
          </div>
          {/* Subtle page gradient/fold for depth */}
          <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/20 via-black/5 to-transparent" />
        </div>

        {/* The Front Cover (Actually rotates) */}
        <motion.div 
          animate={{ rotateY: (isOpen && !noEffect) ? -95 : 0, originX: 0 }}
          whileHover={(!isOpen && !noEffect) ? { rotateY: -95, originX: 0 } : {}}
          transition={{ 
            type: "spring", 
            stiffness: 80, 
            damping: 18,
            mass: 0.8
          }}
          className="relative inset-0 w-full h-full bg-[#1a1a1a] flex flex-col select-none shadow-[10px_10px_30px_rgba(0,0,0,0.3)] transform-style-3d border-y border-r border-black/20 overflow-hidden rounded-r-sm z-10 will-change-transform"
          style={{ 
            backfaceVisibility: 'hidden',
            boxShadow: isOpen ? '0 30px 60px rgba(0,0,0,0.5)' : '10px 10px 30px rgba(0,0,0,0.3)'
          }}
        >
          {/* Background Image (Full Cover) */}
          <img 
            src={illustrationUrl}
            alt=""
            className="absolute inset-x-0 inset-y-0 ml-[12%] w-[88%] h-full object-cover contrast-[1.1] saturate-[1.1]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Hide broken image icon and just show a nice fallback gradient
              e.currentTarget.style.display = 'none';
            }}
          />

          {/* Paper Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-multiply z-10" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} 
          />

          {/* Binding/Spine (Academic Blue Gradient) */}
          <div 
            className="absolute inset-y-0 left-0 w-[12%] z-50 flex flex-col items-center py-4 border-r border-black/40 shadow-[5px_0_15px_rgba(0,0,0,0.3)]"
            style={{ 
              background: 'linear-gradient(to top right, #02204B 0%, #00356B 50%, #004789 100%)'
            }}
          >
            <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
            
            <div className="w-[1px] h-full bg-foreground/10 absolute right-[2px]" />
            
            <div className="mt-auto mb-6 flex flex-col items-center gap-4">
              <div 
                className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                style={{ backgroundColor: config.color }} 
              />
            </div>
          </div>

          {/* Glossiness Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none z-40 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
        </motion.div>
      </div>
    </div>
  );
};
