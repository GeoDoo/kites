"use client";

import { useState, useRef } from "react";
import { X, Link, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
}

// Compress image to reduce storage size
function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Scale down if larger than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG for better compression (unless it's a PNG with transparency)
        const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(outputType, quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function ImageUploadModal({
  isOpen,
  onClose,
  onImageSelect,
  currentImage,
}: ImageUploadModalProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState(currentImage || "");
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // Compress image to reduce storage size
      const compressedDataUrl = await compressImage(file, 1920, 0.7);
      setPreview(compressedDataUrl);
    } catch (err) {
      setError("Failed to process image");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (newUrl) {
      setPreview(newUrl);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      try {
        onImageSelect(preview);
        onClose();
      } catch (err) {
        // This shouldn't happen here, but just in case
        setError("Failed to save image. Try using a smaller image or a URL instead.");
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Add Image</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setTab("upload")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              tab === "upload"
                ? "text-sky-600 border-b-2 border-sky-500 bg-sky-50/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            <Upload size={16} />
            Upload
          </button>
          <button
            onClick={() => setTab("url")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              tab === "url"
                ? "text-sky-600 border-b-2 border-sky-500 bg-sky-50/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            <Link size={16} />
            URL
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {tab === "upload" ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                isProcessing 
                  ? "border-slate-200 bg-slate-50 cursor-wait"
                  : isDragging
                    ? "border-sky-400 bg-sky-50 cursor-pointer"
                    : "border-slate-200 hover:border-sky-300 hover:bg-slate-50 cursor-pointer"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
                className="hidden"
                disabled={isProcessing}
              />
              <div className="flex flex-col items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  isProcessing ? "bg-sky-100 text-sky-500 animate-pulse" : 
                  isDragging ? "bg-sky-100 text-sky-500" : "bg-slate-100 text-slate-400"
                )}>
                  <ImageIcon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {isProcessing ? "Processing image..." : isDragging ? "Drop image here" : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG, GIF, WebP (won't persist after refresh - use URL tab for permanent images)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <p className="text-xs text-emerald-600 mt-2">
                ✓ URLs are saved permanently
              </p>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500 mb-2">Preview</p>
              <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onError={() => setPreview(null)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!preview}
            className={cn(
              "px-5 py-2 text-sm font-medium rounded-lg transition-all",
              preview
                ? "bg-sky-500 text-white hover:bg-sky-600"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            Add Image
          </button>
        </div>
      </div>
    </div>
  );
}
