"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { enrollmentAPI } from "@/lib/enrollment";
import { toast } from "sonner";
import { Loader2, BookOpen, Clock, User } from "lucide-react";

interface EnrollCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course: {
    id: number;
    title: string;
    description?: string | null;
    instructor_name?: string;
    lesson_count?: number;
    total_duration?: string;
  };
}

export function EnrollCourseDialog({
  isOpen,
  onClose,
  onSuccess,
  course,
}: EnrollCourseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    try {
      setIsLoading(true);
      await enrollmentAPI.enroll(course.id);
      toast.success("Сургалтанд амжилттай бүртгэгдлээ!");
      onSuccess();
      onClose();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Бүртгэхэд алдаа гарлаа";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Сургалтанд бүртгүүлэх</DialogTitle>
          <DialogDescription>
            Та энэ сургалтанд бүртгүүлэхдээ итгэлтэй байна уу?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
            {course.description && (
              <p className="text-sm text-gray-600 mb-3">{course.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {course.instructor_name && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{course.instructor_name}</span>
                </div>
              )}
              {course.lesson_count !== undefined && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.lesson_count} хичээл</span>
                </div>
              )}
              {course.total_duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.total_duration}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Бүртгүүлсний дараа та энэ сургалтын бүх хичээлүүдэд хандах боломжтой
            болно.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Цуцлах
          </Button>
          <Button onClick={handleEnroll} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Бүртгэж байна...
              </>
            ) : (
              "Бүртгүүлэх"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
