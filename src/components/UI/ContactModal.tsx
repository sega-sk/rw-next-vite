import React, { useState } from 'react';
import { X } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import NotificationBanner from './NotificationBanner';
import { useNotification } from '../../hooks/useNotification';
import { leadsService } from '../../services/leads';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle?: string;
  productPrice?: string;
  productImage?: string;
  productId?: string; // Add productId prop
  apiSlug?: string;
  showNotification?: (msg: string, type?: any) => void;
}

export default function ContactModal({
  isOpen,
  onClose,
  productTitle = "2025 Wayne Enterprises Batmobile",
  productPrice = "Call for Price",
  productImage = "/vdp hero (2).webp",
  productId, // Add productId prop
  apiSlug = "rent_a_product",
  showNotification: externalShowNotification,
}: ContactModalProps) {
  const { notification, showNotification, clearNotification } = useNotification();

  const [formData, setFormData] = useState({
    mainOption: '',
    rentPeriod: '',
    startDate: '', // Add start_date field
    duration: '', // Add duration field
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    comment: '',
    consent: true
  });

  const [showCommonFields, setShowCommonFields] = useState(false);  const [showCommonFields, setShowCommonFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notify = externalShowNotification || showNotification;Notification;

  // Helper to determine if price should be shown
  const shouldShowPrice = (price: string) => {
    if (!price || price === 'Call for Price') return false;lse;
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    return !isNaN(numericPrice) && numericPrice > 1000;    return !isNaN(numericPrice) && numericPrice > 1000;
  };

  // Helper for conditional logging
  function logIfEnabled(...args: any[]) {
    if (typeof window !== 'undefined' && window.location.search.includes('logs')) {undefined' && window.location.search.includes('logs')) {
      // eslint-disable-next-line no-console // eslint-disable-next-line no-console
      console.log(...args);   console.log(...args);
    }    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {TextAreaElement>) => {
    const { name, value, type } = e.target;ype } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;ked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({
      ...prev,.prev,
      [name]: type === 'checkbox' ? checked : value  [name]: type === 'checkbox' ? checked : value
    }));    }));
  };

  const handleMainOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => { => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, mainOption: value, rentPeriod: '' }));setFormData(prev => ({ ...prev, mainOption: value, rentPeriod: '' }));
    setShowCommonFields(!!value);    setShowCommonFields(!!value);
  };

  const handleSubmit = async (e: React.FormEvent) => {: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mainOption) {Data.mainOption) {
      notify('Please select Buy or Rent first.', 'error'); notify('Please select Buy or Rent first.', 'error');
      return;
    }
    if (formData.mainOption === 'rent' && !formData.rentPeriod) {ata.mainOption === 'rent' && !formData.rentPeriod) {
      notify('Please select a rental period.', 'error'); notify('Please select a rental period.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      // Use the correct API structure for lead submission
      const leadData = {
        form_slug: (formData.mainOption === 'buy' ? 'contact_us' : 'rent_a_product') as 'contact_us' | 'rent_a_product',
        appendices: {
          // Use the actual product ID if available, otherwise fall back to title
          product_id: productId || productTitle,
          rental_period: formData.rentPeriod || '',
          start_date: formData.startDate || '',
          duration: formData.duration || '',
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone_number: formData.phone,
          comments: formData.comment || `${formData.mainOption === 'buy' ? 'Purchase' : 'Rental'} inquiry for ${productTitle}. Price: ${productPrice}`
        }
      };

      // Use the leads service which handles the X-API-KEY automatically
      await leadsService.submitLead(leadData);e.submitLead(leadData);

      setFormData({
        mainOption: '',
        rentPeriod: '',
        startDate: '',
        duration: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        comment: '',
        consent: true
      });  comment: '',
      
      logIfEnabled('Contact form submitted:', leadData);
      
      if (formData.mainOption === 'buy') {
        notify('Purchase request submitted! We will contact you soon to finalize your purchase.', 'success');
      } else {if (formData.mainOption === 'buy') {
        notify(`${formData.rentPeriod.charAt(0).toUpperCase() + formData.rentPeriod.slice(1)} rental request submitted! We will contact you soon to arrange your rental.`, 'success'); request submitted! We will contact you soon to finalize your purchase.', 'success');
      }
      (`${formData.rentPeriod.charAt(0).toUpperCase() + formData.rentPeriod.slice(1)} rental request submitted! We will contact you soon to arrange your rental.`, 'success');
      setTimeout(() => {}
        notify('Thank you! We received your request and will be in touch soon.', 'success');
      }, 800); => {
      uest and will be in touch soon.', 'success');
      onClose();
    } catch (err) {
      logIfEnabled('Contact form error:', err);;
      const errorMessage = err instanceof Error ? err.message : 'Failed to send your request. Please try again.';
      notify(errorMessage, 'error'); logIfEnabled('Contact form error:', err);
    } finally {  const errorMessage = err instanceof Error ? err.message : 'Failed to send your request. Please try again.';
      setIsSubmitting(false);      notify(errorMessage, 'error');
    }
  };      setIsSubmitting(false);

  if (!isOpen) return null;

  return (pen) return null;
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div0 z-50 flex">
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"* Overlay */}
        onClick={onClose}
        aria-label="Close modal"
      />
      {/* Sidebar modal */}
      <div className={`relative bg-white w-full max-w-md h-full ml-auto shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">ull max-w-md h-full ml-auto shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <NotificationBanner
              type={notification.type} className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">
              message={notification.message}ificationBanner
              onClose={clearNotification}    type={notification.type}
            />      message={notification.message}
          </div>nClose={clearNotification}
        )}
        
        <button}
          onClick={onClose}
          className="absolute top-5 right-6 text-gray-400 hover:text-gray-600 text-2xl z-10"
        >  onClick={onClose}
          <X className="h-6 w-6" /> top-5 right-6 text-gray-400 hover:text-gray-600 text-2xl z-10"
        </button>
        
        <div className="p-6">n>
          <h2 className="contact-modal-header text-2xl font-semibold text-gray-900 mb-6 font-inter">
            Get {productTitle.split(' ').slice(-1)[0]}
          </h2>
          ]}
          {/* Product Card */}
          <div className="contact-modal-product-card bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-4">
              {/* Product Image */}dal-product-card bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
              <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">ms-start gap-4">
                <OptimizedImage}
                  src={productImage}ded-lg overflow-hidden flex-shrink-0 shadow-sm">
                  alt={productTitle}ptimizedImage
                  size="thumbnail"c={productImage}
                  className="w-full h-full object-cover"    alt={productTitle}
                />
              </div>ect-cover"
              
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 font-inter text-sm leading-tight mb-1">* Product Info */}
                  {productTitle}min-w-0">
                </h3>gray-900 font-inter text-sm leading-tight mb-1">
                
                {/* Price Display */}
                {shouldShowPrice(productPrice) ? (
                  <div className="text-lg font-bold text-yellow-600 font-inter">rice Display */}
                    {productPrice}
                  </div>="text-lg font-bold text-yellow-600 font-inter">
                ) : (ductPrice}
                  <div className="text-lg font-bold text-yellow-600 font-inter call-for-price-modal"></div>
                    Get in Touch) : (
                  </div>t-inter call-for-price-modal">
                )}
                v>
                <div className="text-xs text-gray-500 font-inter mt-1">
                  Premium movie vehicle rental
                </div><div className="text-xs text-gray-500 font-inter mt-1">
              </div>        Premium movie vehicle rental
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="contact-modal-form space-y-5">
              <div>={handleSubmit} className="space-y-5">
                <label className="block text-sm font-semibold text-gray-700 mb-3 font-inter">ame="contact-modal-form space-y-5">
                  What would you like to do?<span className="text-red-500 ml-1">*</span>
                </label>sm font-semibold text-gray-700 mb-3 font-inter">
                <selectlassName="text-red-500 ml-1">*</span>
                  name="mainOption"
                  value={formData.mainOption}
                  onChange={handleMainOptionChange} name="mainOption"
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter text-gray-700 bg-white transition-all duration-200 hover:border-gray-300"
                >
                  <option value="">Choose an option...</option>me="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter text-gray-700 bg-white transition-all duration-200 hover:border-gray-300"
                  <option value="buy">💰 Purchase This Vehicle</option>
                  <option value="rent">🎬 Rent for Event/Production</option>    <option value="">Choose an option...</option>
                </select>This Vehicle</option>
              </div>
              
              {formData.mainOption === 'rent' && (
                <div className="rental-period-section bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 font-inter">
                    Rental Period<span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="rentPeriod"
                    value={formData.rentPeriod}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 border-2 border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter text-gray-700 bg-white transition-all duration-200 mb-4"
                  >
                    <option value="">Choose rental period...</option>focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter text-gray-700 bg-white transition-all duration-200 mb-4"
                    <option value="daily">📅 Daily - $5,000/day</option>
                    <option value="weekly">📅 Weekly - $30,000/week</option> value="">Choose rental period...</option>
                    <option value="monthly">📅 Monthly - $100,000/month</option>ption value="daily">📅 Daily - $5,000/day</option>
                    <option value="yearly">📅 Yearly - $1,000,000/year</option>    <option value="weekly">📅 Weekly - $30,000/week</option>
                  </select>      <option value="monthly">📅 Monthly - $100,000/month</option>
                </div>early">📅 Yearly - $1,000,000/year</option>
              )}</select>
              
              {showCommonFields && ( Start Date field for rent_a_product */}
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 font-inter">
                        First Name<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"-full p-3 border-2 border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter transition-all duration-200 mb-4"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        requiredd Duration field for rent_a_product */}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter transition-all duration-200 hover:border-gray-300"lassName="block text-sm font-semibold text-gray-700 mb-2 font-inter">
                        placeholder="John"ion (e.g., "3 days", "1 week")
                      />
                    </div>
                    <div>"
                      <label className="block text-sm font-semibold text-gray-700 mb-2 font-inter">ration"
                        Last Name<span className="text-red-500 ml-1">*</span>.duration}
                      </label>utChange}
                      <inputweek, 2 months"
                        type="text"order-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter transition-all duration-200"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter transition-all duration-200 hover:border-gray-300"ields && (
                        placeholder="Doe"
                      /><div className="grid grid-cols-2 gap-4">
                    </div>v>
                  </div>">
                  
                  <div>l>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 font-inter">ut
                      Email Address<span className="text-red-500 ml-1">*</span>"
                    </label>tName"
                    <inputtName}
                      type="email"e}
                      name="email"ed
                      value={formData.email}0"
                      onChange={handleInputChange}
                      required/>
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter transition-all duration-200 hover:border-gray-300"v>
                      placeholder="john@example.com"  <div>
                    />label className="block text-sm font-semibold text-gray-700 mb-2 font-inter">
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 font-inter">pe="text"
                      Phone Number<span className="text-red-500 ml-1">*</span>stName"
                    </label>mData.lastName}
                    <inputtChange}
                      type="tel"
                      name="phone"ame="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter transition-all duration-200 hover:border-gray-300"
                      value={formData.phone}
                      onChange={handleInputChange}
                      requireddiv>
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter transition-all duration-200 hover:border-gray-300"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  red-500 ml-1">*</span>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 font-inter">
                      Tell us about your event or inquiry
                    </label>ail"
                    <textarea
                      name="comment"
                      rows={4}
                      value={formData.comment}us:ring-yellow-500 focus:border-yellow-500 font-inter transition-all duration-200 hover:border-gray-300"
                      onChange={handleInputChange}placeholder="john@example.com"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter transition-all duration-200 hover:border-gray-300 resize-none"
                      placeholder="Wedding, movie production, corporate event, private party..."</div>
                    />
                  </div>
                  "block text-sm font-semibold text-gray-700 mb-2 font-inter">
                  <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">pan className="text-red-500 ml-1">*</span>
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}one"
                      onChange={handleInputChange}value={formData.phone}
                      className="mt-1 w-4 h-4 text-yellow-600 border-2 border-gray-300 rounded focus:ring-yellow-500"
                      required
                    />ame="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter transition-all duration-200 hover:border-gray-300"
                    <label className="text-sm text-gray-700 font-inter leading-relaxed">aceholder="(555) 123-4567"
                      I consent to being contacted about my inquiry and understand that Reel Wheels Experience will use my information to provide quotes and rental details. />
                    </label>  </div>
                  </div>    
                </>v>
              )}assName="block text-sm font-semibold text-gray-700 mb-2 font-inter">
              
              <button
                type="submit"     <textarea
                className="contact-modal-submit-btn w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 rounded-xl transition-all duration-300 font-inter font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"nt"
                disabled={isSubmitting}
              >
                {isSubmitting ? (={handleInputChange}
                  <div className="flex items-center justify-center gap-2">assName="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-inter transition-all duration-200 hover:border-gray-300 resize-none"
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> placeholder="Wedding, movie production, corporate event, private party..."
                    Sending...
                  </div></div>
                ) : (
                  "🚀 SEND MESSAGE"<div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                )}   <input
              </button>        type="checkbox"
            </div>          name="consent"
          </form>            checked={formData.consent}
        </div>                  onChange={handleInputChange}
      </div>                     className="mt-1 w-4 h-4 text-yellow-600 border-2 border-gray-300 rounded focus:ring-yellow-500"



}  );    </div>                      required
                    />
                    <label className="text-sm text-gray-700 font-inter leading-relaxed">
                      I consent to being contacted about my inquiry and understand that Reel Wheels Experience will use my information to provide quotes and rental details.
                    </label>
                  </div>
                </>
              )}
              
              <button
                type="submit"
                className="contact-modal-submit-btn w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 rounded-xl transition-all duration-300 font-inter font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  "🚀 SEND MESSAGE"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}