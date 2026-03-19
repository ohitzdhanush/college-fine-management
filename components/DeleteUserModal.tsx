"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // adjust path if needed
import { Loader2, Trash } from "lucide-react";
import { useState } from "react";

type DeleteUserModalProps = {
  open: boolean;
  setOpen: (v: any) => void;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  onConfirm: (id?: string) => Promise<boolean | void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export default function DeleteUserModal({
  open,
  setOpen,
  user,
  onConfirm,
  title = "Delete User",
  description = "This action cannot be undone. The user and all their associated data will be permanently removed.",
  confirmText = "Delete",
  cancelText = "Cancel",
}: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!user?._id) {
      setErrorMessage("Missing user id.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await onConfirm(user?._id);
      if (res === false) {
        setErrorMessage("Failed to delete user.");
        setLoading(false);
        return;
      }
      setOpen(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      setErrorMessage(err?.message || "Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => setOpen(null)}>
      <AlertDialogPortal>
        <AlertDialogOverlay />

        <AlertDialogContent className="max-w-lg w-full p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <Trash className="w-5 h-5 text-red-600" />
              <span>{title}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-1">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {user && (
            <div className="mt-4 border rounded-md bg-gray-50 p-3 text-sm">
              <p className="text-sm text-slate-700">
                <strong className="mr-2">Name:</strong> {user?.name ?? "—"}
              </p>
              <p className="text-sm text-slate-700">
                <strong className="mr-2">Email:</strong> {user?.email ?? "—"}
              </p>
              <p className="text-sm text-slate-700">
                <strong className="mr-2">Role:</strong> {user?.role ?? "—"}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-3 text-sm text-red-600">{errorMessage}</div>
          )}

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel
              disabled={loading}
              className="mr-2 cursor-pointer"
            >
              {cancelText}
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              aria-disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="w-4 h-4" />
                  {confirmText}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
