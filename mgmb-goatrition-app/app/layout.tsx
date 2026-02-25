import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'MGMB Goatrition — Fuel Discipline. Track Power.',
  description: 'Fighter-focused calorie & macro tracker with AI meal photo analysis. Built for serious athletes.',
  keywords: ['nutrition tracker', 'fighter nutrition', 'macro tracker', 'MMA nutrition', 'boxing diet', 'calorie tracking'],
  authors: [{ name: 'MGMB Goatrition' }],
  themeColor: '#dc2626',
  viewport: { width: 'device-width', initialScale: 1, userScalable: false },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}
