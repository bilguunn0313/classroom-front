"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { enrollmentAPI } from "@/lib/enrollment";
import { courseAPI } from "@/lib/course";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";

export default function CourseStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.id as string);

  // Fetch course details
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await courseAPI.getById(courseId);
      return response;
    },
  });

  // Fetch students with progress
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["course-students-progress", courseId],
    queryFn: async () => {
      const response =
        await enrollmentAPI.getCourseStudentsWithProgress(courseId);
      return response;
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isLoading = courseLoading || studentsLoading;
  const course = courseData?.data;
  const students = studentsData?.data || [];
  const enrollmentCount = studentsData?.count || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/my-courses")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Буцах
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {course?.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">{course?.description}</p>
          </div>
          <div className="flex items-center gap-2 bg-brand-50 px-4 py-2 rounded-lg">
            <Users className="w-5 h-5 text-brand-600" />
            <span className="text-lg font-semibold text-brand-600">
              {enrollmentCount} Сурагч
            </span>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Элссэн сурагчид</CardTitle>
          <CardDescription>
            Энэ сургалтад элсэгсэн бүх сурагчдын явцыг харах
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Сурагч элсээгүй байна</p>
              <p className="text-gray-400 text-sm mt-2">
                Сурагчид элссэний дараа харагдах болно
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Нэр</TableHead>
                    <TableHead>Имэйл</TableHead>
                    <TableHead>Элсэх огноо</TableHead>
                    <TableHead>Явц</TableHead>
                    <TableHead className="text-right">Гүйцэтгэл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {student.email}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(student.enrolled_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <Progress
                            value={student.progress_percentage}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium text-gray-700 min-w-[45px] text-right">
                            {student.progress_percentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {student.completed_lessons} / {student.total_lessons}{" "}
                        Хичээлүүд
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
