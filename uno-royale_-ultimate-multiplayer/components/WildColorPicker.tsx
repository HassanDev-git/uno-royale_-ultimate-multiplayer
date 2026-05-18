
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardColor } from '../types';
import { COLORS, COLOR_CLASSES } from '../constants';
import { audioService } from '../services/audioService';

interface WildColorPickerProps {
  onSelect: (color: CardColor) => void;
  isOpen: boolean;
}

const WildColorPicker: React.FC<WildColorPickerProps> = ({ onSelect, isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="bg-zinc-900 p-8 rounded-3xl border-4 border-zinc-700 shadow-2xl text-center"
          >
            <h2 className="text-3xl font-uno text-white mb-8 tracking-wide">CHOOSE A COLOR</h2>
            <div className="grid grid-cols-2 gap-4">
              {COLORS.map(color => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    audioService.play('click');
                    onSelect(color);
                  }}
                  className={`w-32 h-32 rounded-2xl ${COLOR_CLASSES[color]} border-4 border-white/20 shadow-lg flex items-center justify-center group`}
                >
                  <span className="text-white font-black text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    {color}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WildColorPicker;
