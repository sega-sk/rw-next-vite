import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

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
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (images.length >= maxImages) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

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
    </div>
  );
}