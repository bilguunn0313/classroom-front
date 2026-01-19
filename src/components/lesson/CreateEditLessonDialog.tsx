// components/lesson/CreateEditLessonDialog.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { lessonAPI } from "@/lib/lesson";
import { Lesson } from "@/types/schema.types";
import { PdfUploadZone } from "./PdfUploadZone";
import { Progress } from "@/components/ui/progress";

interface CreateEditLessonDialogProps {
  courseId: number;
  lesson?: Lesson;
  onSuccess: () => void;
  trigger?: ReactNode;
}

export function CreateEditLessonDialog({
  courseId,
  lesson,
  onSuccess,
  trigger,
}: CreateEditLessonDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [text, setText] = useState("");
  const [lessonOrder, setLessonOrder] = useState("");
  const [pdfMaterials, setPdfMaterials] = useState<any[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const isEdit = !!lesson;

  // Reset form when dialog opens for new lesson, populate when editing
  useEffect(() => {
    if (open) {
      if (lesson) {
        setTitle(lesson.title);
        setDescription(lesson.description || "");
        setVideoUrl(lesson.video_url || "");
        setVideoDuration(lesson.video_duration?.toString() || "");
        setText(lesson.text || "");
        setLessonOrder(lesson.lesson_order.toString());
      } else {
        // Reset form for new lesson
        resetForm();
      }
    }
  }, [lesson, open]);

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      toast.error("Видео файл 500MB-аас бага байх ёстой. HandBrake ашиглан багасгана уу.");
      e.target.value = "";
      return;
    }

    // Check file type
    if (!file.type.startsWith("video/")) {
      toast.error("Зөвхөн видео файл оруулах боломжтой");
      e.target.value = "";
      return;
    }

    setVideoFile(file);

    // Auto-detect duration
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const durationInSeconds = Math.round(video.duration);
      setVideoDuration(durationInSeconds.toString());
      window.URL.revokeObjectURL(video.src);
      toast.success(`Видео хугацаа: ${Math.floor(durationInSeconds / 60)} мин ${durationInSeconds % 60} сек`);
    };
    video.onerror = () => {
      toast.error("Видео файлыг уншиж чадсангүй");
      setVideoFile(null);
      e.target.value = "";
    };
    video.src = URL.createObjectURL(file);
  };

  const handleRemoveVideoFile = () => {
    setVideoFile(null);
    setVideoDuration("");
    const fileInput = document.getElementById("videoFile") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Хичээлийн нэр заавал оруулна уу");
      return;
    }

    // Video/text is now optional - PDF-only lessons are allowed

    setSaving(true);
    try {
      const data = {
        courseId,
        title,
        description: description || null,
        videoUrl: null, // Always null, we only use file upload
        videoDuration: videoDuration ? parseInt(videoDuration) : null,
        text: text || null,
        lessonOrder: parseInt(lessonOrder) || 1,
      };

      let lessonId: number;

      if (isEdit && lesson?.id) {
        await lessonAPI.update(lesson.id, data);
        lessonId = lesson.id;
        toast.success("Хичээл амжилттай шинэчлэгдлээ!");
      } else {
        const newLesson = await lessonAPI.create(data);
        lessonId = newLesson.id || newLesson.data?.id;
        toast.success("Хичээл амжилттай үүслээ!");
      }

      // Upload video file if provided
      if (videoFile && lessonId) {
        setUploading(true);
        try {
          await lessonAPI.uploadVideo(lessonId, videoFile, (progress) => {
            setUploadProgress(progress);
          });
          toast.success("Видео амжилттай хуулагдлаа!");
        } catch (error) {
          toast.error("Видео хуулахад алдаа гарлаа");
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }

      setOpen(false);
      onSuccess();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Хичээл хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setVideoDuration("");
    setText("");
    setLessonOrder("");
    setPdfMaterials([]);
    setVideoFile(null);
    setUploadProgress(0);
    setUploading(false);

    // Clear file input
    const fileInput = document.getElementById("videoFile") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Хичээл нэмэх
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Хичээл засах" : "Шинэ хичээл үүсгэх"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Хичээлийн мэдээллийг шинэчлэх"
              : "Сургалтдаа шинэ хичээл нэмэх"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Хичээлийн нэр *</Label>
              <Input
                id="title"
                placeholder="жишээ нь: Хувьсагчийн танилцуулга"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Товч тайлбар</Label>
              <Textarea
                id="description"
                placeholder="Хичээлийн товч тайлбар"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonOrder">Хичээлийн дараалал *</Label>
              <Input
                id="lessonOrder"
                type="number"
                min="1"
                placeholder="1"
                value={lessonOrder}
                onChange={(e) => setLessonOrder(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Video Content */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Видео хуулах (заавал биш)</h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoFile">Видео файл (MAX 500MB)</Label>
                <Input
                  id="videoFile"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  disabled={uploading}
                />
                <p className="text-sm text-gray-500">
                  💡 Зөвлөгөө: Том видео файлыг HandBrake программ ашиглан 720p чанарт багасгаарай
                </p>
              </div>

              {videoFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {videoFile.name}
                        </p>
                        <p className="text-xs text-blue-700">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          {videoDuration && ` • ${Math.floor(parseInt(videoDuration) / 60)} мин ${parseInt(videoDuration) % 60} сек`}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoDuration("");
                        const fileInput = document.getElementById("videoFile") as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                      }}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Видео хуулж байна...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </div>
          </div>

          {/* Text Content - Optional */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Нэмэлт текст контент (заавал биш)</h4>
            <p className="text-sm text-gray-500 mb-3">
              Хичээлийн дэлгэрэнгүй тайлбар, код жишээ, тэмдэглэл гэх мэт
            </p>

            <div className="space-y-2">
              <Label htmlFor="text">Хичээлийн текст</Label>
              <Textarea
                id="text"
                placeholder="Хичээлийн дэлгэрэнгүй агуулга..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
              />
            </div>
          </div>

          {/* PDF Materials - Disabled until backend API is ready */}
          {/* {isEdit && lesson?.id && (
            <div className="border-t pt-6">
              <PdfUploadZone
                lessonId={lesson.id}
                materials={pdfMaterials}
                onMaterialsUpdate={setPdfMaterials}
              />
            </div>
          )} */}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={uploading}
            >
              Цуцлах
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              <Save className="mr-2 h-4 w-4" />
              {uploading ? "Видео хуулж байна..." : saving ? "Хадгалж байна..." : isEdit ? "Шинэчлэх" : "Үүсгэх"}
            </Button>
          </div>

          {/* Note for new lessons */}
          {!isEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Анхаар:</strong> Хичээл нь зөвхөн видео, зөвхөн текст, эсвэл хоёуланд нь агуулгатай байж болно.
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
