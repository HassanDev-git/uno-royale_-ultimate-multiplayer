import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Medal } from 'lucide-react';
import { Player } from '../types';
import { AVATARS } from '../constants';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose }) => {
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Mock data since DB is removed
      const mockUsers: Player[] = [
        { id: '1', name: 'GrandMaster', avatar: AVATARS[0], wins: 150, coins: 5000, hand: [], isBot: false, unoDeclared: false },
        { id: '2', name: 'UnoKing', avatar: AVATARS[1], wins: 120, coins: 3500, hand: [], isBot: false, unoDeclared: false },
        { id: '3', name: 'ElitePlayer', avatar: AVATARS[2], wins: 95, coins: 2000, hand: [], isBot: false, unoDeclared: false },
        { id: '4', name: 'CardShark', avatar: AVATARS[3], wins: 80, coins: 1500, hand: [], isBot: false, unoDeclared: false },
        { id: '5', name: 'BotSlayer', avatar: AVATARS[4], wins: 65, coins: 1200, hand: [], isBot: false, unoDeclared: false },
      ];
      setTopPlayers(mockUsers);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-2xl h-[70vh] bg-zinc-900 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
            <header className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-4">
                <BarChart3 size={32} className="text-green-500" />
                <h2 className="text-4xl font-uno text-white italic uppercase tracking-wider">Hall of Fame</h2>
              </div>
              <button onClick={onClose} className="p-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl transition-all active:scale-95"><X size={24} /></button>
            </header>

            <div className="p-8 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              {topPlayers.map((player, idx) => (
                <motion.div key={player.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.05 }} className={`p-5 rounded-2xl border flex items-center justify-between ${idx === 0 ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-black/20 border-white/5'}`}>
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 flex items-center justify-center">
                       {idx < 3 ? <Medal className={idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-zinc-400' : 'text-orange-600'} size={24} /> : <span className="text-zinc-700 font-black italic">{idx + 1}</span>}
                    </div>
                    <div className="flex items-center gap-4">
                       <img src={player.avatar} className="w-10 h-10 rounded-full border-2 border-white/10" alt="" />
                       <span className={`text-sm font-black uppercase tracking-widest ${idx === 0 ? 'text-yellow-500' : 'text-white'}`}>{player.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-white">{player.wins || 0} Wins</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">{player.coins || 0} Total Coins</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Leaderboard;