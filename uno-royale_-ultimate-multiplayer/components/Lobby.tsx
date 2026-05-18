
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, Hash, ChevronLeft, ChevronRight, Globe, UserPlus, LogIn, ArrowLeft, Info, User, LogOut, Settings, Shield, ShoppingBag, Zap, Search } from 'lucide-react';
import { audioService } from '../services/audioService';
import { AVATARS } from '../constants';
import { AIDifficulty, Player } from '../types';

interface LobbyProps {
  userProfile: Player;
  onStart: (playerName: string, avatar: string, difficulty: AIDifficulty, isOnline: boolean, playerCount: number, roomId?: string, isPublic?: boolean) => void;
  onShowRules: () => void;
  onLogout: () => void;
  onShowAccount: () => void;
  onShowSettings: () => void;
  onShowShop: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ userProfile, onStart, onShowRules, onLogout, onShowAccount, onShowSettings, onShowShop }) => {
  const [avatarIndex, setAvatarIndex] = useState(AVATARS.indexOf(userProfile.avatar) || 0);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('MEDIUM');
  const [isOnline, setIsOnline] = useState(false);
  const [onlineAction, setOnlineAction] = useState<'CREATE' | 'JOIN' | 'QUICK' | null>(null);
  const [targetRoom, setTargetRoom] = useState('');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [quickMatchPlayers, setQuickMatchPlayers] = useState<number>(4);

  const handleStart = (action?: 'QUICK') => {
    if (isOnline && onlineAction === 'JOIN' && !targetRoom) return;
    
    audioService.init();
    onStart(
      userProfile.name, 
      AVATARS[avatarIndex], 
      difficulty, 
      isOnline, 
      action === 'QUICK' ? quickMatchPlayers : playerCount, 
      isOnline && onlineAction === 'JOIN' ? targetRoom : undefined,
      action === 'QUICK'
    );
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-6 overflow-y-auto overflow-x-hidden relative">
      {/* Top Navigation */}
      <div className="absolute top-6 right-6 flex gap-3">
        <button 
          onClick={onShowShop}
          className="p-4 bg-zinc-900 border border-white/5 rounded-2xl text-yellow-500 hover:text-white hover:border-yellow-500/20 transition-all flex items-center gap-2 group shadow-xl"
          title="Uno Shop"
        >
          <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={onShowAccount}
          className="p-4 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 group shadow-xl"
          title="My Account"
        >
          <Shield size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={onShowSettings}
          className="p-4 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 group shadow-xl"
          title="Settings"
        >
          <Settings size={20} className="group-hover:rotate-45 transition-transform" />
        </button>
        <button 
          onClick={onShowRules}
          className="p-4 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 group shadow-xl"
          title="Rules"
        >
          <Info size={20} />
        </button>
        <button 
          onClick={onLogout}
          className="p-4 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-400 hover:text-red-500 hover:border-red-500/20 transition-all flex items-center gap-2 group shadow-xl"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-7xl md:text-8xl font-uno text-white drop-shadow-2xl mb-2 flex items-center justify-center gap-4">
          <span className="text-red-600">U</span>
          <span className="text-blue-500">N</span>
          <span className="text-yellow-500">O</span>
        </h1>
        <div className="flex items-center justify-center gap-2">
           <img src={userProfile.avatar} className="w-8 h-8 rounded-full border border-white/20" alt="" />
           <p className="text-zinc-500 font-bold tracking-[0.3em] text-sm md:text-xl uppercase">Welcome, {userProfile.name}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border-2 border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md space-y-6"
      >
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
          <button 
            onClick={() => { setIsOnline(false); setOnlineAction(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs tracking-widest transition-all ${!isOnline ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
          >
            <Users size={16} /> SOLO
          </button>
          <button 
            onClick={() => setIsOnline(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs tracking-widest transition-all ${isOnline ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500'}`}
          >
            <Globe size={16} /> ONLINE
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!isOnline ? (
            <motion.div key="solo-mode" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-6">
                  <button onClick={() => setAvatarIndex(prev => (prev - 1 + AVATARS.length) % AVATARS.length)} className="text-zinc-700 hover:text-white"><ChevronLeft size={32} /></button>
                  <div className="w-24 h-24 rounded-full border-4 border-red-600 bg-zinc-950 overflow-hidden shadow-2xl">
                    <img src={AVATARS[avatarIndex]} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <button onClick={() => setAvatarIndex(prev => (prev + 1) % AVATARS.length)} className="text-zinc-700 hover:text-white"><ChevronRight size={32} /></button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Players (Including Bots)</label>
                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                    {[2, 3, 4].map((count) => (
                      <button key={count} onClick={() => setPlayerCount(count)} className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${playerCount === count ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-400'}`}>
                        <div className="flex gap-0.5 mb-1">{Array.from({length: count}).map((_, i) => <User key={i} size={10} fill={playerCount === count ? "white" : "none"} />)}</div>
                        <span className="text-[10px] font-black">{count}P</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">AI Difficulty</label>
                  <div className="flex gap-2">
                    {(['EASY', 'MEDIUM', 'HARD'] as AIDifficulty[]).map((level) => (
                      <button key={level} onClick={() => setDifficulty(level)} className={`flex-1 p-3 rounded-xl text-[10px] font-black transition-all border-2 ${difficulty === level ? 'bg-red-600 border-white text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>{level}</button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => handleStart()} className="w-full bg-red-600 hover:bg-red-500 text-white p-5 rounded-2xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95">
                <Play fill="currentColor" size={20} /> PLAY SOLO
              </button>
            </motion.div>
          ) : (
            <motion.div key="online-mode" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
              {onlineAction === null ? (
                <div className="space-y-6">
                  <p className="text-center text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Multiplayer Universe</p>
                  
                  {/* Play Solo Online / Quick Match Section */}
                  <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-[2rem] space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Zap size={16} className="text-blue-500" />
                            <h3 className="text-white font-black text-xs uppercase tracking-widest italic">Quick Match</h3>
                        </div>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase">Random Battle</span>
                    </div>

                    <div className="space-y-3">
                        <label className="text-zinc-600 text-[9px] font-black uppercase tracking-widest ml-1">Select Players</label>
                        <div className="flex bg-black/60 p-1 rounded-xl border border-white/5">
                          {[2, 3, 4].map((count) => (
                            <button key={count} onClick={() => setQuickMatchPlayers(count)} className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${quickMatchPlayers === count ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}>
                              <span className="text-[10px] font-black">{count}P</span>
                            </button>
                          ))}
                        </div>
                        <button onClick={() => { setOnlineAction('QUICK'); handleStart('QUICK'); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95">
                            FIND MATCH NOW <Search size={14} />
                        </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setOnlineAction('CREATE'); audioService.play('click'); }} className="group bg-zinc-950 border-2 border-zinc-800 hover:border-blue-600 p-4 rounded-3xl transition-all flex flex-col gap-2">
                      <div className="p-3 bg-blue-600/10 rounded-2xl w-fit group-hover:bg-blue-600 transition-colors"><UserPlus className="text-blue-500 group-hover:text-white" size={20} /></div>
                      <h3 className="text-white font-black text-xs uppercase tracking-widest">Host Room</h3>
                    </button>
                    <button onClick={() => { setOnlineAction('JOIN'); audioService.play('click'); }} className="group bg-zinc-950 border-2 border-zinc-800 hover:border-green-600 p-4 rounded-3xl transition-all flex flex-col gap-2">
                      <div className="p-3 bg-green-600/10 rounded-2xl w-fit group-hover:bg-green-600 transition-colors"><LogIn className="text-green-500 group-hover:text-white" size={20} /></div>
                      <h3 className="text-white font-black text-xs uppercase tracking-widest">Join Room</h3>
                    </button>
                  </div>
                </div>
              ) : onlineAction === 'QUICK' ? (
                <div className="py-10 flex flex-col items-center gap-8">
                    <div className="relative">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 rounded-full border-4 border-blue-600 border-t-transparent shadow-[0_0_30px_rgba(37,99,235,0.3)]" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Globe className="text-blue-500 animate-pulse" size={40} />
                        </div>
                    </div>
                    <div className="space-y-2 text-center">
                        <p className="text-white font-black uppercase tracking-[0.3em] text-sm italic">Searching for {quickMatchPlayers} Players...</p>
                        <p className="text-zinc-500 text-[9px] font-bold uppercase">Scanning Global Servers</p>
                    </div>
                    <button onClick={() => setOnlineAction(null)} className="text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <ArrowLeft size={14} /> Cancel Matchmaking
                    </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => setOnlineAction(null)} className="text-zinc-500 hover:text-white"><ArrowLeft size={20} /></button>
                    <span className="text-zinc-400 font-black uppercase text-xs tracking-widest">{onlineAction === 'CREATE' ? 'Hosting Private Room' : 'Joining Private Room'}</span>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-6">
                      <button onClick={() => setAvatarIndex(prev => (prev - 1 + AVATARS.length) % AVATARS.length)} className="text-zinc-700 hover:text-white"><ChevronLeft size={24} /></button>
                      <div className="w-20 h-20 rounded-full border-4 border-blue-600 bg-zinc-950 overflow-hidden"><img src={AVATARS[avatarIndex]} alt="Avatar" className="w-full h-full object-cover" /></div>
                      <button onClick={() => setAvatarIndex(prev => (prev + 1) % AVATARS.length)} className="text-zinc-700 hover:text-white"><ChevronRight size={24} /></button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {onlineAction === 'CREATE' && (
                      <div className="space-y-2">
                        <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Room Capacity</label>
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                          {[2, 3, 4].map((count) => (
                            <button key={count} onClick={() => setPlayerCount(count)} className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${playerCount === count ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-400'}`}>
                              <span className="text-[10px] font-black">{count}P</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {onlineAction === 'JOIN' && (
                      <div className="space-y-2">
                        <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Room ID</label>
                        <div className="relative"><Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" /><input type="text" placeholder="e.g. AB1234" value={targetRoom} onChange={(e) => setTargetRoom(e.target.value.toUpperCase())} className="w-full bg-zinc-950 border border-zinc-800 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600 transition-all font-mono font-bold" /></div>
                      </div>
                    )}
                  </div>

                  <button onClick={() => handleStart()} disabled={onlineAction === 'JOIN' && !targetRoom} className={`w-full ${onlineAction === 'CREATE' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'} disabled:bg-zinc-800 text-white p-5 rounded-2xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95`}>{onlineAction === 'CREATE' ? <UserPlus size={20} /> : <LogIn size={20} />}{onlineAction === 'CREATE' ? 'CREATE ROOM' : 'JOIN ROOM'}</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Lobby;
