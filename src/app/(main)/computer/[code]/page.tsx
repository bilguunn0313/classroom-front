"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { computerSpecsAPI } from "@/lib/computer-specs";
import { ComputerSpec } from "@/types/schema.types";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  StickyNote,
  Laptop,
  AlertCircle,
  Loader2,
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
        <p className="text-[15px] font-medium text-gray-900 mt-0.5 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ComputerSpecPublicPage() {
  const params = useParams();
  const code = params.code as string;

  const [spec, setSpec] = useState<ComputerSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    const fetchSpec = async () => {
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
    };

    fetchSpec();
  }, [code]);

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
      icon: <Cpu className="h-4.5 w-4.5" />,
      label: "Процессор",
      value: spec.cpu,
    },
    {
      icon: <MemoryStick className="h-4.5 w-4.5" />,
      label: "Санах ой",
      value: spec.ram,
    },
    {
      icon: <HardDrive className="h-4.5 w-4.5" />,
      label: "Hard Disk",
      value: spec.storage,
    },
    {
      icon: <Laptop className="h-4.5 w-4.5" />,
      label: "Үйлдлийн систем",
      value: spec.os,
    },
    {
      icon: <Monitor className="h-4.5 w-4.5" />,
      label: "Монитор",
      value: spec.monitor,
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

          {/* Footer */}
          <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 text-center font-medium">
              Космо ERP &middot; Тоног төхөөрөмжийн бүртгэл
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
