"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/admin";
import { AdminLesson, PaginationData } from "@/types/admin";
import SearchBar from "@/components/admin/SearchBar";
import FilterPanel, { FilterOption } from "@/components/admin/FilterPanel";
import DataTable, { Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

export default function AdminLessonsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-lessons", page, search, publishedFilter],
    queryFn: async () => {
      const response = await adminAPI.getLessons({
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

  const columns: Column<AdminLesson>[] = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "title",
      label: "Title",
      render: (lesson) => (
        <div>
          <p className="font-medium text-gray-900">{lesson.title}</p>
          {lesson.description && (
            <p className="text-xs text-gray-500 truncate max-w-xs">
              {lesson.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "course_title",
      label: "Course",
    },
    {
      key: "video_url",
      label: "Video",
      render: (lesson) =>
        lesson.video_url ? (
          <a
            href={lesson.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="text-xs">View</span>
          </a>
        ) : (
          <span className="text-gray-400 text-xs">No video</span>
        ),
    },
    {
      key: "order",
      label: "Order",
    },
    {
      key: "published",
      label: "Status",
      render: (lesson) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            lesson.published
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {lesson.published ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created At",
      render: (lesson) => format(new Date(lesson.created_at), "MMM dd, yyyy"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lesson Management</h1>
        <p className="text-gray-500 mt-1">Manage and view all lessons</p>
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
            placeholder="Search lessons by title or description..."
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
          <p className="text-red-600">Failed to load lessons</p>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={data?.data || []}
        columns={columns}
        loading={isLoading}
        emptyMessage="No lessons found"
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
