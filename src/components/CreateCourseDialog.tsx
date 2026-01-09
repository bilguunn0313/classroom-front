"use client";

import { useState } from "react";
import { Plus, FolderPlus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubjects } from "@/hooks/useSubjects";
import { subjectAPI } from "@/lib/subject";
import { courseAPI } from "@/lib/course";
import { useUserContext } from "@/lib/userProvider";
import { toast } from "sonner";

interface CreateCourseDialogProps {
  onSuccess?: () => void;
}

export function CreateCourseDialog({ onSuccess }: CreateCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("course");
  const { subjects, loading: subjectsLoading, refetch } = useSubjects();
  const { user } = useUserContext();

  // Subject form state
  const [subjectTitle, setSubjectTitle] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");

  // Course form state
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const resetForms = () => {
    setSubjectTitle("");
    setSubjectDescription("");
    setCourseTitle("");
    setCourseDescription("");
    setSelectedSubjectId("");
    setThumbnailUrl("");
    setActiveTab("course");
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectTitle.trim()) {
      toast.error("Subject title is required");
      return;
    }

    setLoading(true);
    try {
      await subjectAPI.create({
        title: subjectTitle,
        description: subjectDescription || null,
      });
      toast.success("Subject created successfully!");
      await refetch();
      setSubjectTitle("");
      setSubjectDescription("");
      setActiveTab("course");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create subject");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      toast.error("Course title is required");
      return;
    }
    if (!selectedSubjectId) {
      toast.error("Please select a subject");
      return;
    }
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      await courseAPI.create({
        title: courseTitle,
        description: courseDescription || null,
        subjectId: parseInt(selectedSubjectId),
        userId: user.id,
        thumbnailUrl: thumbnailUrl || null,
      });
      toast.success("Course created successfully!");
      resetForms();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Сургалт үүсгэх
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Шинэ сургалт үүсгэх</DialogTitle>
          <DialogDescription>
            Эхлээд сэдэв үүсгээд дараа нь сургалт үүсгэнэ үү
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="course">Сургалт үүсгэх</TabsTrigger>
            <TabsTrigger value="subject">Сэдэв үүсгэх</TabsTrigger>
          </TabsList>

          <TabsContent value="course" className="space-y-4 mt-4">
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Сэдэв сонгох *</Label>
                <Select
                  value={selectedSubjectId}
                  onValueChange={setSelectedSubjectId}
                  disabled={subjectsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Сэдэв сонгоно уу" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.id.toString()}
                      >
                        {subject.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {subjects.length === 0 && !subjectsLoading && (
                  <p className="text-sm text-gray-500">
                    Сэдэв олдсонгүй. "Сэдэв үүсгэх" табаас шинэ сэдэв үүсгэнэ
                    үү.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseTitle">Сургалтын нэр *</Label>
                <Input
                  id="courseTitle"
                  placeholder="жишээ нь: JavaScript-ийн үндэс"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseDescription">Тайлбар</Label>
                <Textarea
                  id="courseDescription"
                  placeholder="Сургалтын тухай товч тайлбар"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">Зургийн URL</Label>
                <Input
                  id="thumbnailUrl"
                  placeholder="https://example.com/image.jpg"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Цуцлах
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Үүсгэж байна..." : "Сургалт үүсгэх"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="subject" className="space-y-4 mt-4">
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subjectTitle">Сэдвийн нэр *</Label>
                <Input
                  id="subjectTitle"
                  placeholder="жишээ нь: Програмчлал"
                  value={subjectTitle}
                  onChange={(e) => setSubjectTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectDescription">Тайлбар</Label>
                <Textarea
                  id="subjectDescription"
                  placeholder="Сэдвийн тухай товч тайлбар"
                  value={subjectDescription}
                  onChange={(e) => setSubjectDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Цуцлах
                </Button>
                <Button type="submit" disabled={loading}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  {loading ? "Үүсгэж байна..." : "Сэдэв үүсгэх"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
