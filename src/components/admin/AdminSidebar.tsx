"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserContext } from "@/lib/userProvider";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  FolderOpen,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    label: "Lessons",
    href: "/admin/lessons",
    icon: Video,
  },
  {
    label: "Subjects",
    href: "/admin/subjects",
    icon: FolderOpen,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useUserContext();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin/dashboard">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">
            {user?.role}
          </span>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
