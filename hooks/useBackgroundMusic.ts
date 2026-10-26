import { useEffect, useRef, useState } from 'react';

export function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // The page renders nothing until mounted, so reading storage here can't cause a hydration mismatch
  const [isMuted, setIsMuted] = useState(() => typeof window !== 'undefined' && localStorage.getItem('halfmoon_isMuted') === 'true');

  useEffect(() => {
    const savedMute = localStorage.getItem('halfmoon_isMuted') === 'true';

    const audio = new Audio('/bgm.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audio.muted = savedMute;
    audioRef.current = audio;

    // Browsers block autoplay until the first user gesture
    const playAudio = () => {
      audio.play().catch(() => { });
      document.removeEventListener('pointerdown', playAudio);
      document.removeEventListener('keydown', playAudio);
    };

    document.addEventListener('pointerdown', playAudio);
    document.addEventListener('keydown', playAudio);

    return () => {
      audio.pause();
      document.removeEventListener('pointerdown', playAudio);
      document.removeEventListener('keydown', playAudio);
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('halfmoon_isMuted', String(next));
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  };

  return { isMuted, toggleMute };
}
