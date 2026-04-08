import './globals.css';

import { DM_Sans } from 'next/font/google';

const body = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-body',
  preload: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={body.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://edge-platform.sitecorecloud.io" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
