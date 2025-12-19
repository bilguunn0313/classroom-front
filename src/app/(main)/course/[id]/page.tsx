"use client";
import { Courses } from "@/types/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const courseDetail = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<Courses | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const data = await courseAPI.getCourseById(courseId);
      setCourse(data);
    } catch (error) {
      console.log("Error fetching course details:", error);

      setCourse({
        id: courseId,
        title: "Javascript Basics",
        description:
          "Learn the fundamentals of JavaScript, the programming language of the web. This course covers variables, data types, functions, loops, and more.",
        department: "Software Department",
        teacher: "Bilguun",
        videos: 3,
        duration: "1 цаг 30 мин",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <p>{course?.title}</p>
        <p>{course?.description}</p>
        <p>{course?.department}</p>
        <p>{course?.teacher}</p>

        <p>{course?.duration}</p>
      </div>
    </div>
  );
};

export default courseDetail;
