// Synthesized sound effects. A single AudioContext is shared because browsers
// cap how many can be open at once.

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedCtx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      sharedCtx = new Ctor();
    }
    if (sharedCtx.state === 'suspended') sharedCtx.resume().catch(() => { });
    return sharedCtx;
  } catch {
    return null;
  }
}

interface Tone {
  freq: number;
  endFreq?: number;
  type?: OscillatorType;
  volume: number;
  duration: number; // seconds
  delay?: number;   // seconds
}

function playTones(tones: Tone[]) {
  const ctx = getCtx();
  if (!ctx) return;
  for (const tone of tones) {
    const start = ctx.currentTime + (tone.delay ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tone.type ?? 'sine';
    osc.frequency.setValueAtTime(tone.freq, start);
    if (tone.endFreq) osc.frequency.exponentialRampToValueAtTime(tone.endFreq, start + tone.duration / 3);
    gain.gain.setValueAtTime(tone.volume, start);
    gain.gain.exponentialRampToValueAtTime(0.01, start + tone.duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + tone.duration);
  }
}

export function playPairSound() {
  playTones([{ freq: 600, endFreq: 1200, volume: 0.1, duration: 0.3 }]);
}

export function playFullMoonSound() {
  playTones([{ freq: 800, endFreq: 1600, volume: 0.15, duration: 0.4 }]);
}

export function playChainSound(index: number) {
  playTones([{ freq: 400 + index * 100, volume: 0.15, duration: 0.3 }]);
}

export function playCompletionSound() {
  playTones([600, 750, 900].map((freq, i) => ({ freq, volume: 0.2, duration: 0.2, delay: i * 0.08 })));
}

export function playMultipleChainSound() {
  playTones([400, 500, 600, 700, 800, 900].map((freq, i) => ({ freq, type: 'triangle' as const, volume: 0.15, duration: 0.2, delay: i * 0.1 })));
}

export function playGameOverSound(result: 'win' | 'lose') {
  if (result === 'win') {
    playTones([523, 659, 784, 1047].map((freq, i) => ({ freq, type: 'triangle' as const, volume: 0.15, duration: 0.8, delay: i * 0.15 })));
  } else {
    playTones([440, 392, 349, 294].map((freq, i) => ({ freq, volume: 0.12, duration: 0.6, delay: i * 0.2 })));
  }
}

export function playDrawSound() {
  // Neutral tone sequence (neither happy nor sad)
  playTones([0, 0.15, 0.3].map(delay => ({ freq: 440, volume: 0.1, duration: 0.4, delay })));
}

export function playLevelStartSound() {
  // Mystical ascending arpeggio
  playTones([
    { freq: 261.63, delay: 0 },
    { freq: 329.63, delay: 0.15 },
    { freq: 392.0, delay: 0.3 },
    { freq: 523.25, delay: 0.5 },
    { freq: 659.25, delay: 0.7 },
  ].map(n => ({ ...n, volume: 0.15, duration: 1.5 })));
}

export function playSelectSound() {
  playTones([{ freq: 880, volume: 0.04, duration: 0.08 }]);
}
