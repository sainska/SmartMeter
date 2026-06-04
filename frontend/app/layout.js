import { DM_Sans, Source_Serif_4 } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import { PROJECT_TOPIC, PROJECT_TAGLINE } from '@/lib/config';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata = {
  title: PROJECT_TOPIC,
  description: PROJECT_TAGLINE,
};

const themeScript = `(function(){try{var s=localStorage.getItem('smartmeter_theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',s==='light'||s==='dark'?s:(d?'dark':'light'));}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${sourceSerif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
