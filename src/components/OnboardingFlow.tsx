import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, ChevronRight, ChevronLeft, Check, Globe, User, GraduationCap, Target } from 'lucide-react';
import ShinyButton from './ui/shiny-button';
import { SPECIALTIES } from '../constants';

interface OnboardingFlowProps {
  onComplete: (data: any) => void;
}

const COUNTRIES = [
  { name: 'USA', emoji: '🇺🇸' },
  { name: 'UK', emoji: '🇬🇧' },
  { name: 'Canada', emoji: '🇨🇦' },
  { name: 'France', emoji: '🇫🇷' },
  { name: 'Germany', emoji: '🇩🇪' },
  { name: 'Japan', emoji: '🇯🇵' },
  { name: 'Australia', emoji: '🇦🇺' },
  { name: 'Brazil', emoji: '🇧🇷' },
  { name: 'India', emoji: '🇮🇳' },
  { name: 'UAE', emoji: '🇦🇪' },
];

const GOALS = [
  { id: 'clinical', label: 'Clinical Decisions', icon: Brain },
  { id: 'research', label: 'Research Literacy', icon: Target },
  { id: 'treatments', label: 'New Treatments', icon: GraduationCap },
];

const EXPERIENCE_LEVELS = ['Resident', 'Attending', 'Fellow'];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    specialty: '',
    subTopics: [] as string[],
    goal: '',
    experience: '',
    name: '',
    country: '',
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete(formData);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleSubTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      subTopics: prev.subTopics.includes(topic)
        ? prev.subTopics.filter(t => t !== topic)
        : prev.subTopics.length < 5 ? [...prev.subTopics, topic] : prev.subTopics
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground tracking-tight">Pick your specialty</h2>
              <p className="text-muted-foreground text-sm lg:text-base font-medium opacity-80">We'll tailor your knowledge network to your expertise</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {SPECIALTIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setFormData({ ...formData, specialty: s.id }); handleNext(); }}
                  className={`w-full p-5 rounded-3xl border transition-all duration-500 flex items-center justify-between group relative overflow-hidden ${formData.specialty === s.id ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'bg-foreground/5 border-foreground/10 hover:bg-foreground/10 hover:border-foreground/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]" style={{ backgroundColor: s.color }} />
                    <span className="text-base font-black uppercase tracking-widest text-foreground group-hover:translate-x-1 transition-transform">{s.name}</span>
                  </div>
                  {formData.specialty === s.id && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/50"
                    >
                      <Check size={18} strokeWidth={3} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground tracking-tight">Sub-topics</h2>
              <p className="text-muted-foreground text-sm lg:text-base font-medium opacity-80">Select 3–5 areas you follow closely in clinical practice</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {['Heart Failure', 'Arrhythmia', 'Imaging', 'Intervention', 'Prevention', 'Genetics', 'Pediatrics', 'Surgery', 'Pharmacology', 'AI in Medicine'].map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleSubTopic(topic)}
                  className={`px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${formData.subTopics.includes(topic) ? 'bg-blue-500 border-blue-500 text-white shadow-[0_10px_20px_rgba(59,130,246,0.3)]' : 'bg-foreground/5 border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/10'}`}
                >
                  {topic}
                </button>
              ))}
            </div>
            <div className="pt-6">
              <ShinyButton 
                disabled={formData.subTopics.length < 3}
                onClick={handleNext}
                className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] disabled:opacity-30 shadow-2xl shadow-blue-500/20"
              >
                Continue ({formData.subTopics.length}/5)
              </ShinyButton>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground tracking-tight">Your primary goal</h2>
              <p className="text-muted-foreground text-sm lg:text-base font-medium opacity-80">Help us prioritize your clinical feed and insights</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => { setFormData({ ...formData, goal: goal.id }); handleNext(); }}
                  className={`w-full p-6 rounded-[32px] border transition-all duration-500 flex items-center gap-5 text-left group ${formData.goal === goal.id ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'bg-foreground/5 border-foreground/10 hover:bg-foreground/10'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${formData.goal === goal.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' : 'bg-foreground/5 text-muted-foreground group-hover:bg-foreground/10'}`}>
                    <goal.icon size={28} />
                  </div>
                  <span className="text-base lg:text-lg font-black uppercase tracking-widest text-foreground">{goal.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground tracking-tight">Experience level</h2>
              <p className="text-muted-foreground text-sm lg:text-base font-medium opacity-80">This affects paper complexity and clinical filters</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => { setFormData({ ...formData, experience: level }); handleNext(); }}
                  className={`w-full p-6 rounded-[32px] border transition-all duration-500 flex items-center justify-between group ${formData.experience === level ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'bg-foreground/5 border-foreground/10 hover:bg-foreground/10'}`}
                >
                  <span className="text-base lg:text-lg font-black uppercase tracking-widest text-foreground">{level}</span>
                  {formData.experience === level && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/50"
                    >
                      <Check size={18} strokeWidth={3} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground tracking-tight">Final details</h2>
              <p className="text-muted-foreground text-sm lg:text-base font-medium opacity-80">How should we address you in the academy?</p>
            </div>
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-500 pointer-events-none" />
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={20} />
                <input 
                  type="text" 
                  placeholder="Dr. Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-14 pl-14 pr-6 rounded-2xl bg-foreground/5 border border-foreground/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-base font-medium text-foreground transition-all outline-none placeholder:text-muted-foreground/30 shadow-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-[240px] overflow-y-auto no-scrollbar p-1">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setFormData({ ...formData, country: c.name })}
                    className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all duration-300 ${formData.country === c.name ? 'bg-blue-500/10 border-blue-500 shadow-lg' : 'bg-foreground/5 border-foreground/10 hover:bg-foreground/10'}`}
                  >
                    <span className="text-xl">{c.emoji}</span>
                    <span className="text-foreground truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-6">
              <ShinyButton 
                disabled={!formData.name || !formData.country}
                onClick={handleNext}
                className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] disabled:opacity-30 shadow-2xl shadow-blue-500/20"
              >
                Complete Setup
              </ShinyButton>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-background to-blue-900/10 pointer-events-none" />
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-foreground/5 z-50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-[32px] p-8 lg:p-10 border-foreground/10 shadow-2xl"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex justify-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all ${i + 1 === step ? 'w-4 bg-blue-500' : 'w-1 bg-foreground/10'}`} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
