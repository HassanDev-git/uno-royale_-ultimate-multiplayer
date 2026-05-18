
import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../types';
import { WifiOff, Star } from 'lucide-react';

interface PlayerAvatarProps {
  player: Player;
  isActive: boolean;
  isDirectionClockwise: boolean;
  cardCount: number;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, isActive, isDirectionClockwise, cardCount }) => {
  if (!player) return null;

  const tagType = player.equipped?.nameTag;
  const isLegend = tagType === 'tag_legend';
  const isPro = tagType === 'tag_pro';

  return (
    <div className="flex flex-col items-center gap-1 md:gap-2 relative scale-90 md:scale-100">
      <motion.div
        animate={isActive ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0px #fff", "0 0 15px #fff", "0 0 0px #fff"] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 md:border-4 ${isActive ? 'border-white' : 'border-zinc-700'} overflow-hidden bg-zinc-800 shadow-xl relative`}
      >
        <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
        {player.isOnline === false && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <WifiOff size={16} className="text-red-500" />
          </div>
        )}
      </motion.div>
      <div className="text-center flex flex-col items-center max-w-[80px]">
        {isLegend && <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="text-yellow-400 mb-0.5"><Star size={10} fill="currentColor" /></motion.div>}
        <p className={`text-[10px] md:text-sm font-bold truncate w-full px-2 py-0.5 rounded-full ${isLegend ? 'bg-yellow-500 text-black font-black uppercase italic' : isPro ? 'text-blue-400' : isActive ? 'text-white' : 'text-zinc-500'}`}>
          {player.name}
        </p>
        <div className="flex items-center justify-center gap-1">
          <span className="text-[9px] md:text-xs font-black text-white/70">{cardCount} 🂠</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerAvatar;
