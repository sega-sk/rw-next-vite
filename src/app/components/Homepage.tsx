'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Remove the export from the function declaration
function Homepage() {
  const router = useRouter()
  const [showSearchModal, setShowSearchModal] = useState(false)
  
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-white shadow-sm relative z-40">
        <div className="bg-yellow-600 text-black py-2 text-center text-sm font-medium">
          <p>🎬 Bring Hollywood Magic to Your <strong>Event</strong>!</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center">
              <button className="flex items-center">
                <img src="/logo black and white.webp" alt="Reel Wheels Experience" className="h-8 md:h-12 w-auto" />
              </button>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button className="text-lg font-medium text-yellow-600 border-b-2 border-yellow-600 pb-1">Home</button>
              <button onClick={() => router.push('/catalog')} className="text-lg font-medium text-gray-700 hover:text-yellow-600">Shop</button>
              <button onClick={() => router.push('/about')} className="text-lg font-medium text-gray-700 hover:text-yellow-600">About</button>
            </nav>
          </div>
        </div>
      </header>
      <div className="homepage-hero-slider relative overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="absolute inset-0">
          <img src="/reel wheel hero_first slide.webp" alt="Reel Wheels Experience" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bebas mb-2 tracking-[0.2em] drop-shadow-2xl whitespace-nowrap text-white transform scale-x-[0.7] origin-center">
              REEL WHEELS
            </h1>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bebas mb-12 tracking-[0.4em] drop-shadow-xl whitespace-nowrap text-white transform scale-x-[0.8] origin-center">
              EXPERIENCE
            </h2>
            <button 
              onClick={() => router.push('/catalog')}
              className="hero-button bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-full font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all"
            >
              VIEW "THE COLLECTION"
            </button>
          </div>
        </div>
      </div>
      <footer className="bg-black text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center text-xs md:text-sm text-gray-400">
            © COPYRIGHT • <a href="https://dealertower.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">DEALERTOWER</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Add default export
export default Homepage