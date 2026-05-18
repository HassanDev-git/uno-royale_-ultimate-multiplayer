
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { GameState, Player, Card, CardColor, AIDifficulty, GameStatus } from './types';
import { createDeck, AVATARS, COLOR_CLASSES } from './constants';
import Lobby from './components/Lobby';
import UnoCard from './components/UnoCard';
import PlayerAvatar from './components/PlayerAvatar';
import WildColorPicker from './components/WildColorPicker';
import SettingsPage from './components/SettingsPage';
import AccountPage from './components/AccountPage';
import RulesModal from './components/RulesModal';
import WaitingRoom from './components/WaitingRoom';
import ChatBox from './components/ChatBox';
import Shop from './components/Shop';
import Leaderboard from './components/Leaderboard';
import GameOverModal from './components/GameOverModal';
import Auth from './components/Auth';
import { audioService } from './services/audioService';
import { db, auth, ref, set, onValue, update, onDisconnect, remove, onAuthStateChanged, get } from './services/firebaseService';
import { Home, Zap, RefreshCcw, Loader2, Trophy, Music, ShoppingBag } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [viewState, setViewState] = useState<GameStatus>('LOBBY');
  const [pendingWildCard, setPendingWildCard] = useState<Card | null>(null);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number>(-1);
  const [userProfile, setUserProfile] = useState<Player | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [countdown, setCountdown] = useState<number | undefined>(undefined);
  const [roomMaxPlayers, setRoomMaxPlayers] = useState<number>(4);
  const [activeModal, setActiveModal] = useState<'SHOP' | 'LEADERBOARD' | null>(null);
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [hostId, setHostId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [isPublicRoom, setIsPublicRoom] = useState(false);

  const botProcessingRef = useRef<boolean>(false);
  const lastTurnIdRef = useRef<number>(-1);
  const autoStartInitiatedRef = useRef<boolean>(false);

  // Helper to ensure we always work with arrays from Firebase
  const ensureArray = <T,>(data: any): T[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Object.values(data);
  };

  const isHost = !isOnlineMode || (userProfile?.id === hostId);
  
  // Memoized derived states to ensure consistency
  const currentPlayers = useMemo(() => ensureArray<Player>(gameState?.players), [gameState?.players]);
  const discardPile = useMemo(() => ensureArray<Card>(gameState?.discardPile), [gameState?.discardPile]);
  const deck = useMemo(() => ensureArray<Card>(gameState?.deck), [gameState?.deck]);
  
  const topCard = useMemo(() => {
    const pile = discardPile;
    return pile.length > 0 ? pile[pile.length - 1] : null;
  }, [discardPile]);

  const isUserTurn = useMemo(() => {
    return gameState?.status === 'PLAYING' && gameState?.currentPlayerIndex === myPlayerIndex;
  }, [gameState?.status, gameState?.currentPlayerIndex, myPlayerIndex]);

  const saveProfile = (profile: Player) => {
    setUserProfile(profile);
    localStorage.setItem(`uno_profile_${profile.id}`, JSON.stringify(profile));
    if (isOnlineMode && roomId) {
        update(ref(db, `rooms/${roomId}/players/${profile.id}`), { ...profile, isOnline: true });
    }
  };

  const getNextPlayerIndex = useCallback((currentIndex: number, direction: number, players: Player[]) => {
    if (!players || players.length === 0) return 0;
    let nextIdx = (currentIndex + direction + players.length) % players.length;
    let attempts = 0;
    while (players[nextIdx]?.isFinished && attempts < players.length) {
      nextIdx = (nextIdx + direction + players.length) % players.length;
      attempts++;
    }
    return nextIdx;
  }, []);

  const canPlayCard = useCallback((card: Card, activeColor: CardColor | null, currentTopCard: Card | null) => {
    if (!currentTopCard) return true; // Safety fallback
    return card.color === 'WILD' || card.color === activeColor || card.value === currentTopCard.value;
  }, []);

  // Bot Logic: Only Host executes bot moves
  useEffect(() => {
    if (!gameState || gameState.status !== 'PLAYING' || !isHost) return;

    const players = ensureArray<Player>(gameState.players);
    const currentPlayer = players[gameState.currentPlayerIndex];
    if (!currentPlayer || !currentPlayer.isBot) return;

    if (lastTurnIdRef.current === gameState.turnId) return;

    const botAction = async () => {
      if (botProcessingRef.current) return;
      botProcessingRef.current = true;
      
      const botThinkTime = Math.random() * 800 + 1200;
      await new Promise(resolve => setTimeout(resolve, botThinkTime));
      
      if (lastTurnIdRef.current === gameState.turnId) {
        botProcessingRef.current = false;
        return;
      }

      lastTurnIdRef.current = gameState.turnId;
      const currentTopCard = discardPile[discardPile.length - 1];
      const playableCards = (ensureArray<Card>(currentPlayer.hand)).filter(c => canPlayCard(c, gameState.activeColor, currentTopCard));

      if (playableCards.length > 0) {
        const bestCard = playableCards.sort((a, b) => (a.color === 'WILD' ? 1 : -1))[0];
        let chosenColor: CardColor | undefined;
        if (bestCard.color === 'WILD') {
          const colors: CardColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
          chosenColor = colors[Math.floor(Math.random() * 4)];
        }
        await handlePlayCard(bestCard, gameState.currentPlayerIndex, chosenColor);
      } else {
        await handleDrawCard(gameState.currentPlayerIndex);
      }
      botProcessingRef.current = false;
    };

    botAction();
  }, [gameState?.turnId, gameState?.currentPlayerIndex, gameState?.status, isHost, canPlayCard, discardPile]);

  useEffect(() => {
    const isTense = currentPlayers.some(p => !p.isFinished && (ensureArray(p.hand).length) <= 2);
    if (viewState === 'LOBBY' || viewState === 'COUNTDOWN') audioService.playLobbyMusic();
    else if (viewState === 'PLAYING') audioService.playMusic(isTense ? 'tension' : 'game');
    else audioService.stopMusic();
  }, [viewState, currentPlayers.map(p => ensureArray(p.hand).length).join(',')]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        const saved = localStorage.getItem(`uno_profile_${user.uid}`);
        if (saved) setUserProfile(JSON.parse(saved));
        else {
          const profile: Player = {
            id: user.uid, name: user.displayName || 'Warrior', email: user.email || '',
            hand: [], isBot: false, avatar: user.photoURL || AVATARS[0], unoDeclared: false,
            coins: 100, wins: 0, inventory: ['card_classic', 'bg_dark', 'tag_none', 'chat_default'],
            equipped: { cardTheme: 'card_classic', bgTheme: 'bg_dark', nameTag: 'tag_none', chatTheme: 'chat_default' }
          };
          saveProfile(profile);
        }
      } else if (!user) setUserProfile(null);
      setIsAuthenticating(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOnlineMode && roomId) {
      const roomRef = ref(db, `rooms/${roomId}`);
      const unsubscribe = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setHostId(data.hostId || null);
          setViewState(data.status);
          setCountdown(data.countdown);
          setRoomMaxPlayers(data.maxPlayers);
          setIsPublicRoom(data.isPublic || false);
          const playersArr = ensureArray<Player>(data.players);
          
          if (data.status === 'PLAYING' || data.status === 'WINNER') {
            const rawGS = data.gameState || {};
            const cleanGS = {
                ...rawGS,
                players: ensureArray(rawGS.players),
                deck: ensureArray(rawGS.deck),
                discardPile: ensureArray(rawGS.discardPile),
                rankings: ensureArray(rawGS.rankings),
                messages: ensureArray(rawGS.messages),
                winner: rawGS.winner || null
            };
            setGameState(cleanGS);
            if (cleanGS.players) {
              const myIdx = cleanGS.players.findIndex((p: Player) => p.id === userProfile?.id);
              setMyPlayerIndex(myIdx);
            }
          } else {
            setGameState((prev) => ({
              ...(prev || {}),
              players: playersArr,
              status: data.status,
              turnId: data.gameState?.turnId || 0,
              winner: null
            } as GameState));
            setMyPlayerIndex(playersArr.findIndex(p => p.id === userProfile?.id));

            // Auto-start logic for Quick Match (isPublic)
            if (data.isPublic && playersArr.length >= data.maxPlayers && data.status === 'LOBBY' && data.hostId === userProfile?.id && !autoStartInitiatedRef.current) {
                autoStartInitiatedRef.current = true;
                handleInitiateCountdown();
            }
          }
        } else {
          setViewState('LOBBY'); setRoomId(null); setIsOnlineMode(false);
        }
      });
      return () => unsubscribe();
    }
  }, [isOnlineMode, roomId, userProfile?.id]);

  const handleInitiateCountdown = () => {
    if (!roomId) return;
    update(ref(db, `rooms/${roomId}`), { status: 'COUNTDOWN', countdown: 10 }); 
    let c = 10; 
    const t = setInterval(() => { 
        c--; 
        update(ref(db, `rooms/${roomId}`), { countdown: c }); 
        if(c <= 0) { 
            clearInterval(t); 
            actuallyStartGame(); 
            autoStartInitiatedRef.current = false;
        } 
    }, 1000);
  };

  const handleDrawCard = useCallback(async (playerIndex: number) => {
    if (!gameState || gameState.status !== 'PLAYING') return;
    audioService.play('card_slide');
    
    let currentDeck = ensureArray<Card>(gameState.deck);
    let currentPlayers = ensureArray<Player>(gameState.players);
    let currentDiscardPile = ensureArray<Card>(gameState.discardPile);
    
    const currentPlayer = { ...currentPlayers[playerIndex] };

    if (currentDeck.length === 0) {
      if (currentDiscardPile.length > 1) {
        const top = currentDiscardPile.pop()!;
        currentDeck = currentDiscardPile.sort(() => Math.random() - 0.5);
        currentDiscardPile = [top];
      } else return;
    }

    const drawnCard = currentDeck.pop();
    if (drawnCard) {
      currentPlayer.hand = [...(ensureArray<Card>(currentPlayer.hand)), drawnCard];
      currentPlayers[playerIndex] = currentPlayer;
    }

    const nextIndex = getNextPlayerIndex(playerIndex, gameState.direction, currentPlayers);
    const newState = { 
        ...gameState, 
        deck: currentDeck, 
        players: currentPlayers, 
        currentPlayerIndex: nextIndex, 
        discardPile: currentDiscardPile, 
        lastAction: `${currentPlayer.name} drew a card`,
        winner: gameState.winner || null,
        turnId: (gameState.turnId || 0) + 1
    };
    
    if (isOnlineMode && roomId) update(ref(db, `rooms/${roomId}/gameState`), newState);
    else setGameState(newState);
  }, [gameState, isOnlineMode, roomId, getNextPlayerIndex]);

  const handlePlayCard = useCallback(async (card: Card, playerIndex: number, chosenColor?: CardColor) => {
    if (!gameState || gameState.status !== 'PLAYING') return;
    if (card.color === 'WILD' && !chosenColor) { setPendingWildCard(card); setIsPickingColor(true); return; }
    setIsPickingColor(false);
    audioService.play(card.color === 'WILD' ? 'action_card' : 'card_slide');
    
    let currentDeck = ensureArray<Card>(gameState.deck);
    let currentPlayers = ensureArray<Player>(gameState.players);
    let currentDiscardPile = ensureArray<Card>(gameState.discardPile);

    const currentPlayer = { ...currentPlayers[playerIndex] };
    currentPlayer.hand = (ensureArray<Card>(currentPlayer.hand)).filter(c => c.id !== card.id);
    currentPlayers[playerIndex] = currentPlayer;
    
    let newDirection = gameState.direction;
    const finalActiveColor = (card.color === 'WILD' ? chosenColor : card.color) as CardColor;
    let actionMessage = `${currentPlayer.name} played ${card.color} ${card.value}`;
    let skipCount = 1;

    if (card.value === 'REVERSE') {
      if (currentPlayers.filter(p => !p.isFinished).length === 2) skipCount = 1;
      else newDirection = (gameState.direction === 1 ? -1 : 1) as (1 | -1);
    } else if (card.value === 'SKIP') skipCount = 2;

    let nextIndex = playerIndex;
    for(let i=0; i<skipCount; i++) nextIndex = getNextPlayerIndex(nextIndex, newDirection, currentPlayers);

    if (card.value === 'DRAW2' || card.value === 'WILD4') {
      const drawCount = card.value === 'DRAW2' ? 2 : 4;
      const targetIdx = nextIndex;
      const targetPlayer = { ...currentPlayers[targetIdx] };
      const drawnCards: Card[] = [];
      for (let i = 0; i < drawCount; i++) {
        if (currentDeck.length === 0) currentDeck = currentDiscardPile.slice(0, -1).sort(() => Math.random() - 0.5);
        const drawn = currentDeck.pop(); if (drawn) drawnCards.push(drawn);
      }
      targetPlayer.hand = [...(ensureArray<Card>(targetPlayer.hand)), ...drawnCards];
      currentPlayers[targetIdx] = targetPlayer;
      nextIndex = getNextPlayerIndex(targetIdx, newDirection, currentPlayers);
    }

    const newRankings = [...ensureArray<string>(gameState.rankings)];
    if ((ensureArray(currentPlayer.hand)).length === 0) {
      currentPlayer.isFinished = true;
      currentPlayer.rank = newRankings.length + 1;
      newRankings.push(currentPlayer.id);
      currentPlayers[playerIndex] = currentPlayer;
      actionMessage = `${currentPlayer.name} Finished! (#${currentPlayer.rank})`;
      if (currentPlayer.rank === 1) confetti({ particleCount: 150, spread: 70 });
    }

    const activeCount = currentPlayers.filter(p => !p.isFinished).length;
    let newStatus: GameStatus = gameState.status;
    let winner = gameState.winner || null;

    if (activeCount <= 1) {
      const loser = currentPlayers.find(p => !p.isFinished);
      if (loser) { loser.isFinished = true; loser.rank = newRankings.length + 1; newRankings.push(loser.id); }
      newStatus = 'WINNER';
      winner = currentPlayers.find(p => p.id === newRankings[0]) || null;
      
      const myRank = newRankings.indexOf(userProfile?.id || "") + 1;
      let reward = myRank === 1 ? 250 : myRank === 2 ? 100 : myRank === 3 ? 50 : 0;
      if (userProfile && reward > 0) saveProfile({ ...userProfile, coins: (userProfile.coins || 0) + reward, wins: myRank === 1 ? (userProfile.wins || 0) + 1 : userProfile.wins });
    }

    const newState = { 
        ...gameState, 
        deck: currentDeck, 
        players: currentPlayers, 
        currentPlayerIndex: nextIndex, 
        discardPile: [...currentDiscardPile, card], 
        direction: newDirection, 
        activeColor: finalActiveColor, 
        lastAction: actionMessage, 
        rankings: newRankings, 
        status: newStatus, 
        winner: winner || null,
        turnId: (gameState.turnId || 0) + 1
    };
    
    if (isOnlineMode && roomId) update(ref(db, `rooms/${roomId}`), { gameState: newState, status: newStatus });
    else { setGameState(newState); setViewState(newStatus); }
  }, [gameState, isOnlineMode, roomId, getNextPlayerIndex, userProfile]);

  const actuallyStartGame = async () => {
    if (!roomId || !isHost) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    const snap = await get(roomRef);
    if (!snap.exists()) return;
    const playersArr = ensureArray<Player>(snap.val().players);
    const finalDeck = createDeck();
    playersArr.forEach(p => { 
      p.hand = []; p.isFinished = false; 
      for(let i=0; i<7; i++) { const c = finalDeck.pop(); if(c) p.hand.push(c); } 
    });
    let first = finalDeck.pop()!;
    while(first.color === 'WILD') { finalDeck.unshift(first); finalDeck.sort(() => Math.random() - 0.5); first = finalDeck.pop()!; }
    const initialGameState = { 
      players: playersArr, currentPlayerIndex: 0, deck: finalDeck, discardPile: [first], direction: 1 as 1 | -1, activeColor: first.color,
      status: 'PLAYING' as GameStatus, winner: null, rankings: [], lastAction: 'Game Started!', pendingDrawCount: 0, 
      aiDifficulty: snap.val().gameState?.aiDifficulty || 'MEDIUM', maxPlayers: snap.val().maxPlayers, messages: ensureArray(snap.val().gameState?.messages),
      turnId: 1
    };
    update(roomRef, { status: 'PLAYING', countdown: null, gameState: initialGameState });
  };

  const startNewGame = useCallback(async (playerName: string, avatar: string, difficulty: AIDifficulty, isOnline: boolean, playerCount: number, targetRoomId?: string, isPublic?: boolean) => {
    setIsOnlineMode(isOnline);
    setRoomMaxPlayers(playerCount);
    audioService.init();

    if (isOnline) {
      let finalId = targetRoomId ? targetRoomId.toUpperCase() : null;
      
      // Quick Match Matchmaking
      if (isPublic && !finalId) {
          const roomsSnap = await get(ref(db, `rooms`));
          const rooms = roomsSnap.val() || {};
          const availableRoom = Object.values(rooms).find((r: any) => 
            r.isPublic && 
            r.status === 'LOBBY' && 
            r.maxPlayers === playerCount &&
            ensureArray(r.players).length < r.maxPlayers
          ) as any;

          if (availableRoom) finalId = availableRoom.id;
          else finalId = Array.from({length:6}, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random()*36)]).join('');
      } else if (!finalId) {
          finalId = Array.from({length:6}, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random()*36)]).join('');
      }

      const playerObj = { ...userProfile!, name: playerName, avatar, isOnline: true, isReady: true, hand: [], isFinished: false, unoDeclared: false };
      
      const roomRef = ref(db, `rooms/${finalId}`);
      const snap = await get(roomRef);

      if (snap.exists()) {
        if (ensureArray(snap.val().players).length < snap.val().maxPlayers) {
          setRoomId(finalId);
          await set(ref(db, `rooms/${finalId}/players/${userProfile!.id}`), playerObj);
        } else if (!isPublic) { alert("Room full."); setIsOnlineMode(false); return; }
        else { // If public but full (race condition), retry create
            startNewGame(playerName, avatar, difficulty, isOnline, playerCount, undefined, true);
            return;
        }
      } else {
        setRoomId(finalId);
        await set(roomRef, { 
          id: finalId, status: 'LOBBY', hostId: userProfile!.id, maxPlayers: playerCount, isPublic: isPublic || false, players: { [userProfile!.id]: playerObj }, 
          gameState: { players: [playerObj], currentPlayerIndex: 0, deck: [], discardPile: [], direction: 1, rankings: [], status: 'LOBBY', lastAction: 'Waiting for players...', aiDifficulty: difficulty, maxPlayers: playerCount, messages: [], turnId: 0, winner: null }
        });
      }
      onDisconnect(ref(db, `rooms/${finalId}/players/${userProfile!.id}`)).remove();
    } else {
      const deck = createDeck();
      const players: Player[] = [{ ...userProfile!, name: playerName, avatar, hand: [], isBot: false, isFinished: false, unoDeclared: false }];
      for (let i = 1; i < playerCount; i++) players.push({ id: `bot-${i}`, name: `Bot ${i}`, avatar: AVATARS[i % AVATARS.length], hand: [], isBot: true, isFinished: false, unoDeclared: false, equipped: { cardTheme: 'card_classic', bgTheme: 'bg_dark', nameTag: 'tag_none', chatTheme: 'chat_default' } });
      players.forEach(p => { for(let j=0; j<7; j++) { const c = deck.pop(); if(c) p.hand.push(c); } });
      const first = deck.pop()!;
      setGameState({ players, currentPlayerIndex: 0, deck, discardPile: [first], direction: 1, activeColor: first.color === 'WILD' ? 'RED' : first.color, status: 'PLAYING', rankings: [], winner: null, lastAction: 'Game Started!', pendingDrawCount: 0, aiDifficulty: difficulty, maxPlayers: playerCount, turnId: 1 });
      setMyPlayerIndex(0); setViewState('PLAYING');
    }
  }, [userProfile]);

  if (isAuthenticating) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={48} /></div>;
  if (!userProfile) return <Auth onAuthSuccess={setUserProfile} />;
  
  if (viewState === 'ACCOUNT') return <AccountPage user={userProfile} onBack={() => setViewState('LOBBY')} />;
  if (viewState === 'SETTINGS') return <SettingsPage user={userProfile} onBack={() => setViewState('LOBBY')} onUpdate={saveProfile} />;

  if (!gameState || viewState === 'LOBBY' || viewState === 'COUNTDOWN') {
    if (isOnlineMode && roomId) return <WaitingRoom roomId={roomId} players={ensureArray<Player>(gameState?.players)} maxPlayers={roomMaxPlayers} countdown={countdown} isHost={isHost} onStartGame={handleInitiateCountdown} onCancel={() => { if(isHost && roomId) remove(ref(db, `rooms/${roomId}`)); else if(roomId) remove(ref(db, `rooms/${roomId}/players/${userProfile.id}`)); setViewState('LOBBY'); setRoomId(null); setIsOnlineMode(false); }} />;
    return (
      <div className="relative">
        <Lobby userProfile={userProfile} onStart={startNewGame} onShowRules={() => setShowRules(true)} onLogout={() => auth.signOut()} onShowAccount={() => setViewState('ACCOUNT')} onShowSettings={() => setViewState('SETTINGS')} onShowShop={() => setActiveModal('SHOP')} />
        <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
        <Shop isOpen={activeModal === 'SHOP'} user={userProfile} onClose={() => setActiveModal(null)} />
        <button onClick={() => audioService.cycleLobbyMusic()} className="fixed bottom-6 left-6 p-4 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-400 hover:text-white flex items-center gap-2 group shadow-xl z-50">
          <Music size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Cycle Track</span>
        </button>
      </div>
    );
  }

  const myPlayer = currentPlayers[myPlayerIndex];
  const myHand = ensureArray<Card>(myPlayer?.hand);

  return (
    <div className={`fixed inset-0 bg-[#111111] overflow-hidden flex flex-col font-uno select-none`}>
      <header className="z-20 p-3 flex justify-between items-center bg-black/60 backdrop-blur-md border-b border-white/5 h-16">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-uno text-white">UNO ROYALE</div>
          <div className="bg-yellow-500/10 px-2 py-0.5 rounded-full flex items-center gap-1"><Zap size={12} className="text-yellow-500" fill="currentColor" /><span className="text-[10px] text-yellow-500 font-black">{userProfile.coins}</span></div>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setActiveModal('SHOP')} className="text-zinc-500 hover:text-white"><ShoppingBag size={20} /></button>
            <button onClick={() => { if(isOnlineMode && roomId) { if(isHost) remove(ref(db, `rooms/${roomId}`)); else remove(ref(db, `rooms/${roomId}/players/${userProfile.id}`)); } setGameState(null); setViewState('LOBBY'); setRoomId(null); setIsOnlineMode(false); }} className="text-zinc-500 hover:text-white"><Home size={20} /></button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-between p-4 relative overflow-hidden">
        <div className="w-full flex justify-center items-center gap-12 flex-wrap">
          {currentPlayers.map((p, idx) => idx !== myPlayerIndex && <PlayerAvatar key={p.id} player={p} isActive={gameState.currentPlayerIndex === idx} isDirectionClockwise={gameState.direction === 1} cardCount={ensureArray(p.hand).length} />)}
        </div>

        <div className="flex flex-col items-center justify-center gap-8 w-full">
          {gameState.activeColor && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className={`px-12 py-3 rounded-full border-2 border-white/40 shadow-xl ${COLOR_CLASSES[gameState.activeColor]}`}>
              <span className="text-white font-black text-2xl uppercase italic">{gameState.activeColor}</span>
            </motion.div>
          )}
          <div className="flex gap-10 items-center">
            <motion.div whileTap={isUserTurn ? { scale: 0.95 } : {}} onClick={() => isUserTurn && handleDrawCard(myPlayerIndex)} className={`w-24 h-36 bg-zinc-950 rounded-2xl border-4 border-zinc-800 flex items-center justify-center cursor-pointer relative ${!isUserTurn ? 'opacity-30' : 'hover:border-blue-500 shadow-2xl transition-all'}`}>
              <div className="text-zinc-800 font-black text-2xl rotate-45">DRAW</div>
            </motion.div>
            <div className="relative w-24 h-36 flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {topCard && <UnoCard key={`${topCard.id}-${discardPile.length}`} card={topCard} disabled theme={currentPlayers[gameState.currentPlayerIndex]?.equipped?.cardTheme} />}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] bg-black/50 px-6 py-2 rounded-full border border-white/10 italic text-center max-w-md">{gameState.lastAction}</p>
        </div>

        <div className="w-full flex flex-col items-center gap-4 mt-auto">
          <div className="flex items-center gap-4">
            <PlayerAvatar player={myPlayer} isActive={isUserTurn} isDirectionClockwise={gameState.direction === 1} cardCount={myHand.length} />
            {isUserTurn && <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity }} className="bg-red-600 px-3 py-1 rounded-lg text-[8px] font-black text-white uppercase italic shadow-lg">YOUR TURN</motion.div>}
          </div>
          <div className="w-full max-w-full overflow-x-auto flex justify-center gap-2 no-scrollbar px-2 pb-4">
            <div className="flex gap-4 pt-4">
              {myHand.map(card => {
                const playable = isUserTurn && canPlayCard(card, gameState.activeColor, topCard);
                return (
                  <UnoCard 
                    key={card.id} 
                    card={card} 
                    onClick={() => handlePlayCard(card, myPlayerIndex)} 
                    disabled={!playable} 
                    theme={userProfile.equipped?.cardTheme} 
                    isSmall={window.innerWidth < 768} 
                  />
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <WildColorPicker isOpen={isPickingColor} onSelect={(color) => pendingWildCard && handlePlayCard(pendingWildCard, myPlayerIndex, color)} />
      <GameOverModal isOpen={viewState === 'WINNER'} winner={gameState.winner} rankings={ensureArray(gameState.rankings)} myPlayerId={userProfile.id} onRematch={() => { if(isOnlineMode) actuallyStartGame(); else startNewGame(userProfile.name, userProfile.avatar, gameState.aiDifficulty, false, currentPlayers.length); }} onReturnHome={() => { setViewState('LOBBY'); setGameState(null); setRoomId(null); setIsOnlineMode(false); }} isHost={isHost} />
      <ChatBox messages={ensureArray(gameState?.messages)} onSendMessage={(text) => isOnlineMode && roomId && update(ref(db, `rooms/${roomId}/gameState`), { messages: [...ensureArray(gameState?.messages), { id: Date.now().toString(), senderId: userProfile.id, senderName: userProfile.name, text, timestamp: Date.now() }] })} myPlayerId={userProfile.id} />
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
      <Shop isOpen={activeModal === 'SHOP'} user={userProfile} onClose={() => setActiveModal(null)} />
    </div>
  );
};

export default App;
