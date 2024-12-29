'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadToImgur } from '@/lib/imgur';
import { toast } from 'sonner';

export function ImageUploadForm() {
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;

          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }));
            },
            'image/jpeg',
            0.8
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const compressedFile = await compressImage(file);
      const url = await uploadToImgur(compressedFile);
      setImageUrl(url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error('Please provide an image URL');
      return;
    }
    // Handle the submission with the imageUrl
    console.log('Submitted URL:', imageUrl);
    toast.success('Form submitted successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6 p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
            Image URL
          </label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL or upload an image"
            className="w-full"
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              'Uploading...'
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>

          {imageUrl && (
            <div className="w-full aspect-video relative rounded-lg overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Uploaded preview"
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full">
        <ImageIcon className="w-4 h-4 mr-2" />
        Submit
      </Button>
    </form>
  );
}