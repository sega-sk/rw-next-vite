import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/UI/Button';
import FormField from '../../../components/Forms/FormField';
import Input from '../../../components/Forms/Input';
import Textarea from '../../../components/Forms/Textarea';
import Select from '../../../components/Forms/Select';
import ImageUploader from '../../../components/UI/ImageUploader';
import MultiSelect from '../../../components/UI/MultiSelect';
import { apiService } from '../../../services/api';
import { useApi, useMutation } from '../../../hooks/useApi';
import { useToastContext } from '../../../contexts/ToastContext';
import type { ProductCreate, RentalPeriod } from '../../../services/api';
import OptimizedImage from '../../../components/UI/OptimizedImage';

export default function AddProductPage() {
  const { user } = useAuth();
  const { showToast } = useToastContext();

  const {
    data: product,
    error,
    isLoading,
    mutate: createProduct,
  } = useMutation<ProductCreate, Error>(apiService.products.create);

  const handleSubmit = async (formData: ProductCreate) => {
    try {
      await createProduct(formData);
      showToast('Product added successfully!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <h1>Add New Product</h1>
      <form onSubmit={handleSubmit}>
        <FormField label="Product Name" name="name" required>
          <Input />
        </FormField>
        <FormField label="Description" name="description" required>
          <Textarea />
        </FormField>
        <FormField label="Price" name="price" required>
          <Input type="number" step="0.01" />
        </FormField>
        <FormField label="Rental Period" name="rentalPeriod" required>
          <Select>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </FormField>
        <FormField label="Images" name="images" required>
          <ImageUploader />
        </FormField>
        <FormField label="Categories" name="categories" required>
          <MultiSelect />
        </FormField>
        <Button type="submit">Add Product</Button>
      </form>
      {product && (
        <div>
          <h2>Product Preview</h2>
          <OptimizedImage src={product.images[0].url} alt={product.name} />
          <p>{product.description}</p>
          <p>${product.price}</p>
        </div>
      )}
    </div>
  );
}