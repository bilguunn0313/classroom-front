"use client";
// import Banner from "@/components/Banner";
import CourseCard from "@/components/Card";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useSubjectWithCourse } from "@/hooks/useSubjectWithCourse";
import { useRouter } from "next/navigation";

const App = () => {
  const router = useRouter();
  const { data, error, loading } = useSubjectWithCourse();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Header />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {data.map(({ subject, course }) => (
          <section key={subject.id} className="mb-12">
            <h2 className="text-3xl font-bold mb-2">{subject.title}</h2>
            {subject.description && (
              <p className="text-gray-600 mb-6">{subject.description}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {course.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => router.push(`/course/${course.id}`)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default App;
