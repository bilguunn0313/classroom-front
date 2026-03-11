"use client";

import { format } from "date-fns";
import { Check, X, Loader2 } from "lucide-react";
import { useMenuResponse } from "@/hooks/useMenu";
import { toast } from "sonner";

interface MenuRSVPProps {
  menuId: number;
  menuDate: string; // "YYYY-MM-DD"
}

export function MenuRSVP({ menuId, menuDate }: MenuRSVPProps) {
  const { myResponse, summary, loading, responding, respond } =
    useMenuResponse(menuId);

  const today = format(new Date(), "yyyy-MM-dd");
  const deadlinePassed = menuDate <= today;

  const handleRespond = async (willAttend: boolean) => {
    try {
      await respond(willAttend);
      toast.success(
        willAttend ? "Идэх гэж бүртгэгдлээ" : "Идэхгүй гэж бүртгэгдлээ",
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Алдаа гарлаа");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-center h-full">
        <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col justify-center h-full">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2.5">
        Хариу өгөх
      </p>

      {deadlinePassed ? (
        <div className="text-sm text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
          Хугацаа дууссан
          {myResponse && (
            <span className="ml-1 font-medium text-gray-500">
              ({myResponse.will_attend ? "Идэх" : "Идэхгүй"})
            </span>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => handleRespond(true)}
            disabled={responding}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                myResponse?.will_attend === true
                  ? "bg-green-500 text-white shadow-sm"
                  : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
              }
              disabled:opacity-50
            `}
          >
            {responding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Иднэ
          </button>
          <button
            onClick={() => handleRespond(false)}
            disabled={responding}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                myResponse?.will_attend === false
                  ? "bg-red-500 text-white shadow-sm"
                  : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              }
              disabled:opacity-50
            `}
          >
            {responding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            Идэхгүй
          </button>
        </div>
      )}

      {/* Summary below buttons */}
      {summary && summary.total > 0 && (
        <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" />
            {summary.attending} идэх
          </span>
          <span className="flex items-center gap-1">
            <X className="h-3 w-3 text-red-400" />
            {summary.not_attending} идэхгүй
          </span>
        </div>
      )}
    </div>
  );
}
