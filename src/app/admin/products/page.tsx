import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/UI/Button';
import Badge from '../../../components/UI/Badge';
import { apiService } from '../../../services/api';
import { useApi, useMutation } from '../../../hooks/useApi';
import { useToastContext } from '../../../contexts/ToastContext';
import OptimizedImage from '../../../components/UI/OptimizedImage';
import { formatPrice } from '../../../utils/priceUtils';

// ...existing code...