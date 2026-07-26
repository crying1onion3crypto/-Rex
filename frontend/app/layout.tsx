import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryClientProvider } from '@/providers/query-provider';
import { ToastProvider } from '@/providers/toast-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Contract AI SaaS - AI-Powered Contract Review',
  description: 'Upload, analyze, and manage your contracts with AI-powered insights',
  keywords: ['contract analysis', 'AI', 'legal', 'SaaS', 'contract review'],
  authors: [{ name: 'Contract AI SaaS' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://contract-ai-saas.com',
    siteName: 'Contract AI SaaS',
    title: 'Contract AI SaaS - AI-Powered Contract Review',
    description: 'Upload, analyze, and manage your contracts with AI-powered insights',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contract AI SaaS - AI-Powered Contract Review',
    description: 'Upload, analyze, and manage your contracts with AI-powered insights',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryClientProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </QueryClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
