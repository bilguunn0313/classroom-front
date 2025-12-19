"use client";
// import Banner from "@/components/Banner";
import CourseCard from "@/components/Card";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Courses } from "@/types/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

const App = () => {
  const router = useRouter();
  const [courses] = useState<Courses[]>([
    {
      id: 1,
      title: "Анхан ДУНД Шатны Дүрмийн Цогц хичээл - АНГЛИ ХЭЛ",
      description:
        "Англи хэлний дүрмийг анхан болон дунд шатнаас эхлэн цогцоор нь заах сургалт.",
      departmentId: 1,
      teacherId: 1,
      videos: 51,
      duration: "3 цаг 58 мин",
    },
    {
      id: 2,
      title: "Супер хурдтай Astro frontend фрэймворк",
      description:
        "Astro ашиглан хурдан, SEO friendly frontend хөгжүүлэх бүрэн сургалт.",
      departmentId: 2,
      teacherId: 2,
      videos: 76,
      duration: "13 цаг 3 мин",
    },
    {
      id: 3,
      title: "ChatGPT эхнээс нь дуустал",
      description:
        "ChatGPT болон AI хэрэгслүүдийг бодит ажилд ашиглах практик сургалт.",
      departmentId: 3,
      teacherId: 3,
      videos: 108,
      duration: "22 цаг 33 мин",
    },
    {
      id: 4,
      title: "GraphQL backend + React frontend",
      description:
        "GraphQL backend болон React frontend хамтад нь хөгжүүлэх сургалт.",
      departmentId: 4,
      teacherId: 4,
      videos: 117,
      duration: "19 цаг 25 мин",
    },
    {
      id: 5,
      title: "Компьютерийн сүлжээ",
      description:
        "Компьютерийн сүлжээний суурь ойлголтоос эхлээд ахисан түвшин хүртэл.",
      departmentId: 5,
      teacherId: 5,
      videos: 110,
      duration: "24 цаг 18 мин",
    },
    {
      id: 6,
      title: "TypeScript + Express + React fullstack",
      description:
        "TypeScript ашиглан backend болон frontend бүтээх иж бүрэн сургалт.",
      departmentId: 6,
      teacherId: 6,
      videos: 125,
      duration: "17 цаг 36 мин",
    },
    {
      id: 7,
      title: "Flutter 3.0 мобайл хөгжүүлэлт",
      description: "Flutter ашиглан Android, iOS апп хөгжүүлэх сургалт.",
      departmentId: 7,
      teacherId: 7,
      videos: 103,
      duration: "20 цаг 31 мин",
    },
    {
      id: 8,
      title: "Amazon Web Services (AWS)",
      description:
        "AWS клауд технологийн үндсэн ойлголт болон практик хэрэглээ.",
      departmentId: 8,
      teacherId: 8,
      videos: 101,
      duration: "25 цаг 47 мин",
    },
    {
      id: 9,
      title: "React эхнээс нь дуустал",
      description:
        "React library-г анхан шатнаас ахисан түвшин хүртэл судлах сургалт.",
      departmentId: 2,
      teacherId: 4,
      videos: 120,
      duration: "42 цаг 2 мин",
    },
    {
      id: 10,
      title: "JavaScript эхнээс нь дуустал",
      description: "JavaScript хэлний суурь ойлголтоос гүнзгий түвшин хүртэл.",
      departmentId: 2,
      teacherId: 6,
      videos: 134,
      duration: "52 цаг 21 мин",
    },
    {
      id: 11,
      title: "HTML5 & CSS3 (Sass)",
      description:
        "HTML5, CSS3 болон Sass ашиглан modern веб дизайн хийх сургалт.",
      departmentId: 2,
      teacherId: 1,
      videos: 120,
      duration: "29 цаг 40 мин",
    },
    {
      id: 12,
      title: "NodeJS Express REST API",
      description:
        "NodeJS + Express ашиглан REST API backend хөгжүүлэх сургалт.",
      departmentId: 4,
      teacherId: 3,
      videos: 110,
      duration: "33 цаг 24 мин",
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 mx-auto">
      {/* <Banner /> */}

      <main className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-12">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => router.push(`/course/${course.id}`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
