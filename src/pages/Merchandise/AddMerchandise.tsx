import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useMutation, useApi } from '../../hooks/useApi';
import type { MerchandiseCreate } from '../../services/api';
import Button from '../../components/UI/Button';
import FormField from '../../components/Forms/FormField';
import Input from '../../components/Forms/Input';
import Textarea from '../../components/Forms/Textarea';
import ImageUploader from '../../components/UI/ImageUploader';

export default function AddMerchandise() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MerchandiseCreate>({
    title: '',
    subtitle: '',
    description: '',
    price: 0,
    photos: [],
    keywords: [],
    product_ids: [],
    slug: '',
  });
  const [newTag, setNewTag] = useState('');
  const { mutate: createMerchandise, loading } = useMutation(
    (data: MerchandiseCreate) => apiService.createMerchandise(data)
  );
  const { data: allProductsData } = useApi(
    () => apiService.getProducts({ limit: 100 }),
    { 
      immediate: true, 
      cacheKey: 'merch-add-all-products', 
      cacheTTL: 15 * 1000, // 15 seconds
      staleWhileRevalidate: true 
    }
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
    if (newTag.trim() && !formData.keywords.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newTag.trim()]
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
      keywords: prev.keywords.filter(tag => tag !== tagToRemove)
    }));
    logIfEnabled('Tag removed:', tagToRemove);
    setTimeout(() => {
      alert('Tag removed!');
      logIfEnabled('Tag remove message shown');
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price.toString().trim()) {
      alert('Title and price are required.');
      logIfEnabled('Merchandise create failed: Title and price required');
      return;
    }
    try {
      const res = await createMerchandise(formData);
      logIfEnabled('Merchandise created:', res);
      alert('Merchandise created successfully!');
      
      // Redirect to edit page for the newly created item
      if (res?.id) {
        setTimeout(() => {
          navigate(`/admin/merchandise/edit/${res.id}`);
        }, 1000);
      } else {
        setTimeout(() => {
          navigate('/admin/merchandise');
        }, 1000);
      }
    } catch (error) {
      logIfEnabled('Create merchandise error:', error);
      alert('Failed to create merchandise.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add Merchandise</h1>
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
        <FormField label="Price" required>
          <Input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </FormField>
        <FormField label="Keywords">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {(formData.keywords || []).map((tag, idx) => (
                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-600">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 hover:text-red-600">×</button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="+Add Keywords"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>Add</Button>
            </div>
          </div>
        </FormField>
        <FormField label="Related Products">
          <div className="border rounded-lg max-h-48 overflow-y-auto p-2 bg-white">
            {paginatedProducts.map((product) => (
              <label key={product.id} className="flex items-center space-x-2 mb-1">
                <input
                  type="checkbox"
                  checked={formData.product_ids?.includes(String(product.id)) || false}
                  onChange={e => {
                    const checked = e.target.checked;
                    const productId = String(product.id);
                    setFormData(prev => ({
                      ...prev,
                      product_ids: checked
                        ? [...(prev.product_ids || []), productId]
                        : (prev.product_ids || []).filter(id => id !== productId)
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
        <FormField label="Description">
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
          />
        </FormField>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/merchandise')}>
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

// This file is already a standalone page for adding merchandise.