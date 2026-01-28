"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUserContext } from "@/lib/userProvider";
import { courseAPI } from "@/lib/course";
import { useSubjects } from "@/hooks/useSubjects";
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
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string);
  const { user } = useUserContext();
  const { subjects, loading: subjectsLoading } = useSubjects();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await courseAPI.getById(courseId);

        // Handle different response structures
        const course = response?.data || response;

        // Check if we got valid course data
        if (!course || !course.title) {
          toast.error("Сургалт олдсонгүй эсвэл буруу мэдээлэл");
          router.push("/my-courses");
          return;
        }

        // Check if user owns this course
        // if (course.user_id !== user?.id && user?.role !== "admin") {
        //   toast.error("Та энэ сургалтыг засах эрхгүй байна");
        //   router.push("/my-courses");
        //   return;
        // }

        setCourseTitle(course.title);
        setCourseDescription(course.description || "");
        setSelectedSubjectId(course.subject_id.toString());
        setThumbnailUrl(course.thumbnail_url || "");
      } catch (error: any) {
        console.error("Error loading course:", error);

        // Handle specific error cases
        if (error.response?.status === 403 || error.response?.status === 401) {
          toast.error("Та энэ сургалтыг засах эрхгүй байна");
        } else if (error.response?.status === 404) {
          toast.error("Сургалт олдсонгүй");
        } else {
          toast.error(error.response?.data?.message || "Сургалт ачаалахад алдаа гарлаа");
        }

        router.push("/my-courses");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && user) {
      fetchCourse();
    }
  }, [courseId, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseTitle.trim()) {
      toast.error("Сургалтын нэр заавал оруулна уу");
      return;
    }
    if (!selectedSubjectId) {
      toast.error("Сэдэв сонгоно уу");
      return;
    }

    setSaving(true);
    try {
      await courseAPI.updateCourse(courseId, {
        title: courseTitle,
        description: courseDescription || null,
        subjectId: parseInt(selectedSubjectId),
        userId: user!.id,
        thumbnailUrl: thumbnailUrl || null,
      });
      toast.success("Сургалт амжилттай шинэчлэгдлээ!");
      router.push("/my-courses");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Сургалт шинэчлэхэд алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
          <Header />
          <div className="container mx-auto px-4 py-12 flex justify-center flex-grow">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
        <Header />

        <main className="container mx-auto px-4 py-12 flex-grow">
          <div className="max-w-3xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/my-courses")}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Буцах
            </Button>

            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Сургалт засах
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                    rows={6}
                  />
                </div>

                {/* THUMBNAIL FEATURE - COMMENTED OUT
                    Uncomment this section if you want to allow users to upload custom thumbnails.
                    Otherwise, the Card component will use beautiful dynamic gradients based on course ID.
                */}
                {/* <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">Зургийн URL</Label>
                  <Input
                    id="thumbnailUrl"
                    placeholder="https://example.com/image.jpg"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                  />
                  {thumbnailUrl && (
                    <div className="mt-2">
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-course.jpg";
                        }}
                      />
                    </div>
                  )}
                </div> */}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/my-courses")}
                  >
                    Цуцлах
                  </Button>
                  <Button type="submit" disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Хадгалж байна..." : "Хадгалах"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
