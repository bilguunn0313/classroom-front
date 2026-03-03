"use client";

import { useState, useRef } from "react";
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [urlInput, setUrlInput] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get full URL (handles both relative and absolute URLs)
  const getFullUrl = (url: string) => {
    if (!url) return "";
    // If already a full URL, return as-is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // If relative path, prepend backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return `${backendUrl}${url}`;
  };

  // Resize image to 1280x720 (16:9 aspect ratio)
  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Target dimensions (16:9 aspect ratio)
          const targetWidth = 1280;
          const targetHeight = 720;

          // Create canvas
          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Calculate scaling to cover the entire canvas (crop if needed)
          const scale = Math.max(
            targetWidth / img.width,
            targetHeight / img.height
          );
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;

          // Center the image
          const x = (targetWidth - scaledWidth) / 2;
          const y = (targetHeight - scaledHeight) / 2;

          // Draw image
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create blob"));
                return;
              }
              // Create new file with same name
              const resizedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            },
            "image/jpeg",
            0.9 // Quality (90%)
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Зөвхөн зургийн файл оруулна уу");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Зургийн хэмжээ 10MB-аас бага байх ёстой");
      return;
    }

    setUploading(true);
    try {
      // Resize image to 1280x720
      const processingToast = toast.loading("Зургийг боловсруулж байна...");
      const resizedFile = await resizeImage(file);

      // Show preview of resized image
      const previewPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setPreviewUrl(dataUrl);
          resolve(dataUrl);
        };
        reader.readAsDataURL(resizedFile);
      });

      await previewPromise;

      // Upload resized file
      const imageUrl = await uploadAPI.uploadImage(resizedFile);
      onChange(imageUrl);
      setPreviewUrl(imageUrl);

      // Dismiss processing toast and show success
      toast.dismiss(processingToast);
      toast.success("Зураг амжилттай хуулагдлаа!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Зураг хуулахад алдаа гарлаа",
      );
      setPreviewUrl(value); // Reset to original value on error
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error("URL оруулна уу");
      return;
    }
    onChange(urlInput);
    setPreviewUrl(urlInput);
    toast.success("Зургийн URL хадгалагдлаа!");
  };

  const handleRemove = () => {
    onChange("");
    setPreviewUrl("");
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" />
            Зураг хуулах
          </TabsTrigger>
          <TabsTrigger value="url">
            <LinkIcon className="mr-2 h-4 w-4" />
            URL оруулах
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              uploading
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            {previewUrl ? (
              <div className="space-y-2">
                <div className="relative inline-block">
                  <img
                    src={getFullUrl(previewUrl)}
                    alt="Preview"
                    className="max-w-full max-h-48 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemove}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Өөр зураг сонгох
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Хуулж байна..." : "Зураг сонгох"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, WebP (max 5MB)
                </p>
                <p className="text-xs text-gray-400">
                  Автоматаар 1280x720 (16:9) хэмжээнд тохируулна
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <Button type="button" onClick={handleUrlSubmit}>
              Хадгалах
            </Button>
          </div>

          {previewUrl && (
            <div className="relative inline-block">
              <img
                src={getFullUrl(previewUrl)}
                alt="Preview"
                className="max-w-full max-h-48 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
