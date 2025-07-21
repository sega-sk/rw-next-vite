/**
 * Reel Wheels Experience - Main App Component
 * Developed by SeGa_cc for DealerTower
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './components/Auth/LoginPage';
import Layout from './components/Layout/Layout'; 
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/Products/AddProduct';
import ProductList from './pages/Products/ProductList';
import MemorabiliaList from './pages/Memorabilia/MemorabiliaList';
import AddMemorabilia from './pages/Memorabilia/AddMemorabilia';
import EditMemorabilia from './pages/Memorabilia/EditMemorabilia';
import MerchandiseList from './pages/Merchandise/MerchandiseList';
import AddMerchandise from './pages/Merchandise/AddMerchandise';
import EditMerchandise from './pages/Merchandise/EditMerchandise';
import LeadsList from './pages/Leads/LeadsList';
import ProfilePage from './pages/Profile/ProfilePage';
import UsersList from './pages/Users/UsersList';
import AddUser from './pages/Users/AddUser';

// Main website components
import Homepage from './pages/Website/Homepage';
import CatalogPage from './pages/Website/CatalogPage';
import ProductDetailPage from './pages/Website/ProductDetailPage';
import MemorabiliaPage from './pages/Website/MemorabiliaPage';
import MerchandisePage from './pages/Website/MerchandisePage';
import FavoritesPage from './pages/Website/FavoritesPage';
import AboutPage from './pages/Website/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <FavoritesProvider>
          <Router>
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<Homepage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/catalog/:productType" element={<CatalogPage />} />
              <Route path="/catalog/:productType/:slug" element={<ProductDetailPage />} />
              
              {/* Product-specific memorabilia and merchandise routes */}
              <Route path="/catalog/:productType/:slug/memorabilia" element={<MemorabiliaPage />} />
              <Route path="/catalog/:productType/:slug/merchandise" element={<MerchandisePage />} />
              
              <Route path="/about" element={<AboutPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              
              {/* Standalone memorabilia and merchandise pages */}
              <Route path="/memorabilia" element={<MemorabiliaPage />} />
              <Route path="/memorabilia/:slug" element={<MemorabiliaPage />} />
              <Route path="/merchandise" element={<MerchandisePage />} />
              <Route path="/merchandise/:slug" element={<MerchandisePage />} />
              
              <Route path="/contact" element={<MemorabiliaPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              <Route path="/admin/login" element={<LoginPage />} />
              
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <Layout title="Dashboard"><Dashboard /></Layout>
                </ProtectedRoute> 
              } />
              
              <Route path="/admin/products/add" element={
                <ProtectedRoute>
                  <Layout title="Add Product" breadcrumb={['Dashboard', 'Add Product']}>
                    <AddProduct />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/products" element={
                <ProtectedRoute>
                  <Layout title="Add Product" breadcrumb={['Dashboard', 'Add Product']}>
                    <AddProduct />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/product-list" element={
                <ProtectedRoute>
                  <Layout title="Products List" breadcrumb={['Dashboard', 'Product list']}><ProductList /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/memorabilia" element={
                <ProtectedRoute>
                  <Layout title="Memorabilia List" breadcrumb={['Dashboard', 'Memorabilia']}><MemorabiliaList /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/memorabilia/add" element={
                <ProtectedRoute>
                  <Layout title="Add Memorabilia" breadcrumb={['Dashboard', 'Memorabilia', 'Add']}><AddMemorabilia /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/memorabilia/edit/:id" element={
                <ProtectedRoute>
                  <Layout title="Edit Memorabilia" breadcrumb={['Dashboard', 'Memorabilia', 'Edit']}><EditMemorabilia /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/merchandise" element={
                <ProtectedRoute>
                  <Layout title="Merchandise" breadcrumb={['Dashboard', 'Merchandise']}><MerchandiseList /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/merchandise/add" element={
                <ProtectedRoute>
                  <Layout title="Add Merchandise" breadcrumb={['Dashboard', 'Merchandise', 'Add']}><AddMerchandise /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/merchandise/edit/:id" element={
                <ProtectedRoute>
                  <Layout title="Edit Merchandise" breadcrumb={['Dashboard', 'Merchandise', 'Edit']}><EditMerchandise /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/leads" element={
                <ProtectedRoute>
                  <Layout title="Leads Management" breadcrumb={['Dashboard', 'Leads']}><LeadsList /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/profile" element={
                <ProtectedRoute>
                  <Layout title="Profile Settings" breadcrumb={['Dashboard', 'Profile']}><ProfilePage /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute>
                  <Layout title="User Management" breadcrumb={['Dashboard', 'Users']}><UsersList /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users/add" element={
                <ProtectedRoute>
                  <Layout title="Add User" breadcrumb={['Dashboard', 'Users', 'Add']}><AddUser /></Layout>
                </ProtectedRoute>
              } />
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </FavoritesProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;