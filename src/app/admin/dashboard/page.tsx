import { useAuth } from '../../../contexts/AuthContext';
import { apiService } from '../../../services/api';
import { leadsService } from '../../../services/leads';
import { useApi } from '../../../hooks/useApi';
import OptimizedImage from '../../../components/UI/OptimizedImage';
import { formatPrice } from '../../../utils/priceUtils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: leads } = useApi(leadsService.getAllLeads);
  const { data: products } = useApi(apiService.getAllProducts);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Leads</h2>
          {leads?.length === 0 ? (
            <p className="text-gray-500">No leads found.</p>
          ) : (
            <ul>
              {leads?.map((lead) => (
                <li key={lead.id} className="border-b py-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{lead.name}</span>
                    <span className="text-gray-500">{lead.email}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{lead.phone}</span>
                    <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          {products?.length === 0 ? (
            <p className="text-gray-500">No products found.</p>
          ) : (
            <ul>
              {products?.map((product) => (
                <li key={product.id} className="border-b py-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-gray-500">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{product.category}</span>
                    <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}