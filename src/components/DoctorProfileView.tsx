import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Star, MapPin, Award, BookOpen, MessageSquare, Share2, Heart } from 'lucide-react';

interface DoctorProfileViewProps {
  doctor: any;
  onClose: () => void;
}

export const DoctorProfileView: React.FC<DoctorProfileViewProps> = ({ doctor, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[70] bg-background flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-6 lg:py-8 flex items-center justify-between border-b border-foreground/5 bg-background/40 backdrop-blur-2xl sticky top-0 z-50">
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90 shadow-2xl border-foreground/10"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="flex gap-3">
          <button className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90 shadow-2xl border-foreground/10">
            <Share2 size={20} />
          </button>
          <button className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90 shadow-2xl border-foreground/10">
            <Heart size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />
        
        <div className="p-6 lg:p-12 max-w-5xl mx-auto w-full space-y-12 lg:space-y-16">
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 relative">
          <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full -z-10" />
          <div className="w-40 h-40 lg:w-56 lg:h-56 rounded-[48px] overflow-hidden border-4 border-foreground/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex-shrink-0 transform hover:scale-105 transition-transform duration-700">
            <img src={doctor.avatar} alt={doctor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-6xl font-serif font-bold text-foreground tracking-tight">{doctor.name}</h1>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <p className="text-blue-500 font-black uppercase tracking-[0.25em] text-xs lg:text-sm">{doctor.specialty} Specialist</p>
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
                <p className="text-muted-foreground font-black uppercase tracking-[0.25em] text-xs lg:text-sm">Mayo Clinic</p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={18} className="text-blue-500" />
                <span className="text-sm font-medium">Rochester, MN</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star size={18} className="text-amber-400" fill="currentColor" />
                <span className="text-sm font-black text-foreground">4.9 <span className="text-muted-foreground font-medium opacity-60">(124 Reviews)</span></span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
              <div className="px-5 py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                Top 1% Global
              </div>
              <div className="px-5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                Verified Expert
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'XP Points', value: doctor.xp.toLocaleString(), icon: Award, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Papers Read', value: '1,240', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Accuracy', value: '98.2%', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Followers', value: '12.4k', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-[32px] p-6 lg:p-8 space-y-4 border-foreground/5 shadow-2xl hover:scale-105 transition-all duration-500 group">
              <div className={`${stat.color} ${stat.bg} w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.25em] opacity-60">{stat.label}</p>
                <p className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Biography */}
        <div className="glass-card rounded-[40px] p-8 lg:p-12 space-y-6 border-foreground/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -z-10 group-hover:bg-blue-500/10 transition-colors duration-700" />
          <h3 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">Biography</h3>
          <p className="text-muted-foreground text-base lg:text-lg leading-relaxed font-medium opacity-80">
            {doctor.name} is a world-renowned specialist in {doctor.specialty} with over 15 years of clinical experience. 
            Currently serving as a Senior Consultant at the Mayo Clinic, they have published over 50 peer-reviewed papers 
            and are a frequent speaker at international medical conferences. Their research focuses on 
            innovative treatments and precision medicine in modern healthcare.
          </p>
        </div>

        {/* Recent Contributions */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">Recent Contributions</h3>
            <button className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-[32px] p-5 flex gap-6 hover:bg-foreground/5 transition-all duration-500 cursor-pointer group border-foreground/5 shadow-xl">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
                  <img src={`https://picsum.photos/seed/doc-contrib-${i}/200/200`} alt="contribution" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-2">
                  <h4 className="text-base font-serif font-bold text-foreground group-hover:text-blue-500 transition-colors line-clamp-2 leading-tight">
                    Advances in {doctor.specialty} Diagnostics: A 2024 Review
                  </h4>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Scientific Paper</p>
                    <div className="w-1 h-1 rounded-full bg-foreground/20" />
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">12 min read</p>
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">98% Match</span>
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">1.2k Reads</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </motion.div>
  );
};
