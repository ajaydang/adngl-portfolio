import type { Metadata } from 'next';
import './globals.css';

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
      <body className="bg-[#0B0202] font-sans text-white antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
