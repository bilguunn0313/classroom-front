"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MenuCalendar } from "@/components/MenuCalendar";
import { ImageUpload } from "@/components/ImageUpload";
import { useMenuByDate, useMonthlyMenus, useMenuResponses } from "@/hooks/useMenu";
import { menuAPI } from "@/lib/menu";
import { toast } from "sonner";
import {
  Plus,
  Save,
  Trash2,
  Loader2,
  Users,
  Check,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ItemFormData {
  name: string;
  description: string;
  imageUrl: string;
  itemType: "meal_1" | "meal_2" | "drink";
  ingredients: string;
  calories: string; // string for input, convert to number on save
}

const EMPTY_ITEM = (type: "meal_1" | "meal_2" | "drink"): ItemFormData => ({
  name: "",
  description: "",
  imageUrl: "",
  itemType: type,
  ingredients: "",
  calories: "",
});

const ITEM_TYPE_LABELS: Record<string, string> = {
  meal_1: "Хоол 1",
  meal_2: "Хоол 2",
  drink: "Уух зүйл",
};

function MenuManageContent() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(1);

  useEffect(() => {
    const now = new Date();
    setSelectedDate(format(now, "yyyy-MM-dd"));
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth() + 1);
    setMounted(true);
  }, []);

  const { menus, refetch: refetchMonthly } = useMonthlyMenus(calYear, calMonth);
  const { menu, loading: dayLoading, refetch: refetchDay } = useMenuByDate(selectedDate);
  const { responses, loading: responsesLoading } = useMenuResponses(menu?.id ?? null);

  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemFormData[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync form with loaded menu
  useEffect(() => {
    if (menu) {
      setNotes(menu.notes || "");
      setItems(
        menu.items.map((item) => ({
          name: item.name,
          description: item.description || "",
          imageUrl: item.image_url || "",
          itemType: item.item_type,
          ingredients: item.ingredients || "",
          calories: item.calories ? String(item.calories) : "",
        }))
      );
    } else {
      setNotes("");
      setItems([]);
    }
  }, [menu]);

  const menuDates = new Set(menus.map((m) => m.menu_date.split("T")[0]));

  const handleMonthChange = (year: number, month: number) => {
    setCalYear(year);
    setCalMonth(month);
  };

  const handleAddItem = (type: "meal_1" | "meal_2" | "drink") => {
    setItems([...items, EMPTY_ITEM(type)]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof ItemFormData,
    value: string
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSave = async () => {
    const validItems = items.filter((i) => i.name.trim());
    if (validItems.length === 0) {
      toast.error("Хамгийн багадаа нэг хоол нэмнэ үү");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        menuDate: selectedDate,
        notes: notes || null,
        items: validItems.map((i) => ({
          name: i.name,
          description: i.description || null,
          imageUrl: i.imageUrl || null,
          itemType: i.itemType,
          ingredients: i.ingredients || null,
          calories: i.calories ? Number(i.calories) : null,
        })),
      };

      if (menu) {
        await menuAPI.update(menu.id, payload);
        toast.success("Цэс амжилттай шинэчлэгдлээ");
      } else {
        await menuAPI.create(payload);
        toast.success("Цэс амжилттай үүсгэгдлээ");
      }

      await Promise.all([refetchDay(), refetchMonthly()]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!menu) return;
    setDeleting(true);
    try {
      await menuAPI.delete(menu.id);
      toast.success("Цэс амжилттай устгагдлаа");
      await Promise.all([refetchDay(), refetchMonthly()]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Устгахад алдаа гарлаа");
    } finally {
      setDeleting(false);
    }
  };

  const displayDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("mn-MN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })
    : "";

  const attendingCount = responses.filter((r) => r.will_attend).length;
  const notAttendingCount = responses.filter((r) => !r.will_attend).length;

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
          <h1 className="text-2xl font-bold text-gray-800">Цэс удирдах</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Өдөр сонгоод цэс нэмэх, засах, хариулт харах
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

          {/* Editor Panel */}
          <div className="space-y-5">
            {/* Date header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {displayDate}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {menu ? "Цэс бүртгэгдсэн" : "Цэс байхгүй — шинээр үүсгэх"}
                </p>
              </div>
              {menu && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                      disabled={deleting}
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Устгах
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Цэс устгах уу?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {displayDate}-ний цэс болон бүх хоолны мэдээлэл устгагдана. Энэ үйлдлийг буцаах боломжгүй.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Болих</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Устгах
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {dayLoading ? (
              <div className="text-center py-12 text-gray-400">Уншиж байна...</div>
            ) : (
              <>
                {/* Notes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тэмдэглэл
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Нэмэлт тэмдэглэл..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    rows={2}
                  />
                </div>

                {/* Item Slots by Type */}
                {(["meal_1", "meal_2", "drink"] as const).map((type) => {
                  const typeItems = items
                    .map((item, idx) => ({ item, idx }))
                    .filter(({ item }) => item.itemType === type);

                  return (
                    <div
                      key={type}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-gray-700">
                          {ITEM_TYPE_LABELS[type]}
                        </h3>
                        <button
                          onClick={() => handleAddItem(type)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Нэмэх
                        </button>
                      </div>

                      {typeItems.length === 0 ? (
                        <p className="text-sm text-gray-300 text-center py-4">
                          Хоол нэмэгдээгүй байна
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {typeItems.map(({ item, idx }) => (
                            <div
                              key={idx}
                              className="border border-gray-100 rounded-xl p-4 space-y-3 relative"
                            >
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>

                              {/* Name */}
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Нэр
                                </label>
                                <input
                                  value={item.name}
                                  onChange={(e) =>
                                    handleItemChange(idx, "name", e.target.value)
                                  }
                                  placeholder="Хоолны нэр"
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                              </div>

                              {/* Description */}
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Тайлбар
                                </label>
                                <input
                                  value={item.description}
                                  onChange={(e) =>
                                    handleItemChange(idx, "description", e.target.value)
                                  }
                                  placeholder="Богино тайлбар..."
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                              </div>

                              {/* Ingredients + Calories row */}
                              <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Орц найрлага
                                  </label>
                                  <input
                                    value={item.ingredients}
                                    onChange={(e) =>
                                      handleItemChange(idx, "ingredients", e.target.value)
                                    }
                                    placeholder="Үхрийн мах, төмс, лууван..."
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  />
                                  <p className="text-[11px] text-gray-300 mt-0.5">
                                    Таслалаар тусгаарлана
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Калори
                                  </label>
                                  <input
                                    type="number"
                                    value={item.calories}
                                    onChange={(e) =>
                                      handleItemChange(idx, "calories", e.target.value)
                                    }
                                    placeholder="ккал"
                                    min={0}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  />
                                </div>
                              </div>

                              {/* Image */}
                              <ImageUpload
                                value={item.imageUrl}
                                onChange={(url) =>
                                  handleItemChange(idx, "imageUrl", url)
                                }
                                label="Зураг"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {menu ? "Шинэчлэх" : "Үүсгэх"}
                </button>

                {/* Response Dashboard */}
                {menu && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-gray-600" />
                      <h3 className="text-base font-semibold text-gray-700">
                        Хариултууд
                      </h3>
                    </div>

                    <div className="flex gap-4 mb-4">
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {attendingCount} идэх
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                        <X className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-600">
                          {notAttendingCount} идэхгүй
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                          {responses.length} нийт
                        </span>
                      </div>
                    </div>

                    {responsesLoading ? (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        Уншиж байна...
                      </div>
                    ) : responses.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">
                        Хариу ирээгүй байна
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left py-2 px-2 font-medium text-gray-500">
                                Нэр
                              </th>
                              <th className="text-left py-2 px-2 font-medium text-gray-500">
                                Имэйл
                              </th>
                              <th className="text-center py-2 px-2 font-medium text-gray-500">
                                Хариу
                              </th>
                              <th className="text-right py-2 px-2 font-medium text-gray-500">
                                Хугацаа
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {responses.map((r) => (
                              <tr
                                key={r.id}
                                className="border-b border-gray-50 hover:bg-gray-50"
                              >
                                <td className="py-2 px-2 text-gray-800">
                                  {r.user_name}
                                </td>
                                <td className="py-2 px-2 text-gray-500">
                                  {r.user_email}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  {r.will_attend ? (
                                    <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                                      <Check className="h-3 w-3" />
                                      Идэх
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">
                                      <X className="h-3 w-3" />
                                      Идэхгүй
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-2 text-right text-gray-400 text-xs">
                                  {new Date(r.updated_at).toLocaleString(
                                    "mn-MN",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function MenuManagePage() {
  return (
    <ProtectedRoute requiredRole={["admin", "chief"]}>
      <MenuManageContent />
    </ProtectedRoute>
  );
}
