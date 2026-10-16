import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Ajay Dangol — Full-Stack Developer',
  description:
    'Thoughtful, performant digital products through modern frontend engineering, immersive interaction, and purposeful design.',
  openGraph: {
    title: 'Ajay Dangol — Full-Stack Developer',
    description: 'Full-Stack Developer portfolio of Ajay Dangol.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[var(--c-bg)] font-sans text-[var(--c-text)] antialiased overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
