import React from 'react';
import { motion } from 'framer-motion';

function StarField() {
  // Use a fixed random seed or deterministic pattern to avoid hydration errors if needed,
  // or since it's just pure decorative, we can accept it or use a mounted check if needed.
  // We'll use random values inline but if hydration complains we could add a mounted check.
  // Actually, to prevent hydration mismatch on server, we can render 100 empty divs,
  // or wrap with a useEffect check. Let's use simple logic.
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

function CosmicGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <motion.div
        className="cosmic-glow"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

interface StartScreenProps {
  onStartGame: () => void;
  onShowTutorial: () => void;
  currentLevel: number;
  bestLevel: number;
}

export function StartScreen({ onStartGame, onShowTutorial, currentLevel, bestLevel }: StartScreenProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="start-screen selection:bg-indigo-500/30">
      {/* Background effects */}
      <StarField />
      <CosmicGlow />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="start-card z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Title section */}
          <motion.div variants={itemVariants} className="title-section">
            <motion.div
              className="hero-moon"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              🌙
            </motion.div>

            <h1 className="game-title">
              <span className="title-rise">RISE OF THE</span>
              <span className="title-half-moon drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">HALF MOON</span>
            </h1>

            <p className="game-tagline">
              A Strategic Moon Phase Card Game
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="button-group w-full">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(108, 99, 255, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              className="start-button primary w-full"
              onClick={onStartGame}
            >
              <span className="button-icon">🎮</span>
              <span className="button-text">START GAME</span>
              <div className="button-glow" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="start-button secondary w-full"
              onClick={onShowTutorial}
            >
              <span className="button-icon">📖</span>
              <span className="button-text">HOW TO PLAY</span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="stats-container w-full">
            <div className="stat-item flex-1 justify-center">
              <div className="stat-icon">📍</div>
              <div className="stat-content">
                <span className="stat-label">Current Level</span>
                <span className="stat-value">{currentLevel}</span>
              </div>
            </div>

            <div className="stat-divider" />

            <div className="stat-item flex-1 justify-center">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <span className="stat-label">Best Level</span>
                <span className="stat-value">{bestLevel}</span>
              </div>
            </div>
          </motion.div>

          {/* GitHub section */}
          <motion.div variants={itemVariants} className="github-section w-full">
            <motion.a
              href="https://github.com/nahyun27/rise-of-halfmoon"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="github-button"
            >
              <svg
                className="github-icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path
                  fill="currentColor"
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
              <span>View on GitHub</span>
            </motion.a>

            <p className="github-message">
              Enjoyed the game? ⭐ Star the repo!<br />
              <span className="github-submessage">
                Found a bug or have ideas? Open an issue! 💡
              </span>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
