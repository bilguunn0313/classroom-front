"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUserContext } from "@/lib/userProvider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { PdfUploadZone } from "@/components/lesson/PdfUploadZone";
import { courseAPI } from "@/lib/course";
import { lessonAPI } from "@/lib/lesson";

interface PdfMaterial {
  id: number;
  lesson_id: number;
  title: string;
  file_url: string;
  file_size: number | null;
  uploaded_at: string;
}

export default function CreateEditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string);
  const lessonId = params.lessonId ? parseInt(params.lessonId as string) : null;
  const isEdit = !!lessonId;

  const { user } = useUserContext();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [text, setText] = useState("");
  const [lessonOrder, setLessonOrder] = useState("");
  const [pdfMaterials, setPdfMaterials] = useState<PdfMaterial[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const course = await courseAPI.getById(courseId);
        if (course.user_id !== user?.id && user?.role !== "admin") {
          toast.error("You don't have permission");
          router.push("/my-courses");
          return;
        }

        if (isEdit && lessonId) {
          const lesson = await lessonAPI.getById(lessonId);
          setTitle(lesson.title);
          setDescription(lesson.description || "");
          setVideoUrl(lesson.video_url || "");
          setVideoDuration(lesson.video_duration?.toString() || "");
          setText(lesson.text || "");
          setLessonOrder(lesson.lesson_order.toString());

          // Fetch PDF materials for this lesson
          try {
            const response = await fetch(
              `/api/pdf-materials/lesson/${lessonId}`,
              { credentials: "include" },
            );
            if (response.ok) {
              const result = await response.json();
              setPdfMaterials(result.data || []);
            }
          } catch (error) {
            console.error("Failed to load PDF materials:", error);
          }
        } else {
          const lessons = await lessonAPI.getByCourse(courseId);
          setLessonOrder((lessons.length + 1).toString());
        }
      } catch (error) {
        toast.error("Failed to load data");
        router.push("/my-courses");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && user) {
      fetchData();
    }
  }, [courseId, lessonId, isEdit, user, router]);

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
        lessonOrder: parseInt(lessonOrder),
      };

      if (isEdit && lessonId) {
        await lessonAPI.update(lessonId, data);
        toast.success("Lesson updated successfully!");
      } else {
        await lessonAPI.create(data);
        toast.success("Lesson created successfully!");
      }

      router.push(`/course/${courseId}/lessons`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
          <Header />
          <div className="container mx-auto px-4 py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Header />

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push(`/course/${courseId}/lessons`)}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Буцах
            </Button>

            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {isEdit ? "Хичээл засах" : "Шинэ хичээл нэмэх"}
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-2">
                  <Label htmlFor="title">Хичээлийн нэр *</Label>
                  <Input
                    id="title"
                    placeholder="жишээ нь: JavaScript хувьсагчид"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Тайлбар</Label>
                  <Textarea
                    id="description"
                    placeholder="Хичээлийн тухай товч тайлбар"
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
                    value={lessonOrder}
                    onChange={(e) => setLessonOrder(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Хичээл хэддүгээр байрлалд байх вэ
                  </p>
                </div>

                {/* Video Content */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Видео агуулга</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">Видео URL</Label>
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
                        <Label>Видео урьдчилан үзэх</Label>
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
                      <Label htmlFor="videoDuration">
                        Видео үргэлжлэх хугацаа (секунд)
                      </Label>
                      <Input
                        id="videoDuration"
                        type="number"
                        min="0"
                        placeholder="120"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(e.target.value)}
                      />
                      <p className="text-sm text-gray-500">
                        Жишээ: 2 минут = 120 секунд
                      </p>
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Текст агуулга</h3>

                  <div className="space-y-2">
                    <Label htmlFor="text">Хичээлийн текст</Label>
                    <Textarea
                      id="text"
                      placeholder="Хичээлийн дэлгэрэнгүй агуулга..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={10}
                    />
                  </div>
                </div>

                {/* PDF Materials - Only show when editing */}
                {lessonId && (
                  <div className="border-t pt-6">
                    <PdfUploadZone
                      lessonId={lessonId}
                      materials={pdfMaterials}
                      onMaterialsUpdate={setPdfMaterials}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/course/${courseId}/lessons`)}
                  >
                    Цуцлах
                  </Button>
                  <Button type="submit" disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Хадгалж байна..." : "Хадгалах"}
                  </Button>
                </div>

                {/* Note about PDFs */}
                {!isEdit && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Анхаар:</strong> Хичээл үүсгэсний дараа PDF
                      материал нэмэх боломжтой болно
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
