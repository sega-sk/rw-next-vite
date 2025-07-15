'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CatalogPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

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
              <button className="text-yellow-600 border-b-2 border-yellow-600 pb-1">Shop</button>
              <button onClick={() => router.push('/about')} className="text-gray-700 hover:text-yellow-600">About</button>
            </nav>
          </div>
        </div>
      </header>

      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-5xl font-bebas text-gray-900 mb-4">The Collection</h1>
          <p className="text-gray-600">View Our Collection of products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              placeholder="Search Here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-gray-300 bg-white py-4 pl-12 pr-6 text-base focus:border-gray-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products available at the moment.</p>
        </div>
      </div>
    </div>
  )
}