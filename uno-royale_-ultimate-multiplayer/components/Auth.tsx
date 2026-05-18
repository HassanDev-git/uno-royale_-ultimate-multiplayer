
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowRight, Mail, Lock, LogIn, UserPlus, CheckCircle, AlertCircle, RotateCcw, Loader2, KeyRound } from 'lucide-react';
import { Player } from '../types';
import { AVATARS } from '../constants';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, sendPasswordResetEmail } from '../services/firebaseService';

interface AuthProps {
  onAuthSuccess: (user: Player) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'LOGIN') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        if (!fbUser.emailVerified) {
          setError("Your email is not verified. Check your inbox.");
          await signOut(auth);
          setVerificationSent(true);
          setLoading(false);
          return;
        }

        const player: Player = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Warrior',
          email: fbUser.email || '',
          hand: [],
          isBot: false,
          avatar: fbUser.photoURL || AVATARS[0],
          unoDeclared: false,
          coins: 100,
          wins: 0,
          inventory: ['card_classic', 'bg_dark', 'tag_none', 'chat_default'],
          equipped: { cardTheme: 'card_classic', bgTheme: 'bg_dark', nameTag: 'tag_none', chatTheme: 'chat_default' }
        };
        onAuthSuccess(player);
      } else if (authMode === 'SIGNUP') {
        if (!name.trim()) throw new Error("Name is required");
        if (password.length < 6) throw new Error("Password must be at least 6 characters");
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        
        await updateProfile(fbUser, {
          displayName: name,
          photoURL: randomAvatar
        });

        await sendEmailVerification(fbUser);
        await signOut(auth);
        setVerificationSent(true);
      } else if (authMode === 'FORGOT') {
        if (!email) throw new Error("Please enter your email address");
        await sendPasswordResetEmail(auth, email);
        setResetSent(true);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered.");
      } else if (err.code === 'auth/user-not-found') {
        setError("No user found with this email.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || !password) {
      setError("Please enter your credentials again to resend the link.");
      setVerificationSent(false);
      return;
    }
    setError('');
    setLoading(true);
    setResendSuccess(false);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 6000);
    } catch (err: any) {
      setError("Failed to resend. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-uno relative overflow-hidden">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-zinc-900/50 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl shadow-2xl z-10 text-center">
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
            {resendSuccess ? <CheckCircle className="text-green-500" size={40} /> : <Mail className="text-blue-500" size={40} />}
          </div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase italic">
            {resendSuccess ? "Link Resent!" : "Verify Your Email"}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            {resendSuccess 
              ? "A fresh verification link has been sent. Check your inbox again." 
              : <>We've sent a verification link to <span className="text-white font-bold">{email}</span>. Please check your inbox.</>}
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => { setVerificationSent(false); setAuthMode('LOGIN'); setError(''); }}
              className="w-full bg-white text-black p-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
            >
              BACK TO LOGIN <LogIn size={20} />
            </button>
            <button 
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full bg-zinc-800 text-zinc-400 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:text-white flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}
              {loading ? "SENDING..." : "Resend Link"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (resetSent) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-uno relative overflow-hidden">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-zinc-900/50 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl shadow-2xl z-10 text-center">
          <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase italic">Email Sent</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Check your email <span className="text-white font-bold">{email}</span> for instructions to reset your password.
          </p>
          <button 
            onClick={() => { setResetSent(false); setAuthMode('LOGIN'); setError(''); }}
            className="w-full bg-white text-black p-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
          >
            RETURN TO LOGIN <LogIn size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-uno relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md bg-zinc-900/50 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl shadow-2xl z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tighter italic uppercase">
            <span className="text-red-500">U</span>
            <span className="text-blue-500">N</span>
            <span className="text-yellow-500">O</span> ROYALE
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">
            {authMode === 'LOGIN' ? 'Login to your account' : authMode === 'SIGNUP' ? 'Create your warrior persona' : 'Recover your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {authMode === 'SIGNUP' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Warrior Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Username" required className="w-full bg-black/40 border border-zinc-800 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full bg-black/40 border border-zinc-800 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {authMode !== 'FORGOT' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Secret Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full bg-black/40 border border-zinc-800 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {authMode === 'LOGIN' && (
            <div className="text-right">
              <button type="button" onClick={() => setAuthMode('FORGOT')} className="text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors">
                Forgot Password?
              </button>
            </div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
              <p className="text-red-500 text-[10px] font-bold">{error}</p>
            </motion.div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-white hover:bg-zinc-200 text-black p-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-6">
            {loading ? <Loader2 className="animate-spin" size={24} /> : <>{authMode === 'LOGIN' ? 'LOG IN' : authMode === 'SIGNUP' ? 'SIGN UP' : 'RESET PASSWORD'} <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          {authMode !== 'LOGIN' && (
            <button onClick={() => setAuthMode('LOGIN')} className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
              <LogIn size={14} /> ALREADY A WARRIOR? LOG IN
            </button>
          )}
          {authMode !== 'SIGNUP' && (
             <button onClick={() => setAuthMode('SIGNUP')} className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
              <UserPlus size={14} /> NEW PLAYER? JOIN NOW
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
