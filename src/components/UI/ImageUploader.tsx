import React, { useState, useRef } from 'react';
import { Upload, X, ChevronLeft, ChevronRight, Expand, ImageIcon } from 'lucide-react';
import Button from './Button';
import { apiService } from '../../services/api';
import { useMutation } from '../../hooks/useApi';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  className?: string;
}

export default function ImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 10,
  label = "Upload images",
  className = "" 
}: ImageUploaderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadFile, loading: uploading } = useMutation(
    async (file: File) => {
      try {
        return await apiService.uploadFile(file);
      } catch (error) {
        console.error('Upload failed:', error);
        if (error instanceof Error && error.message.includes('Authentication')) {
          // Redirect to login if authentication failed
          window.location.href = '/admin/login';
        }
        throw error;
      }
    }
  );

  const handleFiles = async (files: FileList) => {
    if (!files.length) return;
    
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} image${maxImages > 1 ? 's' : ''} allowed`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);

    try {
      const uploadPromises = filesToProcess.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 10MB`);
        }

        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
          throw new Error(errorData.message || `Failed to upload ${file.name}`);
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Upload all files in parallel, allow multiple images at once
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const result = await uploadFile(file);
        return result.url;
      } catch (error) {
        console.error('Upload failed:', error);
        return null;
      }
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      // Add all uploaded images at once, up to maxImages
      onImagesChange([...images, ...validUrls].slice(0, maxImages));
      if (validUrls.length > 0) {
        console.log('Images uploaded:', validUrls);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    try {
      // Delete from server
      await apiService.deleteFile(imageUrl);
    } catch (error) {
      console.error('Failed to delete file from server:', error);
    }

    // Remove from local state regardless of server response
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    if (currentImageIndex >= newImages.length && newImages.length > 0) {
      setCurrentImageIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setCurrentImageIndex(0);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleExpandGallery = () => {
    setIsGalleryExpanded(true);
  };

  const closeExpandedGallery = () => {
    setIsGalleryExpanded(false);
  };

  // Expanded Gallery Modal
  const ExpandedGallery = () => (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close Button */}
        <button
          onClick={closeExpandedGallery}
          className="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-all z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Main Image */}
        <div className="relative max-w-4xl max-h-full">
          <img 
            src={images[currentImageIndex]} 
            alt={`Product ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black bg-opacity-50 p-2 rounded-lg">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                index === currentImageIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img 
                src={image} 
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Image Counter */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : images.length >= maxImages
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => images.length < maxImages && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxImages > 1}
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading || images.length >= maxImages}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : images.length >= maxImages ? (
          <div className="flex flex-col items-center">
            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Maximum {maxImages} image{maxImages > 1 ? 's' : ''} reached</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="text-xs text-gray-500">
              Click to browse or drag & drop {maxImages > 1 ? `(max ${maxImages})` : ''}
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className={`grid gap-4 ${maxImages === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
          {images.map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <OptimizedImage
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  size="thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
              {maxImages > 1 && (
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Count */}
      {maxImages > 1 && (
        <p className="text-xs text-gray-500 text-center">
          {images.length} of {maxImages} images uploaded
        </p>
      )}

      {/* Expanded Gallery Modal */}
      {isGalleryExpanded && <ExpandedGallery />}
    </div>
  );
}