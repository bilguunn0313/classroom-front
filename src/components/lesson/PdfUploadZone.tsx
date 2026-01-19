"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Download, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Manual URL input
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlTitle, setUrlTitle] = useState("");
  const [urlLink, setUrlLink] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);

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

  // Handle URL-based PDF addition
  const handleAddUrl = async () => {
    if (!urlTitle.trim() || !urlLink.trim()) {
      toast.error("Гарчиг болон URL заавал оруулна уу");
      return;
    }

    // Validate URL
    try {
      new URL(urlLink);
    } catch {
      toast.error("Буруу URL хаяг");
      return;
    }

    setAddingUrl(true);

    try {
      const result = await pdfAPI.addByUrl(lessonId, urlTitle, urlLink, null);
      const newMaterial = result.data;

      onMaterialsUpdate([...materials, newMaterial]);
      toast.success("PDF амжилттай нэмэгдлээ");

      // Reset form
      setUrlTitle("");
      setUrlLink("");
      setShowUrlInput(false);
    } catch (error) {
      console.error("Add URL error:", error);
      toast.error("PDF нэмэхэд алдаа гарлаа");
    } finally {
      setAddingUrl(false);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">PDF Материалууд</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUrlInput(!showUrlInput)}
          >
            <FileText className="mr-2 h-4 w-4" />
            URL нэмэх
          </Button>
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
      </div>

      {/* URL Input Form */}
      {showUrlInput && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="space-y-2">
            <Label>PDF Гарчиг</Label>
            <Input
              placeholder="жишээ нь: JavaScript Reference Guide"
              value={urlTitle}
              onChange={(e) => setUrlTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>PDF URL</Label>
            <Input
              placeholder="https://example.com/document.pdf"
              value={urlLink}
              onChange={(e) => setUrlLink(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowUrlInput(false);
                setUrlTitle("");
                setUrlLink("");
              }}
            >
              Цуцлах
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAddUrl}
              disabled={addingUrl}
            >
              {addingUrl ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Нэмэх
            </Button>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50"
          }
          ${
            uploading
              ? "opacity-50 pointer-events-none"
              : "cursor-pointer hover:border-gray-400"
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-gray-600">PDF хуулж байна...</p>
          </>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              Дарж файл сонгох эсвэл чирж оруулах
            </p>
            <p className="text-xs text-gray-500">Зөвхөн PDF файл (MAX 10MB)</p>
          </>
        )}
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
                    onClick={() => window.open(material.file_url, "_blank")}
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
