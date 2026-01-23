"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { adminAPI } from "@/lib/admin";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  course_id: z.string().min(1, "Course is required"),
  video_url: z.string().optional(),
  lesson_order: z.string().min(1, "Order is required"),
  published: z.enum(["true", "false"]),
});

type FormValues = z.infer<typeof formSchema>;

interface Lesson {
  id: number;
  title: string;
  description?: string;
  course_id: number;
  video_url?: string;
  lesson_order: number;
  published: boolean;
}

interface EditLessonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: any) => Promise<void>;
  lesson: Lesson | null;
}

export function EditLessonDialog({
  isOpen,
  onClose,
  onSubmit,
  lesson,
}: EditLessonDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      course_id: "",
      video_url: "",
      lesson_order: "1",
      published: "false",
    },
  });

  useEffect(() => {
    if (isOpen) {
      loadCourses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (lesson && isOpen) {
      form.reset({
        title: lesson.title,
        description: lesson.description || "",
        course_id: lesson.course_id.toString(),
        video_url: lesson.video_url || "",
        lesson_order: lesson.lesson_order.toString(),
        published: lesson.published ? "true" : "false",
      });
    }
  }, [lesson, isOpen, form]);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await adminAPI.getCourses({});
      setCourses(response.data || []);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSubmit = async (data: FormValues) => {
    if (!lesson) return;

    try {
      setIsLoading(true);
      const payload = {
        ...data,
        course_id: parseInt(data.course_id),
        lesson_order: parseInt(data.lesson_order),
        published: data.published === "true",
      };
      await onSubmit(lesson.id, payload);
      onClose();
    } catch (error) {
      console.error("Error updating lesson:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
          <DialogDescription>
            Update lesson information. Modify the fields you want to change.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Introduction to Variables"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the lesson..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="course_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingCourses}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingCourses ? "Loading..." : "Select course"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem
                          key={course.id}
                          value={course.id.toString()}
                        >
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lesson_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publish Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="false">Draft</SelectItem>
                      <SelectItem value="true">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
