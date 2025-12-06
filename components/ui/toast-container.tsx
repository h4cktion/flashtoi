"use client";

import { useToastStore } from "@/lib/store/toast-store";
import { useEffect, useState } from "react";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out flex items-center justify-between ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : toast.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : toast.type === "warning"
              ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
          role="alert"
        >
          <div className="flex items-center gap-3">
            {toast.type === "success" && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === "error" && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-current opacity-70 hover:opacity-100 focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
