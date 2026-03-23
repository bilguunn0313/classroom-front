"use client";

import { useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUserContext } from "@/lib/userProvider";
import { useCars } from "@/hooks/useCars";
import {
  useTireConditionRecords,
  useLatestTireConditions,
} from "@/hooks/useTireCondition";
import { useOdometerRecords, useLatestOdometer } from "@/hooks/useOdometer";
import { carAPI } from "@/lib/car";
import { tireConditionAPI } from "@/lib/tire-condition";
import { odometerAPI } from "@/lib/odometer";
import { Car, TireCondition, OdometerReading } from "@/types/schema.types";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import {
  CircleGauge,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  ArrowLeft,
  Download,
  Car as CarIcon,
  Gauge,
} from "lucide-react";

const MONTH_NAMES = [
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

const CONDITION_LABELS: Record<string, string> = {
  good: "Сайн",
  fair: "Дунд",
  poor: "Муу",
  critical: "Аюултай",
};

const CONDITION_COLORS: Record<string, string> = {
  good: "bg-green-100 text-green-700 border-green-200",
  fair: "bg-yellow-100 text-yellow-700 border-yellow-200",
  poor: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

type DetailTab = "tire" | "odometer";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];
  return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatKm(km: number): string {
  return km.toLocaleString() + " км";
}

function exportTireCSV(
  records: TireCondition[],
  year: number,
  month: number,
  carLabel: string
) {
  const header = [
    "Огноо",
    "Улсын дугаар",
    "Машин",
    "Байдал",
    "Тэмдэглэл",
    "Бүртгэсэн",
  ];
  const rows = records.map((r) => [
    String(r.record_date).split("T")[0],
    r.license_plate || "",
    r.car_name || "",
    CONDITION_LABELS[r.condition] || r.condition,
    r.notes ? `"${r.notes.replace(/"/g, '""')}"` : "",
    r.recorded_by_name || "",
  ]);

  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tire-condition-${carLabel}-${year}-${String(month).padStart(2, "0")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TireConditionPage() {
  const { user } = useUserContext();
  const isManager = user?.role === "admin" || user?.role === "supervisor";

  const { cars, refetch: refetchCars } = useCars();

  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("tire");

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const {
    records: latestRecords,
    loading: latestLoading,
    refetch: refetchLatest,
  } = useLatestTireConditions();

  const {
    records: monthlyRecords,
    loading: monthlyLoading,
    refetch: refetchMonthly,
  } = useTireConditionRecords(selectedCarId, year, month);

  const {
    records: latestOdoRecords,
    refetch: refetchLatestOdo,
  } = useLatestOdometer();

  const {
    records: monthlyOdoRecords,
    loading: monthlyOdoLoading,
    refetch: refetchMonthlyOdo,
  } = useOdometerRecords(selectedCarId, year, month);

  const isOverview = selectedCarId === null;

  // Build a map of latest odometer per car for overview
  const latestOdoMap = new Map<number, OdometerReading>();
  for (const r of latestOdoRecords) {
    latestOdoMap.set(r.car_id, r);
  }

  // ── Car dialog state ──
  const [carDialogOpen, setCarDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [carPlate, setCarPlate] = useState("");
  const [carNameForm, setCarNameForm] = useState("");
  const [savingCar, setSavingCar] = useState(false);

  const [deleteCarTarget, setDeleteCarTarget] = useState<Car | null>(null);
  const [deletingCar, setDeletingCar] = useState(false);

  // ── Condition dialog state ──
  const [condDialogOpen, setCondDialogOpen] = useState(false);
  const [editingCond, setEditingCond] = useState<TireCondition | null>(null);
  const [formCarId, setFormCarId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formCondition, setFormCondition] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [savingCond, setSavingCond] = useState(false);

  const [deleteCondTarget, setDeleteCondTarget] =
    useState<TireCondition | null>(null);
  const [deletingCond, setDeletingCond] = useState(false);

  // ── Odometer dialog state ──
  const [odoDialogOpen, setOdoDialogOpen] = useState(false);
  const [editingOdo, setEditingOdo] = useState<OdometerReading | null>(null);
  const [odoCarId, setOdoCarId] = useState("");
  const [odoDate, setOdoDate] = useState("");
  const [odoKm, setOdoKm] = useState("");
  const [odoNotes, setOdoNotes] = useState("");
  const [savingOdo, setSavingOdo] = useState(false);

  const [deleteOdoTarget, setDeleteOdoTarget] =
    useState<OdometerReading | null>(null);
  const [deletingOdo, setDeletingOdo] = useState(false);

  // ── Month nav ──
  const goToPrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  // ── Car CRUD ──
  const openCreateCarDialog = () => {
    setEditingCar(null);
    setCarPlate("");
    setCarNameForm("");
    setCarDialogOpen(true);
  };

  const openEditCarDialog = (car: Car) => {
    setEditingCar(car);
    setCarPlate(car.license_plate);
    setCarNameForm(car.car_name || "");
    setCarDialogOpen(true);
  };

  const handleSaveCar = async () => {
    if (!carPlate.trim()) {
      toast.error("Улсын дугаар оруулна уу");
      return;
    }
    try {
      setSavingCar(true);
      if (editingCar) {
        await carAPI.update(editingCar.id, {
          licensePlate: carPlate.trim(),
          carName: carNameForm.trim() || null,
        });
        toast.success("Машины мэдээлэл шинэчлэгдлээ");
      } else {
        await carAPI.create({
          licensePlate: carPlate.trim(),
          carName: carNameForm.trim() || null,
        });
        toast.success("Машин бүртгэгдлээ");
      }
      setCarDialogOpen(false);
      refetchCars();
      refetchLatest();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Алдаа гарлаа";
      toast.error(msg);
    } finally {
      setSavingCar(false);
    }
  };

  const handleDeleteCar = async () => {
    if (!deleteCarTarget) return;
    try {
      setDeletingCar(true);
      await carAPI.delete(deleteCarTarget.id);
      toast.success("Машин устгагдлаа");
      setDeleteCarTarget(null);
      if (selectedCarId === deleteCarTarget.id) {
        setSelectedCarId(null);
      }
      refetchCars();
      refetchLatest();
      refetchLatestOdo();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Алдаа гарлаа";
      toast.error(msg);
    } finally {
      setDeletingCar(false);
    }
  };

  // ── Condition CRUD ──
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const openCreateCondDialog = () => {
    setEditingCond(null);
    setFormCarId(selectedCarId ? String(selectedCarId) : "");
    setFormDate(todayStr);
    setFormCondition("");
    setFormNotes("");
    setCondDialogOpen(true);
  };

  const openEditCondDialog = (record: TireCondition) => {
    setEditingCond(record);
    setFormCarId(String(record.car_id));
    setFormDate(String(record.record_date).split("T")[0]);
    setFormCondition(record.condition);
    setFormNotes(record.notes || "");
    setCondDialogOpen(true);
  };

  const handleSaveCond = async () => {
    if (!formCarId || !formDate || !formCondition) {
      toast.error("Машин, огноо, байдал сонгоно уу");
      return;
    }
    try {
      setSavingCond(true);
      if (editingCond) {
        await tireConditionAPI.update(editingCond.id, {
          carId: Number(formCarId),
          recordDate: formDate,
          condition: formCondition,
          notes: formNotes || null,
        });
        toast.success("Бүртгэл шинэчлэгдлээ");
      } else {
        await tireConditionAPI.create({
          carId: Number(formCarId),
          recordDate: formDate,
          condition: formCondition,
          notes: formNotes || null,
        });
        toast.success("Дугуйн байдал бүртгэгдлээ");
      }
      setCondDialogOpen(false);
      refetchLatest();
      refetchMonthly();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Алдаа гарлаа";
      toast.error(msg);
    } finally {
      setSavingCond(false);
    }
  };

  const handleDeleteCond = async () => {
    if (!deleteCondTarget) return;
    try {
      setDeletingCond(true);
      await tireConditionAPI.delete(deleteCondTarget.id);
      toast.success("Бүртгэл устгагдлаа");
      setDeleteCondTarget(null);
      refetchLatest();
      refetchMonthly();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Алдаа гарлаа";
      toast.error(msg);
    } finally {
      setDeletingCond(false);
    }
  };

  // ── Odometer CRUD ──
  const openCreateOdoDialog = () => {
    setEditingOdo(null);
    setOdoCarId(selectedCarId ? String(selectedCarId) : "");
    setOdoDate(todayStr);
    setOdoKm("");
    setOdoNotes("");
    setOdoDialogOpen(true);
  };

  const openEditOdoDialog = (record: OdometerReading) => {
    setEditingOdo(record);
    setOdoCarId(String(record.car_id));
    setOdoDate(String(record.record_date).split("T")[0]);
    setOdoKm(String(record.reading_km));
    setOdoNotes(record.notes || "");
    setOdoDialogOpen(true);
  };

  const handleSaveOdo = async () => {
    if (!odoCarId || !odoDate || !odoKm) {
      toast.error("Машин, огноо, км оруулна уу");
      return;
    }
    const kmNum = parseInt(odoKm, 10);
    if (isNaN(kmNum) || kmNum < 0) {
      toast.error("Км тоо байх ёстой");
      return;
    }
    try {
      setSavingOdo(true);
      if (editingOdo) {
        await odometerAPI.update(editingOdo.id, {
          carId: Number(odoCarId),
          recordDate: odoDate,
          readingKm: kmNum,
          notes: odoNotes || null,
        });
        toast.success("Км заалт шинэчлэгдлээ");
      } else {
        await odometerAPI.create({
          carId: Number(odoCarId),
          recordDate: odoDate,
          readingKm: kmNum,
          notes: odoNotes || null,
        });
        toast.success("Км заалт бүртгэгдлээ");
      }
      setOdoDialogOpen(false);
      refetchLatestOdo();
      refetchMonthlyOdo();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Алдаа гарлаа";
      toast.error(msg);
    } finally {
      setSavingOdo(false);
    }
  };

  const handleDeleteOdo = async () => {
    if (!deleteOdoTarget) return;
    try {
      setDeletingOdo(true);
      await odometerAPI.delete(deleteOdoTarget.id);
      toast.success("Км заалтын бүртгэл устгагдлаа");
      setDeleteOdoTarget(null);
      refetchLatestOdo();
      refetchMonthlyOdo();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Алдаа гарлаа";
      toast.error(msg);
    } finally {
      setDeletingOdo(false);
    }
  };

  const selectedCar = cars.find((c) => c.id === selectedCarId);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-10 max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/home"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <CircleGauge className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Машин
              </h1>
              <p className="text-xs text-muted-foreground">
                Дугуйн байдал, км заалтын бүртгэл
              </p>
            </div>
          </div>

          {/* Car selector + month nav + actions */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Select
                value={selectedCarId ? String(selectedCarId) : "overview"}
                onValueChange={(val) => {
                  setSelectedCarId(val === "overview" ? null : Number(val));
                  setDetailTab("tire");
                }}
              >
                <SelectTrigger className="w-[220px] h-9">
                  <SelectValue placeholder="Бүх машин" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Бүх машин (ерөнхий)</SelectItem>
                  {cars.map((car) => (
                    <SelectItem key={car.id} value={String(car.id)}>
                      {car.license_plate}
                      {car.car_name ? ` — ${car.car_name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!isOverview && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={goToPrevMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[120px] text-center">
                    {year} оны {MONTH_NAMES[month - 1]}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={goToNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isOverview && detailTab === "tire" && monthlyRecords.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportTireCSV(
                      monthlyRecords,
                      year,
                      month,
                      selectedCar?.license_plate || "all"
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV татах
                </Button>
              )}
              {isManager && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openCreateCarDialog}
                  >
                    <CarIcon className="h-4 w-4 mr-1" />
                    Машин нэмэх
                  </Button>
                  {(isOverview || detailTab === "tire") && (
                    <Button size="sm" onClick={openCreateCondDialog}>
                      <Plus className="h-4 w-4 mr-1" />
                      Дугуй
                    </Button>
                  )}
                  {(isOverview || detailTab === "odometer") && (
                    <Button size="sm" onClick={openCreateOdoDialog}>
                      <Gauge className="h-4 w-4 mr-1" />
                      Км заалт
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Detail tabs (when a car is selected) */}
          {!isOverview && (
            <div className="flex gap-1 mb-4">
              <button
                onClick={() => setDetailTab("tire")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  detailTab === "tire"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Дугуйн байдал
              </button>
              <button
                onClick={() => setDetailTab("odometer")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  detailTab === "odometer"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Км заалт
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/*  OVERVIEW MODE                                                */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {isOverview && (
            <>
              <div className="rounded-lg border bg-card">
                {latestLoading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Уншиж байна...</span>
                  </div>
                ) : latestRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <CircleGauge className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Бүртгэл байхгүй байна
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Улсын дугаар</TableHead>
                        <TableHead>Машин</TableHead>
                        <TableHead>Байдал</TableHead>
                        <TableHead>Огноо</TableHead>
                        <TableHead className="text-right">Км заалт</TableHead>
                        <TableHead>Тэмдэглэл</TableHead>
                        <TableHead>Бүртгэсэн</TableHead>
                        {isManager && (
                          <TableHead className="text-right">Үйлдэл</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {latestRecords.map((record) => {
                        const odo = latestOdoMap.get(record.car_id);
                        return (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {record.license_plate}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {record.car_name || "—"}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${CONDITION_COLORS[record.condition] || ""}`}
                              >
                                {CONDITION_LABELS[record.condition] ||
                                  record.condition}
                              </span>
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {formatDate(record.record_date)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
                              {odo ? formatKm(odo.reading_km) : "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-[140px] truncate">
                              {record.notes || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {record.recorded_by_name || "—"}
                            </TableCell>
                            {isManager && (
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => openEditCondDialog(record)}
                                  >
                                    Засах
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs text-red-500 hover:text-red-600 hover:border-red-300"
                                    onClick={() => setDeleteCondTarget(record)}
                                  >
                                    Устгах
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Cars management list (manager only) */}
              {isManager && cars.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-medium mb-3 text-muted-foreground">
                    Бүртгэлтэй машинууд
                  </h2>
                  <div className="rounded-lg border bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Улсын дугаар</TableHead>
                          <TableHead>Нэр</TableHead>
                          <TableHead>Бүртгэсэн</TableHead>
                          <TableHead className="text-right">Үйлдэл</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cars.map((car) => (
                          <TableRow key={car.id}>
                            <TableCell className="font-medium">
                              {car.license_plate}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {car.car_name || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {car.created_by_name || "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => openEditCarDialog(car)}
                                >
                                  Засах
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs text-red-500 hover:text-red-600 hover:border-red-300"
                                  onClick={() => setDeleteCarTarget(car)}
                                >
                                  Устгах
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/*  CAR DETAIL — TIRE TAB                                        */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {!isOverview && detailTab === "tire" && (
            <div className="rounded-lg border bg-card">
              {monthlyLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Уншиж байна...</span>
                </div>
              ) : monthlyRecords.length === 0 ? (
                <div className="text-center py-12">
                  <CircleGauge className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Энэ сард бүртгэл байхгүй байна
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Огноо</TableHead>
                      <TableHead>Байдал</TableHead>
                      <TableHead>Шинэчилсэн цаг</TableHead>
                      <TableHead>Тэмдэглэл</TableHead>
                      <TableHead>Бүртгэсэн</TableHead>
                      {isManager && (
                        <TableHead className="text-right">Үйлдэл</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {formatDate(record.record_date)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${CONDITION_COLORS[record.condition] || ""}`}
                          >
                            {CONDITION_LABELS[record.condition] ||
                              record.condition}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {formatTime(record.updated_at)}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[160px] truncate">
                          {record.notes || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.recorded_by_name || "—"}
                        </TableCell>
                        {isManager && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => openEditCondDialog(record)}
                              >
                                Засах
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs text-red-500 hover:text-red-600 hover:border-red-300"
                                onClick={() => setDeleteCondTarget(record)}
                              >
                                Устгах
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/*  CAR DETAIL — ODOMETER TAB                                    */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {!isOverview && detailTab === "odometer" && (
            <div className="rounded-lg border bg-card">
              {monthlyOdoLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Уншиж байна...</span>
                </div>
              ) : monthlyOdoRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Gauge className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Энэ сард км заалтын бүртгэл байхгүй байна
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Огноо</TableHead>
                      <TableHead className="text-right">Км заалт</TableHead>
                      <TableHead className="text-right">Зөрүү</TableHead>
                      <TableHead>Тэмдэглэл</TableHead>
                      <TableHead>Бүртгэсэн</TableHead>
                      {isManager && (
                        <TableHead className="text-right">Үйлдэл</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyOdoRecords.map((record, idx) => {
                      const prev =
                        idx > 0 ? monthlyOdoRecords[idx - 1] : null;
                      const diff = prev
                        ? record.reading_km - prev.reading_km
                        : null;
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {formatDate(record.record_date)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatKm(record.reading_km)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {diff !== null ? (
                              <span
                                className={
                                  diff >= 0
                                    ? "text-blue-600"
                                    : "text-red-500"
                                }
                              >
                                {diff >= 0 ? "+" : ""}
                                {diff.toLocaleString()} км
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-[160px] truncate">
                            {record.notes || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.recorded_by_name || "—"}
                          </TableCell>
                          {isManager && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => openEditOdoDialog(record)}
                                >
                                  Засах
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs text-red-500 hover:text-red-600 hover:border-red-300"
                                  onClick={() => setDeleteOdoTarget(record)}
                                >
                                  Устгах
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </main>

        {/* ── Car Create/Edit Dialog ── */}
        <Dialog open={carDialogOpen} onOpenChange={setCarDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                {editingCar ? "Машин засах" : "Машин нэмэх"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="car-plate">Улсын дугаар</Label>
                <Input
                  id="car-plate"
                  placeholder="жишээ нь: 1234УНА"
                  value={carPlate}
                  onChange={(e) => setCarPlate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="car-name">Машины нэр</Label>
                <Input
                  id="car-name"
                  placeholder="жишээ нь: Хүнд даацын 1"
                  value={carNameForm}
                  onChange={(e) => setCarNameForm(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCarDialogOpen(false)}
                  disabled={savingCar}
                >
                  Болих
                </Button>
                <Button onClick={handleSaveCar} disabled={savingCar}>
                  {savingCar && (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  )}
                  {editingCar ? "Хадгалах" : "Нэмэх"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Car Delete Confirmation ── */}
        <AlertDialog
          open={!!deleteCarTarget}
          onOpenChange={(open) => !open && setDeleteCarTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Машин устгах</AlertDialogTitle>
              <AlertDialogDescription>
                &quot;{deleteCarTarget?.license_plate}&quot; машиныг устгахдаа
                итгэлтэй байна уу? Бүх дугуйн болон км заалтын бүртгэл мөн
                устана. Энэ үйлдлийг буцаах боломжгүй.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingCar}>
                Болих
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCar}
                disabled={deletingCar}
                className="bg-red-500 hover:bg-red-600"
              >
                {deletingCar && (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                )}
                Устгах
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Condition Create/Edit Dialog ── */}
        <Dialog open={condDialogOpen} onOpenChange={setCondDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                {editingCond
                  ? "Дугуйн байдал засах"
                  : "Дугуйн байдал бүртгэх"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Машин</Label>
                <Select value={formCarId} onValueChange={setFormCarId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Машин сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={String(car.id)}>
                        {car.license_plate}
                        {car.car_name ? ` — ${car.car_name}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cond-date">Огноо</Label>
                <Input
                  id="cond-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Байдал</Label>
                <Select value={formCondition} onValueChange={setFormCondition}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Байдал сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Сайн</SelectItem>
                    <SelectItem value="fair">Дунд</SelectItem>
                    <SelectItem value="poor">Муу</SelectItem>
                    <SelectItem value="critical">Аюултай</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cond-notes">Тэмдэглэл</Label>
                <Textarea
                  id="cond-notes"
                  placeholder="Нэмэлт тайлбар..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCondDialogOpen(false)}
                  disabled={savingCond}
                >
                  Болих
                </Button>
                <Button onClick={handleSaveCond} disabled={savingCond}>
                  {savingCond && (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  )}
                  {editingCond ? "Хадгалах" : "Бүртгэх"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Condition Delete Confirmation ── */}
        <AlertDialog
          open={!!deleteCondTarget}
          onOpenChange={(open) => !open && setDeleteCondTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Бүртгэл устгах</AlertDialogTitle>
              <AlertDialogDescription>
                Энэ дугуйн байдлын бүртгэлийг устгахдаа итгэлтэй байна уу? Энэ
                үйлдлийг буцаах боломжгүй.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingCond}>
                Болих
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCond}
                disabled={deletingCond}
                className="bg-red-500 hover:bg-red-600"
              >
                {deletingCond && (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                )}
                Устгах
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Odometer Create/Edit Dialog ── */}
        <Dialog open={odoDialogOpen} onOpenChange={setOdoDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                {editingOdo ? "Км заалт засах" : "Км заалт бүртгэх"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Машин</Label>
                <Select value={odoCarId} onValueChange={setOdoCarId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Машин сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={String(car.id)}>
                        {car.license_plate}
                        {car.car_name ? ` — ${car.car_name}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="odo-date">Огноо</Label>
                <Input
                  id="odo-date"
                  type="date"
                  value={odoDate}
                  onChange={(e) => setOdoDate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="odo-km">Км заалт</Label>
                <Input
                  id="odo-km"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="жишээ нь: 125000"
                  value={odoKm}
                  onChange={(e) => setOdoKm(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="odo-notes">Тэмдэглэл</Label>
                <Textarea
                  id="odo-notes"
                  placeholder="Нэмэлт тайлбар..."
                  value={odoNotes}
                  onChange={(e) => setOdoNotes(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setOdoDialogOpen(false)}
                  disabled={savingOdo}
                >
                  Болих
                </Button>
                <Button onClick={handleSaveOdo} disabled={savingOdo}>
                  {savingOdo && (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  )}
                  {editingOdo ? "Хадгалах" : "Бүртгэх"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Odometer Delete Confirmation ── */}
        <AlertDialog
          open={!!deleteOdoTarget}
          onOpenChange={(open) => !open && setDeleteOdoTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Км заалт устгах</AlertDialogTitle>
              <AlertDialogDescription>
                Энэ км заалтын бүртгэлийг устгахдаа итгэлтэй байна уу? Энэ
                үйлдлийг буцаах боломжгүй.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingOdo}>
                Болих
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteOdo}
                disabled={deletingOdo}
                className="bg-red-500 hover:bg-red-600"
              >
                {deletingOdo && (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                )}
                Устгах
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
