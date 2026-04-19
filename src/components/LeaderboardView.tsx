import React from 'react';
import { motion } from 'motion/react';
import { GlobePulse } from './ui/cobe-globe-pulse';
import { Trophy, Medal, Award, Star, User } from 'lucide-react';

const TOP_DOCTORS = [
  { id: 1, name: "Dr. Sarah Chen", specialty: "Cardiology", xp: 15420, rank: 1, avatar: "https://images.unsplash.com/photo-1559839734-2b71f153678f?auto=format&fit=crop&q=80&w=100&h=100" },
  { id: 2, name: "Dr. James Wilson", specialty: "Neurology", xp: 14850, rank: 2, avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100&h=100" },
  { id: 3, name: "Dr. Elena Rodriguez", specialty: "Oncology", xp: 13900, rank: 3, avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100&h=100" },
  { id: 4, name: "Dr. Michael Park", specialty: "Pediatrics", xp: 12400, rank: 4, avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100&h=100" },
  { id: 5, name: "Dr. Amara Okafor", specialty: "Dermatology", xp: 11200, rank: 5, avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=100&h=100" },
];

export const LeaderboardView: React.FC<{ isDark: boolean; onDoctorClick: (doc: any) => void }> = ({ isDark, onDoctorClick }) => {
  const [selectedDoc, setSelectedDoc] = React.useState<any>(null);
  const [zoom, setZoom] = React.useState(1);

  const handleMarkerClick = (markerId: string) => {
    const doc = TOP_DOCTORS.find(d => `pulse-${d.id}` === markerId) || TOP_DOCTORS[0];
    setSelectedDoc(doc);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar pb-32">
      <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
        <header className="text-center lg:text-left space-y-3">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground tracking-tight">Global Leaderboard</h2>
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="h-px w-8 bg-blue-500/50" />
            <p className="text-blue-500 text-[11px] font-black uppercase tracking-[0.25em]">Top Medical Specialists</p>
            <div className="h-px w-8 bg-blue-500/50" />
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-center">
          {/* Globe Section */}
          <div className="relative aspect-square w-full max-w-2xl mx-auto lg:mx-0 group">
            <div className="absolute inset-0 bg-blue-500/10 blur-[150px] rounded-full animate-pulse" />
            
            {/* Zoom Controls */}
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
              <button 
                onClick={() => setZoom(prev => Math.min(prev + 0.2, 2))}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl glass-card border-transparent flex items-center justify-center text-foreground hover:bg-foreground/10 transition-all hover:scale-110 active:scale-90 shadow-2xl"
              >
                <span className="text-xl font-bold">+</span>
              </button>
              <button 
                onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl glass-card border-transparent flex items-center justify-center text-foreground hover:bg-foreground/10 transition-all hover:scale-110 active:scale-90 shadow-2xl"
              >
                <span className="text-xl font-bold">-</span>
              </button>
            </div>

            <div 
              className="w-full h-full transition-transform duration-300 ease-out cursor-crosshair"
              style={{ transform: `scale(${zoom})` }}
            >
              <GlobePulse 
                dark={isDark ? 1 : 0} 
                className="w-full h-full" 
                markers={TOP_DOCTORS.map(doc => ({
                  id: `pulse-${doc.id}`,
                  location: [Math.random() * 180 - 90, Math.random() * 360 - 180], // Random locations for demo
                  delay: Math.random() * 2
                }))}
                onMarkerClick={handleMarkerClick}
              />
            </div>

            {/* Dr. Card Overlay */}
            {selectedDoc && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 w-[85%] lg:w-64 glass-card border-transparent rounded-xl lg:rounded-2xl p-4 shadow-2xl cursor-pointer"
                onClick={() => onDoctorClick(selectedDoc)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden border-2 border-transparent">
                    <img src={selectedDoc.avatar} alt={selectedDoc.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">{selectedDoc.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{selectedDoc.specialty}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-foreground/5 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-blue-500">
                    <Star size={12} fill="currentColor" />
                    <span className="text-[10px] font-bold">4.9</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">View Profile</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Leaderboard List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>Specialist</span>
              <span>XP Points</span>
            </div>

            <div className="space-y-3">
              {TOP_DOCTORS.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => onDoctorClick(doc)}
                  className="glass-card rounded-xl lg:rounded-2xl p-4 lg:p-5 flex items-center gap-5 border-transparent group hover:bg-foreground/10 transition-all duration-300 cursor-pointer hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1"
                >
                  <div className="w-10 flex justify-center">
                    {i === 0 ? <Trophy className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" size={24} /> :
                     i === 1 ? <Medal className="text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]" size={24} /> :
                     i === 2 ? <Medal className="text-amber-700 drop-shadow-[0_0_10px_rgba(180,83,9,0.5)]" size={24} /> :
                     <span className="text-muted-foreground font-black text-lg">{i + 1}</span>}
                  </div>

                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-500/50 transition-colors shadow-lg">
                    <img src={doc.avatar} alt={doc.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-foreground truncate group-hover:text-blue-500 transition-colors">{doc.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em]">{doc.specialty}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-blue-500 tracking-tight">{doc.xp.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Points</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
