
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Coins, Calendar, Shield, ArrowLeft, Star, ShoppingBag } from 'lucide-react';
import { Player } from '../types';

interface AccountPageProps {
  user: Player;
  onBack: () => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ user, onBack }) => {
  const winRate = user.wins && user.wins > 0 ? "Legendary" : "Aspiring Warrior";
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center p-6 font-uno overflow-y-auto no-scrollbar">
      <div className="w-full max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Lobby</span>
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy size={160} /></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12 relative z-10">
            <div className="w-32 h-32 rounded-full border-4 border-red-600 bg-black shadow-[0_0_30px_rgba(220,38,38,0.3)] p-1 overflow-hidden">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tight">{user.name}</h1>
                <Star size={20} className="text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-zinc-500 text-xs font-bold">{user.email}</p>
              <div className="mt-4 flex gap-2 justify-center md:justify-start">
                <span className="bg-red-600/20 text-red-500 border border-red-600/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{winRate}</span>
                <span className="bg-blue-600/20 text-blue-500 border border-blue-600/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Level 1</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 relative z-10">
            <div className="bg-black/40 border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-2">
              <Trophy className="text-yellow-500" size={24} />
              <span className="text-2xl font-black text-white">{user.wins || 0}</span>
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Total Wins</span>
            </div>
            <div className="bg-black/40 border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-2">
              <Coins className="text-yellow-500" size={24} />
              <span className="text-2xl font-black text-white">{user.coins || 0}</span>
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Coins</span>
            </div>
            <div className="bg-black/40 border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-2 col-span-2 md:col-span-1">
              <ShoppingBag className="text-blue-500" size={24} />
              <span className="text-2xl font-black text-white">{user.inventory?.length || 0}</span>
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Items Owned</span>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <h3 className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] ml-2">Currently Equipped</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                <span className="text-xs font-bold text-zinc-500 uppercase">Card Theme</span>
                <span className="text-xs font-black text-white uppercase">{user.equipped?.cardTheme.replace('card_', '')}</span>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                <span className="text-xs font-bold text-zinc-500 uppercase">Arena Bg</span>
                <span className="text-xs font-black text-white uppercase">{user.equipped?.bgTheme.replace('bg_', '')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountPage;
