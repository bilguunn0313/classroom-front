"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ComputerSpec } from "@/types/schema.types";
import { useSpecHistory } from "@/hooks/useComputerSpecs";

interface SpecHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  spec: ComputerSpec | null;
}

const HISTORY_LIMIT = 10;

export function SpecHistoryDialog({
  isOpen,
  onClose,
  spec,
}: SpecHistoryDialogProps) {
  const [page, setPage] = useState(1);

  // Reset page when dialog opens for a different spec
  useEffect(() => {
    if (isOpen) setPage(1);
  }, [isOpen, spec?.id]);

  const { history, total, loading } = useSpecHistory(
    isOpen ? spec?.id ?? null : null,
    page,
    HISTORY_LIMIT
  );

  const totalPages = Math.ceil(total / HISTORY_LIMIT);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Мэдээллийн түүх</DialogTitle>
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

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Ачааллаж байна...
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Түүх байхгүй байна
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Огноо</TableHead>
                  <TableHead>Тодорхойлолт</TableHead>
                  <TableHead>Тэмдэглэл</TableHead>
                  <TableHead>Оруулсан</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="whitespace-nowrap align-top">
                      {new Date(h.created_at).toLocaleDateString("mn-MN")}
                    </TableCell>
                    <TableCell className="max-w-[300px] whitespace-pre-wrap align-top">
                      {h.descr || "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] whitespace-pre-wrap align-top">
                      {h.notes || "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap align-top">
                      {h.created_by_name || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Нийт {total} хувилбар</p>
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
  );
}
