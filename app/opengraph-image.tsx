import { ImageResponse } from 'next/og';
import { SITE_NAME } from '../constants/site';
import { litPath } from '../components/MoonPhase';

export const alt = `${SITE_NAME} – moon phase card game`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function Disc({ phase, size: d }: { phase: number, size: number }) {
  const lit = litPath(phase);
  return (
    <svg width={d} height={d} viewBox="10 10 80 80">
      <circle cx="50" cy="50" r="40" fill="#1c1f4a" />
      {lit && <path d={lit} fill="#f3dfa6" />}
    </svg>
  );
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at 50% 40%, #1f2160 0%, #0a0b1d 55%, #05060f 100%)',
          color: '#ecebff',
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', gap: 22, marginBottom: 44 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(phase => <Disc key={phase} phase={phase} size={56} />)}
        </div>
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 14, color: '#a3a6d6' }}>RISE OF THE</div>
        <div style={{ display: 'flex', fontSize: 120, fontWeight: 700, letterSpacing: 8, color: '#f6d27a', marginTop: 6 }}>HALF MOON</div>
        <div style={{ display: 'flex', fontSize: 34, color: '#a3a6d6', marginTop: 26, fontFamily: 'sans-serif' }}>
          A moon phase card game · Play free in your browser
        </div>
      </div>
    ),
    size,
  );
}
