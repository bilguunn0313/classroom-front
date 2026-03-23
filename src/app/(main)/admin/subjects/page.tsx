"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/admin";
import { AdminSubject, PaginationData } from "@/types/admin";
import SearchBar from "@/components/admin/SearchBar";
import DataTable, { Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import { EditSubjectDialog } from "@/components/admin/EditSubjectDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSubjectsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<AdminSubject | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleCreate = async (data: any) => {
    try {
      await adminAPI.createSubject(data);
      toast.success("Сэдэв амжилттай үүслээ");
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Сэдэв үүсгэхэд алдаа гарлаа");
      throw error;
    }
  };

  const handleEdit = async (id: number, data: any) => {
    try {
      await adminAPI.updateSubject(id, data);
      toast.success("Сэдэв амжилттай шинэчлэгдлээ");
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Сэдэв шинэчлэхэд алдаа гарлаа");
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedSubject) return;

    try {
      setIsDeleting(true);
      await adminAPI.deleteSubject(selectedSubject.id);
      toast.success("Сэдэв амжилттай устгагдлаа");
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      setDeleteDialogOpen(false);
      setSelectedSubject(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Сэдэв устгахад алдаа гарлаа");
    } finally {
      setIsDeleting(false);
    }
  };

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
          <p className="font-medium text-foreground">{subject.title}</p>
          {subject.description && (
            <p className="text-xs text-muted-foreground truncate max-w-md">
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
        <span className="px-2 py-1 text-xs font-medium bg-brand-100 text-brand-800 rounded">
          {subject.course_count}{" "}
          {subject.course_count === 1 ? "course" : "courses"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created At",
      render: (subject) => format(new Date(subject.created_at), "MMM dd, yyyy"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (subject) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedSubject(subject);
              setEditDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedSubject(subject);
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Subject Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage and view all subjects</p>
        </div>
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

      <EditSubjectDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedSubject(null);
        }}
        onSubmit={handleEdit}
        subject={selectedSubject}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedSubject(null);
        }}
        onConfirm={handleDelete}
        title="Delete Subject"
        description={`Are you sure you want to delete subject "${selectedSubject?.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
