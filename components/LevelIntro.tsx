"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function playLevelStartSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Mystical ascending arpeggio
    const notes = [
      { freq: 261.63, time: 0 },     // C
      { freq: 329.63, time: 0.15 },  // E
      { freq: 392.00, time: 0.3 },   // G
      { freq: 523.25, time: 0.5 },   // C (higher)
      { freq: 659.25, time: 0.7 }    // E (higher)
    ];

    notes.forEach(({ freq, time }) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.value = freq;
        osc.type = 'sine';

        // Reverb-like envelope
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      }, time * 1000);
    });
  } catch (e) {
    // Ignore audio errors
  }
}

function FloatingStars({ count }: { count: number }) {
  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2
    }))
    , [count]);

  return (
    <>
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="floating-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 3,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </>
  );
}

function MysticalBackground() {
  return (
    <div className="mystical-bg">
      {/* Radial glow pulse */}
      <motion.div
        className="glow-circle"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Expanding rings */}
      {[0, 0.5, 1].map((delay, i) => (
        <motion.div
          key={i}
          className="expanding-ring"
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{
            duration: 2,
            delay: delay,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      ))}

      {/* Floating stars */}
      <FloatingStars count={30} />
    </div>
  );
}

function OrbitingParticles() {
  return (
    <div className="orbit-container">
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <motion.div
          key={i}
          className="orbiting-particle"
          style={{
            transform: `rotate(${angle}deg)`
          }}
          animate={{
            rotate: angle + 360
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.1
          }}
        >
          <div className="particle-dot" />
        </motion.div>
      ))}
    </div>
  );
}

interface LevelIntroProps {
  levelNumber: number;
  levelName: string;
  onComplete: () => void;
  onSkip?: () => void;
}

export const LevelIntro: React.FC<LevelIntroProps> = ({ levelNumber, levelName, onComplete, onSkip }) => {
  const [phase, setPhase] = useState<'fadeIn' | 'hold' | 'fadeOut'>('fadeIn');

  useEffect(() => {
    playLevelStartSound();

    // Phase 1: Fade in (0.8s)
    const holdTimer = setTimeout(() => setPhase('hold'), 800);

    // Phase 2: Hold (1.5s)
    const fadeOutTimer = setTimeout(() => setPhase('fadeOut'), 2300);

    // Phase 3: Fade out (0.7s) then complete
    const completeTimer = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        onSkip?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onSkip]);

  return (
    <motion.div
      className="level-intro-overlay"
      initial={{ opacity: 0 }}
      animate={{
        opacity: phase === 'fadeOut' ? 0 : 1
      }}
      transition={{ duration: phase === 'fadeOut' ? 0.7 : 0.8 }}
    >
      {/* Mystical background effects */}
      <MysticalBackground />

      {/* Level number */}
      <motion.div
        className="level-number"
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{
          scale: phase === 'fadeOut' ? 0.8 : 1,
          rotate: 0,
          opacity: phase === 'fadeOut' ? 0 : 1
        }}
        transition={{
          duration: 0.8,
          type: 'spring',
          stiffness: 100
        }}
      >
        <div className="level-label">LEVEL</div>
        <div className="number">{levelNumber}</div>
      </motion.div>

      {/* Level name with moon icon */}
      <motion.div
        className="level-name"
        initial={{ y: 30, opacity: 0 }}
        animate={{
          y: phase === 'fadeOut' ? -20 : 0,
          opacity: phase === 'fadeOut' ? 0 : 1
        }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <span className="moon-icon">🌙</span>
        <span className="name-text">{levelName}</span>
      </motion.div>

      {/* Orbiting particles */}
      <OrbitingParticles />

      {/* Skip button removed as requested */}
    </motion.div>
  );
}
