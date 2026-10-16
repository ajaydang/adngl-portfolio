'use client';

import dynamic from 'next/dynamic';
import V2Navigation from './components/V2Navigation';
import V2Footer from './components/V2Footer';
import Link from 'next/link';

const WavyGrid = dynamic(() => import('./components/WavyGrid'), { ssr: false });

export default function V2Home() {
  return (
    <>
      <V2Navigation />

      <section className="v2-hero">
        <div className="v2-hero-canvas">
          <WavyGrid />
        </div>

        <div className="v2-hero-overlay">
          <div className="v2-hero-left">
            <h1 className="v2-hero-name">
              Ajay
              <br />
              Dangol
            </h1>
          </div>
          <div className="v2-hero-right">
            <p className="v2-hero-bio">
              Ajay is a full-stack developer creating thoughtful, performant
              digital products through modern frontend engineering, immersive
              interaction, and purposeful design.{' '}
              <span className="v2-hero-bio-secondary">
                His work combines clean architecture with expressive
                interfaces — built on engineering discipline and creative
                thinking.
              </span>
            </p>
          </div>
        </div>

        <div className="v2-hero-bottom">
          <div className="v2-hero-bottom-location">
            <p>Based in Nepal</p>
          </div>
          <div className="v2-hero-bottom-cta">
            <Link href="/v2/work" className="v2-animated-link">
              <span className="v2-link-content">
                <span className="v2-link-text">
                  Explore My Work
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '0.5rem' }}>
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </span>
                <span className="v2-link-text">
                  Explore My Work
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '0.5rem' }}>
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </span>
              </span>
            </Link>
          </div>
          <div className="v2-hero-bottom-cta">
            <Link href="/v2/contact" className="v2-animated-link">
              <span className="v2-link-content">
                <span className="v2-link-text">
                  Contact Me
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '0.5rem' }}>
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </span>
                <span className="v2-link-text">
                  Contact Me
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '0.5rem' }}>
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <V2Footer />
    </>
  );
}
