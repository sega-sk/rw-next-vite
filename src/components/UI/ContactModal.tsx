import React, { useState } from 'react';
import { X } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { leadsService } from '../../services/leads';
import type { LeadCreate } from '../../services/leads';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle?: string;
  productPrice?: string | number;
  productId?: string;
}

export default function ContactModal({ 
  isOpen, 
  onClose, 
  productTitle = "2025 Wayne Enterprises Batmobile", 
  productPrice = "Call for Price",
  productId 
}: ContactModalProps) {
  const [formData, setFormData] = useState({
    mainOption: '',
    rentPeriod: '',
    firstName: 'Bruce',
    lastName: 'Wayne',
    email: 'bruce.wayne@wayneenterprises.com',
    phone: '555-BATMAN',
    comment: '',
    consent: true
  });

  const [showCommonFields, setShowCommonFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMainOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, mainOption: value, rentPeriod: '' }));
    setShowCommonFields(!!value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mainOption) {
      alert('Please select Buy or Rent first.');
      return;
    }
    
    if (formData.mainOption === 'rent' && !formData.rentPeriod) {
      alert('Please select a rental period.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Prepare lead data
      const leadData: LeadCreate = {
        form_slug: 'rent_a_product',
        appendices: {
          product_id: productId || '',
          rental_period: formData.rentPeriod,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone_number: formData.phone,
          comments: formData.comment || `${formData.mainOption === 'buy' ? 'Purchase' : 'Rental'} inquiry for ${productTitle}. Selected option: ${formData.mainOption}${formData.rentPeriod ? `, Rental period: ${formData.rentPeriod}` : ''}`,
        }
      };

      // Submit lead to API
      await leadsService.submitLead(leadData);
      
      // Show success alert with styled component
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-fadeIn';
      
      // Create check icon
      const checkIcon = document.createElement('span');
      checkIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      
      // Create message text
      const messageText = document.createElement('p');
      messageText.className = 'font-medium';
      messageText.textContent = `${formData.mainOption === 'buy' ? 'Purchase' : formData.rentPeriod} request submitted successfully!`;
      
      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'ml-2 text-white hover:text-gray-200';
      closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      closeBtn.onclick = () => document.body.removeChild(successDiv);
      
      // Assemble and append alert
      successDiv.appendChild(checkIcon);
      successDiv.appendChild(messageText);
      successDiv.appendChild(closeBtn);
      document.body.appendChild(successDiv);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 5000);
      
      // Reset form
      setFormData({
        mainOption: '',
        rentPeriod: '',
        firstName: 'Bruce',
        lastName: 'Wayne',
        email: 'bruce.wayne@wayneenterprises.com',
        phone: '555-BATMAN',
        comment: '',
        consent: true
      });
      setShowCommonFields(false);
      onClose();
      
    } catch (error) {
      console.error('Failed to submit lead:', error);
      
      // Show error alert with styled component
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-fadeIn';
      
      // Create alert icon
      const alertIcon = document.createElement('span');
      alertIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
      
      // Create message text
      const messageText = document.createElement('p');
      messageText.className = 'font-medium';
      messageText.textContent = 'Failed to submit your request. Please try again.';
      
      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'ml-2 text-white hover:text-gray-200';
      closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      closeBtn.onclick = () => document.body.removeChild(errorDiv);
      
      // Assemble and append alert
      errorDiv.appendChild(alertIcon);
      errorDiv.appendChild(messageText);
      errorDiv.appendChild(closeBtn);
      document.body.appendChild(errorDiv);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="contact-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="contact-modal-content bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-6 text-gray-400 hover:text-gray-600 text-2xl"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <h2 className="contact-modal-header text-2xl font-semibold text-gray-900 mb-4 font-inter">Get {productTitle.split(' ').pop()}</h2>
          
          <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="w-16 h-12 bg-black rounded flex items-center justify-center">
              <OptimizedImage
                src="/logo.png"
                alt="Product"
                size="thumbnail"
                className="w-full h-full object-contain"
                fallback={<span className="text-yellow-500 text-xs font-bold">PRODUCT</span>}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 font-inter">{productTitle}</h3>
            </div>
            <div className="text-lg font-bold text-gray-900 font-inter">{productPrice}</div>
            {typeof productPrice === 'string' && productPrice === 'Call for Price' && (
              <div className="text-xs text-gray-500 font-inter mt-1">Contact us for pricing details</div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="contact-modal-form space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Select Option<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="mainOption"
                value={formData.mainOption}
                onChange={handleMainOptionChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
              >
                <option value="">Choose an option...</option>
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
              </select>
            </div>

            {formData.mainOption === 'rent' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                  Rental Period<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="rentPeriod"
                  value={formData.rentPeriod}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                >
                  <option value="">Choose rental period...</option>
                  <option value="daily">Daily - $5,000/day</option>
                  <option value="weekly">Weekly - $30,000/week</option>
                  <option value="monthly">Monthly - $100,000/month</option>
                  <option value="yearly">Yearly - $1,000,000/year</option>
                </select>
              </div>
            )}

            {showCommonFields && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                      First Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                      Last Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                    Email<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Comments</label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter your comments here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <label className="text-sm text-gray-600 font-inter">
                    Wayne Enterprises may text me updates about my inquiry or appointment. Message and data rates may apply. 
                    Message frequency varies. Reply HELP for help or STOP to opt out.{' '}
                    <a href="#" className="text-blue-600 underline">Privacy Policy</a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors font-inter disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting 
                    ? 'Submitting...' 
                    : formData.mainOption === 'buy' ? 'Get Purchase Quote' : 'Get Rental Quote'}
                </button>
              </>
            )}

            {!showCommonFields && (
              <button
                type="button"
                disabled={true}
                className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed font-inter"
              >
                Select an option first
              </button>
            )}
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}