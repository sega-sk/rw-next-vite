import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reel Wheels Experience - Authentic Movie Vehicle Rentals & Memorabilia',
  description: 'Rent iconic movie vehicles like the Batmobile, DeLorean, and Ecto-1. Premium collection of authentic film cars and memorabilia for events, parties, and productions.',
  keywords: 'movie car rental, Batmobile rental, DeLorean rental, film vehicle rental, movie memorabilia, Hollywood cars, event rentals',
  authors: [{ name: 'Reel Wheels Experience' }],
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  openGraph: {
    type: 'website',
    url: 'https://reelwheelsexperience.com/',
    title: 'Reel Wheels Experience - Authentic Movie Vehicle Rentals',
    description: 'Rent iconic movie vehicles like the Batmobile, DeLorean, and Ecto-1. Premium collection of authentic film cars and memorabilia.',
    images: [
      {
        url: '/vdp hero (2).webp',
        width: 1200,
        height: 630,
        alt: 'Reel Wheels Experience'
      }
    ],
    siteName: 'Reel Wheels Experience',
  },
  twitter: {
    card: 'summary_large_image',
    site: 'https://reelwheelsexperience.com/',
    title: 'Reel Wheels Experience - Authentic Movie Vehicle Rentals',
    description: 'Rent iconic movie vehicles like the Batmobile, DeLorean, and Ecto-1. Premium collection of authentic film cars and memorabilia.',
    images: ['/vdp hero (2).webp'],
  },
  alternates: {
    canonical: 'https://reelwheelsexperience.com/',
  },
  icons: {
    icon: [
      { url: '/vite.svg', type: 'image/svg+xml' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: '#000000',
  other: {
    'msapplication-TileColor': '#000000',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.pexels.com" crossOrigin="" />
        <link rel="preconnect" href="https://dealertower.app" crossOrigin="" />
        <link rel="dns-prefetch" href="https://reel-wheel-api-x92jj.ondigitalocean.app" />
        
        {/* Optimized font loading */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Bebas+Neue&display=swap" 
          rel="stylesheet" 
          media="print" 
          onLoad="this.media='all'" 
        />
        <noscript>
          <link 
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Bebas+Neue&display=swap" 
            rel="stylesheet" 
          />
        </noscript>
        
        {/* Additional CSS */}
        <link rel="stylesheet" href="/adds.css" media="print" onLoad="this.media='all'" />
        <noscript>
          <link rel="stylesheet" href="/adds.css" />
        </noscript>
        
        {/* Preload critical resources */}
        <link rel="preload" href="/logo-color.webp" as="image" type="image/webp" />
        <link rel="preload" href="/reel wheel hero_first slide.webp" as="image" type="image/webp" />
        <link rel="preload" href="/logo black and white.webp" as="image" type="image/webp" />
        
        {/* Schema.org structured data */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "LocalBusiness",
                  "name": "Reel Wheels Experience",
                  "description": "Premium movie vehicle rental and memorabilia collection for events and productions",
                  "url": "https://reelwheelsexperience.com",
                  "telephone": "+1-971-416-6074",
                  "email": "contact@reelwheelsexperience.com",
                  "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "US"
                  },
                  "sameAs": [
                    "https://dealertower.com"
                  ],
                  "serviceType": "Vehicle Rental Service",
                  "areaServed": "United States",
                  "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Movie Vehicle Rentals",
                    "itemListElement": [
                      {
                        "@type": "Offer",
                        "itemOffered": {
                          "@type": "Product",
                          "name": "Batmobile Rental",
                          "description": "Authentic Batman movie vehicle rental"
                        }
                      },
                      {
                        "@type": "Offer",
                        "itemOffered": {
                          "@type": "Product",
                          "name": "DeLorean Time Machine Rental",
                          "description": "Back to the Future DeLorean rental"
                        }
                      }
                    ]
                  }
                },
                {
                  "@type": "WebSite",
                  "name": "Reel Wheels Experience",
                  "url": "https://reelwheelsexperience.com",
                  "author": {
                    "@type": "Person",
                    "name": "SeGa_cc"
                  },
                  "creator": {
                    "@type": "Organization",
                    "name": "DealerTower"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body>
        {/* Skip link for accessibility */}
        <a href="#main-content" className="skip-link" tabIndex={1}>
          Skip to main content
        </a>
        
        <noscript>
          <div style={{ textAlign: 'center', padding: '20px', background: '#f3f4f6' }}>
            <h1>Reel Wheels Experience</h1>
            <p>Please enable JavaScript to view our movie vehicle rental catalog.</p>
            <p>Call us at <a href="tel:+19714166074">(971) 416-6074</a> for assistance.</p>
          </div>
        </noscript>
        
        <div id="main-content" role="application">
          {children}
        </div>
      </body>
    </html>
  )
}