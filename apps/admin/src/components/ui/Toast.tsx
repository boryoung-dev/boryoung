"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { X, Check, AlertCircle } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(0);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++nextIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = { success: <Check className="w-4 h-4" />, error: <AlertCircle className="w-4 h-4" />, info: <AlertCircle className="w-4 h-4" /> };
  const colors = { success: "bg-emerald-600", error: "bg-red-600", info: "bg-[color:var(--fg)]" };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm shadow-lg ${colors[t.type]} animate-in slide-in-from-bottom-2 fade-in duration-200`}>
            {icons[t.type]}
            <span>{t.message}</span>
            <button onClick={() => remove(t.id)} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
