'use client'
import { useRouter } from 'next/navigation'

export function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => router.push('/')} className="flex items-center">
              <img src="/logo black and white.webp" alt="Reel Wheels Experience" className="h-8 w-auto" />
            </button>
            <nav className="flex items-center space-x-8">
              <button onClick={() => router.push('/')} className="text-gray-700 hover:text-yellow-600">Home</button>
              <button onClick={() => router.push('/catalog')} className="text-gray-700 hover:text-yellow-600">Shop</button>
              <button className="text-yellow-600 border-b-2 border-yellow-600 pb-1">About</button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <h1 className="text-5xl font-bebas text-gray-900 mb-8 text-center">ABOUT US</h1>
        <div className="prose prose-lg max-w-4xl mx-auto">
          <p>Make your next party one to remember. Our collection of famous film and TV vehicles and memorabilia provides the perfect backdrop to any event.</p>
        </div>
      </div>
    </div>
  )
}