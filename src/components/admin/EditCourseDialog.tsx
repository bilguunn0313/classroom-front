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
  subject_id: z.string().min(1, "Subject is required"),
  instructor_name: z.string().optional(),
  published: z.enum(["true", "false"]),
});

type FormValues = z.infer<typeof formSchema>;

interface Course {
  id: number;
  title: string;
  description?: string;
  subject_id: number;
  instructor_name?: string;
  published: boolean;
}

interface EditCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: any) => Promise<void>;
  course: Course | null;
}

export function EditCourseDialog({
  isOpen,
  onClose,
  onSubmit,
  course,
}: EditCourseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      subject_id: "",
      instructor_name: "",
      published: "false",
    },
  });

  useEffect(() => {
    if (isOpen) {
      loadSubjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (course && isOpen) {
      form.reset({
        title: course.title,
        description: course.description || "",
        subject_id: course.subject_id.toString(),
        instructor_name: course.instructor_name || "",
        published: course.published ? "true" : "false",
      });
    }
  }, [course, isOpen, form]);

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await adminAPI.getSubjects({});
      setSubjects(response.data || []);
    } catch (error) {
      console.error("Error loading subjects:", error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubmit = async (data: FormValues) => {
    if (!course) return;

    try {
      setIsLoading(true);
      const payload = {
        ...data,
        subject_id: parseInt(data.subject_id),
        published: data.published === "true",
      };
      await onSubmit(course.id, payload);
      onClose();
    } catch (error) {
      console.error("Error updating course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update course information. Modify the fields you want to change.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Introduction to Programming" {...field} />
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
                      placeholder="Brief description of the course..."
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
              name="subject_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingSubjects}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingSubjects ? "Loading..." : "Select subject"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.title}
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
              name="instructor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
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
