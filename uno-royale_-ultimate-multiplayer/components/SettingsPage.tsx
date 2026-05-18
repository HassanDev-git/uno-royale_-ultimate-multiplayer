
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Volume2, ChevronLeft, ChevronRight, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { Player } from '../types';
import { AVATARS } from '../constants';
import { audioService } from '../services/audioService';
import { auth, verifyBeforeUpdateEmail } from '../services/firebaseService';

interface SettingsPageProps {
  user: Player;
  onBack: () => void;
  onUpdate: (updatedUser: Player) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onBack, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [newEmail, setNewEmail] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(AVATARS.indexOf(user.avatar) || 0);
  const [volume, setVolume] = useState(audioService.getVolume());
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSave = () => {
    if (!name.trim()) return;
    setLoading(true);
    const updatedUser = { ...user, name: name.trim(), avatar: AVATARS[avatarIndex] };
    onUpdate(updatedUser);
    setMsg({ text: "Profile updated successfully!", type: 'success' });
    setTimeout(() => { setMsg(null); setLoading(false); }, 1500);
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setMsg({ text: "Invalid email address", type: 'error' });
      return;
    }
    setEmailLoading(true);
    try {
      if (auth.currentUser) {
        await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
        setMsg({ text: "Verification link sent to new email!", type: 'success' });
        setNewEmail('');
      }
    } catch (err: any) {
      setMsg({ text: err.message || "Failed to update email. Re-login required.", type: 'error' });
    } finally {
      setEmailLoading(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioService.setVolume(val);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center p-6 font-uno overflow-y-auto no-scrollbar">
      <div className="w-full max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Lobby</span>
        </button>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl space-y-12">
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase mb-2">ARENA SETTINGS</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Configure your warrior persona</p>
          </div>

          <div className="space-y-10">
            {/* Profile Section */}
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Warrior Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/40 border border-zinc-800 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Change Avatar</label>
                <div className="flex items-center justify-center gap-8 bg-black/20 p-6 rounded-3xl border border-white/5">
                  <button onClick={() => setAvatarIndex(prev => (prev - 1 + AVATARS.length) % AVATARS.length)} className="text-zinc-700 hover:text-white"><ChevronLeft size={32} /></button>
                  <div className="w-24 h-24 rounded-full border-4 border-red-600 bg-zinc-950 overflow-hidden shadow-2xl p-1">
                    <img src={AVATARS[avatarIndex]} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <button onClick={() => setAvatarIndex(prev => (prev + 1) % AVATARS.length)} className="text-zinc-700 hover:text-white"><ChevronRight size={32} /></button>
                </div>
              </div>
            </div>

            {/* Account Security Section */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                <ShieldCheck size={14} className="text-blue-500" /> Account Security
              </label>
              <div className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-4">
                <div>
                  <p className="text-zinc-600 text-[9px] font-bold uppercase mb-2">Current Email</p>
                  <p className="text-white text-sm font-bold opacity-60">{user.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-600 text-[9px] font-bold uppercase">Update Email Address</p>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                       <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter new email" className="w-full bg-black/40 border border-zinc-800 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-sm" />
                    </div>
                    <button onClick={handleUpdateEmail} disabled={emailLoading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 disabled:opacity-50 transition-all">
                      {emailLoading ? <Loader2 className="animate-spin" /> : 'UPDATE'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Volume Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-zinc-500">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1">Master Volume</label>
                <Volume2 size={16} />
              </div>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600" />
            </div>
          </div>

          <div className="flex flex-col gap-4">
             {msg && <div className={`text-center p-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${msg.type === 'success' ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'}`}>{msg.text}</div>}
             <button onClick={handleSave} disabled={loading} className="w-full bg-white hover:bg-zinc-200 text-black p-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                <Save size={20} /> SAVE PROFILE
             </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
