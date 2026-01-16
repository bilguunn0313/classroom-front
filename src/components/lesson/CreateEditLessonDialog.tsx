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
import { Save, Plus } from "lucide-react";
import { toast } from "sonner";
import { lessonAPI } from "@/lib/lesson";
import { Lesson } from "@/types/schema.types";
import { PdfUploadZone } from "./PdfUploadZone";

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

        // Load PDF materials
        if (lesson.id) {
          fetch(`/api/pdf-materials/lesson/${lesson.id}`, {
            credentials: "include",
          })
            .then((res) => res.json())
            .then((result) => setPdfMaterials(result.data || []))
            .catch(console.error);
        }
      } else {
        // Reset form for new lesson
        resetForm();
      }
    }
  }, [lesson, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    if (!videoUrl.trim() && !text.trim()) {
      toast.error("Please provide either a video URL or text content");
      return;
    }

    setSaving(true);
    try {
      const data = {
        courseId,
        title,
        description: description || null,
        videoUrl: videoUrl || null,
        videoDuration: videoDuration ? parseInt(videoDuration) : null,
        text: text || null,
        lessonOrder: parseInt(lessonOrder) || 1,
      };

      if (isEdit && lesson?.id) {
        await lessonAPI.update(lesson.id, data);
        toast.success("Lesson updated successfully!");
      } else {
        await lessonAPI.create(data);
        toast.success("Lesson created successfully!");
      }

      setOpen(false);
      onSuccess();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save lesson");
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Lesson
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Lesson" : "Create New Lesson"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update lesson details"
              : "Add a new lesson to your course"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Lesson Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Variables"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the lesson"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonOrder">Lesson Order *</Label>
              <Input
                id="lessonOrder"
                type="number"
                min="1"
                value={lessonOrder}
                onChange={(e) => setLessonOrder(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Video Content */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Video Content</h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>

              {videoUrl && (
                <div className="space-y-2">
                  <Label>Video Preview</Label>
                  <div className="bg-black rounded-lg overflow-hidden aspect-video">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full"
                      onError={() => toast.error("Invalid video URL")}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="videoDuration">Duration (seconds)</Label>
                <Input
                  id="videoDuration"
                  type="number"
                  min="0"
                  placeholder="120"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Example: 2 minutes = 120 seconds
                </p>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Text Content</h4>

            <div className="space-y-2">
              <Label htmlFor="text">Lesson Text</Label>
              <Textarea
                id="text"
                placeholder="Detailed lesson content..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
              />
            </div>
          </div>

          {/* PDF Materials - Only for editing */}
          {isEdit && lesson?.id && (
            <div className="border-t pt-6">
              <PdfUploadZone
                lessonId={lesson.id}
                materials={pdfMaterials}
                onMaterialsUpdate={setPdfMaterials}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>

          {/* Note for new lessons */}
          {!isEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Note:</strong> You can add PDF materials after
                creating the lesson
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
