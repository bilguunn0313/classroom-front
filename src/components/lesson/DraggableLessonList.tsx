"use client";

import { useState } from "react";
import {
  GripVertical,
  Video,
  FileText,
  Eye,
  EyeOff,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { lessonAPI } from "@/lib/lesson";

interface Lesson {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  video_url: string | null;
  video_duration: number | null;
  text: string | null;
  lesson_order: number;
  published: boolean;
}

interface DraggableLessonListProps {
  lessons: Lesson[];
  courseId: number;
  onLessonsReorder: (lessons: Lesson[]) => void;
  onEditLesson: (lessonId: number) => void;
  onDeleteLesson: (lessonId: number) => void;
  onTogglePublish: (lesson: Lesson) => void;
  formatDuration: (seconds: number | null) => string;
}

export function DraggableLessonList({
  lessons,
  courseId,
  onLessonsReorder,
  onEditLesson,
  onDeleteLesson,
  onTogglePublish,
  formatDuration,
}: DraggableLessonListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";

    // Add drag image
    const target = e.currentTarget as HTMLElement;
    const clone = target.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.top = "-9999px";
    document.body.appendChild(clone);
    e.dataTransfer.setDragImage(clone, 0, 0);
    setTimeout(() => document.body.removeChild(clone), 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // Only clear if we've actually left the element bounds
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      resetDragState();
      return;
    }

    // Create new array with reordered lessons
    const newLessons = [...lessons];
    const [draggedLesson] = newLessons.splice(draggedIndex, 1);
    newLessons.splice(dropIndex, 0, draggedLesson);

    // Update lesson_order for all lessons
    const updatedLessons = newLessons.map((lesson, index) => ({
      ...lesson,
      lesson_order: index + 1,
    }));

    // Optimistically update UI
    onLessonsReorder(updatedLessons);
    resetDragState();

    // Save to backend
    try {
      setSaving(true);
      await lessonAPI.reorder(
        courseId,
        updatedLessons.map((l) => l.id)
      );
      toast.success("Lessons reordered successfully");
    } catch (error) {
      toast.error("Failed to save lesson order");
      // Revert on error
      onLessonsReorder(lessons);
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  const resetDragState = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);
  };

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-4">Одоогоор хичээл байхгүй байна</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 relative">
      {saving && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm text-gray-600">Saving order...</p>
          </div>
        </div>
      )}

      {lessons.map((lesson, index) => {
        const isBeingDragged = draggedIndex === index;
        const isDropTarget = dragOverIndex === index;
        const showDropIndicator =
          isDragging && isDropTarget && draggedIndex !== index;

        return (
          <div key={lesson.id} className="relative">
            {/* Drop indicator line above */}
            {showDropIndicator &&
              draggedIndex !== null &&
              index < draggedIndex && (
                <div className="absolute -top-1.5 left-0 right-0 h-0.5 bg-blue-600 rounded-full z-10">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              )}

            <div
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                border border-gray-200 rounded-lg p-4 
                transition-all duration-200
                ${
                  isBeingDragged
                    ? "opacity-40 scale-95"
                    : "opacity-100 scale-100"
                }
                ${
                  isDragging && !isBeingDragged
                    ? "hover:border-blue-300 hover:bg-blue-50/50"
                    : "hover:border-gray-300"
                }
                ${
                  isDropTarget && !isBeingDragged
                    ? "border-blue-400 bg-blue-50/30"
                    : "bg-white"
                }
                cursor-move
              `}
            >
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="mt-1 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-5 w-5" />
                </div>

                {/* Lesson Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          Хичээл {lesson.lesson_order}
                        </span>
                        {lesson.published ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Eye className="mr-1 h-3 w-3" />
                            Нийтлэгдсэн
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <EyeOff className="mr-1 h-3 w-3" />
                            Ноорог
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Lesson Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    {lesson.video_url && (
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        <span>{formatDuration(lesson.video_duration)}</span>
                      </div>
                    )}
                    {lesson.text && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>Текст агуулга</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditLesson(lesson.id);
                      }}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Засах
                    </Button>

                    {!lesson.published && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePublish(lesson);
                        }}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Нийтлэх
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLesson(lesson.id);
                      }}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Устгах
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Drop indicator line below */}
            {showDropIndicator &&
              draggedIndex !== null &&
              index > draggedIndex && (
                <div className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-blue-600 rounded-full z-10">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
}
