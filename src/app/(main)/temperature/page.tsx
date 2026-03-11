"use client";

import { useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUserContext } from "@/lib/userProvider";
import { useTemperatureRecords } from "@/hooks/useTemperature";
import { temperatureAPI } from "@/lib/temperature";
import { TemperatureRecord } from "@/types/schema.types";
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
  Thermometer,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  ArrowLeft,
  Download,
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

function exportCSV(records: TemperatureRecord[], year: number, month: number) {
  const header = ["Огноо", "Температур (°C)", "Шинэчилсэн цаг", "Тэмдэглэл", "Бүртгэсэн"];
  const rows = records.map((r) => [
    String(r.record_date).split("T")[0],
    String(r.temperature),
    formatTime(r.updated_at),
    r.notes ? `"${r.notes.replace(/"/g, '""')}"` : "",
    r.recorded_by_name || "",
  ]);

  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  const bom = "\uFEFF"; // UTF-8 BOM so Excel opens Mongolian text correctly
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `temperature-${year}-${String(month).padStart(2, "0")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TemperaturePage() {
  const { user } = useUserContext();
  const isManager = user?.role === "admin" || user?.role === "supervisor";

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { records, loading, refetch } = useTemperatureRecords(year, month);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TemperatureRecord | null>(null);
  const [formDate, setFormDate] = useState("");
  const [formTemp, setFormTemp] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<TemperatureRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const openCreateDialog = () => {
    setEditing(null);
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setFormDate(todayStr);
    setFormTemp("");
    setFormNotes("");
    setDialogOpen(true);
  };

  const openEditDialog = (record: TemperatureRecord) => {
    setEditing(record);
    setFormDate(String(record.record_date).split("T")[0]);
    setFormTemp(String(record.temperature));
    setFormNotes(record.notes || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formDate || !formTemp) {
      toast.error("Огноо болон температур оруулна уу");
      return;
    }

    const tempNum = parseFloat(formTemp);
    if (isNaN(tempNum)) {
      toast.error("Температур тоо байх ёстой");
      return;
    }

    try {
      setSaving(true);
      if (editing) {
        await temperatureAPI.update(editing.id, {
          recordDate: formDate,
          temperature: tempNum,
          notes: formNotes || null,
        });
        toast.success("Температур шинэчлэгдлээ");
      } else {
        await temperatureAPI.create({
          recordDate: formDate,
          temperature: tempNum,
          notes: formNotes || null,
        });
        toast.success("Температур бүртгэгдлээ");
      }
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Алдаа гарлаа";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await temperatureAPI.delete(deleteTarget.id);
      toast.success("Бүртгэл устгагдлаа");
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Алдаа гарлаа";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-10 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/home"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center">
              <Thermometer className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Температурын бүртгэл
              </h1>
              <p className="text-xs text-muted-foreground">
                Агуулахын өдөр тутмын температур
              </p>
            </div>
          </div>

          {/* Month navigation + Add button */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
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
            </div>

            <div className="flex items-center gap-2">
              {records.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCSV(records, year, month)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV татах
                </Button>
              )}
              {isManager && (
                <Button size="sm" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-1" />
                  Бүртгэх
                </Button>
              )}
            </div>
          </div>

          {/* Data table */}
          <div className="rounded-lg border bg-card">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Уншиж байна...</span>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12">
                <Thermometer className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Энэ сард бүртгэл байхгүй байна
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Огноо</TableHead>
                    <TableHead className="text-right">Температур</TableHead>
                    <TableHead>Шинэчилсэн цаг</TableHead>
                    <TableHead>Тэмдэглэл</TableHead>
                    <TableHead>Бүртгэсэн</TableHead>
                    {isManager && (
                      <TableHead className="text-right">Үйлдэл</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {formatDate(record.record_date)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {record.temperature}°C
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
                              onClick={() => openEditDialog(record)}
                            >
                              Засах
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-red-500 hover:text-red-600 hover:border-red-300"
                              onClick={() => setDeleteTarget(record)}
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
        </main>

        {/* Create / Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Температур засах" : "Температур бүртгэх"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="record-date">Огноо</Label>
                <Input
                  id="record-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="temperature">Температур (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="жишээ нь: -18.5"
                  value={formTemp}
                  onChange={(e) => setFormTemp(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="notes">Тэмдэглэл</Label>
                <Textarea
                  id="notes"
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
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                >
                  Болих
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  )}
                  {editing ? "Хадгалах" : "Бүртгэх"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Бүртгэл устгах</AlertDialogTitle>
              <AlertDialogDescription>
                Энэ температурын бүртгэлийг устгахдаа итгэлтэй байна уу? Энэ
                үйлдлийг буцаах боломжгүй.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Болих</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600"
              >
                {deleting && (
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
