'use client'
import { useRouter } from 'next/navigation'

export function FavoritesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => router.push('/')} className="flex items-center">
              <img src="/logo black and white.webp" alt="Reel Wheels Experience" className="h-8 w-auto" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Favorites</h1>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No favorites yet</p>
          <button
            onClick={() => router.push('/catalog')}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 mt-6"
          >
            Browse Catalog
          </button>
        </div>
      </div>
    </div>
  )
}