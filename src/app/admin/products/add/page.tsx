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

// This page is not implemented for Vite/React SPA routing.
// Please use the main AddProduct page at /src/pages/Products/AddProduct.tsx
export default function AddProductPage() {
  return null;
}