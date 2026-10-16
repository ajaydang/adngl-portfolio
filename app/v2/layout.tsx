import type { Metadata } from 'next';
import './v2.css';

export const metadata: Metadata = {
  title: 'Ajay Dangol — V2 Portfolio',
  description: 'Experimental portfolio with Three.js wave grids and Bayer dithering visuals.',
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="v2-root" style={{ overflow: 'auto', height: '100vh' }}>
      {children}
    </div>
  );
}
