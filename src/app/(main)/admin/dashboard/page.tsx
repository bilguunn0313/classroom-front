"use client";

import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/admin";
import StatsCard from "@/components/admin/StatsCard";
import { Users, BookOpen, Video, FolderOpen } from "lucide-react";
import { DashboardStats } from "@/types/admin";

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const response = await adminAPI.getDashboardStats();
      return response.data as DashboardStats;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow p-6 border border-gray-200 h-32 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={data?.totalUsers || 0}
          icon={Users}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Total Courses"
          value={data?.totalCourses || 0}
          icon={BookOpen}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Total Lessons"
          value={data?.totalLessons || 0}
          icon={Video}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Total Subjects"
          value={data?.totalSubjects || 0}
          icon={FolderOpen}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Users
        </h2>
        <div className="space-y-3">
          {data?.recentUsers && data.recentUsers.length > 0 ? (
            data.recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent users</p>
          )}
        </div>
      </div>

      {/* Recent Courses */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Courses
        </h2>
        <div className="space-y-3">
          {data?.recentCourses && data.recentCourses.length > 0 ? (
            data.recentCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{course.title}</p>
                  <p className="text-sm text-gray-500">
                    {course.subject_name} • {course.teacher_name}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    course.published
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {course.published ? "Published" : "Draft"}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent courses</p>
          )}
        </div>
      </div>
    </div>
  );
}
