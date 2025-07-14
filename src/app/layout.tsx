import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reel Wheels Experience - Authentic Movie Vehicle Rentals & Memorabilia',
  description: 'Rent iconic movie vehicles like the Batmobile, DeLorean, and Ecto-1. Premium collection of authentic film cars and memorabilia for events, parties, and productions.',
  keywords: 'movie car rental, Batmobile rental, DeLorean rental, film vehicle rental, movie memorabilia, Hollywood cars, event rentals',
  authors: [{ name: 'SeGa_cc' }],
  creator: 'DealerTower',
  openGraph: {
    type: 'website',
    url: 'https://reelwheelsexperience.com/',
    title: 'Reel Wheels Experience - Authentic Movie Vehicle Rentals',
    description: 'Rent iconic movie vehicles like the Batmobile, DeLorean, and Ecto-1. Premium collection of authentic film cars and memorabilia.',
    images: ['/vdp hero (2).webp'],
    siteName: 'Reel Wheels Experience',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reel Wheels Experience - Authentic Movie Vehicle Rentals',
    description: 'Rent iconic movie vehicles like the Batmobile, DeLorean, and Ecto-1. Premium collection of authentic film cars and memorabilia.',
    images: ['/vdp hero (2).webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}