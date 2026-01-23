"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/admin";
import { AdminCourse, PaginationData } from "@/types/admin";
import SearchBar from "@/components/admin/SearchBar";
import FilterPanel, { FilterOption } from "@/components/admin/FilterPanel";
import DataTable, { Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import { EditCourseDialog } from "@/components/admin/EditCourseDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleCreate = async (data: any) => {
    try {
      await adminAPI.createCourse(data);
      toast.success("Course created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create course");
      throw error;
    }
  };

  const handleEdit = async (id: number, data: any) => {
    try {
      await adminAPI.updateCourse(id, data);
      toast.success("Course updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update course");
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedCourse) return;

    try {
      setIsDeleting(true);
      await adminAPI.deleteCourse(selectedCourse.id);
      toast.success("Course deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
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
      key: "user_name",
      label: "Instructor",
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
    {
      key: "actions",
      label: "Actions",
      render: (course) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCourse(course);
              setEditDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCourse(course);
              setDeleteDialogOpen(true);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Course Management
          </h1>
          <p className="text-gray-500 mt-1">Manage and view all courses</p>
        </div>
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

      {/* Dialogs */}

      <EditCourseDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedCourse(null);
        }}
        onSubmit={handleEdit}
        course={selectedCourse}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleDelete}
        title="Delete Course"
        description={`Are you sure you want to delete course "${selectedCourse?.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
