import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Grid, List } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import Tooltip from '../../components/UI/Tooltip';
import OptimizedImage from '../../components/UI/OptimizedImage';
import { apiService } from '../../services/api';
import { useApi, useMutation } from '../../hooks/useApi';
import { useToastContext } from '../../contexts/ToastContext';
import type { Merchandise } from '../../services/api';

export default function MerchandiseList() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToastContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // API hooks - Updated to refresh every 15 seconds
  const { data: merchandiseData, loading, execute: refetchMerchandise } = useApi(
    () => apiService.getMerchandise({ q: searchTerm, limit: 100 }),
    { 
      immediate: true, 
      cacheKey: `merchandise-list-${searchTerm}`, 
      cacheTTL: 15 * 1000, // 15 seconds
      staleWhileRevalidate: true 
    }
  );

  const { mutate: deleteMerchandise, loading: deleting } = useMutation(
    (id: string) => apiService.deleteMerchandise(id)
  );

  // Search effect - only refresh when user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        refetchMerchandise();
      }
    }, 500); // Increased debounce time
    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Removed refetchMerchandise dependency

  const handleEdit = (item: Merchandise) => {
    navigate(`/admin/merchandise/edit/${item.id}`);
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this merchandise item?')) {
      try {
        await deleteMerchandise(itemId);
        success('Merchandise Deleted', 'Merchandise item has been deleted successfully!');
        refetchMerchandise();
      } catch (err) {
        error('Delete Failed', 'Failed to delete merchandise.');
      }
    }
  };

  const merchandiseItems = merchandiseData?.rows || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Merchandise</h1>
        <div className="flex items-center justify-between mb-4">
          <Button icon={Plus} onClick={() => navigate('/admin/merchandise/add')} className="btn-hover">
            Add New
          </Button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              aria-label="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {viewMode === 'list' ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keywords</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {merchandiseItems.map((item) => (
                  <tr key={item.id} className="table-row-hover">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <OptimizedImage
                            className="h-12 w-12 rounded-lg object-cover"
                            src={item.photos[0] || '/Back To The Future 35th Anniversary-mobile.webp'}
                            alt={item.title}
                            size="thumbnail"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500">{item.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.price}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.keywords.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs rounded bg-green-100 text-green-600">{tag}</span>
                        ))}
                        {item.keywords.length > 3 && (
                          <Tooltip
                            content={
                              <div className="max-w-xs">
                                <div className="font-medium mb-2">Additional Tags:</div>
                                <div className="flex flex-wrap gap-1">
                                  {item.keywords.slice(3).map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">{tag}</span>
                                  ))}
                                </div>
                              </div>
                            }
                            position="top"
                          >
                            <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 cursor-help hover:bg-gray-200 transition-colors">
                              +{item.keywords.length - 3}
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          aria-label="Edit"
                          onClick={() => handleEdit(item)}
                          className="btn-hover"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDelete(item.id)}
                          className="btn-hover"
                          loading={deleting}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6">
              <div className="space-y-6">
                {merchandiseItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-6 card-hover">
                    <div className="flex items-start space-x-6">
                      <div className="w-24 h-24 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                        <OptimizedImage
                          className="w-24 h-24 rounded-lg object-cover"
                          src={item.photos[0] || '/Back To The Future 35th Anniversary-mobile.webp'}
                          alt={item.title}
                          size="small"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-500 mb-4">{item.subtitle}</p>
                        <div className="mb-4">
                          <span className="text-sm text-gray-500">Price</span>
                          <p className="font-medium">${item.price}</p>
                        </div>
                        <div className="mb-4">
                          <span className="text-sm text-gray-500 block mb-2">Keywords</span>
                          <div className="flex flex-wrap gap-2">
                            {item.keywords.map((tag, index) => (
                              <span key={index} className="px-2 py-1 text-xs rounded bg-green-100 text-green-600">{tag}</span>
                            ))}
                          </div>
                        </div>
                        {item.description && (
                          <div>
                            <span className="text-sm text-gray-500 block mb-2">Description</span>
                            <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleEdit(item)}
                          className="btn-hover"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDelete(item.id)}
                          className="btn-hover"
                          loading={deleting}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {merchandiseItems.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No merchandise items found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}