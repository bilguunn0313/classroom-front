"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Download, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { pdfAPI } from "@/lib/pdf";

interface PdfMaterial {
  id: number;
  lesson_id: number;
  title: string;
  file_url: string;
  file_size: number | null;
  uploaded_at: string;
}

interface PdfUploadZoneProps {
  lessonId: number;
  materials: PdfMaterial[];
  onMaterialsUpdate: (materials: PdfMaterial[]) => void;
}

export function PdfUploadZone({
  lessonId,
  materials,
  onMaterialsUpdate,
}: PdfUploadZoneProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Зөвхөн PDF файл оруулах боломжтой");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("PDF файл 10MB-аас бага байх ёстой");
      return;
    }

    setUploading(true);

    try {
      const result = await pdfAPI.uploadFile(lessonId, file, file.name);
      const newMaterial = result.data;

      onMaterialsUpdate([...materials, newMaterial]);
      toast.success("PDF амжилттай хуулагдлаа");

      // Refresh the page to update the UI
      router.refresh();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("PDF хуулахад алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (materialId: number) => {
    if (!confirm("PDF файлыг устгах уу?")) return;

    setDeleting(materialId);

    try {
      await pdfAPI.delete(materialId);
      onMaterialsUpdate(materials.filter((m) => m.id !== materialId));
      toast.success("PDF амжилттай устгагдлаа");

      // Refresh the page to update the UI
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("PDF устгахад алдаа гарлаа");
    } finally {
      setDeleting(null);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // Helper function to get full PDF URL
  const getFullPdfUrl = (fileUrl: string) => {
    if (!fileUrl) return "";

    // If URL is already absolute (starts with http/https), return as is
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }

    // Otherwise, prepend the API base URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return `${apiUrl}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">PDF Материалууд</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Файл оруулах
        </Button>
      </div>

      {/* File Upload Button */}
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-24 border-2 border-dashed hover:border-blue-500 hover:bg-blue-50"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              PDF хуулж байна...
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-blue-600" />
              <span className="font-medium">PDF файл сонгох</span>
              <span className="text-xs text-gray-500">
                Зөвхөн PDF файл (MAX 10MB)
              </span>
            </div>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Materials List */}
      {materials.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Хуулагдсан материалууд ({materials.length})
          </h4>
          <div className="space-y-2">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {material.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(material.file_size)} •{" "}
                      {new Date(material.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(getFullPdfUrl(material.file_url), "_blank")
                    }
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(material.id)}
                    disabled={deleting === material.id}
                  >
                    {deleting === material.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
