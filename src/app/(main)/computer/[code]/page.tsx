"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { computerSpecsAPI } from "@/lib/computer-specs";
import { ComputerSpecWithInspection } from "@/types/schema.types";
import { useUserContext } from "@/lib/userProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ComputerSpecFormDialog } from "@/components/admin/ComputerSpecFormDialog";
import { InspectionFormDialog } from "@/components/admin/InspectionFormDialog";
import { toast } from "sonner";
import {
  FileText,
  StickyNote,
  Monitor,
  AlertCircle,
  Loader2,
  Pencil,
  ClipboardCheck,
} from "lucide-react";

interface SpecField {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}

function SpecRow({ icon, label, value }: SpecField) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="text-[15px] font-medium text-gray-900 mt-0.5 break-words whitespace-pre-line">
          {value}
        </p>
      </div>
    </div>
  );
}

function ComputerSpecContent() {
  const params = useParams();
  const code = params.code as string;
  const { user } = useUserContext();
  const isAdmin = user?.role === "admin";

  const [spec, setSpec] = useState<ComputerSpecWithInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inspectionDialogOpen, setInspectionDialogOpen] = useState(false);

  const fetchSpec = useCallback(async () => {
    if (!code) return;
    try {
      setLoading(true);
      setError(null);
      const response = await computerSpecsAPI.getByCode(code);
      if (response.success) {
        setSpec(response.data);
      } else {
        setError("Мэдээлэл олдсонгүй");
      }
    } catch {
      setError("Мэдээлэл олдсонгүй");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchSpec();
  }, [fetchSpec]);

  const handleEditSubmit = async (data: { descr?: string; notes?: string }) => {
    if (!spec) return;
    try {
      await computerSpecsAPI.update(spec.id, data);
      toast.success("Мэдээлэл амжилттай шинэчлэгдлээ");
      setEditDialogOpen(false);
      await fetchSpec();
    } catch {
      toast.error("Шинэчлэхэд алдаа гарлаа");
    }
  };

  const handleInspectionSubmit = async (data: {
    inspectionDate: string;
    status: "pass" | "fail";
    notes?: string;
  }) => {
    if (!spec) return;
    try {
      await computerSpecsAPI.createInspection({
        computerSpecId: spec.id,
        inspectionDate: data.inspectionDate,
        status: data.status,
        notes: data.notes || null,
      });
      toast.success("Үзлэг амжилттай бүртгэгдлээ");
      setInspectionDialogOpen(false);
      await fetchSpec();
    } catch {
      toast.error("Үзлэг бүртгэхэд алдаа гарлаа");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-400 font-medium">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  // Error / not found state
  if (error || !spec) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50 px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Мэдээлэл олдсонгүй
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">
              {code}
            </span>{" "}
            кодтой компьютерийн мэдээлэл бүртгэгдээгүй байна.
          </p>
        </div>
      </div>
    );
  }

  const specFields: SpecField[] = [
    {
      icon: <FileText className="h-4.5 w-4.5" />,
      label: "Тодорхойлолт",
      value: spec.descr,
    },
    {
      icon: <StickyNote className="h-4.5 w-4.5" />,
      label: "Тэмдэглэл",
      value: spec.notes,
    },
  ];

  const hasAnySpec = specFields.some((f) => f.value);

  return (
    <div className="min-h-svh bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50">
      {/* Header band */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-4 pt-10 pb-16 text-white">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
              <Monitor className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-blue-100">
              Тоног төхөөрөмж
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
            {spec.odoo_asset_name || "Нэргүй хөрөнгө"}
          </h1>

          {spec.odoo_asset_code && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-md px-3 py-1.5">
              <span className="text-xs font-bold tracking-wider text-blue-100">
                КОД
              </span>
              <span className="text-sm font-semibold">
                {spec.odoo_asset_code}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Spec card — overlaps the header */}
      <div className="px-4 -mt-8 pb-10">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg shadow-blue-900/8 border border-gray-100 overflow-hidden">
          {hasAnySpec ? (
            <div className="px-5 py-2">
              {specFields.map((field, idx) => (
                <SpecRow key={idx} {...field} />
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-gray-400">
                Техникийн мэдээлэл бүртгэгдээгүй байна
              </p>
            </div>
          )}

          {/* Latest Inspection */}
          {spec.latest_inspection && (
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Сүүлийн үзлэг
              </p>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    spec.latest_inspection.status === "pass"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {spec.latest_inspection.status === "pass"
                    ? "Хэвийн"
                    : "Асуудалтай"}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(
                    spec.latest_inspection.inspection_date
                  ).toLocaleDateString("mn-MN")}
                </span>
              </div>
              {spec.latest_inspection.notes && (
                <p className="text-sm text-gray-500 mt-1.5">
                  {spec.latest_inspection.notes}
                </p>
              )}
            </div>
          )}

          {/* Admin action buttons */}
          {isAdmin && (
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setEditDialogOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 active:bg-blue-200 transition-colors"
              >
                <Pencil className="h-4 w-4" />
                Мэдээлэл засах
              </button>
              <button
                onClick={() => setInspectionDialogOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 active:bg-green-200 transition-colors"
              >
                <ClipboardCheck className="h-4 w-4" />
                Үзлэг нэмэх
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 text-center font-medium">
              Космо ERP &middot; Тоног төхөөрөмжийн бүртгэл
            </p>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {isAdmin && (
        <>
          <ComputerSpecFormDialog
            isOpen={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onSubmit={handleEditSubmit}
            spec={spec}
          />
          <InspectionFormDialog
            isOpen={inspectionDialogOpen}
            onClose={() => setInspectionDialogOpen(false)}
            onSubmit={handleInspectionSubmit}
            assetName={spec.odoo_asset_name || spec.odoo_asset_code || undefined}
          />
        </>
      )}
    </div>
  );
}

export default function ComputerSpecPublicPage() {
  return (
    <ProtectedRoute>
      <ComputerSpecContent />
    </ProtectedRoute>
  );
}
