import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-static';

export const metadata: Metadata = {
  metadataBase: new URL('https://toondiff.com'),

  title: {
    default: 'TOON Diff – Compare TOON YAML Files | Validator & Token Analyzer',
    template: '%s | TOON Diff Tool'
  },

  description:
    'TOON Diff is the fastest way to compare, validate, and analyze TOON documents. Highlight differences, detect structural errors, count tokens, and explore side-by-side YAML comparison.',

  keywords: [
    'TOON',
    'TOON Diff',
    'TOON Validator',
    'TOON Document',
    'YAML diff tool',
    'document diff viewer',
    'token counter',
    'TOON syntax validator',
    'compare YAML online',
    'TOON analyzer'
  ],

  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://toondiff.com',
    siteName: 'TOON Diff Tool',
    title: 'TOON Diff – Compare & Validate TOON Documents Online',
    description:
      'Online tool to compare TOON documents side-by-side, validate syntax, highlight differences, and analyze token efficiency.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TOON Diff – Online TOON Document Comparator'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'TOON Diff – Compare & Validate TOON YAML Files',
    description:
      'Compare TOON documents with highlights, validation, and token analysis.',
    images: ['/og-image.png']
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1
    }
  },

  alternates: {
    canonical: 'https://toondiff.com'
  },

  themeColor: '#ffffff'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
