import '../styles/globals.css'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { ThemeProvider } from 'next-themes'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LearnDataSkill',
  description: 'Interactive SQL lessons with in-browser runner (coming next)',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  alternates: { canonical: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
