
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Home, RotateCcw, Frown, Zap, Medal } from 'lucide-react';
import { Player } from '../types';
import { audioService } from '../services/audioService';

interface GameOverModalProps {
  isOpen: boolean;
  winner: Player | null;
  rankings: string[];
  myPlayerId: string;
  onRematch: () => void;
  onReturnHome: () => void;
  isHost: boolean;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, winner, rankings, myPlayerId, onRematch, onReturnHome, isHost }) => {
  const myRank = rankings.indexOf(myPlayerId) + 1;
  const isWinner = myRank === 1;

  useEffect(() => {
    if (isOpen) {
      if (isWinner) audioService.play('winner_fanfare');
      else audioService.play('turn_alert');
    }
  }, [isOpen, isWinner]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-zinc-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-zinc-600';
  };

  const getRankReward = (rank: number) => {
    if (rank === 1) return 250;
    if (rank === 2) return 100;
    if (rank === 3) return 50;
    return 0;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[4rem] overflow-hidden flex flex-col items-center shadow-2xl p-8 md:p-12 text-center relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className={`absolute inset-0 opacity-20 pointer-events-none ${isWinner ? 'bg-yellow-500/20' : 'bg-red-500/20'} blur-3xl`} />

            <div className="relative z-10 flex flex-col items-center w-full">
              <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center mb-6 border-4 ${isWinner ? 'border-yellow-500 bg-yellow-500/20' : 'border-zinc-700 bg-zinc-800'}`}>
                {isWinner ? <Trophy size={60} className="text-yellow-500" /> : <Frown size={60} className="text-zinc-500" />}
              </div>

              <h1 className={`text-4xl md:text-5xl font-uno mb-1 tracking-tighter ${isWinner ? 'text-white' : 'text-zinc-400'}`}>
                {isWinner ? 'ROYAL VICTORY!' : `RANK #${myRank}`}
              </h1>
              <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.4em] mb-8">
                The Battle has Concluded
              </p>

              {/* Leaderboard Summary */}
              <div className="w-full space-y-2 mb-10">
                {rankings.map((pid, idx) => {
                    const rank = idx + 1;
                    const reward = getRankReward(rank);
                    return (
                        <div key={pid} className={`flex items-center justify-between p-4 rounded-2xl border ${pid === myPlayerId ? 'bg-white/10 border-white/20 scale-105' : 'bg-black/40 border-white/5'}`}>
                            <div className="flex items-center gap-4">
                                <span className={`text-xl font-black ${getRankColor(rank)}`}>#{rank}</span>
                                <span className="text-sm font-bold text-white uppercase">{pid === myPlayerId ? 'YOU' : 'Opponent'}</span>
                            </div>
                            {reward > 0 && (
                                <div className="flex items-center gap-1.5 text-yellow-500">
                                    <Zap size={14} fill="currentColor" />
                                    <span className="text-xs font-black">+{reward}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                 <button onClick={onReturnHome} className="flex items-center justify-center gap-3 p-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all active:scale-95">
                   <Home size={18} /> Home
                 </button>
                 {isHost ? (
                    <button onClick={onRematch} className="flex items-center justify-center gap-3 p-5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-xl">
                      <RotateCcw size={18} /> Restart Battle
                    </button>
                 ) : (
                    <div className="flex items-center justify-center p-5 bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-[2rem] font-black uppercase text-[8px] tracking-widest italic animate-pulse">
                        Waiting for Host Rematch...
                    </div>
                 )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameOverModal;
