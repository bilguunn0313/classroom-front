"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUserContext } from "@/lib/userProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { enrollmentAPI } from "@/lib/enrollment";
import {
  GraduationCap,
  UtensilsCrossed,
  ArrowRight,
  LogOut,
  BookOpen,
  Thermometer,
  Settings,
  ClipboardList,
} from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  user: "Хэрэглэгч",
  admin: "Админ",
  chief: "Менежер",
  supervisor: "Хянагч",
};


function formatDate(): string {
  const now = new Date();
  const days = [
    "Ням",
    "Даваа",
    "Мягмар",
    "Лхагва",
    "Пүрэв",
    "Баасан",
    "Бямба",
  ];
  const months = [
    "1-р сар",
    "2-р сар",
    "3-р сар",
    "4-р сар",
    "5-р сар",
    "6-р сар",
    "7-р сар",
    "8-р сар",
    "9-р сар",
    "10-р сар",
    "11-р сар",
    "12-р сар",
  ];
  return `${now.getFullYear()} оны ${months[now.getMonth()]}ын ${now.getDate()}, ${days[now.getDay()]} гараг`;
}

export default function HomePage() {
  const { user, logout } = useUserContext();
  const [enrolledCount, setEnrolledCount] = useState<number | null>(null);

  useEffect(() => {
    enrollmentAPI
      .getMyCourses()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setEnrolledCount(res.data.length);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        {/* ── Main ─────────────────────────────────────────────────────── */}
        <main className="flex-1 container mx-auto px-6 py-10 max-w-5xl">
          {/* Greeting */}
          <div className="flex items-start justify-between mb-10 animate-fade-in">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-2 py-0.5">
                  {user ? (ROLE_LABEL[user.role] ?? "Хэрэглэгч") : ""}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatDate()}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Сайн байна уу, {user?.name ?? "..."}
              </h1>
              {enrolledCount !== null && enrolledCount > 0 && (
                <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                  {enrolledCount} сургалтанд бүртгэлтэй
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              Гарах
            </button>
          </div>

          {/* ── Navigation Cards ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            <Link
              href="/course"
              className="group rounded-xl border bg-card p-9 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up delay-100"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </div>
              <h2 className="font-bold text-base mb-1.5">Сургалт</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Видео хичээл үзэх, мэдлэгээ дээшлүүлэх
              </p>
            </Link>

            <Link
              href="/menu"
              className="group rounded-xl border bg-card p-9 hover:border-orange-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up delay-200"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <UtensilsCrossed className="h-6 w-6 text-orange-500" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </div>
              <h2 className="font-bold text-base mb-1.5">Хоолны цэс</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Өдрийн хоолны цэс харах, хариу өгөх
              </p>
            </Link>

            <Link
              href="/temperature"
              className="group rounded-xl border bg-card p-9 hover:border-cyan-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up delay-300"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Thermometer className="h-6 w-6 text-cyan-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </div>
              <h2 className="font-bold text-base mb-1.5">Температур</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Агуулахын температурын бүртгэл харах
              </p>
            </Link>

            {user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                className="group rounded-xl border bg-card p-9 hover:border-purple-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up delay-400"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </div>
                <h2 className="font-bold text-base mb-1.5">Админ хэсэг</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Хэрэглэгч, сургалт, хичээл удирдах
                </p>
              </Link>
            )}

            {(user?.role === "admin" || user?.role === "chief") && (
              <Link
                href="/menu/manage"
                className="group rounded-xl border bg-card p-9 hover:border-green-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up delay-500"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <ClipboardList className="h-6 w-6 text-green-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </div>
                <h2 className="font-bold text-base mb-1.5">Цэс удирдах</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Хоолны цэс нэмэх, засах, устгах
                </p>
              </Link>
            )}
          </div>

        </main>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className="py-4 px-6 text-center text-xs text-muted-foreground border-t">
          © {new Date().getFullYear()} Cosmo
        </footer>
      </div>
    </ProtectedRoute>
  );
}
