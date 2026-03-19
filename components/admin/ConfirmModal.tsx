// --- SimpleConfirmModal (put near top of file) ---
import React from "react";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};

const ConfirmModal = ({
  open,
  title,
  message,
  loading,
  onCancel,
  onConfirm,
}: ConfirmModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold">{title ?? "Confirm"}</h3>
        <p className="mt-2 text-sm text-gray-600">
          {message ?? "Are you sure?"}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer transition-all duration-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await onConfirm();
            }}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
