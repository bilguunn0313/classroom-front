"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function ScanPageContent() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  // Keep input focused so the Bluetooth HID scanner always has a target
  useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    focusInput();
    const interval = setInterval(focusInput, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = value.trim();
    if (!code) return;
    setRedirecting(true);
    router.push(`/computer/${encodeURIComponent(code)}`);
  };

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
          {redirecting ? (
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          ) : (
            <ScanLine className="h-10 w-10 text-blue-600" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          баркод уншуулна уу
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Bluetooth скайнераа төхөөрөмжийн зураас руу чиглүүл
        </p>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            inputMode="none"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTimeout(() => inputRef.current?.focus(), 100)}
            className="w-full text-center text-lg font-mono tracking-wider px-4 py-3 rounded-xl border-2 border-blue-200 bg-white focus:border-blue-500 focus:outline-none"
            placeholder="..."
            disabled={redirecting}
          />
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Скайнер бэлэн</span>
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <ProtectedRoute>
      <ScanPageContent />
    </ProtectedRoute>
  );
}
