"use client";

import React from 'react';
import { motion } from 'framer-motion';

const STAR_PATH = 'm12 2.8 2.83 5.73 6.32.92-4.57 4.46 1.08 6.3L12 17.24l-5.66 2.97 1.08-6.3L2.85 9.45l6.32-.92L12 2.8z';

interface StarRatingProps {
  stars: number;
  size?: number;
  // Pop the earned stars in one by one
  animate?: boolean;
  className?: string;
}

export function StarRating({ stars, size = 16, animate = false, className = '' }: StarRatingProps) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} role="img" aria-label={`${stars} of 3 stars`}>
      {[0, 1, 2].map(i => {
        const earned = i < stars;
        return (
          <motion.svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            initial={animate && earned ? { scale: 0, rotate: -60, opacity: 0 } : false}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14, delay: animate ? 0.35 + i * 0.25 : 0 }}
            style={earned ? { filter: `drop-shadow(0 0 ${size / 3}px rgba(246,210,122,0.7))` } : undefined}
          >
            <path
              d={STAR_PATH}
              fill={earned ? '#f6d27a' : 'rgba(255,255,255,0.06)'}
              stroke={earned ? '#f6d27a' : 'rgba(255,255,255,0.2)'}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </motion.svg>
        );
      })}
    </div>
  );
}
