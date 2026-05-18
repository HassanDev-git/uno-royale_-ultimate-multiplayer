
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '../services/audioService';
import { Volume2, VolumeX, X } from 'lucide-react';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ isOpen, onClose }) => {
  const [volume, setVolume] = useState(audioService.getVolume());

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioService.setVolume(val);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-zinc-900 border-2 border-zinc-800 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-uno text-white mb-8">SETTINGS</h2>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-widest">Master Volume</span>
                  {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <p className="text-zinc-600 text-[10px] text-center uppercase font-bold tracking-tighter">
                  UNO Royale v1.2 • Engine: React/Howler
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsOverlay;
