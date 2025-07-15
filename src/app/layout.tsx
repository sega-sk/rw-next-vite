import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './providers/AuthProvider'
import { FavoritesProvider } from './providers/FavoritesProvider'
import { ToastProvider } from './providers/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reel Wheels Experience - Authentic Movie Vehicle Rentals & Memorabilia',
  description: 'Rent iconic movie vehicles like the Batmobile, DeLorean, and Ecto-1. Premium collection of authentic film cars and memorabilia for events, parties, and productions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Bebas+Neue&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <FavoritesProvider>
              {children}
            </FavoritesProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}