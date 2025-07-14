import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Plus, X, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import FormField from '../../components/Forms/FormField';
import Input from '../../components/Forms/Input';
import Textarea from '../../components/Forms/Textarea';
import Select from '../../components/Forms/Select';
import ImageUploader from '../../components/UI/ImageUploader';
import MultiSelect from '../../components/UI/MultiSelect';
import { apiService } from '../../services/api';
import { useApi, useMutation } from '../../hooks/useApi';
import { useToastContext } from '../../contexts/ToastContext';
import type { ProductCreate, RentalPeriod } from '../../services/api';
import OptimizedImage from '../../components/UI/OptimizedImage';

// Product type options
const productTypes = [
  { value: '', label: 'Type Product Type' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'prop', label: 'Prop' },
  { value: 'costume', label: 'Costume' },
  { value: 'memorabilia', label: 'Memorabilia' },
];

// Rental period options
const rentalPeriods = [
  { value: '', label: 'Select Rental Period' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { success, error } = useToastContext();
  
  // Get edit product ID from URL params
  const searchParams = new URLSearchParams(location.search);
  const editProductId = searchParams.get('edit');
  const isEditing = !!editProductId;
  
  // Form state
  const [formData, setFormData] = useState<ProductCreate>({
    title: '',
    subtitle: '',
    description: '',
    product_types: [],
    movies: [],
    genres: [],
    keywords: [],
    available_rental_periods: [],
    images: [],
    background_image_url: '',
    is_background_image_activated: false,
    is_trending_model: false,
    sale_price: 0,
    retail_price: 0,
    rental_price_hourly: 0,
    rental_price_daily: 0,
    rental_price_weekly: 0,
    rental_price_monthly: 0,
    rental_price_yearly: 0,
    video_url: '',
    slug: '',
    memorabilia_ids: [],
    merchandise_ids: [],
    product_ids: [],
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newMovie, setNewMovie] = useState('');
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  // Fetch product data for editing
  const { data: editProduct, loading: loadingProduct } = useApi(
    () => editProductId ? apiService.getProduct(editProductId) : Promise.resolve(null),
    { 
      immediate: !!editProductId,
      cacheKey: `edit-product-${editProductId}`,
      cacheTTL: 2 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Fetch memorabilia for multiselect
  const { data: memorabiliaData } = useApi(
    () => apiService.getMemorabilia({ limit: 100 }),
    { 
      immediate: true,
      cacheKey: 'add-product-memorabilia',
      cacheTTL: 5 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Fetch merchandise for multiselect
  const { data: merchandiseData } = useApi(
    () => apiService.getMerchandise({ limit: 100 }),
    { 
      immediate: true,
      cacheKey: 'add-product-merchandise',
      cacheTTL: 5 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Fetch all products for related products multiselect
  const { data: allProductsData } = useApi(
    () => apiService.getProducts({ limit: 200 }),
    { 
      immediate: true,
      cacheKey: 'add-product-all-products',
      cacheTTL: 5 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Load product data when editing
  useEffect(() => {
    if (isEditing && editProduct) {
      setFormData({
        title: editProduct.title || '',
        subtitle: editProduct.subtitle || '',
        description: editProduct.description || '',
        product_types: editProduct.product_types,
        movies: editProduct.movies,
        genres: editProduct.genres,
        keywords: editProduct.keywords,
        available_rental_periods: editProduct.available_rental_periods,
        images: editProduct.images,
        background_image_url: editProduct.background_image_url || '',
        is_background_image_activated: editProduct.is_background_image_activated,
        is_trending_model: editProduct.is_trending_model,
        sale_price: editProduct.sale_price ? parseFloat(editProduct.sale_price) : 0,
        retail_price: editProduct.retail_price ? parseFloat(editProduct.retail_price) : 0,
        rental_price_hourly: editProduct.rental_price_hourly ? parseFloat(editProduct.rental_price_hourly) : 0,
        rental_price_daily: editProduct.rental_price_daily ? parseFloat(editProduct.rental_price_daily) : 0,
        rental_price_weekly: editProduct.rental_price_weekly ? parseFloat(editProduct.rental_price_weekly) : 0,
        rental_price_monthly: editProduct.rental_price_monthly ? parseFloat(editProduct.rental_price_monthly) : 0,
        rental_price_yearly: editProduct.rental_price_yearly ? parseFloat(editProduct.rental_price_yearly) : 0,
        video_url: editProduct.video_url || '',
        slug: editProduct.slug || '',
        memorabilia_ids: editProduct.memorabilia_ids,
        merchandise_ids: editProduct.merchandise_ids,
        product_ids: editProduct.product_ids,
      });
      
      if (editProduct.background_image_url) {
        setBackgroundImages([editProduct.background_image_url]);
      }
      
      if (editProduct.video_url) {
        setVideoUrl(editProduct.video_url);
      }
    }
  }, [isEditing, editProduct]);

  // Transform data for MultiSelect components
  const memorabiliaOptions = (memorabiliaData?.rows || []).map(item => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    image: item.photos[0]
  }));

  const merchandiseOptions = (merchandiseData?.rows || []).map(item => ({
    id: item.id,
    title: item.title,
    subtitle: `$${item.price}`,
    image: item.photos[0]
  }));

  const productOptions = (allProductsData?.rows || [])
    .filter(product => product.id !== editProductId) // Exclude current product when editing
    .map(product => ({
      id: product.id,
      title: product.title,
      subtitle: product.subtitle,
      image: product.images[0]
    }));

  const { mutate: createProduct, loading: creating } = useMutation(
    (data: ProductCreate) => apiService.createProduct(data)
  );
  
  const { mutate: updateProduct, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: ProductCreate }) => apiService.updateProduct(id, data)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayFieldAdd = (field: keyof ProductCreate, value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[];
      if (!currentArray.includes(value.trim())) {
        setFormData(prev => ({
          ...prev,
          [field]: [...currentArray, value.trim()]
        }));
        setValue('');
      }
    }
  };

  const handleArrayFieldRemove = (field: keyof ProductCreate, valueToRemove: string) => {
    const currentArray = formData[field] as string[];
    setFormData(prev => ({
      ...prev,
      [field]: currentArray.filter(item => item !== valueToRemove)
    }));
  };

  const handleRentalPeriodChange = (period: RentalPeriod) => {
    const currentPeriods = formData.available_rental_periods;
    if (currentPeriods.includes(period)) {
      setFormData(prev => ({
        ...prev,
        available_rental_periods: currentPeriods.filter(p => p !== period)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        available_rental_periods: [...currentPeriods, period]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting form data:', formData);
    
    if (!isAuthenticated) {
      alert('Please login to add products');
      navigate('/admin/login');
      return;
    }
    
    if (!formData.title.trim()) {
      alert('Product title is required.');
      return;
    }
    
    try {
      // Clean up the data before sending
      const cleanedData = { ...formData };

      // Generate slug if not provided
      if (!cleanedData.slug) {
        cleanedData.slug = cleanedData.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
      }
      
      // Set background image URL
      cleanedData.background_image_url = backgroundImages[0] || '';
      
      // Set video URL
      cleanedData.video_url = videoUrl.trim() || '';
      
      // Ensure numeric fields are numbers, not strings
      cleanedData.sale_price = parseFloat(cleanedData.sale_price as any) || 0;
      cleanedData.retail_price = parseFloat(cleanedData.retail_price as any) || 0;
      cleanedData.rental_price_hourly = parseFloat(cleanedData.rental_price_hourly as any) || 0;
      cleanedData.rental_price_daily = parseFloat(cleanedData.rental_price_daily as any) || 0;
      cleanedData.rental_price_weekly = parseFloat(cleanedData.rental_price_weekly as any) || 0;
      cleanedData.rental_price_monthly = parseFloat(cleanedData.rental_price_monthly as any) || 0;
      cleanedData.rental_price_yearly = parseFloat(cleanedData.rental_price_yearly as any) || 0;
      
      console.log('Cleaned data:', cleanedData);

      if (isEditing && editProductId) {
        // Update existing product
        const result = await updateProduct({ id: editProductId, data: cleanedData });
        success('Product Updated', 'Product has been updated successfully!');
      } else {
        // Create new product
        const result = await createProduct(cleanedData);
        success('Product Created', 'Product has been created successfully!');
      }
      
      navigate('/admin/product-list');
    } catch (error) {
      console.error('Failed to save product:', error);
      if (error instanceof Error && error.message.includes('Authentication')) {
        error('Authentication Error', 'Your session has expired. Please login again.');
        navigate('/admin/login');
      } else {
        error('Save Failed', `Failed to save product: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin/product-list');
  };

  // Show loading state when fetching product for editing
  if (isEditing && loadingProduct) {
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Edit Product' : 'Add Product'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Update product details below' : 'Add new product details below'} - 
            <button 
              onClick={() => navigate('/admin/product-list')}
              className="text-blue-600 hover:text-blue-800 ml-1"
            >
              or go to listing
            </button>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Information */}
          <div className="lg:col-span-2 space-y-6 w-full">
            {/* Product Information Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Information</h2>
              
              <div className="space-y-4">
                <FormField label="Product title" required>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter product title"
                    required
                  />
                </FormField>

                <FormField label="Subtitle">
                  <Input
                    name="subtitle"
                    value={formData.subtitle || ''}
                    onChange={handleInputChange}
                    placeholder="Enter subtitle"
                  />
                </FormField>

                {/* Keywords */}
                <FormField label="Search Keywords">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.keywords.map((keyword, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                          {keyword}
                          <button
                            type="button"
                            onClick={() => handleArrayFieldRemove('keywords', keyword)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="Add keyword"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayFieldAdd('keywords', newKeyword, setNewKeyword))}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleArrayFieldAdd('keywords', newKeyword, setNewKeyword)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </FormField>

                {/* Product Types */}
                <FormField label="Product Types">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.product_types.map((type, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {type}
                          <button
                            type="button"
                            onClick={() => handleArrayFieldRemove('product_types', type)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <Select
                      options={productTypes}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleArrayFieldAdd('product_types', e.target.value, () => {});
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </FormField>

                {/* Movies */}
                <FormField label="Movies">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.movies.map((movie, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                          {movie}
                          <button
                            type="button"
                            onClick={() => handleArrayFieldRemove('movies', movie)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={newMovie}
                        onChange={(e) => setNewMovie(e.target.value)}
                        placeholder="Add movie"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayFieldAdd('movies', newMovie, setNewMovie))}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleArrayFieldAdd('movies', newMovie, setNewMovie)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </FormField>

                {/* Genres */}
                <FormField label="Genres">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.genres.map((genre, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                          {genre}
                          <button
                            type="button"
                            onClick={() => handleArrayFieldRemove('genres', genre)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        placeholder="Add genre"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayFieldAdd('genres', newGenre, setNewGenre))}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleArrayFieldAdd('genres', newGenre, setNewGenre)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </FormField>

                <FormField label="Description">
                  <Textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Product description..."
                  />
                </FormField>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormField label="Retail Price">
                  <Input
                    name="retail_price"
                    type="number"
                    value={formData.retail_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Sale Price">
                  <Input
                    name="sale_price"
                    type="number"
                    value={formData.sale_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>
              </div>

              {/* Rental Periods */}
              <FormField label="Available Rental Periods">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.available_rental_periods.map((period, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        {period}
                        <button
                          type="button"
                          onClick={() => handleArrayFieldRemove('available_rental_periods', period)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Select
                    options={rentalPeriods}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleRentalPeriodChange(e.target.value as RentalPeriod);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </FormField>

              {/* Rental Prices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField label="Hourly Rate">
                  <Input
                    name="rental_price_hourly"
                    type="number"
                    value={formData.rental_price_hourly}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Daily Rate">
                  <Input
                    name="rental_price_daily"
                    type="number"
                    value={formData.rental_price_daily}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Weekly Rate">
                  <Input
                    name="rental_price_weekly"
                    type="number"
                    value={formData.rental_price_weekly}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Monthly Rate">
                  <Input
                    name="rental_price_monthly"
                    type="number"
                    value={formData.rental_price_monthly}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>
              </div>

              {/* Video URL */}
              <FormField label="Product Video URL" className="mt-4">
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Add a video URL to showcase this product with video background on homepage slider
                </p>
              </FormField>
              
              {/* Slug */}
              <FormField label="Slug (URL)" className="mt-4">
                <Input
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="product-url-slug"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to auto-generate from title
                </p>
              </FormField>
            </div>
          </div>

          {/* Right Column - Images and Connected Items */}
          <div className="space-y-6">
            {/* Product Images */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
              <ImageUploader 
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
              />

              {/* Background for Product Page */}
              <div className="border-t pt-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Background for Product Page</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="is_background_image_activated"
                      checked={formData.is_background_image_activated}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {formData.is_background_image_activated && (
                  <div className="space-y-4">
                    <ImageUploader 
                      images={backgroundImages}
                      onImagesChange={setBackgroundImages}
                      maxImages={1}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Connected Memorabilia */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Connected Memorabilia</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/memorabilia/add')}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add New
                    </button>
                  </div>
                </div>
                <MultiSelect
                  options={memorabiliaOptions}
                  selectedIds={formData.memorabilia_ids || []}
                  onChange={(selectedIds) => setFormData(prev => ({ ...prev, memorabilia_ids: selectedIds }))}
                  placeholder="Select memorabilia items..."
                  searchable={true}
                />
              </div>
            </div>

            {/* Connected Merchandise */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Connected Merchandise</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/merchandise/add')}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add New
                    </button>
                  </div>
                </div>
                <MultiSelect
                  options={merchandiseOptions}
                  selectedIds={formData.merchandise_ids || []}
                  onChange={(selectedIds) => setFormData(prev => ({ ...prev, merchandise_ids: selectedIds }))}
                  placeholder="Select merchandise items..."
                  searchable={true}
                />
              </div>
            </div>

            {/* Connected Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Related Products</label>
                </div>
                <MultiSelect
                  options={productOptions}
                  selectedIds={formData.product_ids || []}
                  onChange={(selectedIds) => setFormData(prev => ({ ...prev, product_ids: selectedIds }))}
                  placeholder="Select related products..."
                  searchable={true}
                />
              </div>
            </div>
          </div>

        </div>
        
        {/* Form Actions */}
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={handleCancel} className="btn-hover">
            Back to List
          </Button>
          <Button onClick={handleSubmit} loading={creating || updating} className="btn-hover">
            {isEditing ? 'Update Product' : 'Save Product'}
          </Button>
        </div>
      </div>
    </div>
  );
}