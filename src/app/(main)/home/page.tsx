"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUserContext } from "@/lib/userProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useTodayMenu } from "@/hooks/useMenu";
import { enrollmentAPI } from "@/lib/enrollment";
import {
  GraduationCap,
  UtensilsCrossed,
  ArrowRight,
  LogOut,
  BookOpen,
  Coffee,
  CookingPot,
  Loader2,
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

const ITEM_TYPE_META: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  meal_1: { label: "Үндсэн хоол", icon: CookingPot },
  meal_2: { label: "Хоёр дахь хоол", icon: UtensilsCrossed },
  drink: { label: "Уух зүйл", icon: Coffee },
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
  const { menu, loading: menuLoading } = useTodayMenu();
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
        <main className="flex-1 container mx-auto px-6 py-10 max-w-4xl">
          {/* Greeting */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-2 py-0.5">
                  {user ? (ROLE_LABEL[user.role] ?? "Хэрэглэгч") : ""}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatDate()}
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <Link
              href="/course"
              className="group rounded-lg border bg-card p-6 hover:border-blue-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </div>
              <h2 className="font-semibold text-sm mb-1">Сургалт</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Видео хичээл үзэх, мэдлэгээ дээшлүүлэх
              </p>
            </Link>

            <Link
              href="/menu"
              className="group rounded-lg border bg-card p-6 hover:border-orange-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </div>
              <h2 className="font-semibold text-sm mb-1">Хоолны цэс</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Өдрийн хоолны цэс харах, хариу өгөх
              </p>
            </Link>

            <Link
              href="/temperature"
              className="group rounded-lg border bg-card p-6 hover:border-cyan-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <Thermometer className="h-5 w-5 text-cyan-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </div>
              <h2 className="font-semibold text-sm mb-1">Температур</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Агуулахын температурын бүртгэл харах
              </p>
            </Link>
          </div>

          {/* ── Role-specific shortcuts ────────────────────────────────── */}
          {(user?.role === "admin" || user?.role === "chief") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {user?.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className="group rounded-lg border bg-card p-6 hover:border-purple-200 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Settings className="h-5 w-5 text-purple-600" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </div>
                  <h2 className="font-semibold text-sm mb-1">Админ хэсэг</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Хэрэглэгч, сургалт, хичээл удирдах
                  </p>
                </Link>
              )}
              {(user?.role === "admin" || user?.role === "chief") && (
                <Link
                  href="/menu/manage"
                  className="group rounded-lg border bg-card p-6 hover:border-green-200 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <ClipboardList className="h-5 w-5 text-green-600" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </div>
                  <h2 className="font-semibold text-sm mb-1">Цэс удирдах</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Хоолны цэс нэмэх, засах, устгах
                  </p>
                </Link>
              )}
            </div>
          )}

          {/* ── Today's Menu Preview ───────────────────────────────────── */}
          <section className="rounded-lg border bg-card">
            <div className="px-5 py-3.5 border-b flex items-center justify-between">
              <h3 className="text-sm font-medium">Өнөөдрийн цэс</h3>
              <Link
                href="/menu"
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                Дэлгэрэнгүй
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-5">
              {menuLoading ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Уншиж байна...</span>
                </div>
              ) : menu && menu.items && menu.items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {menu.items.map((item) => {
                    const meta = ITEM_TYPE_META[item.item_type] ?? {
                      label: item.item_type,
                      icon: UtensilsCrossed,
                    };
                    const TypeIcon = meta.icon;

                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-md border bg-background"
                      >
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[11px] text-muted-foreground font-medium">
                            {meta.label}
                          </p>
                          <p className="text-sm font-medium line-clamp-1 mt-0.5">
                            {item.name}
                          </p>
                          {item.calories && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {item.calories} ккал
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    Өнөөдөр цэс оруулаагүй байна
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className="py-4 px-6 text-center text-xs text-muted-foreground border-t">
          © {new Date().getFullYear()} Cosmo
        </footer>
      </div>
    </ProtectedRoute>
  );
}
