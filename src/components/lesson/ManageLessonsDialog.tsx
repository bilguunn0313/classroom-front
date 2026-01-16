// components/lesson/ManageLessonsDialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { Lesson } from "@/types/schema.types";
import { lessonAPI } from "@/lib/lesson";
import { toast } from "sonner";
import { CreateEditLessonDialog } from "./CreateEditLessonDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ManageLessonsDialogProps {
  courseId: number;
  lessons: Lesson[];
  onLessonsUpdate: () => void;
  formatDuration: (seconds: number | null) => string;
}

export function ManageLessonsDialog({
  courseId,
  lessons,
  onLessonsUpdate,
  formatDuration,
}: ManageLessonsDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await lessonAPI.delete(id);
      toast.success("Lesson deleted successfully");
      onLessonsUpdate();
    } catch (error) {
      toast.error("Failed to delete lesson");
    } finally {
      setDeleteId(null);
    }
  };

  const handlePublish = async (lesson: Lesson) => {
    try {
      if (lesson.published) {
        toast.error("Cannot unpublish lessons yet");
        return;
      }
      await lessonAPI.publish(lesson.id);
      toast.success("Lesson published successfully");
      onLessonsUpdate();
    } catch (error) {
      toast.error("Failed to publish lesson");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Manage Lessons
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Course Lessons</DialogTitle>
            <DialogDescription>
              Add, edit, reorder, or delete lessons for this course
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
              </p>
              <CreateEditLessonDialog
                courseId={courseId}
                onSuccess={() => {
                  onLessonsUpdate();
                }}
                trigger={
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                }
              />
            </div>

            {/* Lessons List */}
            {lessons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No lessons yet</p>
                <p className="text-sm mt-2">
                  Click "Add Lesson" to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    {/* Order Number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {lesson.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>{formatDuration(lesson.video_duration)}</span>
                        {lesson.published ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Published
                          </span>
                        ) : (
                          <span className="text-yellow-600">Draft</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <CreateEditLessonDialog
                        courseId={courseId}
                        lesson={lesson}
                        onSuccess={() => {
                          onLessonsUpdate();
                        }}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />

                      {!lesson.published && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePublish(lesson)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(lesson.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The lesson and all its data will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
