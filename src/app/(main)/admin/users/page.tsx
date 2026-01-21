"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/admin";
import { AdminUser, PaginationData } from "@/types/admin";
import SearchBar from "@/components/admin/SearchBar";
import FilterPanel, { FilterOption } from "@/components/admin/FilterPanel";
import DataTable, { Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import { format } from "date-fns";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter],
    queryFn: async () => {
      const response = await adminAPI.getUsers({
        page,
        limit: 10,
        search: search || undefined,
        role: roleFilter !== "all" ? (roleFilter as "admin" | "user") : undefined,
      });
      return response;
    },
  });

  const filters: FilterOption[] = [
    {
      label: "Role",
      value: "role",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ],
      onChange: setRoleFilter,
      currentValue: roleFilter,
    },
  ];

  const handleReset = () => {
    setRoleFilter("all");
    setSearch("");
    setPage(1);
  };

  const activeFilterCount = (roleFilter !== "all" ? 1 : 0) + (search ? 1 : 0);

  const columns: Column<AdminUser>[] = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "role",
      label: "Role",
      render: (user) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            user.role === "admin"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {user.role}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created At",
      render: (user) => format(new Date(user.created_at), "MMM dd, yyyy"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">
          Manage and view all registered users
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1); // Reset to first page on search
            }}
            placeholder="Search by name or email..."
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
          <p className="text-red-600">Failed to load users</p>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={data?.data || []}
        columns={columns}
        loading={isLoading}
        emptyMessage="No users found"
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
