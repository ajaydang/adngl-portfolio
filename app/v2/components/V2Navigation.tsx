'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/v2/app', label: 'Home' },
  { href: '/v2/app/about', label: 'About' },
  { href: '/v2/app/work', label: 'Work' },
  { href: '/v2/app/contact', label: 'Contact' },
];

export default function V2Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const isActive = (href: string) =>
    href === '/v2/app' ? pathname === '/v2/app' : pathname.startsWith(href);

  return (
    <>
      <nav className="v2-nav" role="navigation" aria-label="V2 portfolio navigation">
        <Link
          href="/v2/app"
          className="v2-nav-logo-wrap"
          aria-label="Home"
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
        >
          <span className="v2-nav-logo-text">
            {logoHovered ? 'AJAY DANGOL' : 'AD'}
          </span>
        </Link>

        <ul className="v2-nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="v2-nav-link"
                data-active={isActive(item.href)}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/" className="v2-nav-back" aria-label="Return to original site">
          ← V1 Site
        </Link>

        <button
          className="v2-nav-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div className="v2-nav-mobile-overlay" role="dialog" aria-modal="true">
          <button
            onClick={closeMobile}
            style={{ position: 'absolute', top: '1rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--v2-text)', cursor: 'pointer' }}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={closeMobile}>
              {item.label}
            </Link>
          ))}
          <Link href="/" onClick={closeMobile} style={{ fontSize: '1rem', color: 'var(--v2-text-dim)' }}>
            ← Original Site
          </Link>
        </div>
      )}
    </>
  );
}
