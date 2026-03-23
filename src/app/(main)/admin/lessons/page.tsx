"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/admin";
import { AdminLesson, PaginationData } from "@/types/admin";
import SearchBar from "@/components/admin/SearchBar";
import FilterPanel, { FilterOption } from "@/components/admin/FilterPanel";
import DataTable, { Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EditLessonDialog } from "@/components/admin/EditLessonDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";

export default function AdminLessonsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<AdminLesson | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleCreate = () => {
    setCreateDialogOpen(true);
  };

  const handleEdit = (lesson: AdminLesson) => {
    setSelectedLesson(lesson);
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedLesson) return;

    setIsDeleting(true);
    try {
      await adminAPI.deleteLesson(selectedLesson.id);
      toast.success("Хичээл амжилттай устгагдлаа");
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      setDeleteDialogOpen(false);
      setSelectedLesson(null);
    } catch (error) {
      toast.error("Хичээл устгахад алдаа гарлаа");
    } finally {
      setIsDeleting(false);
    }
  };

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
          <p className="font-medium text-foreground">{lesson.title}</p>
        </div>
      ),
    },
    {
      key: "course_title",
      label: "Course",
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
    {
      key: "actions",
      label: "Actions",
      render: (lesson) => (
        <div className="flex gap-2">
          {/* <button
            onClick={() => handleEdit(lesson)}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            title="Edit lesson"
          >
            <Pencil className="w-4 h-4" />
          </button> */}
          <button
            onClick={() => {
              setSelectedLesson(lesson);
              setDeleteDialogOpen(true);
            }}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
            title="Delete lesson"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Lesson Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage and view all lessons</p>
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

      <EditLessonDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        lesson={
          selectedLesson
            ? {
                ...selectedLesson,
                lesson_order: selectedLesson.order,
                description: selectedLesson.description ?? undefined,
                video_url: selectedLesson.video_url ?? undefined,
              }
            : null
        }
        onSubmit={async (data) => {
          await queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
        }}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Lesson"
        description={`Are you sure you want to delete "${selectedLesson?.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
