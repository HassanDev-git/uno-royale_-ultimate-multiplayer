import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_RULES } from '../constants';
import { X, Info, Zap, ShieldAlert, Sparkles, LayoutPanelTop } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'action': return <Zap className="text-blue-400" size={20} />;
      case 'wild': return <Sparkles className="text-yellow-400" size={20} />;
      case 'penalty': return <ShieldAlert className="text-red-500" size={20} />;
      default: return <LayoutPanelTop className="text-zinc-400" size={20} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            className="bg-[#18181b] border border-white/10 p-1 rounded-[3rem] w-full max-w-2xl shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden"
          >
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none" />

            <div className="p-8 md:p-12 max-h-[85vh] overflow-y-auto custom-scrollbar relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-xl">
                      <Info className="text-blue-500" size={28} />
                    </div>
                    <h2 className="text-4xl font-uno text-white tracking-tight uppercase italic">HOW TO PLAY</h2>
                  </div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] ml-1">Royale Official Rulebook</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl transition-all active:scale-90 border border-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {GAME_RULES.map((rule, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 bg-zinc-900/50 border border-white/5 rounded-[2rem] hover:border-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-black/40 rounded-xl group-hover:scale-110 transition-transform">
                        {getIcon(rule.type)}
                      </div>
                      <h3 className="text-white font-black uppercase text-sm tracking-widest">{rule.title}</h3>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed font-medium">{rule.description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 p-8 bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-600/30 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 blur-3xl rounded-full" />
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/40 font-uno text-3xl text-white transform -rotate-12 group-hover:rotate-0 transition-transform">!</div>
                  <div className="space-y-1">
                    <h4 className="text-white font-black text-lg uppercase tracking-tight">The Penalty</h4>
                    <p className="text-zinc-400 text-xs leading-tight">Forget to declare UNO? If another player notices before your next turn, you draw <span className="text-red-500 font-bold">2 cards</span> immediately!</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full mt-10 bg-white hover:bg-zinc-200 text-black p-6 rounded-3xl font-black text-lg uppercase tracking-widest transition-all active:scale-95 shadow-2xl"
              >
                GOT IT, LETS PLAY!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RulesModal;