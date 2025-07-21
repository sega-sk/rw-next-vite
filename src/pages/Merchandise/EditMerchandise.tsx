import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useMutation, useApi } from '../../hooks/useApi';
import type { MerchandiseCreate, MerchandiseUpdate } from '../../services/api';
import { useToastContext } from '../../contexts/ToastContext';
import Button from '../../components/UI/Button';
import FormField from '../../components/Forms/FormField';
import Input from '../../components/Forms/Input';
import Textarea from '../../components/Forms/Textarea';
import ImageUploader from '../../components/UI/ImageUploader';

export default function EditMerchandise() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success, error } = useToastContext();
  
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

  // Fetch merchandise data for editing
  const { data: merchandiseItem, loading: loadingItem } = useApi(
    () => id ? apiService.getMerchandise({ limit: 1, id }) : Promise.resolve(null),
    { 
      immediate: !!id,
      cacheKey: `edit-merchandise-${id}`,
      cacheTTL: 2 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  const { mutate: updateMerchandise, loading } = useMutation(
    (data: { id: string; data: MerchandiseUpdate }) => apiService.updateMerchandise(data.id, data.data)
  );

  const { data: allProductsData } = useApi(
    () => apiService.getProducts({ limit: 100 }),
    { 
      immediate: true, 
      cacheKey: 'merch-edit-all-products', 
      cacheTTL: 15 * 1000, // 15 seconds
      staleWhileRevalidate: true 
    }
  );

  // Load merchandise data when editing
  useEffect(() => {
    if (merchandiseItem?.rows?.[0]) {
      const item = merchandiseItem.rows[0];
      setFormData({
        title: item.title || '',
        subtitle: item.subtitle || '',
        description: item.description || '',
        price: Number(item.price) || 0,
        photos: item.photos || [],
        keywords: item.keywords || [],
        product_ids: Array.isArray(item.product_ids) ? item.product_ids.map(String) : [],
        slug: item.slug || '',
      });
    }
  }, [merchandiseItem]);

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

  const handleAddTag = () => {
    if (newTag.trim() && !formData.keywords.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price.toString().trim() || !id) {
      error('Error', 'Title, price are required and merchandise ID must be provided.');
      return;
    }
    try {
      await updateMerchandise({ id, data: formData });
      success('Success', 'Merchandise updated successfully!');
      navigate('/admin/merchandise');
    } catch (err) {
      error('Error', 'Failed to update merchandise.');
    }
  };

  if (loadingItem) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Merchandise</h1>
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
          <Button variant="outline" type="button" onClick={() => navigate('/admin/merchandise')}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Update
          </Button>
        </div>
      </form>
    </div>
  );
}
