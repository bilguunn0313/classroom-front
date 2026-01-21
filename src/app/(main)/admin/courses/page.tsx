"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/admin";
import { AdminCourse, PaginationData } from "@/types/admin";
import SearchBar from "@/components/admin/SearchBar";
import FilterPanel, { FilterOption } from "@/components/admin/FilterPanel";
import DataTable, { Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import { format } from "date-fns";

export default function AdminCoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-courses", page, search, publishedFilter],
    queryFn: async () => {
      const response = await adminAPI.getCourses({
        page,
        limit: 10,
        search: search || undefined,
        published:
          publishedFilter === "all"
            ? undefined
            : publishedFilter === "published",
      });
      return response;
    },
  });

  const filters: FilterOption[] = [
    {
      label: "Status",
      value: "published",
      options: [
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
      ],
      onChange: setPublishedFilter,
      currentValue: publishedFilter,
    },
  ];

  const handleReset = () => {
    setPublishedFilter("all");
    setSearch("");
    setPage(1);
  };

  const activeFilterCount =
    (publishedFilter !== "all" ? 1 : 0) + (search ? 1 : 0);

  const columns: Column<AdminCourse>[] = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "title",
      label: "Title",
      render: (course) => (
        <div>
          <p className="font-medium text-gray-900">{course.title}</p>
          {course.description && (
            <p className="text-xs text-gray-500 truncate max-w-xs">
              {course.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "subject_name",
      label: "Subject",
    },
    {
      key: "teacher_name",
      label: "Teacher",
    },
    {
      key: "published",
      label: "Status",
      render: (course) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            course.published
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {course.published ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created At",
      render: (course) => format(new Date(course.created_at), "MMM dd, yyyy"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
        <p className="text-gray-500 mt-1">Manage and view all courses</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search courses by title or description..."
          />
        </div>
        <FilterPanel
          filters={filters}
          onReset={handleReset}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load courses</p>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={data?.data || []}
        columns={columns}
        loading={isLoading}
        emptyMessage="No courses found"
      />

      {/* Pagination */}
      {data?.pagination && (
        <Pagination
          pagination={data.pagination as PaginationData}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
