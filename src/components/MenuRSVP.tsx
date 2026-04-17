"use client";

import { format } from "date-fns";
import { Check, X, Loader2, Undo2 } from "lucide-react";
import { useMenuResponse } from "@/hooks/useMenu";
import { toast } from "sonner";

interface MenuRSVPProps {
  menuId: number;
  menuDate: string; // "YYYY-MM-DD"
}

export function MenuRSVP({ menuId, menuDate }: MenuRSVPProps) {
  const { myResponse, summary, loading, responding, respond, cancel } =
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

  const handleCancel = async () => {
    try {
      await cancel();
      toast.success("Хариу цуцлагдлаа");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Алдаа гарлаа");
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  const hasResponded = myResponse != null;
  const total = summary ? summary.attending + summary.not_attending : 0;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Summary bar */}
      {total > 0 && (
        <div className="flex items-center gap-4 px-5 py-2.5 bg-muted/40 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Хариултууд
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {summary!.attending}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {summary!.not_attending}
            </span>
          </div>
        </div>
      )}

      <div className="p-5">
        {deadlinePassed ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              {myResponse?.will_attend ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : myResponse ? (
                <X className="h-4 w-4 text-red-400" />
              ) : (
                <X className="h-4 w-4 text-gray-300" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground/70">Хугацаа дууссан</p>
              {myResponse && (
                <p className="text-xs mt-0.5">
                  Таны хариу: {myResponse.will_attend ? "Идэх" : "Идэхгүй"}
                </p>
              )}
            </div>
          </div>
        ) : hasResponded ? (
          <div className="space-y-3">
            <div
              className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                myResponse.will_attend
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  myResponse.will_attend
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {myResponse.will_attend ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    myResponse.will_attend ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {myResponse.will_attend
                    ? "Та идэх гэж бүртгүүллээ"
                    : "Та идэхгүй гэж бүртгүүллээ"}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              disabled={responding}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all duration-200 disabled:opacity-50"
            >
              {responding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Undo2 className="h-3.5 w-3.5" />
              )}
              Цуцлах
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Та өнөөдрийн хоолонд идэх үү?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRespond(true)}
                disabled={responding}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-green-500 text-white hover:bg-green-600 active:scale-[0.98] shadow-sm hover:shadow disabled:opacity-50"
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
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-card text-muted-foreground hover:text-foreground border border-border hover:border-gray-300 active:scale-[0.98] disabled:opacity-50"
              >
                {responding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Идэхгүй
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
