"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>({ confirm: async () => false });

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    return new Promise((resolve) => { resolveRef.current = resolve; });
  }, []);

  const handleConfirm = () => { resolveRef.current?.(true); setOptions(null); };
  const handleCancel = () => { resolveRef.current?.(false); setOptions(null); };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={handleCancel} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {options.title && <h3 className="text-lg font-semibold text-[color:var(--fg)] mb-2">{options.title}</h3>}
            <p className="text-sm text-[color:var(--muted)] mb-6 leading-relaxed">{options.message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-[color:var(--muted)] hover:text-[color:var(--fg)] rounded-lg hover:bg-[color:var(--surface)] transition-colors">
                {options.cancelText || "취소"}
              </button>
              <button onClick={handleConfirm} className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                options.variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-[color:var(--fg)] hover:opacity-90"
              }`}>
                {options.confirmText || "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
