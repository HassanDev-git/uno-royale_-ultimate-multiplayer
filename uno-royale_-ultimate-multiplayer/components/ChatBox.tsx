
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Volume2, X } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  myPlayerId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, myPlayerId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 h-96 bg-zinc-900 border-2 border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-500" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Live Chat</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.senderId === myPlayerId ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-zinc-500 font-bold mb-1 px-2">{msg.senderName}</span>
                  <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${
                    msg.senderId === myPlayerId 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center px-8">
                  <Volume2 size={32} className="mb-2 opacity-20" />
                  <p className="text-[10px] uppercase font-black tracking-widest">Voice Chat Active</p>
                  <p className="text-[10px]">Messages are read aloud by AI</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/40 border-t border-zinc-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button 
                  onClick={handleSend}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative"
      >
        <MessageSquare size={24} />
        {messages.length > 0 && !isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[10px] font-black">
            {messages.length}
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatBox;
