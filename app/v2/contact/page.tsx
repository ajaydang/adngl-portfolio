'use client';

import { useState, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import V2Navigation from '../components/V2Navigation';
import V2Footer from '../components/V2Footer';

const WavyGrid = dynamic(() => import('../components/WavyGrid'), { ssr: false });

export default function V2Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <V2Navigation />

      <div className="v2-hero-canvas">
        <WavyGrid />
      </div>

      <main className="v2-about-split">
        {/* Left — sticky title */}
        <div className="v2-about-left">
          <div className="v2-about-left-inner">
            <p className="v2-section-label">03 — Contact</p>
            <h1 className="v2-about-title">
              Get In
              <br />
              Touch
            </h1>
            <p className="v2-about-subtitle">Let&apos;s Work Together</p>
            <p className="v2-about-intro">
              Have a project in mind or just want to say hello? I&apos;d love to hear from you. Fill out the form and I&apos;ll get back to you as soon as possible.
            </p>
          </div>
        </div>

        {/* Right — form & links */}
        <div className="v2-about-right">
          <div className="v2-about-card">
            <h3 className="v2-heading-sm">Send a Message</h3>
            <form className="v2-contact-form" onSubmit={handleSubmit}>
              <div className="v2-input-group">
                <label htmlFor="v2-name">Name</label>
                <input id="v2-name" name="name" type="text" required placeholder="Your name" />
              </div>
              <div className="v2-input-group">
                <label htmlFor="v2-email">Email</label>
                <input id="v2-email" name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="v2-input-group">
                <label htmlFor="v2-message">Message</label>
                <textarea id="v2-message" name="message" required placeholder="Tell me about your project..." />
              </div>
              <button type="submit" className="v2-btn-primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send Message'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
              {status === 'sent' && (
                <p style={{ color: 'var(--v2-accent)', fontSize: '0.875rem' }}>
                  Message sent successfully! I&apos;ll get back to you soon.
                </p>
              )}
              {status === 'error' && (
                <p style={{ color: '#f44', fontSize: '0.875rem' }}>
                  Something went wrong. Please try again or use the links below.
                </p>
              )}
            </form>
          </div>

          <div className="v2-about-card">
            <h3 className="v2-heading-sm">Connect</h3>
            <div className="v2-contact-socials">
              <a href="mailto:ajaydangol@lftechnology.com">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                ajaydangol@lftechnology.com
              </a>
              <a href="https://github.com/ajaydangol" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                github.com/ajaydangol
              </a>
              <a href="https://linkedin.com/in/ajaydangol" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                linkedin.com/in/ajaydangol
              </a>
            </div>
          </div>
        </div>
      </main>

      <V2Footer />
    </>
  );
}
