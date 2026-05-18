import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardColor } from '../types';
import { COLOR_CLASSES } from '../constants';
import { SkipForward, RefreshCw, ShieldQuestion } from 'lucide-react';

interface UnoCardProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  isSmall?: boolean;
  theme?: string;
}

const UnoCard: React.FC<UnoCardProps> = ({ card, onClick, disabled, isSmall, theme }) => {
  const getIcon = () => {
    switch (card.value) {
      case 'SKIP': return <SkipForward className="w-full h-full p-1 md:p-1.5" />;
      case 'REVERSE': return <RefreshCw className="w-full h-full p-1 md:p-1.5" />;
      case 'DRAW2': return <span className="font-bold text-lg md:text-2xl">+2</span>;
      case 'WILD4': return <span className="font-bold text-lg md:text-2xl">+4</span>;
      case 'WILD': return <ShieldQuestion className="w-full h-full p-1 md:p-1.5" />;
      default: return <span className="font-bold text-2xl md:text-4xl font-uno">{card.value}</span>;
    }
  };

  const isHolo = theme === 'card_gold';
  const isNeon = theme === 'card_neon';
  const isMidnight = theme === 'card_dark';

  const containerThemeClass = 
    isNeon ? 'theme-neon border-white/40' : 
    isHolo ? 'theme-gold border-white/60' : 
    isMidnight ? 'border-zinc-700' : 
    'border-white/20';

  const innerThemeClass = 
    isMidnight ? 'bg-black/60 text-white' : 
    'bg-white/90';

  const colorClass = isMidnight ? 'bg-zinc-900' : COLOR_CLASSES[card.color];

  return (
    <motion.div
      layoutId={card.id}
      whileHover={!disabled ? { y: -15, scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`
        ${isSmall ? 'w-14 h-20 md:w-16 md:h-24' : 'w-20 h-28 md:w-24 md:h-36'} 
        flex-shrink-0
        ${colorClass} 
        rounded-xl md:rounded-[1.25rem] border-[2px] md:border-[3px] ${containerThemeClass} shadow-xl md:shadow-2xl cursor-pointer
        flex flex-col items-center justify-center relative overflow-hidden
        ${disabled ? 'opacity-40 grayscale-[0.5] cursor-not-allowed scale-95' : ''}
        transition-all duration-300
      `}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:8px_8px]" />
      
      <div className={`w-[85%] h-[70%] ${innerThemeClass} rounded-[45%] flex items-center justify-center transform -rotate-12 shadow-inner border border-black/5`}>
        <div className={`
          ${card.color === 'YELLOW' ? 'text-yellow-600' : card.color === 'WILD' ? 'text-zinc-800' : `text-${card.color.toLowerCase()}-700`}
          ${isMidnight ? 'text-white' : ''}
          flex items-center justify-center drop-shadow-sm
        `}>
          {getIcon()}
        </div>
      </div>

      <div className="absolute top-0.5 left-1 font-bold text-[8px] md:text-[10px] text-white/40">{card.value}</div>
      <div className="absolute bottom-0.5 right-1 font-bold text-[8px] md:text-[10px] text-white/40 rotate-180">{card.value}</div>
    </motion.div>
  );
};

export default UnoCard;