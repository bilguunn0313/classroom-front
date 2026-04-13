"use client";

import { useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUserContext } from "@/lib/userProvider";
// import { useCars } from "@/hooks/useCars";
import {
  useFleetVehicles,
  useDepartments,
  useVehicleStates,
  useVehicleModels,
} from "@/hooks/useFleet";
// import {
//   useTireConditionRecords,
//   useLatestTireConditions,
// } from "@/hooks/useTireCondition";
// import { useOdometerRecords, useLatestOdometer } from "@/hooks/useOdometer";
// import { carAPI } from "@/lib/car";
import { fleetAPI } from "@/lib/fleet";
// import { tireConditionAPI } from "@/lib/tire-condition";
// import { odometerAPI } from "@/lib/odometer";
import {
  // Car,
  FleetVehicle,
  // TireCondition,
  // OdometerReading,
  CreateVehicleData,
} from "@/types/schema.types";
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
// import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import {
  CircleGauge,
  // ChevronLeft,
  // ChevronRight,
  // Plus,
  Loader2,
  ArrowLeft,
  // Download,
  // Car as CarIcon,
  // Gauge,
  Truck,
  Check,
} from "lucide-react";

// const MONTH_NAMES = [
//   "1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар",
//   "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар",
// ];

// const CONDITION_LABELS: Record<string, string> = {
//   good: "Сайн", fair: "Дунд", poor: "Муу", critical: "Аюултай",
// };

// const CONDITION_COLORS: Record<string, string> = {
//   good: "bg-green-100 text-green-700 border-green-200",
//   fair: "bg-yellow-100 text-yellow-700 border-yellow-200",
//   poor: "bg-orange-100 text-orange-700 border-orange-200",
//   critical: "bg-red-100 text-red-700 border-red-200",
// };

// type DetailTab = "tire" | "odometer";

// function formatDate(dateStr: string): string {
//   const d = new Date(dateStr + "T00:00:00");
//   const days = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];
//   return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`;
// }

// function formatTime(dateStr: string): string {
//   const d = new Date(dateStr);
//   const h = String(d.getHours()).padStart(2, "0");
//   const m = String(d.getMinutes()).padStart(2, "0");
//   return `${h}:${m}`;
// }

function formatKm(km: number): string {
  return km.toLocaleString() + " км";
}

function odooLabel(field: [number, string] | false): string {
  if (field === false || !field) return "—";
  return field[1];
}

// function exportTireCSV(...) { ... } — commented out (local tire system disabled)

// ── Default form state for fleet vehicle ──
const emptyVehicleForm = (): Record<string, string> => ({
  license_plate: "",
  vin_sn: "",
  model_id: "",
  department_id: "",
  related_department_id: "",
  color: "",
  ownership_type: "",
  technical_config: "",
  car_type: "",
  sub_type: "",
  manufacture_date: "",
  program_code: "",
  related_asset: "",
  capacity: "0",
  load_capacity: "0",
  state_id: "",
});

export default function TireConditionPage() {
  const { user } = useUserContext();
  const isManager = user?.role === "admin" || user?.role === "supervisor";

  // // Old car system — disabled (using Odoo fleet instead)
  // const { cars, refetch: refetchCars } = useCars();

  // Odoo fleet system
  const { vehicles, loading: vehiclesLoading, refetch: refetchVehicles } = useFleetVehicles();
  const { departments } = useDepartments();
  const { states } = useVehicleStates();
  const { models } = useVehicleModels();

  // // Local tire/odometer — disabled (using Odoo fleet instead)
  // const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  // const [detailTab, setDetailTab] = useState<DetailTab>("tire");
  // const now = new Date();
  // const [year, setYear] = useState(now.getFullYear());
  // const [month, setMonth] = useState(now.getMonth() + 1);
  // const { records: latestRecords, loading: latestLoading, refetch: refetchLatest } = useLatestTireConditions();
  // const { records: monthlyRecords, loading: monthlyLoading, refetch: refetchMonthly } = useTireConditionRecords(selectedCarId, year, month);
  // const { records: latestOdoRecords, refetch: refetchLatestOdo } = useLatestOdometer();
  // const { records: monthlyOdoRecords, loading: monthlyOdoLoading, refetch: refetchMonthlyOdo } = useOdometerRecords(selectedCarId, year, month);
  // const isOverview = selectedCarId === null;
  // const latestOdoMap = new Map<number, OdometerReading>();
  // for (const r of latestOdoRecords) { latestOdoMap.set(r.car_id, r); }

  // // ── Old Car dialog state — disabled ──
  // const [carDialogOpen, setCarDialogOpen] = useState(false);
  // const [editingCar, setEditingCar] = useState<Car | null>(null);
  // const [carPlate, setCarPlate] = useState("");
  // const [carNameForm, setCarNameForm] = useState("");
  // const [savingCar, setSavingCar] = useState(false);
  // const [deleteCarTarget, setDeleteCarTarget] = useState<Car | null>(null);
  // const [deletingCar, setDeletingCar] = useState(false);

  // ── Fleet Vehicle dialog state ──
  const [fleetDialogOpen, setFleetDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<FleetVehicle | null>(null);
  const [vForm, setVForm] = useState<Record<string, string>>(emptyVehicleForm());
  const [savingVehicle, setSavingVehicle] = useState(false);

  const [deleteVehicleTarget, setDeleteVehicleTarget] = useState<FleetVehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState(false);

  // // ── Condition dialog state — disabled ──
  // const [condDialogOpen, setCondDialogOpen] = useState(false);
  // const [editingCond, setEditingCond] = useState<TireCondition | null>(null);
  // const [formCarId, setFormCarId] = useState("");
  // const [formDate, setFormDate] = useState("");
  // const [formCondition, setFormCondition] = useState("");
  // const [formNotes, setFormNotes] = useState("");
  // const [savingCond, setSavingCond] = useState(false);
  // const [deleteCondTarget, setDeleteCondTarget] = useState<TireCondition | null>(null);
  // const [deletingCond, setDeletingCond] = useState(false);

  // // ── Odometer dialog state — disabled ──
  // const [odoDialogOpen, setOdoDialogOpen] = useState(false);
  // const [editingOdo, setEditingOdo] = useState<OdometerReading | null>(null);
  // const [odoCarId, setOdoCarId] = useState("");
  // const [odoDate, setOdoDate] = useState("");
  // const [odoKm, setOdoKm] = useState("");
  // const [odoNotes, setOdoNotes] = useState("");
  // const [savingOdo, setSavingOdo] = useState(false);
  // const [deleteOdoTarget, setDeleteOdoTarget] = useState<OdometerReading | null>(null);
  // const [deletingOdo, setDeletingOdo] = useState(false);

  // // ── Month nav, Car CRUD, Condition CRUD, Odometer CRUD — all disabled ──
  // // (local PostgreSQL tire/odometer system commented out — using Odoo fleet)

  // ── Fleet Vehicle CRUD ──
  const updateVField = (key: string, value: string) => {
    setVForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCreateVehicleDialog = () => {
    setEditingVehicle(null);
    setVForm(emptyVehicleForm());
    setFleetDialogOpen(true);
  };

  const openEditVehicleDialog = (v: FleetVehicle) => {
    setEditingVehicle(v);
    setVForm({
      license_plate: v.license_plate || "",
      vin_sn: v.vin_sn || "",
      model_id: v.model_id ? String(v.model_id[0]) : "",
      department_id: v.department_id ? String(v.department_id[0]) : "",
      related_department_id: v.related_department_id ? String(v.related_department_id[0]) : "",
      color: v.color || "",
      ownership_type: v.ownership_type || "",
      technical_config: v.technical_config || "",
      car_type: v.car_type || "",
      sub_type: v.sub_type || "",
      manufacture_date: v.manufacture_date || "",
      program_code: v.program_code || "",
      related_asset: v.related_asset || "",
      capacity: String(v.capacity || 0),
      load_capacity: String(v.load_capacity || 0),
      state_id: v.state_id ? String(v.state_id[0]) : "",
    });
    setFleetDialogOpen(true);
  };

  const handleSaveVehicle = async () => {
    if (!vForm.license_plate.trim()) {
      toast.error("Улсын дугаар оруулна уу");
      return;
    }
    try {
      setSavingVehicle(true);
      const payload: CreateVehicleData = {
        license_plate: vForm.license_plate.trim(),
        vin_sn: vForm.vin_sn.trim() || undefined,
        model_id: vForm.model_id ? Number(vForm.model_id) : undefined,
        department_id: vForm.department_id ? Number(vForm.department_id) : undefined,
        related_department_id: vForm.related_department_id ? Number(vForm.related_department_id) : undefined,
        state_id: vForm.state_id ? Number(vForm.state_id) : undefined,
        color: vForm.color.trim() || undefined,
        ownership_type: vForm.ownership_type || undefined,
        technical_config: vForm.technical_config.trim() || undefined,
        car_type: vForm.car_type.trim() || undefined,
        sub_type: vForm.sub_type.trim() || undefined,
        manufacture_date: vForm.manufacture_date || undefined,
        program_code: vForm.program_code.trim() || undefined,
        related_asset: vForm.related_asset.trim() || undefined,
        capacity: vForm.capacity !== "" ? Number(vForm.capacity) : undefined,
        load_capacity: vForm.load_capacity !== "" ? Number(vForm.load_capacity) : undefined,
      };

      if (editingVehicle) {
        await fleetAPI.updateVehicle(editingVehicle.id, payload);
        toast.success("Тээврийн хэрэгсэл шинэчлэгдлээ");
      } else {
        await fleetAPI.createVehicle(payload);
        toast.success("Тээврийн хэрэгсэл бүртгэгдлээ");
      }
      setFleetDialogOpen(false);
      refetchVehicles();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Алдаа гарлаа";
      toast.error(msg);
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deleteVehicleTarget) return;
    try {
      setDeletingVehicle(true);
      await fleetAPI.deleteVehicle(deleteVehicleTarget.id);
      toast.success("Тээврийн хэрэгсэл устгагдлаа");
      setDeleteVehicleTarget(null);
      refetchVehicles();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Алдаа гарлаа";
      toast.error(msg);
    } finally {
      setDeletingVehicle(false);
    }
  };

  // // ── Condition CRUD + Odometer CRUD — disabled (local system) ──

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-10 max-w-[1600px]">
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

          {/* Actions */}
          <div className="flex items-center justify-end mb-5">
            {isManager && (
              <Button
                size="sm"
                onClick={openCreateVehicleDialog}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                variant="outline"
              >
                <Truck className="h-4 w-4 mr-1" />
                ӨҮ бүртгэх
              </Button>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/*  FLEET VEHICLES (Odoo ERP)                                    */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="rounded-lg border bg-card">
            {vehiclesLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Уншиж байна...</span>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Odoo-д бүртгэлтэй тээврийн хэрэгсэл байхгүй
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Улсын дугаар</TableHead>
                    <TableHead>Нэр</TableHead>
                    <TableHead>Модел</TableHead>
                    <TableHead>Салбар</TableHead>
                    <TableHead>Төлөв</TableHead>
                    <TableHead className="text-right">Км</TableHead>
                    {isManager && (
                      <TableHead className="text-right">Үйлдэл</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">
                        {v.license_plate || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {v.name || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {odooLabel(v.model_id)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {odooLabel(v.department_id)}
                      </TableCell>
                      <TableCell>
                        {v.state_id ? (
                          <Badge variant="secondary" className="text-[11px] font-normal">
                            {v.state_id[1]}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {v.odometer ? formatKm(v.odometer) : "—"}
                      </TableCell>
                      {isManager && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => openEditVehicleDialog(v)}
                            >
                              Засах
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-red-500 hover:text-red-600 hover:border-red-300"
                              onClick={() => setDeleteVehicleTarget(v)}
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

          {/* Local tire + odometer tabs — disabled (using Odoo fleet) */}
        </main>

        {/* Old Car + Car Delete dialogs — disabled (using Odoo fleet) */}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  FLEET VEHICLE CREATE/EDIT DIALOG (Odoo ERP)                    */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <Dialog open={fleetDialogOpen} onOpenChange={setFleetDialogOpen}>
          <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                {editingVehicle
                  ? "Тээврийн хэрэгсэл засах"
                  : "Тээврийн хэрэгсэл бүртгэх"}
              </DialogTitle>
            </DialogHeader>

            {/* Status workflow bar */}
            {states.length > 0 && (
              <div className="flex items-center gap-1 px-1 py-2 bg-muted/40 rounded-lg overflow-x-auto">
                {states.map((st, idx) => {
                  const isActive = vForm.state_id === String(st.id);
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => updateVField("state_id", String(st.id))}
                      className={`
                        relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
                        transition-all duration-200 whitespace-nowrap
                        ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }
                      `}
                    >
                      {isActive && <Check className="h-3 w-3" />}
                      <span>{st.name}</span>
                      {idx < states.length - 1 && (
                        <span className="absolute -right-1 top-1/2 -translate-y-1/2 text-muted-foreground/30 text-[10px] pointer-events-none">
                          ›
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-5 pt-1">
              {/* Two-column form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {/* ── Left column ── */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="v-plate" className="text-xs font-medium">
                      Улсын дугаар <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="v-plate"
                      placeholder="жишээ нь: 1234УНА"
                      value={vForm.license_plate}
                      onChange={(e) => updateVField("license_plate", e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="v-vin" className="text-xs font-medium">
                      Арлын дугаар (VIN)
                    </Label>
                    <Input
                      id="v-vin"
                      placeholder="VIN / Chassis number"
                      value={vForm.vin_sn}
                      onChange={(e) => updateVField("vin_sn", e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Модел</Label>
                    <Select
                      value={vForm.model_id}
                      onValueChange={(val) => updateVField("model_id", val)}
                    >
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue placeholder="Модел сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.name}
                            {m.brand_id ? ` (${m.brand_id[1]})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Салбар</Label>
                    <Select
                      value={vForm.department_id}
                      onValueChange={(val) => updateVField("department_id", val)}
                    >
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue placeholder="Салбар сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Хамаарах салбар</Label>
                    <Select
                      value={vForm.related_department_id}
                      onValueChange={(val) => updateVField("related_department_id", val)}
                    >
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue placeholder="Хамаарах салбар" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="v-color" className="text-xs font-medium">
                      Өнгө
                    </Label>
                    <Input
                      id="v-color"
                      placeholder="жишээ нь: Цагаан"
                      value={vForm.color}
                      onChange={(e) => updateVField("color", e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                </div>

                {/* ── Right column ── */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium">Өмчлөлийн төрөл</Label>
                    <Select
                      value={vForm.ownership_type}
                      onValueChange={(val) => updateVField("ownership_type", val)}
                    >
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue placeholder="Төрөл сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="own">Өөрийн хөрөнгө</SelectItem>
                        <SelectItem value="contract">Гэрээт</SelectItem>
                        <SelectItem value="loan">Зээлтэй</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="v-tech" className="text-xs font-medium">
                      Техникийн тохиргоо
                    </Label>
                    <Input
                      id="v-tech"
                      placeholder="Техникийн мэдээлэл"
                      value={vForm.technical_config}
                      onChange={(e) => updateVField("technical_config", e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="v-type" className="text-xs font-medium">
                      Машины төрөл
                    </Label>
                    <Input
                      id="v-type"
                      placeholder="жишээ нь: Суудлын"
                      value={vForm.car_type}
                      onChange={(e) => updateVField("car_type", e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="v-subtype" className="text-xs font-medium">
                      Дэд төрөл
                    </Label>
                    <Input
                      id="v-subtype"
                      placeholder="жишээ нь: Жийп"
                      value={vForm.sub_type}
                      onChange={(e) => updateVField("sub_type", e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="v-mfg" className="text-xs font-medium">
                      Үйлдвэрлэсэн огноо
                    </Label>
                    <Input
                      id="v-mfg"
                      type="date"
                      value={vForm.manufacture_date}
                      onChange={(e) => updateVField("manufacture_date", e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="v-prog" className="text-xs font-medium">
                      Програм код
                    </Label>
                    <Input
                      id="v-prog"
                      placeholder="Програм код"
                      value={vForm.program_code}
                      onChange={(e) => updateVField("program_code", e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom row — spans both columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 border-t">
                <div className="pt-3">
                  <Label htmlFor="v-asset" className="text-xs font-medium">
                    Холбогдох хөрөнгө
                  </Label>
                  <Input
                    id="v-asset"
                    placeholder="Хөрөнгийн код"
                    value={vForm.related_asset}
                    onChange={(e) => updateVField("related_asset", e.target.value)}
                    className="mt-1 h-9"
                  />
                </div>
                <div className="pt-3">
                  <Label htmlFor="v-cap" className="text-xs font-medium">
                    Багтаамж (хүн)
                  </Label>
                  <Input
                    id="v-cap"
                    type="number"
                    min="0"
                    value={vForm.capacity}
                    onChange={(e) => updateVField("capacity", e.target.value)}
                    className="mt-1 h-9"
                  />
                </div>
                <div className="pt-3">
                  <Label htmlFor="v-load" className="text-xs font-medium">
                    Даац (кг)
                  </Label>
                  <Input
                    id="v-load"
                    type="number"
                    min="0"
                    value={vForm.load_capacity}
                    onChange={(e) => updateVField("load_capacity", e.target.value)}
                    className="mt-1 h-9"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  onClick={() => setFleetDialogOpen(false)}
                  disabled={savingVehicle}
                >
                  Болих
                </Button>
                <Button
                  onClick={handleSaveVehicle}
                  disabled={savingVehicle}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {savingVehicle && (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  )}
                  {editingVehicle ? "Хадгалах" : "Бүртгэх"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Fleet Vehicle Delete Confirmation ── */}
        <AlertDialog
          open={!!deleteVehicleTarget}
          onOpenChange={(open) => !open && setDeleteVehicleTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Тээврийн хэрэгсэл устгах</AlertDialogTitle>
              <AlertDialogDescription>
                &quot;{deleteVehicleTarget?.license_plate || deleteVehicleTarget?.name}&quot; тээврийн хэрэгслийг
                Odoo ERP-ээс устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingVehicle}>
                Болих
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteVehicle}
                disabled={deletingVehicle}
                className="bg-red-500 hover:bg-red-600"
              >
                {deletingVehicle && (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                )}
                Устгах
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Condition + Odometer dialogs — disabled (using Odoo fleet) */}
      </div>
    </ProtectedRoute>
  );
}
