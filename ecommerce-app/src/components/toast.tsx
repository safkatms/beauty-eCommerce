"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const ToastComponent = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = "info") => {
    const newToast = { id: Date.now().toString(), message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(newToast.id);
    }, 3000); // Auto-remove after 3 seconds
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    // Exposing the addToast function globally for use
    (window as any).showToast = addToast;
  }, []);

  return (
    <div className="fixed top-5 right-5 flex flex-col gap-2 z-50">
      <AnimatePresence>
        {toasts.map(({ id, message, type }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${
              type === "success"
                ? "bg-green-600"
                : type === "error"
                ? "bg-red-600"
                : "bg-blue-600"
            }`}
          >
            {type === "success" && <CheckCircle size={20} />}
            {type === "error" && <XCircle size={20} />}
            {type === "info" && <Info size={20} />}

            <span>{message}</span>

            <button onClick={() => removeToast(id)} className="ml-auto">
              <X size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastComponent;
