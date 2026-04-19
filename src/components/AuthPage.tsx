import React, { useState } from 'react';
import { motion } from 'motion/react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, sendSignInLinkToEmail } from 'firebase/auth';
import { Brain, Mail, Chrome, ArrowRight } from 'lucide-react';
import ShinyButton from './ui/shiny-button';

interface AuthPageProps {
  isDark: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ isDark }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGoogleLogin = async () => {
    setMessage('');
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setMessage('The login popup was closed. Try again, or open the app in a new tab if this persists.');
      } else if (error.code === 'auth/cancelled-by-user') {
        setMessage('Login was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setMessage('The login popup was blocked. Please allow popups or open the app in a new tab.');
      } else {
        setMessage('An error occurred during Google login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('Check your email for the magic link!');
    } catch (error) {
      console.error('Magic link error:', error);
      setMessage('Error sending magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md glass-card rounded-[40px] p-10 lg:p-12 space-y-10 relative z-10 border-foreground/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/30 transform hover:scale-110 transition-transform duration-500">
            <img 
              src="https://framerusercontent.com/images/YPAzIjoMNrFadoMFFkX13J0nXrs.png?scale-down-to=512&width=3432&height=3432" 
              alt="Anzar Academy Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground tracking-tight">Anzar Academy</h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-6 bg-[#00356B]/40" />
              <p className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)] text-[10px] font-black uppercase tracking-[0.25em]">The Clinical Constellation</p>
              <div className="h-px w-6 bg-[#00356B]/40" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center gap-4 text-foreground font-black uppercase tracking-widest text-xs hover:bg-foreground/10 hover:border-foreground/20 transition-all active:scale-[0.98] disabled:opacity-30 shadow-xl group"
          >
            <Chrome size={22} className="text-blue-400 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all" />
            Continue with Google
          </button>

          <div className="relative flex items-center gap-6 py-2">
            <div className="flex-1 h-px bg-foreground/5" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">or magic link</span>
            <div className="flex-1 h-px bg-foreground/5" />
          </div>

          <form onSubmit={handleMagicLink} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-all duration-500 pointer-events-none" />
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-blue-400 transition-colors pointer-events-none" size={20} />
              <input 
                type="email" 
                placeholder="doctor@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-foreground/5 border border-foreground/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-base font-medium text-foreground transition-all outline-none placeholder:text-muted-foreground/30 shadow-xl"
                required
              />
            </div>
            <ShinyButton 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 shadow-2xl shadow-[#00356B]/20"
            >
              Send Magic Link
              <ArrowRight size={18} />
            </ShinyButton>
          </form>

          {message && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                <p className="text-center text-xs font-black text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] uppercase tracking-widest leading-relaxed">{message}</p>
              </div>
              {(message.includes('popup') || message.includes('blocked')) && (
                <button
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="w-full h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/25 transition-all shadow-lg"
                >
                  Open in New Tab
                </button>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 space-y-4">
          <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">
            By continuing, you agree to our <span className="text-foreground hover:text-blue-500 transition-colors cursor-pointer">Terms of Service</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
