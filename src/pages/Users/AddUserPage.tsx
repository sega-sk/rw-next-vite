import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/UI/Button';
import FormField from '../../components/Forms/FormField';
import Input from '../../components/Forms/Input';
import Select from '../../components/Forms/Select';
import { apiService } from '../../services/api';
import { useMutation } from '../../hooks/useApi';
import { useToastContext } from '../../contexts/ToastContext';
import type { UserCreate } from '../../services/api';

const roleOptions = [
  { value: '', label: 'Select Role' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
  { value: 'editor', label: 'Editor' },
];

export default function AddUserPage() {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  
  // Form data for add user
  const [formData, setFormData] = useState<UserCreate>({
    email: '',
    password: '',
    role: 'user',
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    role: '',
  });

  const { mutate: createUser, loading: creating } = useMutation(
    (data: UserCreate) => apiService.createUser(data)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
      role: '',
    };
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    // Password validation
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Role validation
    if (!formData.role) {
      errors.role = 'Role is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await createUser(formData);
      success('User Created', 'User has been created successfully!');
      navigate('/admin/users');
    } catch (err) {
      console.error('Failed to create user:', err);
      if (err instanceof Error) {
        if (err.message.includes('Authentication')) {
          error('Authentication Error', 'Your session has expired. Please login again.');
          navigate('/admin/login');
        } else if (err.message.includes('already exists')) {
          setFormErrors(prev => ({ ...prev, email: 'Email already exists' }));
        } else {
          error('Create Failed', `Failed to create user: ${err.message}`);
        }
      } else {
        error('Create Failed', 'Failed to create user. Please try again.');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New User</h1>
          <p className="text-gray-600">Create a new user account with specific role and permissions.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormField label="Email Address" required error={formErrors.email}>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
                error={!!formErrors.email}
              />
            </FormField>

            <FormField label="Password" required error={formErrors.password}>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                error={!!formErrors.password}
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </FormField>

            <FormField label="Role" required error={formErrors.role}>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                options={roleOptions}
                error={!!formErrors.role}
              />
              <p className="text-xs text-gray-500 mt-1">
                Admin: Full access to all features<br />
                Editor: Can edit content but not manage users<br />
                User: Limited access to dashboard
              </p>
            </FormField>

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => navigate('/admin/users')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={creating}
              >
                Create User
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}