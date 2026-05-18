import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Users, Loader2, ArrowLeft, PlayCircle } from 'lucide-react';
import { Player } from '../types';

interface WaitingRoomProps {
  roomId: string;
  players: Player[];
  maxPlayers: number;
  countdown?: number;
  isHost: boolean;
  onStartGame: () => void;
  onCancel: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ roomId, players, maxPlayers, countdown, isHost, onStartGame, onCancel }) => {
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room ID Copied!");
  };

  const gridCols = maxPlayers <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4';

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 relative overflow-hidden font-uno">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05)_0%,rgba(0,0,0,0)_80%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#18181b] border border-zinc-800 p-8 md:p-12 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-4xl z-10 text-center relative"
      >
        <AnimatePresence mode="wait">
          {countdown !== undefined && countdown !== null && countdown > 0 ? (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="flex flex-col items-center justify-center py-10"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-8 border-blue-600 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                <span className="text-4xl md:text-6xl font-black text-white">{countdown}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white tracking-widest uppercase italic animate-pulse">GET READY!</h2>
              <p className="text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mt-2">Game starting shortly...</p>
            </motion.div>
          ) : (
            <div key="lobby-view" className="w-full">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-wide uppercase italic">LOBBY</h2>
              <p className="text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-8 md:mb-12">
                Waiting for {maxPlayers} players to join... ({players.length}/{maxPlayers})
              </p>

              <div className="space-y-6 md:space-y-10">
                <div className="bg-[#0c0c0e] p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-zinc-800/50 flex flex-col items-center gap-4 md:gap-6 shadow-inner">
                  <p className="text-zinc-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Share Room ID with your friends</p>
                  <div className="flex items-center gap-3 md:gap-5">
                    <span className="text-3xl md:text-5xl font-mono font-black text-blue-500 tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{roomId}</span>
                    <button 
                      onClick={copyRoomId}
                      className="p-3 md:p-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl transition-all active:scale-90 border border-white/5 shadow-xl"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>

                <div className={`grid ${gridCols} gap-4 md:gap-6 max-w-3xl mx-auto`}>
                  {players.map((player, idx) => (
                    <div key={player.id} className="p-4 md:p-6 rounded-3xl md:rounded-[2.5rem] border-2 border-blue-600 bg-[#0c0c0e] shadow-lg flex flex-col items-center justify-center min-h-[140px] md:min-h-[180px]">
                      <div className="flex flex-col items-center gap-2 md:gap-4">
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-14 h-14 md:w-20 md:h-20 rounded-full border-[3px] md:border-[4px] border-blue-600 p-1 bg-black shadow-2xl relative">
                          <img src={player.avatar} alt={player.name} className="w-full h-full object-cover rounded-full" />
                        </motion.div>
                        <div className="space-y-1">
                          <p className="text-white font-black text-xs md:text-lg truncate w-20 md:w-24">{player.name}</p>
                          <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-blue-500">{idx === 0 ? 'HOST' : `PLAYER ${idx + 1}`}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="p-4 md:p-6 rounded-3xl md:rounded-[2.5rem] border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center min-h-[140px] md:min-h-[180px] opacity-40">
                      <Users size={24} className="text-zinc-700 mb-2" />
                      <div className="flex items-center gap-1">
                        <Loader2 size={8} className="animate-spin text-zinc-700" />
                        <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-zinc-700">Awaiting...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {isHost && (
                <div className="mt-10 md:mt-14 space-y-4">
                   <button 
                    onClick={onStartGame}
                    disabled={players.length < 2}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 group"
                   >
                     <PlayCircle size={24} /> START 10s TIMER
                   </button>
                   <p className="text-zinc-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                     {players.length < 2 ? 'Need at least 2 players to start' : 'Host initiates a 10s countdown for everyone'}
                   </p>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

        <button 
          onClick={onCancel}
          className="mt-8 md:mt-12 flex items-center gap-3 text-zinc-600 hover:text-red-500 transition-all mx-auto text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          {isHost ? 'Dissolve Room' : 'Leave Lobby'}
        </button>
      </motion.div>
    </div>
  );
};

export default WaitingRoom;