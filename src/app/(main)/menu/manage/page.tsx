"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MenuCalendar } from "@/components/MenuCalendar";
import { ImageUpload } from "@/components/ImageUpload";
import {
  useMenuByDate,
  useMonthlyMenus,
  useMenuResponses,
} from "@/hooks/useMenu";
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
  ArrowLeft,
  CookingPot,
  UtensilsCrossed,
  GlassWater,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ItemFormData {
  name: string;
  imageUrl: string;
  itemType: "meal_1" | "meal_2" | "drink";
  ingredients: string;
  calories: string;
}

const EMPTY_ITEM = (type: "meal_1" | "meal_2" | "drink"): ItemFormData => ({
  name: "",
  imageUrl: "",
  itemType: type,
  ingredients: "",
  calories: "",
});

const ITEM_TYPE_CONFIG: Record<
  string,
  { label: string; icon: typeof CookingPot; accent: string; addLabel: string }
> = {
  meal_1: {
    label: "Хоол 1",
    icon: CookingPot,
    accent: "text-amber-600 bg-amber-50 border-amber-200",
    addLabel: "Хоол нэмэх",
  },
  meal_2: {
    label: "Хоол 2",
    icon: UtensilsCrossed,
    accent: "text-orange-600 bg-orange-50 border-orange-200",
    addLabel: "Хоол нэмэх",
  },
  drink: {
    label: "Уух зүйл",
    icon: GlassWater,
    accent: "text-sky-600 bg-sky-50 border-sky-200",
    addLabel: "Ундаа нэмэх",
  },
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

  const { menus, refetch: refetchMonthly } = useMonthlyMenus(
    calYear,
    calMonth,
  );
  const {
    menu,
    loading: dayLoading,
    refetch: refetchDay,
  } = useMenuByDate(selectedDate);
  const { responses, loading: responsesLoading } = useMenuResponses(
    menu?.id ?? null,
  );

  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemFormData[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (menu) {
      setNotes(menu.notes || "");
      setItems(
        menu.items.map((item) => ({
          name: item.name,
          imageUrl: item.image_url || "",
          itemType: item.item_type,
          ingredients: item.ingredients || "",
          calories: item.calories ? String(item.calories) : "",
        })),
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
    value: string,
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
    ? (() => {
        const d = new Date(selectedDate + "T00:00:00");
        const weekdays = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];
        const months = [
          "1-р сарын", "2-р сарын", "3-р сарын", "4-р сарын",
          "5-р сарын", "6-р сарын", "7-р сарын", "8-р сарын",
          "9-р сарын", "10-р сарын", "11-р сарын", "12-р сарын",
        ];
        return `${d.getFullYear()} оны ${months[d.getMonth()]} ${d.getDate()}, ${weekdays[d.getDay()]} гараг`;
      })()
    : "";

  const attendingCount = responses.filter((r) => r.will_attend).length;
  const notAttendingCount = responses.filter((r) => !r.will_attend).length;

  if (!mounted) {
    return (
      <main className="container mx-auto px-6 py-10 max-w-screen-2xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-10 max-w-screen-2xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/menu"
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-gray-300 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Цэс удирдах
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Өдөр сонгоод цэс нэмэх, засах, хариулт харах
            </p>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
          {/* Calendar */}
          <div className="lg:sticky lg:top-6 lg:self-start">
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
            {/* Date header + actions */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {displayDate}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {menu
                      ? "Цэс бүртгэгдсэн"
                      : "Цэс байхгүй — шинээр үүсгэх"}
                  </p>
                </div>
                {menu && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors">
                          <Users className="h-4 w-4" />
                          <span className="hidden sm:inline">Хариултууд</span>
                          {!responsesLoading && responses.length > 0 && (
                            <span className="text-[11px] font-semibold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                              {responses.length}
                            </span>
                          )}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>
                            Хариултууд — {displayDate}
                          </DialogTitle>
                        </DialogHeader>

                        <div className="flex gap-2 mb-4">
                          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-sm font-semibold text-green-700">
                              {attendingCount} идэх
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-red-400" />
                            <span className="text-sm font-semibold text-red-600">
                              {notAttendingCount} идэхгүй
                            </span>
                          </div>
                        </div>

                        {responsesLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
                          </div>
                        ) : responses.length === 0 ? (
                          <div className="text-center py-8">
                            <Users className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Хариу ирээгүй байна
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-y-auto max-h-[400px] -mx-1">
                            <table className="w-full text-sm">
                              <thead className="sticky top-0 bg-white z-10">
                                <tr className="border-b border-border">
                                  <th className="text-left py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                                    Нэр
                                  </th>
                                  <th className="text-left py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                                    Имэйл
                                  </th>
                                  <th className="text-center py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                                    Хариу
                                  </th>
                                  <th className="text-right py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                                    Хугацаа
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {responses.map((r) => (
                                  <tr
                                    key={r.id}
                                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                                  >
                                    <td className="py-2.5 px-2 text-foreground font-medium">
                                      {r.user_name}
                                    </td>
                                    <td className="py-2.5 px-2 text-muted-foreground">
                                      {r.user_email}
                                    </td>
                                    <td className="py-2.5 px-2 text-center">
                                      {r.will_attend ? (
                                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md text-xs font-semibold">
                                          <Check className="h-3 w-3" />
                                          Идэх
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md text-xs font-semibold">
                                          <X className="h-3 w-3" />
                                          Идэхгүй
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-2 text-right text-muted-foreground text-xs">
                                      {new Date(
                                        r.updated_at,
                                      ).toLocaleString("mn-MN", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <div className="w-px h-5 bg-border" />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
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
                            {displayDate}-ний цэс болон бүх хоолны мэдээлэл
                            устгагдана. Энэ үйлдлийг буцаах боломжгүй.
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
                  </div>
                )}
              </div>

              {/* Status indicator */}
              {menu && (
                <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400" />
              )}
            </div>

            {dayLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
              </div>
            ) : (
              <>
                {/* Notes */}
                <div className="bg-card rounded-2xl border border-border p-5">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Тэмдэглэл
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Нэмэлт тэмдэглэл..."
                    className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring resize-none bg-muted/30 placeholder:text-muted-foreground/40 transition-colors"
                    rows={2}
                  />
                </div>

                {/* Item Slots by Type */}
                {(["meal_1", "meal_2", "drink"] as const).map((type) => {
                  const config = ITEM_TYPE_CONFIG[type];
                  const Icon = config.icon;
                  const typeItems = items
                    .map((item, idx) => ({ item, idx }))
                    .filter(({ item }) => item.itemType === type);

                  return (
                    <div
                      key={type}
                      className="bg-card rounded-2xl border border-border overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-5 pb-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border ${config.accent}`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <h3 className="text-base font-semibold text-foreground">
                            {config.label}
                          </h3>
                          {typeItems.length > 0 && (
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {typeItems.length}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddItem(type)}
                          className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          {config.addLabel}
                        </button>
                      </div>

                      {typeItems.length === 0 ? (
                        <div className="px-5 pb-5">
                          <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
                            <Icon className="h-6 w-6 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground/60">
                              Хоол нэмэгдээгүй байна
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="px-5 pb-5 space-y-3">
                          {typeItems.map(({ item, idx }) => (
                            <div
                              key={idx}
                              className="border border-border rounded-xl p-4 space-y-3 relative bg-muted/20 hover:bg-muted/30 transition-colors"
                            >
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>

                              <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                  Нэр
                                </label>
                                <input
                                  value={item.name}
                                  onChange={(e) =>
                                    handleItemChange(
                                      idx,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Хоолны нэр"
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring bg-card placeholder:text-muted-foreground/40 transition-colors"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                    Орц найрлага
                                  </label>
                                  <input
                                    value={item.ingredients}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        "ingredients",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Үхрийн мах, төмс, лууван..."
                                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring bg-card placeholder:text-muted-foreground/40 transition-colors"
                                  />
                                  <p className="text-[11px] text-muted-foreground/50 mt-1">
                                    Таслалаар тусгаарлана
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                    Калори
                                  </label>
                                  <input
                                    type="number"
                                    value={item.calories}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        "calories",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="ккал"
                                    min={0}
                                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring bg-card placeholder:text-muted-foreground/40 transition-colors"
                                  />
                                </div>
                              </div>

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
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50 shadow-sm active:scale-[0.99]"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {menu ? "Шинэчлэх" : "Үүсгэх"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MenuManagePage() {
  return (
    <ProtectedRoute requiredRole={["admin", "chief"]}>
      <MenuManageContent />
    </ProtectedRoute>
  );
}
