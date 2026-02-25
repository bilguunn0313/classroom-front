"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTodayMenu } from "@/hooks/useMenu";
import { MenuItem } from "@/types/schema.types";

const ITEM_TYPE_LABELS: Record<string, string> = {
  meal_1: "Хоол 1",
  meal_2: "Хоол 2",
  drink: "Уух зүйл",
};

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <p className="font-semibold text-gray-800">{item.name}</p>
        {item.description && (
          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { menu, loading, error } = useTodayMenu();

  const today = new Date().toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const grouped = menu
    ? {
        meal_1: menu.items.filter((i) => i.item_type === "meal_1"),
        meal_2: menu.items.filter((i) => i.item_type === "meal_2"),
        drink: menu.items.filter((i) => i.item_type === "drink"),
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Өдрийн цэс</h1>
          <p className="text-gray-500 mt-1">{today}</p>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400">Уншиж байна...</div>
        )}

        {error && (
          <div className="text-center py-16 text-red-500">{error}</div>
        )}

        {!loading && !error && !menu && (
          <div className="text-center py-16 text-gray-400">
            Өнөөдрийн цэс байхгүй байна
          </div>
        )}

        {menu && grouped && (
          <div className="space-y-8">
            {menu.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
                {menu.notes}
              </div>
            )}

            {(["meal_1", "meal_2", "drink"] as const).map((type) =>
              grouped[type].length > 0 ? (
                <section key={type}>
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">
                    {ITEM_TYPE_LABELS[type]}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {grouped[type].map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              ) : null
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
