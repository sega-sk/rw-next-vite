import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useMutation, useApi } from '../../hooks/useApi';
import type { MemorabiliaCreate } from '../../services/api';
import Button from '../../components/UI/Button';
import FormField from '../../components/Forms/FormField';
import Input from '../../components/Forms/Input';
import Textarea from '../../components/Forms/Textarea';
import ImageUploader from '../../components/UI/ImageUploader';

export default function AddMemorabilia() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MemorabiliaCreate>({
    title: '',
    subtitle: '',
    description: '',
    photos: [],
    keywords: [],
    product_ids: [],
    slug: '',
  });
  const [newTag, setNewTag] = useState('');
  const { mutate: createMemorabilia, loading } = useMutation(
    (data: MemorabiliaCreate) => apiService.createMemorabilia(data)
  );
  const { data: allProductsData } = useApi(
    () => apiService.getProducts({ limit: 100 }),
    { immediate: true, cacheKey: 'memo-add-all-products', cacheTTL: 1 * 60 * 1000, staleWhileRevalidate: true }
  );

  // Pagination for related products
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 30;
  const allProducts = allProductsData?.rows || [];
  const totalProductPages = Math.ceil(allProducts.length / productsPerPage);
  const paginatedProducts = allProducts.slice(
    (productPage - 1) * productsPerPage,
    productPage * productsPerPage
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper for conditional logging
  function logIfEnabled(...args: any[]) {
    if (typeof window !== 'undefined' && window.location.search.includes('logs')) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.keywords?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), newTag.trim()]
      }));
      setNewTag('');
      logIfEnabled('Tag added:', newTag.trim());
      setTimeout(() => {
        alert('Tag added!');
        logIfEnabled('Tag add message shown');
      }, 300);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: (prev.keywords || []).filter(tag => tag !== tagToRemove)
    }));
    logIfEnabled('Tag removed:', tagToRemove);
    setTimeout(() => {
      alert('Tag removed!');
      logIfEnabled('Tag remove message shown');
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required.');
      logIfEnabled('Memorabilia create failed: Title is required');
      return;
    }
    try {
      const res = await createMemorabilia(formData);
      logIfEnabled('Memorabilia created:', res);
      alert('Memorabilia created successfully!');
      setTimeout(() => {
        alert('Saved! Your memorabilia was added.');
        logIfEnabled('Memorabilia save message shown');
      }, 500);
      navigate('/admin/memorabilia');
    } catch (error) {
      logIfEnabled('Create memorabilia error:', error);
      alert('Failed to create memorabilia.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add Memorabilia</h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <ImageUploader
          images={formData.photos}
          onImagesChange={images => setFormData(prev => ({ ...prev, photos: images }))}
        />
        <FormField label="Title" required>
          <Input
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </FormField>
        <FormField label="Subtitle">
          <Input
            name="subtitle"
            value={formData.subtitle}
            onChange={handleInputChange}
          />
        </FormField>
        <FormField label="Keywords">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {(formData.keywords || []).map((tag, idx) => (
                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 hover:text-red-600">×</button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="+Add Tags"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>Add</Button>
            </div>
          </div>
        </FormField>
        <FormField label="Description">
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
          />
        </FormField>
        <FormField label="Related Products">
          <div className="border rounded-lg max-h-48 overflow-y-auto p-2 bg-white">
            {paginatedProducts.map((product) => (
              <label key={product.id} className="flex items-center space-x-2 mb-1">
                <input
                  type="checkbox"
                  checked={formData.product_ids?.includes(product.id) || false}
                  onChange={e => {
                    const checked = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      product_ids: checked
                        ? [...(prev.product_ids || []), product.id]
                        : (prev.product_ids || []).filter(id => id !== product.id)
                    }));
                  }}
                  className="rounded text-blue-600"
                />
                <span className="text-xs">{product.title}</span>
              </label>
            ))}
            {totalProductPages > 1 && (
              <div className="flex justify-center mt-2 gap-2">
                <button
                  type="button"
                  disabled={productPage === 1}
                  onClick={() => setProductPage(productPage - 1)}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50"
                >Prev</button>
                <span className="text-xs">{productPage} / {totalProductPages}</span>
                <button
                  type="button"
                  disabled={productPage === totalProductPages}
                  onClick={() => setProductPage(productPage + 1)}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50"
                >Next</button>
              </div>
            )}
          </div>
        </FormField>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/memorabilia')}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

// This file is already a standalone page for adding memorabilia.
