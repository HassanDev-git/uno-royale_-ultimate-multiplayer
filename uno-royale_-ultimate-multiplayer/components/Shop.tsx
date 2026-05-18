import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Zap, Star } from 'lucide-react';
import { Player, ShopItem } from '../types';
import { SHOP_ITEMS } from '../constants';
import UnoCard from './UnoCard';

interface ShopProps {
  isOpen: boolean;
  user: Player | null;
  onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ isOpen, user, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'card'|'bg'|'tag'|'chat'>('card');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const buyItem = (item: ShopItem) => {
    if (!user) return;
    const isOwned = user.inventory?.includes(item.id);

    if (isOwned) {
      const updatedEquipped = { ...user.equipped!, [item.category + 'Theme']: item.id };
      user.equipped = updatedEquipped;
      onClose();
      return;
    }

    if ((user.coins || 0) < item.price) {
      setErrorMsg(`Not enough coins!`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    user.coins = (user.coins || 0) - item.price;
    user.inventory = [...(user.inventory || []), item.id];
    user.equipped = { ...user.equipped!, [item.category + 'Theme']: item.id };
    
    localStorage.setItem('uno_royale_user', JSON.stringify(user));
    onClose();
  };

  const categories: {id: typeof activeCategory, name: string}[] = [
    { id: 'card', name: 'Cards' },
    { id: 'bg', name: 'Arena' },
    { id: 'tag', name: 'Tags' },
    { id: 'chat', name: 'Chat' },
  ];

  const getPreviewComponent = (item: ShopItem) => {
    if (item.category === 'card') {
      return <UnoCard card={{ id: 'preview', color: 'RED', value: '7' }} disabled theme={item.id} />;
    }
    
    if (item.category === 'bg') {
      let bgStyle = "bg-zinc-950";
      let inner = null;
      if (item.id === 'bg_space') { bgStyle = "theme-bg-space"; inner = <div className="absolute inset-0 flex items-center justify-center opacity-40"><Star className="text-white animate-pulse" size={24} /></div>; }
      else if (item.id === 'bg_casino') { bgStyle = "theme-bg-casino"; inner = <div className="absolute inset-0 border-4 border-green-800 m-2 rounded-xl opacity-20" />; }
      else if (item.id === 'card_neon') bgStyle = "theme-bg-cyber";

      return (
        <div className={`w-32 h-24 rounded-3xl shadow-2xl relative overflow-hidden border border-white/10 ${bgStyle}`}>
          {inner}
          <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/5 rounded-full" />
        </div>
      );
    }

    if (item.category === 'tag') {
      const isLegend = item.id === 'tag_legend';
      const isPro = item.id === 'tag_pro';
      return (
        <div className="w-32 h-24 flex flex-col items-center justify-center gap-3 bg-zinc-900 rounded-3xl border border-white/5">
           <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${isLegend ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : isPro ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-zinc-800 text-zinc-500'}`}>
              PLAYER_NAME
           </div>
        </div>
      );
    }

    return <div className="w-32 h-24 rounded-3xl shadow-2xl" style={{ backgroundColor: item.previewColor }} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-5xl h-[85vh] bg-zinc-900 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
            <header className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-4">
                <ShoppingBag size={32} className="text-yellow-500" />
                <h2 className="text-4xl font-uno text-white italic uppercase tracking-wider">UNO Shop</h2>
              </div>
              <div className="flex items-center gap-6">
                 {errorMsg && <div className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-600/10 px-4 py-2 rounded-xl animate-bounce">{errorMsg}</div>}
                 <div className="bg-yellow-500/20 px-6 py-2 rounded-2xl border border-yellow-500/50 flex items-center gap-3">
                    <Zap size={20} className="text-yellow-500" fill="currentColor" />
                    <span className="text-2xl font-black text-white">{user?.coins || 0}</span>
                 </div>
                 <button onClick={onClose} className="p-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl transition-all"><X size={24} /></button>
              </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
              <nav className="w-48 bg-black/20 p-6 flex flex-col gap-3 border-r border-white/5">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700'}`}>{cat.name}</button>
                ))}
              </nav>

              <div className="flex-1 p-8 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-8 custom-scrollbar">
                {SHOP_ITEMS.filter(i => i.category === activeCategory).map(item => {
                  const isOwned = user?.inventory?.includes(item.id);
                  const isEquipped = user?.equipped && Object.values(user.equipped).includes(item.id);
                  return (
                    <motion.div key={item.id} whileHover={{ y: -8 }} className="bg-zinc-800/40 border-2 border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center gap-6 group hover:border-yellow-500/30 transition-all">
                      <div className="relative group-hover:scale-110 transition-transform duration-500">{getPreviewComponent(item)}</div>
                      <div className="text-center">
                        <h3 className="text-white font-black uppercase text-xs tracking-widest mb-1">{item.name}</h3>
                        <p className={`text-[10px] font-bold ${item.isAnimated ? 'text-yellow-400' : 'text-zinc-500'}`}>{item.isAnimated ? '★ ANIMATED DESIGN' : 'BASIC STYLE'}</p>
                      </div>
                      <button 
                        onClick={() => buyItem(item)}
                        className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${isEquipped ? 'bg-green-600 text-white' : isOwned ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-zinc-950 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black'}`}
                      >
                        {isEquipped ? 'Equipped' : isOwned ? 'Select' : `${item.price} Coins`}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Shop;