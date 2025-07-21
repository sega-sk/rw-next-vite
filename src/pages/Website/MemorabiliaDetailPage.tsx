import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { apiService } from '../../services/api';
import WebsiteHeader from '../../components/Website/WebsiteHeader';
import WebsiteFooter from '../../components/Website/WebsiteFooter';
import OptimizedImage from '../../components/UI/OptimizedImage';
import SEOHead from '../../components/UI/SEOHead';

export default function MemorabiliaDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: memorabiliaData, loading } = useApi(
    () => slug ? apiService.getMemorabilia({ limit: 1, slug }) : Promise.resolve(null),
    { immediate: !!slug }
  );

  const item = memorabiliaData?.rows?.[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <WebsiteHeader onSearchClick={() => {}} variant="dark" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white">
        <WebsiteHeader onSearchClick={() => {}} variant="dark" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Memorabilia Not Found</h1>
          <button
            onClick={() => navigate('/memorabilia')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Memorabilia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={`${item.title} - Movie Memorabilia | Reel Wheels Experience`}
        description={item.description || `${item.title} - Authentic movie memorabilia from Reel Wheels Experience`}
        keywords={`${item.title}, movie memorabilia, ${item.keywords?.join(', ') || ''}`}
        url={`https://reelwheelsexperience.com/memorabilia/${slug}`}
      />

      <WebsiteHeader onSearchClick={() => {}} variant="dark" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <button
          onClick={() => navigate('/memorabilia')}
          className="mb-6 text-blue-600 hover:text-blue-800 font-inter"
        >
          ← Back to Memorabilia
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <OptimizedImage
              src={item.photos?.[0] || '/memorabilia_balanced.webp'}
              alt={item.title}
              size="large"
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>

          <div>
            <h1 className="text-4xl font-bebas text-gray-900 mb-4">{item.title}</h1>
            {item.subtitle && (
              <p className="text-xl text-gray-600 mb-6">{item.subtitle}</p>
            )}

            {item.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            )}

            {item.keywords?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {item.keywords.map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center mt-8">
              <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                Contact for Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <WebsiteFooter />
    </div>
  );
}
