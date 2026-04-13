"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ComputerSpec, ComputerInspection } from "@/types/schema.types";
import { computerSpecsAPI } from "@/lib/computer-specs";
import { useInspectionHistory } from "@/hooks/useComputerSpecs";
import { InspectionFormDialog } from "./InspectionFormDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface InspectionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  spec: ComputerSpec | null;
  onChanged?: () => void;
}

const HISTORY_LIMIT = 10;

export function InspectionHistoryDialog({
  isOpen,
  onClose,
  spec,
  onChanged,
}: InspectionHistoryDialogProps) {
  const [page, setPage] = useState(1);

  // Reset page when dialog opens for a different spec
  useEffect(() => {
    if (isOpen) setPage(1);
  }, [isOpen, spec?.id]);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] =
    useState<ComputerInspection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { inspections, total, loading, refetch } = useInspectionHistory(
    isOpen ? spec?.id ?? null : null,
    page,
    HISTORY_LIMIT
  );

  const totalPages = Math.ceil(total / HISTORY_LIMIT);

  const handleAdd = () => {
    setSelectedInspection(null);
    setFormOpen(true);
  };

  const handleEdit = (inspection: ComputerInspection) => {
    setSelectedInspection(inspection);
    setFormOpen(true);
  };

  const handleDeletePrompt = (inspection: ComputerInspection) => {
    setSelectedInspection(inspection);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (data: {
    inspectionDate: string;
    status: "pass" | "fail";
    notes?: string;
  }) => {
    try {
      if (selectedInspection) {
        await computerSpecsAPI.updateInspection(selectedInspection.id, {
          inspectionDate: data.inspectionDate,
          status: data.status,
          notes: data.notes || null,
        });
        toast.success("Үзлэг амжилттай шинэчлэгдлээ");
      } else if (spec) {
        await computerSpecsAPI.createInspection({
          computerSpecId: spec.id,
          inspectionDate: data.inspectionDate,
          status: data.status,
          notes: data.notes || null,
        });
        toast.success("Үзлэг амжилттай бүртгэгдлээ");
      }
      refetch();
      onChanged?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Хадгалахад алдаа гарлаа"
      );
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedInspection) return;
    try {
      setIsDeleting(true);
      await computerSpecsAPI.deleteInspection(selectedInspection.id);
      toast.success("Үзлэг амжилттай устгагдлаа");
      refetch();
      onChanged?.();
      setDeleteOpen(false);
      setSelectedInspection(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Устгахад алдаа гарлаа");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Үзлэгийн түүх</DialogTitle>
            {spec && (
              <DialogDescription>
                <span className="font-medium text-foreground">
                  {spec.odoo_asset_name}
                </span>
                {spec.odoo_asset_code && (
                  <span className="ml-2 text-muted-foreground">
                    ({spec.odoo_asset_code})
                  </span>
                )}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex justify-end">
            <Button size="sm" onClick={handleAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Үзлэг нэмэх
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Ачааллаж байна...
            </div>
          ) : inspections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Үзлэгийн мэдээлэл байхгүй байна
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Огноо</TableHead>
                    <TableHead>Төлөв</TableHead>
                    <TableHead>Шалгасан</TableHead>
                    <TableHead>Тэмдэглэл</TableHead>
                    <TableHead className="text-right">Үйлдэл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspections.map((ins) => (
                    <TableRow key={ins.id}>
                      <TableCell>
                        {new Date(ins.inspection_date).toLocaleDateString(
                          "mn-MN"
                        )}
                      </TableCell>
                      <TableCell>
                        {ins.status === "pass" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Хэвийн
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            Асуудалтай
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{ins.inspected_by_name || "—"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {ins.notes || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(ins)}
                            title="Засах"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePrompt(ins)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Устгах"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Нийт {total} үзлэг
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <InspectionFormDialog
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedInspection(null);
        }}
        onSubmit={handleFormSubmit}
        inspection={selectedInspection}
        assetName={spec?.odoo_asset_name || undefined}
      />

      <DeleteConfirmDialog
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedInspection(null);
        }}
        onConfirm={handleDelete}
        title="Үзлэг устгах"
        description="Энэ үзлэгийн мэдээллийг устгах уу? Энэ үйлдлийг буцаах боломжгүй."
        isLoading={isDeleting}
      />
    </>
  );
}
