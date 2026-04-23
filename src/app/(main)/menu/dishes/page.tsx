"use client";

import { useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ImageUpload } from "@/components/ImageUpload";
import { useDishes, useDishMutations } from "@/hooks/useDishes";
import { Dish } from "@/types/schema.types";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Loader2,
  ArrowLeft,
  Pencil,
  Trash2,
  CookingPot,
  UtensilsCrossed,
  GlassWater,
  X,
  BookOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const ITEM_TYPE_CONFIG: Record<
  string,
  { label: string; icon: typeof CookingPot; accent: string; bg: string }
> = {
  meal_1: {
    label: "Хоол 1",
    icon: CookingPot,
    accent: "text-amber-600 bg-amber-50 border-amber-200",
    bg: "bg-amber-50",
  },
  meal_2: {
    label: "Хоол 2",
    icon: UtensilsCrossed,
    accent: "text-orange-600 bg-orange-50 border-orange-200",
    bg: "bg-orange-50",
  },
  drink: {
    label: "Уух зүйл",
    icon: GlassWater,
    accent: "text-sky-600 bg-sky-50 border-sky-200",
    bg: "bg-sky-50",
  },
};

type ItemType = "meal_1" | "meal_2" | "drink";

function DishesContent() {
  const [activeTab, setActiveTab] = useState<"all" | ItemType>("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formItemType, setFormItemType] = useState<ItemType>("meal_1");

  const filters: { itemType?: string; search?: string } = {};
  if (activeTab !== "all") filters.itemType = activeTab;
  if (search.trim()) filters.search = search.trim();

  const { dishes, loading } = useDishes(filters);
  const mutations = useDishMutations();

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const openCreate = () => {
    setEditingDish(null);
    setFormName("");
    setFormImageUrl("");
    setFormItemType("meal_1");
    setDialogOpen(true);
  };

  const openEdit = (dish: Dish) => {
    setEditingDish(dish);
    setFormName(dish.name);
    setFormImageUrl(dish.image_url || "");
    setFormItemType(dish.item_type);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error("Хоолны нэр оруулна уу");
      return;
    }

    try {
      if (editingDish) {
        await mutations.update.mutateAsync({
          id: editingDish.id,
          data: {
            name: formName,
            imageUrl: formImageUrl || null,
            itemType: formItemType,
          },
        });
        toast.success("Хоол амжилттай шинэчлэгдлээ");
      } else {
        await mutations.create.mutateAsync({
          name: formName,
          imageUrl: formImageUrl || null,
          itemType: formItemType,
        });
        toast.success("Хоол амжилттай нэмэгдлээ");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Алдаа гарлаа");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await mutations.delete.mutateAsync(id);
      toast.success("Хоол амжилттай устгагдлаа");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Устгахад алдаа гарлаа");
    }
  };

  const tabs = [
    { key: "all" as const, label: "Бүгд" },
    { key: "meal_1" as const, label: "Хоол 1" },
    { key: "meal_2" as const, label: "Хоол 2" },
    { key: "drink" as const, label: "Уух зүйл" },
  ];

  return (
    <main className="container mx-auto px-6 py-10 max-w-screen-xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/menu/manage"
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-gray-300 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Хоолны сан
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Хоолны сангаас цэсэд хурдан нэмэх боломжтой
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Хоол нэмэх
          </button>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Tabs */}
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Хоол хайх..."
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring bg-muted/30 placeholder:text-muted-foreground/40 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
          </div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {search ? "Хайлтад тохирох хоол олдсонгүй" : "Хоолны сан хоосон байна"}
            </p>
            {!search && (
              <button
                onClick={openCreate}
                className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Эхний хоолоо нэмэх
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dishes.map((dish) => {
              const config = ITEM_TYPE_CONFIG[dish.item_type];
              const Icon = config.icon;

              return (
                <div
                  key={dish.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-muted/30 relative">
                    {dish.image_url ? (
                      <img
                        src={`${backendUrl}${dish.image_url}`}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="h-10 w-10 text-muted-foreground/15" />
                      </div>
                    )}

                    {/* Actions overlay */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(dish)}
                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors shadow-sm">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Хоол устгах уу?</AlertDialogTitle>
                            <AlertDialogDescription>
                              &ldquo;{dish.name}&rdquo; хоолны сангаас устгагдана.
                              Энэ үйлдлийг буцаах боломжгүй.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Болих</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(dish.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Устгах
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* Type badge */}
                    <div className="absolute bottom-2 left-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${config.accent} backdrop-blur-sm`}
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-semibold text-foreground text-sm truncate">
                      {dish.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDish ? "Хоол засах" : "Шинэ хоол нэмэх"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Нэр
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Хоолны нэр"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring bg-card placeholder:text-muted-foreground/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Төрөл
              </label>
              <div className="flex gap-2">
                {(["meal_1", "meal_2", "drink"] as const).map((type) => {
                  const config = ITEM_TYPE_CONFIG[type];
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => setFormItemType(type)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        formItemType === type
                          ? config.accent
                          : "border-border text-muted-foreground hover:border-gray-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <ImageUpload
              value={formImageUrl}
              onChange={(url) => setFormImageUrl(url)}
              label="Зураг"
            />

            <button
              onClick={handleSubmit}
              disabled={mutations.create.isPending || mutations.update.isPending}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-200 disabled:opacity-50"
            >
              {(mutations.create.isPending || mutations.update.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {editingDish ? "Шинэчлэх" : "Нэмэх"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function DishesPage() {
  return (
    <ProtectedRoute requiredRole={["admin", "chief"]}>
      <DishesContent />
    </ProtectedRoute>
  );
}
