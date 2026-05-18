
import { Howl, Howler } from 'howler';

class AudioManager {
  private sounds: Record<string, Howl> = {};
  private music: Record<string, Howl> = {};
  private currentMusicKey: string | null = null;
  private currentVolume: number = 0.5;
  private initialized: boolean = false;
  private lobbyTracks: string[] = ['lobby1', 'lobby2', 'lobby3'];
  private currentLobbyIndex: number = 0;

  constructor() {
    const soundUrls: Record<string, string> = {
      card_slide: 'https://cdn.pixabay.com/audio/2022/03/15/audio_739265c03c.mp3',
      turn_alert: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
      action_card: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c976f620ed.mp3',
      uno_shout: 'https://cdn.pixabay.com/audio/2024/02/14/audio_7a6c90b84f.mp3',
      winner_fanfare: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3',
      click: 'https://cdn.pixabay.com/audio/2022/03/24/audio_34d1933c04.mp3'
    };

    const musicUrls: Record<string, string> = {
      lobby1: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d1be646708.mp3',
      lobby2: 'https://cdn.pixabay.com/audio/2024/04/10/audio_f3b0e1a1a1.mp3',
      lobby3: 'https://cdn.pixabay.com/audio/2023/10/25/audio_7b8a1c2d3e.mp3',
      game: 'https://cdn.pixabay.com/audio/2021/11/23/audio_0de8406132.mp3',
      tension: 'https://cdn.pixabay.com/audio/2022/01/18/audio_6070621376.mp3'
    };

    const savedVolume = localStorage.getItem('uno_volume');
    if (savedVolume) this.currentVolume = parseFloat(savedVolume);

    Object.entries(soundUrls).forEach(([key, url]) => {
      this.sounds[key] = new Howl({ src: [url], volume: this.currentVolume, preload: true });
    });

    Object.entries(musicUrls).forEach(([key, url]) => {
      this.music[key] = new Howl({ 
        src: [url], 
        volume: this.currentVolume * 0.4, 
        loop: true, 
        preload: true,
        html5: true
      });
    });
    
    Howler.volume(this.currentVolume);

    // Global Interaction Unlock
    const unlock = () => {
      this.resumeContext();
      if (!this.currentMusicKey) this.playLobbyMusic();
    };
    window.addEventListener('mousedown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  public init() {
    this.resumeContext();
  }

  private resumeContext() {
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume().then(() => {
        this.initialized = true;
      });
    } else {
      this.initialized = true;
    }
  }

  setVolume(val: number) {
    this.currentVolume = val;
    Howler.volume(val);
    Object.values(this.music).forEach(m => m.volume(val * 0.4));
    localStorage.setItem('uno_volume', val.toString());
  }

  getVolume() { return this.currentVolume; }

  play(name: string) {
    if (this.sounds[name]) {
      this.sounds[name].stop();
      this.sounds[name].play();
    }
  }

  playLobbyMusic() {
    const track = this.lobbyTracks[this.currentLobbyIndex];
    this.playMusic(track);
  }

  cycleLobbyMusic() {
    this.currentLobbyIndex = (this.currentLobbyIndex + 1) % this.lobbyTracks.length;
    this.playLobbyMusic();
  }

  playMusic(name: string) {
    if (this.currentMusicKey === name) return;
    this.resumeContext();
    
    if (this.currentMusicKey && this.music[this.currentMusicKey]) {
      const prevKey = this.currentMusicKey;
      this.music[prevKey].fade(this.music[prevKey].volume(), 0, 1500);
      setTimeout(() => {
        if (this.currentMusicKey !== prevKey) {
          this.music[prevKey].stop();
        }
      }, 1500);
    }
    
    if (this.music[name]) {
      this.music[name].stop();
      this.music[name].play();
      this.music[name].fade(0, this.currentVolume * 0.4, 1500);
      this.currentMusicKey = name;
    }
  }

  stopMusic() {
    if (this.currentMusicKey && this.music[this.currentMusicKey]) {
      const prev = this.currentMusicKey;
      this.music[prev].fade(this.music[prev].volume(), 0, 1000);
      setTimeout(() => this.music[prev].stop(), 1000);
      this.currentMusicKey = null;
    }
  }
}

export const audioService = new AudioManager();
