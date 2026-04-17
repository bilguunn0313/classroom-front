"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { uploadAPI } from "@/lib/upload";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Зураг" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview when parent value changes (e.g. loading a saved menu)
  useEffect(() => {
    setPreviewUrl(value);
    setImgError(false);
  }, [value]);

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return `${backendUrl}${url}`;
  };

  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const targetWidth = 1280;
          const targetHeight = 720;
          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("Failed to get canvas context")); return; }

          const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (targetWidth - scaledWidth) / 2;
          const y = (targetHeight - scaledHeight) / 2;
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

          canvas.toBlob(
            (blob) => {
              if (!blob) { reject(new Error("Failed to create blob")); return; }
              resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
            },
            "image/jpeg",
            0.9,
          );
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Зөвхөн зургийн файл оруулна уу");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Зургийн хэмжээ 10MB-аас бага байх ёстой");
      return;
    }

    setUploading(true);
    setImgError(false);
    try {
      const resizedFile = await resizeImage(file);

      // Show local preview immediately
      const localPreview = URL.createObjectURL(resizedFile);
      setPreviewUrl(localPreview);

      const imageUrl = await uploadAPI.uploadImage(resizedFile);
      onChange(imageUrl);
      setPreviewUrl(imageUrl);
      URL.revokeObjectURL(localPreview);
      toast.success("Зураг хуулагдлаа");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Зураг хуулахад алдаа гарлаа");
      setPreviewUrl(value);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreviewUrl("");
    setImgError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasPreview = previewUrl && !imgError;

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {hasPreview ? (
        <div className="relative w-48 mx-auto rounded-lg overflow-hidden border border-border bg-muted">
          <img
            src={getFullUrl(previewUrl)}
            alt="Preview"
            className="w-full aspect-video object-cover"
            onError={() => setImgError(true)}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs font-medium bg-white/90 hover:bg-white text-gray-700 px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm transition-colors"
            >
              Солих
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-medium bg-white/90 hover:bg-red-50 text-red-500 px-2 py-1 rounded-md shadow-sm backdrop-blur-sm transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`
            w-full flex flex-col items-center justify-center gap-2 py-5 rounded-lg border-2 border-dashed transition-colors
            ${uploading
              ? "border-brand-300 bg-brand-50/50"
              : "border-border hover:border-gray-300 hover:bg-muted/30"
            }
          `}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
          )}
          <span className="text-xs text-muted-foreground">
            {uploading ? "Хуулж байна..." : "Зураг оруулах"}
          </span>
        </button>
      )}
    </div>
  );
}
