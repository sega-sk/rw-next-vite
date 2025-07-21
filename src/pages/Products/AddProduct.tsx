import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Plus, X, Edit, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import Button from '../../components/UI/Button';
import FormField from '../../components/Forms/FormField';
import Input from '../../components/Forms/Input';
import Textarea from '../../components/Forms/Textarea';
import Select from '../../components/Forms/Select';
import ImageUploader from '../../components/UI/ImageUploader';
import { apiService } from '../../services/api';
import { useApi, useMutation } from '../../hooks/useApi';
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

// Helper to clean product payload before sending to API
function cleanProductPayload(data: ProductCreate | any): ProductCreate {
  const cleaned: any = {};

  // List of fields that should be arrays
  const arrayFields = [
    'product_types', 'movies', 'genres', 'keywords', 'available_rental_periods',
    'images', 'memorabilia_ids', 'merchandise_ids', 'product_ids'
  ];
  // List of fields that should be numbers (or string numbers)
  const numberFields = [
    'sale_price', 'retail_price', 'rental_price_hourly', 'rental_price_daily',
    'rental_price_weekly', 'rental_price_monthly', 'rental_price_yearly'
  ];

  for (const key in data) {
    let value = data[key];
    if (arrayFields.includes(key)) {
      if (Array.isArray(value)) {
        cleaned[key] = value.filter((v: any) => v !== '' && v !== null && v !== undefined);
      } else if (typeof value === 'string' && value.trim() === '') {
        cleaned[key] = [];
      } else if (value == null) {
        cleaned[key] = [];
      } else {
        cleaned[key] = Array.isArray(value) ? value : [value];
      }
    } else if (numberFields.includes(key)) {
      if (value === '' || value === null || value === undefined) {
        // Don't send empty price fields
        continue;
      }
      // Accept both string and number, but always send as string or number
      cleaned[key] = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
    } else if (typeof value === 'string') {
      if (value.trim() !== '') {
        cleaned[key] = value;
      }
      // else skip empty strings
    } else if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Add a helper for drag-and-drop reordering
function reorderArray<T>(arr: T[], from: number, to: number): T[] {
  const updated = [...arr];
  const [removed] = updated.splice(from, 1);
  updated.splice(to, 0, removed);
  return updated;
}

// Add a helper for localStorage background removal count
function getBgRemoveCount(productId: string): number {
  if (!productId) return 0;
  const key = `bgRemoveCount:${productId}`;
  return Number(localStorage.getItem(key) || '0');
}

function incrementBgRemoveCount(productId: string) {
  if (!productId) return;
  const key = `bgRemoveCount:${productId}`;
  const count = getBgRemoveCount(productId) + 1;
  localStorage.setItem(key, String(count));
}

// Helper for conditional logging
function logIfEnabled(...args: any[]) {
  if (typeof window !== 'undefined' && window.location.search.includes('logs')) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

export default function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToastContext();
  
  // Get edit product ID from URL params
  const searchParams = new URLSearchParams(location.search);
  const editProductId = searchParams.get('edit');
  const isEditing = !!editProductId;
  
  // Form state (ensure correct types for API)
  const [formData, setFormData] = useState<ProductCreate>({
    title: '',
    subtitle: '',
    description_title: '', // Add description_title field
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
    is_on_homepage_slider: false,
    sale_price: 0,
    retail_price: 0,
    rental_price_hourly: 0,
    rental_price_daily: 0,
    rental_price_weekly: 0,
    rental_price_monthly: 0,
    rental_price_yearly: 0,
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [bgRemoving, setBgRemoving] = useState(false);
  const [bgRemoveError, setBgRemoveError] = useState('');
  const [bgRemoveCount, setBgRemoveCount] = useState(0);
  const [showImageReorder, setShowImageReorder] = useState(false);
  const [productPage, setProductPage] = useState(1); // Add pagination state

  // Fetch product data for editing
  const { data: editProduct, loading: loadingProduct } = useApi(
    () => editProductId ? apiService.getProduct(editProductId) : Promise.resolve(null),
    { 
      immediate: !!editProductId,
      cacheKey: `edit-product-${editProductId}`,
      cacheTTL: 15 * 1000, // 15 seconds
      staleWhileRevalidate: true
    }
  );

  // API hooks - Updated to refresh every 15 seconds
  const { data: memorabiliaData } = useApi(
    () => apiService.getMemorabilia({ limit: 100 }),
    { 
      immediate: true,
      cacheKey: 'add-product-memorabilia',
      cacheTTL: 15 * 1000, // 15 seconds
      staleWhileRevalidate: true
    }
  );

  const { data: merchandiseData } = useApi(
    () => apiService.getMerchandise({ limit: 100 }),
    { 
      immediate: true,
      cacheKey: 'add-product-merchandise',
      cacheTTL: 15 * 1000, // 15 seconds
      staleWhileRevalidate: true
    }
  );

  const { data: allProductsData } = useApi(
    () => apiService.getProducts({ limit: 100 }),
    { 
      immediate: true, 
      cacheKey: 'add-product-all-products', 
      cacheTTL: 15 * 1000, // 15 seconds
      staleWhileRevalidate: true 
    }
  );

  const { mutate: createProduct, loading: creating } = useMutation(
    (data: ProductCreate) => apiService.createProduct(data)
  );
  
  const { mutate: updateProduct, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: ProductCreate }) => apiService.updateProduct(id, data)
  );

  // Track background removal count for this product
  useEffect(() => {
    if (isEditing && editProduct?.id) {
      setBgRemoveCount(getBgRemoveCount(editProduct.id));
    }
  }, [isEditing, editProduct?.id]);

  // Load product data when editing
  useEffect(() => {
    if (isEditing && editProduct) {
      setFormData({
        title: editProduct.title || '',
        subtitle: editProduct.subtitle || '',
        description_title: editProduct.description_title || '',
        description: editProduct.description || '',
        product_types: editProduct.product_types || [],
        movies: editProduct.movies || [],
        genres: editProduct.genres || [],
        keywords: editProduct.keywords || [],
        available_rental_periods: editProduct.available_rental_periods || [],
        images: editProduct.images || [],
        background_image_url: editProduct.background_image_url || '',
        is_background_image_activated: !!editProduct.is_background_image_activated,
        is_trending_model: !!editProduct.is_trending_model,
        is_on_homepage_slider: !!editProduct.is_on_homepage_slider,
        sale_price: Number(editProduct.sale_price) || 0,
        retail_price: Number(editProduct.retail_price) || 0,
        rental_price_hourly: Number(editProduct.rental_price_hourly) || 0,
        rental_price_daily: Number(editProduct.rental_price_daily) || 0,
        rental_price_weekly: Number(editProduct.rental_price_weekly) || 0,
        rental_price_monthly: Number(editProduct.rental_price_monthly) || 0,
        rental_price_yearly: Number(editProduct.rental_price_yearly) || 0,
        slug: editProduct.slug || '',
        // Fix: Handle arrays properly and convert to strings consistently
        memorabilia_ids: Array.isArray(editProduct.memorabilia_ids) 
          ? editProduct.memorabilia_ids.map(id => String(id)) 
          : Array.isArray(editProduct.memorabilia) 
            ? editProduct.memorabilia.map(item => String(item.id || item))
            : [],
        merchandise_ids: Array.isArray(editProduct.merchandise_ids) 
          ? editProduct.merchandise_ids.map(id => String(id))
          : Array.isArray(editProduct.merchandises)
            ? editProduct.merchandises.map(item => String(item.id || item))
            : [],
        product_ids: Array.isArray(editProduct.product_ids) 
          ? editProduct.product_ids.map(id => String(id))
          : Array.isArray(editProduct.products)
            ? editProduct.products.map(item => String(item.id || item))
            : [],
      });
      
      if (editProduct.background_image_url) {
        setBackgroundImages([editProduct.background_image_url]);
      }
      
      if (editProduct.video_url) {
        setVideoUrl(editProduct.video_url);
      }
    }
  }, [isEditing, editProduct]);

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

    if (!isAuthenticated) {
      alert('Please login to add products');
      navigate('/admin/login');
      return;
    }

    if (!formData.title.trim()) {
      alert('Product title is required.');
      logIfEnabled('Product create failed: Title required');
      return;
    }

    try {
      const cleanedPayload = cleanProductPayload(formData);

      if (isEditing && editProduct) {
        await updateProduct({
          id: editProduct.id,
          data: cleanedPayload,
        });
        success('Product updated!', 'Product updated successfully!');
        logIfEnabled('Product updated:', editProduct.id);
        
        // Refresh the edit product data instead of redirecting
        setTimeout(async () => {
          try {
            const refreshedProduct = await apiService.getProduct(editProduct.id);
            if (refreshedProduct) {
              // Update the edit product data to reflect changes
              window.location.reload(); // Force refresh to get updated data
            }
          } catch (error) {
            console.error('Failed to refresh product data:', error);
          }
        }, 500);
      } else {
        const createdProduct = await createProduct(cleanedPayload);
        success('Product created!', 'Product created successfully!');
        logIfEnabled('Product created:', formData.title);
        
        // Redirect to edit page for the newly created product
        if (createdProduct?.id) {
          setTimeout(() => {
            navigate(`/admin/products/add?edit=${createdProduct.id}`);
          }, 1000);
        } else {
          setTimeout(() => {
            navigate('/admin/product-list');
          }, 1000);
        }
      }
    } catch (error: any) {
      // Try to extract API error details
      let apiErrorMsg = '';
      if (error?.response && typeof error.response.json === 'function') {
        try {
          const data = await error.response.json();
          apiErrorMsg = data?.message || JSON.stringify(data);
        } catch {
          apiErrorMsg = error.message || String(error);
        }
      } else if (error?.message) {
        apiErrorMsg = error.message;
      } else {
        apiErrorMsg = JSON.stringify(error);
      }
      logIfEnabled('Failed to save product:', apiErrorMsg, error);
      if (apiErrorMsg.toLowerCase().includes('authentication')) {
        error('Authentication Error', 'Your session has expired. Please login again.');
        navigate('/admin/login');
      } else {
        error('Save Failed', `Failed to save product: ${apiErrorMsg}`);
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin/product-list');
  };

  // --- Image Reordering Handlers ---
  const handleDragStart = (idx: number) => setDraggedIndex(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;
    setFormData(prev => ({
      ...prev,
      images: reorderArray(prev.images, draggedIndex, idx)
    }));
    setDraggedIndex(idx);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  // --- Remove Background Handler ---
  const handleRemoveBackground = async () => {
    setBgRemoveError('');
    if (!formData.images[0]) return;
    if (isEditing && editProduct?.id && bgRemoveCount >= 2) {
      setBgRemoveError('Background removal limit reached for this product.');
      return;
    }
    setBgRemoving(true);
    try {
      // Check authentication first
      if (!isAuthenticated) {
        setBgRemoveError('Please login to remove background');
        error('Authentication Required', 'Please login to remove background');
        navigate('/admin/login');
        return;
      }

      // Use the authenticated API service instead of direct call
      const result = await apiService.clearProductBackground(editProduct?.id || '');
      
      // The API returns the full updated product object
      if (result && result.images && Array.isArray(result.images)) {
        // Update form data with the new images array from the API response
        setFormData(prev => ({
          ...prev,
          images: result.images || prev.images
        }));
        
        // Track the background removal count
        if (isEditing && editProduct?.id) {
          incrementBgRemoveCount(editProduct.id);
          setBgRemoveCount(getBgRemoveCount(editProduct.id));
        }
        
        success('Background Removed', 'Background removed successfully from the first image!');
      } else {
        throw new Error('Invalid response format from background removal API');
      }
    } catch (err: any) {
      console.error('Background removal error:', err);
      let errorMessage = 'Failed to remove background';
      
      // Handle specific error types
      if (err.status === 401 || err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        errorMessage = 'Authentication failed. Please login again.';
        setBgRemoveError(errorMessage);
        error('Authentication Failed', errorMessage);
        navigate('/admin/login');
      } else if (err.status === 403) {
        errorMessage = 'Permission denied. You don\'t have access to this feature.';
        setBgRemoveError(errorMessage);
        error('Permission Denied', errorMessage);
      } else if (err.status === 404) {
        errorMessage = 'Product not found or background removal not available.';
        setBgRemoveError(errorMessage);
        error('Product Not Found', errorMessage);
      } else {
        errorMessage = err.message || errorMessage;
        setBgRemoveError(errorMessage);
        error('Background Removal Failed', errorMessage);
      }
    } finally {
      setBgRemoving(false);
    }
  };

  // Add error boundary for the component
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      // Component initialization
      setHasError(false);
    } catch (err) {
      console.error('AddProduct component error:', err);
      setHasError(true);
    }
  }, []);

  if (hasError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Form</h1>
          <p className="text-gray-600 mb-4">There was an error loading the product form.</p>
          <Button onClick={() => navigate('/admin/product-list')}>
            Back to Product List
          </Button>
        </div>
      </div>
    );
  }

  // Defensive: do not render form until editProduct is loaded in edit mode
  if (isEditing && loadingProduct) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Add pagination constants for Related Products
  const productsPerPage = 20;
  const allProducts = allProductsData?.rows || [];
  const totalProductPages = Math.ceil(allProducts.length / productsPerPage);
  const paginatedProducts = allProducts
    .filter(p => p.id !== editProductId) // Don't show current product in related
    .slice((productPage - 1) * productsPerPage, productPage * productsPerPage);

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

                {/* Add Description Title field */}
                <FormField label="Description Title">
                  <Input
                    name="description_title"
                    value={formData.description_title || ''}
                    onChange={handleInputChange}
                    placeholder="Enter description title (optional)"
                  />
                </FormField>

                {/* Keywords */}
                <FormField label="Search Keywords">
                  {/* Wrap multiple children in a div */}
                  <div>
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
                  <div>
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
                  <div>
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
                  <div>
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
                    value={formData.retail_price || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Sale Price">
                  <Input
                    name="sale_price"
                    type="number"
                    value={formData.sale_price || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>
              </div>

              {/* Rental Periods */}
              <FormField label="Available Rental Periods">
                <div>
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
                    value={formData.rental_price_hourly || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Daily Rate">
                  <Input
                    name="rental_price_daily"
                    type="number"
                    value={formData.rental_price_daily || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Weekly Rate">
                  <Input
                    name="rental_price_weekly"
                    type="number"
                    value={formData.rental_price_weekly || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Monthly Rate">
                  <Input
                    name="rental_price_monthly"
                    type="number"
                    value={formData.rental_price_monthly || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>
              </div>

              {/* Video URL */}
              <FormField label="Product Video URL">
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Add a video URL to showcase this product with video background on homepage slider
                </p>
              </FormField>
            </div>
          </div>

          {/* Right Column - Images and Connected Items */}
          <div className="space-y-6">
            {/* Product Images */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
                {formData.images.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImageReorder(!showImageReorder)}
                    className="flex items-center gap-2"
                  >
                    <GripVertical className="h-4 w-4" />
                    {showImageReorder ? 'Hide Reorder' : 'Reorder Images'}
                  </Button>
                )}
              </div>

              {/* --- Image Reorder UI --- */}
              {showImageReorder && formData.images.length > 0 && (
                <div className="mb-4 p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                    <GripVertical className="h-4 w-4" />
                    Drag and drop to reorder images. The first image is used as the main product image.
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {formData.images.map((img, idx) => (
                      <div
                        key={img + idx}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={e => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`relative group border-2 rounded-lg p-1 bg-white transition-all duration-200 ${
                          draggedIndex === idx ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ cursor: 'grab', width: 120, height: 90 }}
                      >
                        <span className="absolute left-1 top-1 text-gray-400 cursor-move z-10">
                          <GripVertical size={16} />
                        </span>
                        <OptimizedImage
                          src={img}
                          alt={`Product ${idx + 1}`}
                          size="thumbnail"
                          className="w-full h-full object-cover rounded"
                        />
                        {/* Image order number */}
                        <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                          {idx + 1}
                        </div>
                        {/* Remove button for each image */}
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx)
                          }))}
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* --- End Image Reorder UI --- */}

              <ImageUploader
                images={formData.images}
                onImagesChange={images => setFormData(prev => ({ ...prev, images }))}
              />

              {/* --- Remove Background Action --- */}
              {formData.images[0] && (
                <div className="mt-4 flex items-center gap-3 remove-background-action">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveBackground}
                    disabled={bgRemoving || (isEditing && editProduct?.id && bgRemoveCount >= 2)}
                  >
                    {bgRemoving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                    Cut Background (1st image)
                  </Button>
                  <span className="text-xs text-gray-500">
                    {isEditing && editProduct?.id
                      ? `(${2 - bgRemoveCount} left)`
                      : '(max 2 per product)'}
                  </span>
                  {bgRemoveError && (
                    <span className="text-xs text-red-600 ml-2"><small>{bgRemoveError}</small></span>
                  )}
                </div>
              )}
              {/* --- End Remove Background Action --- */}
            </div>

            {/* Connected Memorabilia */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Connected Memorabilia</h3>
                <button
                  className="ml-3 px-2 py-1 rounded bg-purple-600 text-white text-xs add-connections-btn-plus"
                  onClick={() => navigate('/admin/memorabilia/add')}
                  title="Add new Memorabilia"
                  type="button"
                >
                  +
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/admin/memorabilia')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View All
                </button>
              </div>
              <div className="border rounded-lg max-h-48 overflow-y-auto p-2 bg-white">
                {memorabiliaData?.rows?.length > 0 ? (
                  memorabiliaData.rows.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        checked={formData.memorabilia_ids?.includes(String(item.id)) || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const itemId = String(item.id);
                          setFormData(prev => ({
                            ...prev,
                            memorabilia_ids: checked 
                              ? [...(prev.memorabilia_ids || []), itemId]
                              : (prev.memorabilia_ids || []).filter(id => id !== itemId)
                          }));
                        }}
                        className="rounded text-blue-600"
                      />
                      <OptimizedImage
                        src={item.photos?.[0] || '/memorabilia_balanced.webp'} 
                        alt={item.title}
                        size="thumbnail"
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No memorabilia items found</p>
                )}
              </div>
            </div>

            {/* Connected Merchandise */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Connected Merchandise</h3>
                <button
                  className="ml-3 px-2 py-1 rounded bg-green-600 text-white text-xs add-connections-btn-plus"
                  onClick={() => navigate('/admin/merchandise/add')}
                  title="Add new Merchandise"
                  type="button"
                >
                  +
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/admin/merchandise')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View All
                </button>
              </div>
              <div className="border rounded-lg max-h-48 overflow-y-auto p-2 bg-white">
                {merchandiseData?.rows?.length > 0 ? (
                  merchandiseData.rows.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        checked={formData.merchandise_ids?.includes(String(item.id)) || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const itemId = String(item.id);
                          setFormData(prev => ({
                            ...prev,
                            merchandise_ids: checked 
                              ? [...(prev.merchandise_ids || []), itemId]
                              : (prev.merchandise_ids || []).filter(id => id !== itemId)
                          }));
                        }}
                        className="rounded text-blue-600"
                      />
                      <OptimizedImage
                        src={item.photos?.[0] || '/Back To The Future 35th Anniversary-mobile.webp'} 
                        alt={item.title}
                        size="thumbnail"
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No merchandise items found</p>
                )}
              </div>
            </div>

            {/* Related Products - Fix empty display and add pagination */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Related Products</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {allProducts.filter(p => p.id !== editProductId).length} total
                  </span>
                  <button 
                    type="button"
                    onClick={() => navigate('/admin/product-list')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="border rounded-lg max-h-48 overflow-y-auto p-2 bg-white">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 mb-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={formData.product_ids?.includes(String(item.id)) || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const itemId = String(item.id);
                          setFormData(prev => ({
                            ...prev,
                            product_ids: checked 
                              ? [...(prev.product_ids || []), itemId]
                              : (prev.product_ids || []).filter(id => id !== itemId)
                          }));
                        }}
                        className="rounded text-blue-600"
                      />
                      <OptimizedImage
                        src={item.images?.[0] || '/vdp hero (2).webp'} 
                        alt={item.title}
                        size="thumbnail"
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                        {item.product_types?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.product_types.slice(0, 2).map((type, idx) => (
                              <span key={idx} className="px-1 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                                {type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-2">No products found</p>
                    <button 
                      type="button"
                      onClick={() => window.location.reload()}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Refresh
                    </button>
                  </div>
                )}
                
                {/* Add pagination controls */}
                {totalProductPages > 1 && (
                  <div className="flex justify-center mt-2 gap-2 pt-2 border-t">
                    <button
                      type="button"
                      disabled={productPage === 1}
                      onClick={() => setProductPage(productPage - 1)}
                      className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Prev
                    </button>
                    <span className="text-xs flex items-center px-2">
                      {productPage} / {totalProductPages}
                    </span>
                    <button
                      type="button"
                      disabled={productPage === totalProductPages}
                      onClick={() => setProductPage(productPage + 1)}
                      className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
              
              {/* Show selected count */}
              {formData.product_ids?.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {formData.product_ids.length} product{formData.product_ids.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            {/* --- Add checkboxes for homepage/trending --- */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Homepage & Trending Settings</h3>
              <div className="flex flex-col gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="is_trending_model"
                    checked={formData.is_trending_model}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span className="ml-2">Trending Model (show in Trending Models)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="is_on_homepage_slider"
                    checked={formData.is_on_homepage_slider}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span className="ml-2">Show on Homepage Slider</span>
                </label>
              </div>
            </div>
            {/* --- end checkboxes --- */}
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