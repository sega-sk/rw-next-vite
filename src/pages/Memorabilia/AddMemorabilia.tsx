import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import FormField from '../../components/Forms/FormField';
import Input from '../../components/Forms/Input';
import Textarea from '../../components/Forms/Textarea';
import ImageUploader from '../../components/UI/ImageUploader';
import MultiSelect from '../../components/UI/MultiSelect';
import { apiService } from '../../services/api';
import { useApi, useMutation } from '../../hooks/useApi';
import { useToastContext } from '../../contexts/ToastContext';
import type { Memorabilia, MemorabiliaCreate, MemorabiliaUpdate } from '../../services/api';

export default function AddMemorabilia() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToastContext();
  
  // Get edit memorabilia ID from URL params
  const searchParams = new URLSearchParams(location.search);
  const editMemorabiliaId = searchParams.get('edit');
  const isEditing = !!editMemorabiliaId;
  
  const [newTag, setNewTag] = useState('');
  
  // Form data for add/edit
  const [formData, setFormData] = useState<MemorabiliaCreate>({
    title: '',
    subtitle: '',
    description: '',
    photos: [],
    keywords: [],
    product_ids: [],
  });

  // Fetch all products for multiselect
  const { data: allProductsData } = useApi(
    () => apiService.getProducts({ limit: 200 }),
    { 
      immediate: true,
      cacheKey: 'add-memorabilia-all-products',
      cacheTTL: 5 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Fetch memorabilia data for editing
  const { data: editMemorabilia, loading: loadingMemorabilia } = useApi(
    () => editMemorabiliaId ? apiService.getMemorabiliaItem(editMemorabiliaId) : Promise.resolve(null),
    { 
      immediate: !!editMemorabiliaId,
      cacheKey: `edit-memorabilia-${editMemorabiliaId}`,
      cacheTTL: 2 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Load memorabilia data when editing
  useEffect(() => {
    if (isEditing && editMemorabilia) {
      setFormData({
        title: editMemorabilia.title || '',
        subtitle: editMemorabilia.subtitle || '',
        description: editMemorabilia.description || '',
        photos: editMemorabilia.photos || [],
        keywords: editMemorabilia.keywords || [],
        product_ids: editMemorabilia.product_ids || [],
      });
    }
  }, [isEditing, editMemorabilia]);

  // Transform data for MultiSelect component
  const productOptions = (allProductsData?.rows || []).map(product => ({
    id: product.id,
    title: product.title,
    subtitle: product.subtitle,
    image: product.images[0]
  }));

  const { mutate: createMemorabilia, loading: creating } = useMutation(
    (data: MemorabiliaCreate) => apiService.createMemorabilia(data)
  );

  const { mutate: updateMemorabilia, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: MemorabiliaUpdate }) => apiService.updateMemorabilia(id, data)
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

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to save memorabilia');
      navigate('/admin/login');
      return;
    }
    
    if (!formData.title.trim()) {
      alert('Title is required.');
      return;
    }
    
    try {
      if (isEditing && editMemorabiliaId) {
        // Update existing item
        await updateMemorabilia({ id: editMemorabiliaId, data: formData });
        success('Memorabilia Updated', 'Memorabilia has been updated successfully!');
      } else {
        // Create new item
        await createMemorabilia(formData);
        success('Memorabilia Created', 'Memorabilia has been created successfully!');
      }
      
      navigate('/admin/memorabilia');
    } catch (error) {
      console.error('Failed to save memorabilia:', error);
      if (error instanceof Error && error.message.includes('Authentication')) {
        error('Authentication Error', 'Your session has expired. Please login again.');
        navigate('/admin/login');
      } else {
        error('Save Failed', `Failed to save memorabilia: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin/memorabilia');
  };

  // Show loading state when fetching memorabilia for editing
  if (isEditing && loadingMemorabilia) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Edit Memorabilia' : 'Add Memorabilia'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Update memorabilia details below' : 'Add new memorabilia details below'} - 
            <button 
              onClick={() => navigate('/admin/memorabilia')}
              className="text-blue-600 hover:text-blue-800 ml-1"
            >
              or go to listing
            </button>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form className="space-y-6" onSubmit={handleSaveItem}>
            <div className="space-y-4">
              <ImageUploader 
                images={formData.photos}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, photos: images }))}
              />
            </div>

            <FormField label="Memorabilia title" required>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Add Title Here"
                required
              />
            </FormField>

            <FormField label="Memorabilia Subtitle">
              <Input
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Add Subtitle Here"
              />
            </FormField>

            <FormField label="Keywords">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.keywords.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="+Add Keywords" 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </FormField>

            <FormField label="Memorabilia Description">
              <Textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Add Description Here"
              />
            </FormField>

            <div className="space-y-4">
              <MultiSelect
                label="Connected Products"
                options={productOptions}
                selectedIds={formData.product_ids || []}
                onChange={(selectedIds) => setFormData(prev => ({ ...prev, product_ids: selectedIds }))}
                placeholder="Select related products..."
                searchable={true}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" loading={creating || updating}>
                {isEditing ? 'Update Memorabilia' : 'Save Memorabilia'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}