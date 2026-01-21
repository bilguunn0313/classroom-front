"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/admin";
import { AdminSubject, PaginationData } from "@/types/admin";
import SearchBar from "@/components/admin/SearchBar";
import DataTable, { Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import { format } from "date-fns";

export default function AdminSubjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-subjects", page, search],
    queryFn: async () => {
      const response = await adminAPI.getSubjects({
        page,
        limit: 10,
        search: search || undefined,
      });
      return response;
    },
  });

  const columns: Column<AdminSubject>[] = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "title",
      label: "Title",
      render: (subject) => (
        <div>
          <p className="font-medium text-gray-900">{subject.title}</p>
          {subject.description && (
            <p className="text-xs text-gray-500 truncate max-w-md">
              {subject.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "course_count",
      label: "Courses",
      render: (subject) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
          {subject.course_count} {subject.course_count === 1 ? "course" : "courses"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created At",
      render: (subject) =>
        format(new Date(subject.created_at), "MMM dd, yyyy"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Subject Management
        </h1>
        <p className="text-gray-500 mt-1">Manage and view all subjects</p>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search subjects by title or description..."
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load subjects</p>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={data?.data || []}
        columns={columns}
        loading={isLoading}
        emptyMessage="No subjects found"
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
