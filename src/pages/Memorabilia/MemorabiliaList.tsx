/** @jsxImportSource react */
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
import type { Memorabilia } from '../../services/api';

// Helper for conditional logging
function logIfEnabled(...args: any[]) {
  if (typeof window !== 'undefined' && window.location.search.includes('logs')) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

export default function MemorabiliaList() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToastContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // API hooks - Updated to refresh every 15 seconds
  const { data: memorabiliaData, loading, execute: refetchMemorabilia } = useApi(
    () => apiService.getMemorabilia({ q: searchTerm, limit: 100 }),
    { 
      immediate: true, 
      cacheKey: `memorabilia-list-${searchTerm}`, 
      cacheTTL: 15 * 1000, // 15 seconds
      staleWhileRevalidate: true 
    }
  );

  const { mutate: deleteMemorabilia, loading: deleting } = useMutation(
    (id: string) => apiService.deleteMemorabilia(id)
  );

  // Search effect - only refresh when user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        refetchMemorabilia();
      }
    }, 500); // Increased debounce time
    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Removed refetchMemorabilia dependency

  const handleEdit = (item: Memorabilia) => {
    logIfEnabled('Editing memorabilia:', item);
    navigate(`/admin/memorabilia/edit/${item.id}`);
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this memorabilia item?')) {
      try {
        await deleteMemorabilia(itemId);
        logIfEnabled('Memorabilia deleted:', itemId);
        success('Memorabilia Deleted', 'Memorabilia item has been deleted successfully!');
        setTimeout(() => {
          success('Deleted!', 'The item was removed from the list.');
          logIfEnabled('Memorabilia delete message shown');
        }, 500);
        refetchMemorabilia();
      } catch (err) {
        logIfEnabled('Delete memorabilia error:', err);
        error('Delete Failed', 'Failed to delete memorabilia.');
      }
    }
  };

  const memorabiliaItems = memorabiliaData?.rows || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Memorabilia</h1>
        <div className="flex items-center justify-between mb-4">
          <Button icon={Plus} onClick={() => navigate('/admin/memorabilia/add')} className="btn-hover">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keywords</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {memorabiliaItems.map((item) => (
                  <tr key={item.id} className="table-row-hover">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <OptimizedImage
                            className="h-12 w-12 rounded-lg object-cover"
                            src={item.photos[0] || '/memorabilia_balanced.webp'}
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
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.keywords.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-600">{tag}</span>
                        ))}
                        {item.keywords.length > 3 && (
                          <Tooltip
                            content={
                              <div className="max-w-xs">
                                <div className="font-medium mb-2">Additional Tags:</div>
                                <div className="flex flex-wrap gap-1">
                                  {item.keywords.slice(3).map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">{tag}</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {memorabiliaItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 card-hover">
                    <div className="flex items-start space-x-4">
                      <OptimizedImage
                        src={item.photos[0] || '/memorabilia_balanced.webp'}
                        alt={item.title}
                        size="small"
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">{item.subtitle}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.keywords.map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-600">{tag}</span>
                          ))}
                        </div>
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
          {memorabiliaItems.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No memorabilia items found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}