import React, { useState, useEffect } from 'react';
import { Graph } from './components/Graph';
import { PaperCard } from './components/PaperCard';
import { Home } from './components/Home';
import { AudiobookView } from './components/AudiobookView';
import { LeaderboardView } from './components/LeaderboardView';
import { PaperPreviewCard } from './components/PaperPreviewCard';
import { LearningPathView } from './components/LearningPathView';
import { DoctorProfileView } from './components/DoctorProfileView';
import { ArticlesListView } from './components/ArticlesListView';
import { JournalsDirectoryView } from './components/JournalsDirectoryView';
import { LatestNewsView } from './components/LatestNewsView';
import { GuidelineLibraryView } from './components/GuidelineLibraryView';
import { GuidelineExplorerView } from './components/GuidelineExplorerView';
import { auth, db, storage, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthPage } from './components/AuthPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MOCK_PAPERS, MOCK_LINKS, SPECIALTIES, USER_STATS } from './constants';
import { Paper, LearningPath, UserProfile } from './types';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Filter, Home as HomeIcon, Compass, Brain, Bookmark, User, Trophy, Moon, Sun, Bell, Headset, LogOut, Award, Star, Zap, ClipboardList, LayoutGrid, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'home' | 'news' | 'audiobook' | 'saved' | 'profile' | 'leaderboard' | 'guidelines';

export default function App() {
  (window as any).MOCK_PAPERS = MOCK_PAPERS;
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [previewPaper, setPreviewPaper] = useState<Paper | null>(null);
  const [realArticles, setRealArticles] = useState<Paper[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState(false);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [isSidebarCompact, setIsSidebarCompact] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{id: string, name: string} | null>(null);
  const [savedPapers, setSavedPapers] = useState<Paper[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Sync saved papers when profile changes
    if (userProfile?.savedPaperIds) {
      const saved = [...MOCK_PAPERS, ...realArticles].filter(p => userProfile.savedPaperIds?.includes(p.id));
      setSavedPapers(saved);
    }
  }, [userProfile?.savedPaperIds, realArticles]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Fetch profile
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
    }
  }, [isDark]);

  const handleOnboardingComplete = async (data: any) => {
    if (!user) return;
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      ...data,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    };
    
    try {
      await setDoc(doc(db, 'users', user.uid), profile);
      setUserProfile(profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  if (isAuthLoading) {
    return (
      <ErrorBoundary>
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)] pointer-events-none" />
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[32px] overflow-hidden shadow-2xl relative z-10 animate-bounce">
              <img 
                src="https://framerusercontent.com/images/YPAzIjoMNrFadoMFFkX13J0nXrs.png?scale-down-to=512&width=3432&height=3432" 
                alt="Anzar Academy Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="mt-8 space-y-2 text-center relative z-10">
            <h2 className="text-xl font-serif font-bold text-foreground tracking-tight">Anzar Academy</h2>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Constellation...</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <AuthPage isDark={isDark} />
      </ErrorBoundary>
    );
  }

  if (!userProfile || !userProfile.onboardingCompleted) {
    return (
      <ErrorBoundary>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </ErrorBoundary>
    );
  }

  const filteredPapers = [...MOCK_PAPERS, ...realArticles].filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty ? p.specialtyId === selectedSpecialty : true;
    return matchesSearch && matchesSpecialty;
  });

  const handlePaperClick = async (paper: Paper) => {
    if (activeTab === 'brain') {
      setPreviewPaper(paper);
    } else {
      setSelectedPaper(paper);

      // Track Read and Impact
      if (user && userProfile) {
        const alreadyRead = userProfile.readPaperIds?.includes(paper.id);
        if (!alreadyRead) {
          try {
            const userRef = doc(db, 'users', user.uid);
            const newReadIds = [...(userProfile.readPaperIds || []), paper.id];
            const newImpactScore = (userProfile.impactScore || 0) + 10;
            
            await updateDoc(userRef, {
              readPaperIds: newReadIds,
              impactScore: newImpactScore
            });

            setUserProfile({
              ...userProfile,
              readPaperIds: newReadIds,
              impactScore: newImpactScore
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
          }
        }
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    setIsUploadingPhoto(true);
    const file = e.target.files[0];
    const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
    
    try {
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { photoURL });
      setUserProfile(prev => prev ? { ...prev, photoURL } : null);
    } catch (e) {
      console.error("Error uploading photo:", e);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home 
            onPaperClick={handlePaperClick} 
            userProfile={userProfile} 
            onArticlesLoaded={setRealArticles}
            onCategoryClick={(cat) => setSelectedCategory(cat)}
          />
        );
      case 'news':
        return <LatestNewsView onClose={() => setActiveTab('home')} />;
      case 'audiobook':
        return <AudiobookView papers={[...MOCK_PAPERS, ...realArticles]} />;
      case 'leaderboard':
        return <LeaderboardView isDark={isDark} onDoctorClick={setSelectedDoctor} />;
      case 'guidelines':
        return <GuidelineExplorerView papers={[...MOCK_PAPERS, ...realArticles]} onPaperClick={handlePaperClick} />;
      case 'saved':
        return (
          <GuidelineLibraryView 
            userProfile={userProfile}
            savedPapers={savedPapers}
            onPaperClick={handlePaperClick}
            onRemovePaper={async (paperId) => {
              if (!user || !userProfile) return;
              try {
                const newIds = (userProfile.savedPaperIds || []).filter(id => id !== paperId);
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { savedPaperIds: newIds });
                setUserProfile({ ...userProfile, savedPaperIds: newIds });
              } catch (e) {
                handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
              }
            }}
            onUpdateFolder={async (folders) => {
              if (!user || !userProfile) return;
              try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { folders });
                setUserProfile({ ...userProfile, folders });
              } catch (e) {
                handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
              }
            }}
          />
        );
      case 'profile':
        return (
          <div className="flex-1 p-6 space-y-10 overflow-y-auto no-scrollbar max-w-4xl mx-auto w-full pb-32">
            <div className="flex flex-col items-center gap-6 py-12 relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full -z-10" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center font-bold text-3xl text-white border-4 border-foreground/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transform hover:scale-105 transition-transform duration-500 relative"
              >
                {isUploadingPhoto ? (
                  <div className="text-sm">Uploading...</div>
                ) : (
                  <img src={userProfile?.photoURL || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"} alt="Profile" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold text-foreground">Edit</div>
              </button>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
              <div className="text-center space-y-2 group">
                <div className="relative inline-block">
                  <input 
                    type="text"
                    defaultValue={userProfile?.name || USER_STATS.name}
                    className="text-3xl lg:text-4xl font-serif font-bold text-foreground tracking-tight bg-transparent border-none outline-none text-center focus:ring-0 p-0"
                    placeholder="Enter your name..."
                  />
                  <div className="absolute bottom-0 left-0 w-full h-px bg-blue-500/0 group-hover:bg-blue-500/20 transition-colors" />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-blue-500 text-[11px] font-black uppercase tracking-[0.2em]">{userProfile?.specialty || 'Cardiology'} Specialist</p>
                  <div className="w-1 h-1 rounded-full bg-foreground/20" />
                  <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.2em]">{userProfile?.country || 'Mayo Clinic'}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-3 bg-gradient-to-br from-blue-500/10 to-transparent border-foreground/5 shadow-2xl">
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.25em] opacity-60">Publications Read</p>
                <p className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">{userProfile?.readPaperIds?.length || 0}</p>
              </div>
              <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-3 bg-gradient-to-br from-amber-500/10 to-transparent border-foreground/5 shadow-2xl">
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.25em] opacity-60">Impact Score</p>
                <p className="text-3xl lg:text-4xl font-black text-amber-400 tracking-tight">{userProfile?.impactScore || 0}</p>
              </div>
            </div>

            <div className="glass-card rounded-[32px] p-8 lg:p-10 space-y-8 border-foreground/5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl lg:text-2xl font-serif font-bold text-foreground">Settings</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-foreground/5 border border-foreground/5 hover:bg-foreground/10 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-500'}`}>
                      {isDark ? <Moon size={24} /> : <Sun size={24} />}
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground">Appearance</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsDark(!isDark)}
                    className={`w-14 h-7 rounded-full transition-all duration-500 relative shadow-inner ${isDark ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <motion.div 
                      animate={{ x: isDark ? 32 : 4 }}
                      className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-xl"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-[32px] p-8 lg:p-10 space-y-8 border-foreground/5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl lg:text-2xl font-serif font-bold text-foreground">Achievements</h3>
                <Award className="text-blue-500" size={24} />
              </div>
              <div className="grid gap-6">
                {(() => {
                  const allPapers = [...MOCK_PAPERS, ...realArticles];
                  const readPapers = allPapers.filter(p => userProfile?.readPaperIds?.includes(p.id));
                  const readCount = readPapers.length;
                  const specialtyPapersRead = readPapers.filter(p => p.specialtyId === userProfile?.specialty?.toLowerCase()).length;
                  
                  const achievements = [
                    { name: 'Explorer', desc: 'Read 5 papers', progress: Math.min(100, readCount * 20), icon: Sun },
                    { name: 'Scholar', desc: 'Read 25 papers', progress: Math.min(100, readCount * 4), icon: Star },
                    { name: 'Specialist', desc: `Master 5 ${userProfile?.specialty || ''} papers`, progress: Math.min(100, specialtyPapersRead * 20), icon: Award }
                  ];

                  return achievements.map((ach, i) => (
                    <div key={i} className="space-y-3 group cursor-default">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ach.progress === 100 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-foreground/5 text-muted-foreground'}`}>
                            <ach.icon size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground group-hover:text-blue-500 transition-colors">{ach.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{ach.desc}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-black tracking-widest ${ach.progress === 100 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          {ach.progress}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${ach.progress}%` }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className={`h-full rounded-full ${ach.progress === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]'}`} 
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-foreground/20 font-bold uppercase tracking-widest">
            Coming Soon
          </div>
        );
    }
  };

  const navItems = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'audiobook', icon: Headset, label: 'Audiobook' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'saved', icon: Bookmark, label: 'Saved' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen overflow-hidden flex font-sans">
      <div className="atmosphere" />

      {/* Desktop Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCompact ? 88 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col border-r border-surface bg-background/20 backdrop-blur-xl z-40 relative group/sidebar p-0"
      >
        {/* Toggle Button - Placed exactly on the border line */}
        <button 
          onClick={() => setIsSidebarCompact(!isSidebarCompact)}
          className="absolute -right-3 top-[10%] w-6 h-6 rounded-full bg-[#00356B] flex items-center justify-center text-foreground shadow-[0_0_15px_rgba(0,53,107,0.5)] border border-foreground/20 opacity-0 group-hover/sidebar:opacity-100 transition-all z-50 hover:bg-[#004789] hover:scale-110 active:scale-95"
          title={isSidebarCompact ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCompact ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
          <div className={`flex items-center gap-3 mb-12 relative z-10 ${isSidebarCompact ? 'justify-center' : 'px-2'}`}>
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
              <img 
                src="https://framerusercontent.com/images/YPAzIjoMNrFadoMFFkX13J0nXrs.png?scale-down-to=512&width=3432&height=3432" 
                alt="Anzar Academy Logo" 
                className="w-full h-full object-cover scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            <AnimatePresence>
              {!isSidebarCompact && (
                <motion.h1 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-serif font-bold text-foreground tracking-tight whitespace-nowrap"
                >
                  Anzar Academy
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          <nav className="flex-1 space-y-3">
            {navItems.map((item) => (
                <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center transition-all relative ${
                  isSidebarCompact ? 'justify-center p-3' : 'gap-4 px-4 py-3'
                } rounded-2xl ${
                  activeTab === item.id 
                    ? 'bg-[#00356B]/20 text-blue-400 font-black shadow-[0_0_25px_rgba(0,53,107,0.2)] border border-[#00356B]/40' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                }`}
              >
                <item.icon size={22} className={activeTab === item.id ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]' : ''} />
                
                <AnimatePresence>
                  {!isSidebarCompact && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm tracking-wide whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {activeTab === item.id && !isSidebarCompact && (
                  <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00356B] shadow-[0_0_8px_rgba(0,53,107,0.8)]" />
                )}
              </button>
            ))}

            <div className={`pt-6 mt-6 border-t border-foreground/5 ${isSidebarCompact ? 'flex justify-center' : ''}`}>
              <button
                onClick={handleLogout}
                className={`flex items-center transition-all text-red-400/70 hover:text-red-400 hover:bg-red-400/10 group border border-transparent hover:border-red-400/20 ${
                  isSidebarCompact ? 'p-2 rounded-xl' : 'w-full gap-4 px-4 py-3 rounded-2xl'
                }`}
              >
                <div className={`rounded-xl bg-red-400/10 flex items-center justify-center group-hover:bg-red-400/20 transition-colors ${
                  isSidebarCompact ? 'w-10 h-10' : 'w-8 h-8'
                }`}>
                  <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                </div>
                {!isSidebarCompact && <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Disconnect</span>}
              </button>
            </div>
          </nav>

          <AnimatePresence>
            {!isSidebarCompact && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-auto p-5 rounded-3xl bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-600/20 shadow-[0_10px_30px_rgba(37,99,235,0.1)]"
              >
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 opacity-80">Current Streak</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <Zap size={20} fill="currentColor" />
                  </div>
                  {(() => {
                    // Logic to calculate streak based on readPaperIds (simplified for demonstration)
                    // In a real app, you would have a more complex 'dailyActivity' log.
                    // Here we estimate using creation/update timestamps if available, 
                    // or just show a placeholder based on some user fields.
                    const streak = userProfile?.readPaperIds ? Math.min(30, userProfile.readPaperIds.length / 2 + 1) : 0;
                    return <span className="text-2xl font-black text-foreground tracking-tight">{Math.floor(streak)} Days</span>;
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {renderContent()}

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-48px)] max-w-md">
          <nav className="glass-menu px-6 py-3.5 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-surface">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`relative flex flex-col items-center gap-1 transition-all duration-500 group ${activeTab === item.id ? 'text-blue-400 scale-110' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute -inset-x-3 -inset-y-2 bg-[#00356B]/20 rounded-2xl -z-10 shadow-[0_0_25px_rgba(0,53,107,0.3)] border border-[#00356B]/30"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} className={activeTab === item.id ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]' : ''} />
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-red-400 transition-colors pl-2"
            >
              <LogOut size={20} />
            </button>
          </nav>
        </div>
      </main>

      <PaperCard
        paper={selectedPaper}
        onClose={() => setSelectedPaper(null)}
        userProfile={userProfile}
        onPaperSelect={(p) => setSelectedPaper(p)}
        onArticlesLoaded={(articles) => setRealArticles(prev => {
          // Add only unique articles by PMID
          const existingPmids = new Set(prev.map(a => a.pmid));
          const uniqueNew = articles.filter(a => !existingPmids.has(a.pmid));
          return [...prev, ...uniqueNew];
        })}
      />

      <PaperPreviewCard
        paper={previewPaper}
        onClose={() => setPreviewPaper(null)}
        onFullView={(paper) => {
          setPreviewPaper(null);
          setSelectedPaper(paper);
        }}
      />

      <AnimatePresence>
        {selectedPath && (
          <LearningPathView 
            path={selectedPath}
            onClose={() => setSelectedPath(null)}
            onPaperClick={handlePaperClick}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCategory && selectedCategory.id === 'meta-analysis' ? (
          <JournalsDirectoryView onClose={() => setSelectedCategory(null)} />
        ) : selectedCategory && selectedCategory.id === 'latest-news' ? (
          <LatestNewsView onClose={() => setSelectedCategory(null)} />
        ) : selectedCategory && (
          <ArticlesListView 
            articles={filteredPapers.filter(p => {
              const type = p.contentType?.toLowerCase() || '';
              const catId = selectedCategory.id;
              if (catId === 'articles') return type === 'article';
              if (catId === 'guidelines') return type === 'guideline';
              if (catId === 'books') return type === 'book';
              if (catId === 'reviews') return type === 'review' || type.includes('review');
              if (catId === 'trials') return type === 'trial' || type.includes('trial');
              return type === catId || type + 's' === catId;
            })}
            categoryName={selectedCategory.name}
            onClose={() => setSelectedCategory(null)}
            onArticleClick={handlePaperClick}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-[70] bg-background">
            <DoctorProfileView 
              doctor={selectedDoctor}
              onClose={() => setSelectedDoctor(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
}
