"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MenuCalendar } from "@/components/MenuCalendar";
import { MenuRSVP } from "@/components/MenuRSVP";
import { useMenuByDate, useMonthlyMenus } from "@/hooks/useMenu";
import { MenuItem } from "@/types/schema.types";
import { UtensilsCrossed, Flame } from "lucide-react";

const ITEM_TYPE_LABELS: Record<string, string> = {
  meal_1: "1-р хоол",
  meal_2: "2-р хоол",
  drink: "Уух зүйл",
};

function MenuItemCard({ item }: { item: MenuItem }) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${backendUrl}${url}`;
  };

  const ingredientList = item.ingredients
    ? item.ingredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="group bg-white rounded-xl border border-gray-900/15 overflow-hidden flex flex-row hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">
      {/* Fixed-size image */}
      {item.image_url ? (
        <div className="w-[140px] sm:w-[180px] h-[130px] sm:h-[150px] flex-shrink-0 overflow-hidden">
          <img
            src={getFullUrl(item.image_url)}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>
      ) : (
        <div className="w-[140px] sm:w-[180px] h-[130px] sm:h-[150px] flex-shrink-0 bg-gray-50 flex items-center justify-center">
          <UtensilsCrossed className="h-8 w-8 text-gray-200" />
        </div>
      )}

      {/* Text content */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center min-w-0 relative">
        {/* Calorie badge */}
        {item.calories && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-medium text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-md">
            <Flame className="h-3 w-3" />
            {item.calories} ккал
          </span>
        )}

        {/* Name */}
        <p className="font-semibold text-gray-800 text-sm sm:text-base leading-snug pr-16">
          {item.name}
        </p>

        {/* Description */}
        {item.description && (
          <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-1 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Ingredient pills */}
        {ingredientList.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {ingredientList.map((ing, i) => (
              <span
                key={i}
                className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
              >
                {ing}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(1);
  const [animKey, setAnimKey] = useState(0);

  // Initialize dates on client only to avoid hydration mismatch
  useEffect(() => {
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    setSelectedDate(todayStr);
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth() + 1);
    setMounted(true);
  }, []);

  const today = mounted ? format(new Date(), "yyyy-MM-dd") : "";

  const { menus } = useMonthlyMenus(calYear, calMonth);
  const { menu, loading: dayLoading } = useMenuByDate(selectedDate);

  const menuDates = new Set(menus.map((m) => m.menu_date.split("T")[0]));

  useEffect(() => {
    if (!mounted) return;
    setAnimKey((k) => k + 1);
  }, [selectedDate]);

  const handleMonthChange = (year: number, month: number) => {
    setCalYear(year);
    setCalMonth(month);
  };

  const displayDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("mn-MN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })
    : "";

  const grouped = menu
    ? {
        meal_1: menu.items.filter((i) => i.item_type === "meal_1"),
        meal_2: menu.items.filter((i) => i.item_type === "meal_2"),
        drink: menu.items.filter((i) => i.item_type === "drink"),
      }
    : null;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Уншиж байна...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Хоолны цэс</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Өдөр сонгож цэс болон хариу өгөх боломжтой
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* Calendar */}
          <div>
            <MenuCalendar
              year={calYear}
              month={calMonth}
              menuDates={menuDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onMonthChange={handleMonthChange}
            />
          </div>

          {/* Day Detail */}
          <div className="space-y-4">
            {/* Date + RSVP side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-gray-800 truncate">
                    {displayDate}
                  </h2>
                  {selectedDate === today && (
                    <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Өнөөдөр
                    </span>
                  )}
                </div>
              </div>

              {menu ? (
                <MenuRSVP
                  menuId={menu.id}
                  menuDate={menu.menu_date.split("T")[0]}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-center">
                  <p className="text-sm text-gray-300">--</p>
                </div>
              )}
            </div>

            {/* Animated content */}
            <div key={animKey} className="animate-[fadeSlideIn_0.35s_ease-out]">
              {dayLoading && (
                <div className="text-center py-12 text-gray-400">
                  Уншиж байна...
                </div>
              )}

              {!dayLoading && !menu && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                  <UtensilsCrossed className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">Энэ өдөр цэс байхгүй байна</p>
                </div>
              )}

              {menu && grouped && (
                <>
                  {menu.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 mb-4">
                      {menu.notes}
                    </div>
                  )}

                  {/* All meals in one unified card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    <div className="space-y-6">
                      {(["meal_1", "meal_2", "drink"] as const).map(
                        (type, idx) => {
                          if (grouped[type].length === 0) return null;
                          const prevTypes = (
                            ["meal_1", "meal_2", "drink"] as const
                          ).slice(0, idx);
                          const hasPrev = prevTypes.some(
                            (t) => grouped[t].length > 0,
                          );
                          return (
                            <section key={type}>
                              {hasPrev && (
                                <hr className="border-gray-100 mb-6" />
                              )}
                              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                {ITEM_TYPE_LABELS[type]}
                              </h3>
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                {grouped[type].map((item) => (
                                  <MenuItemCard key={item.id} item={item} />
                                ))}
                              </div>
                            </section>
                          );
                        },
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
