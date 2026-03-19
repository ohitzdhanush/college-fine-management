// FineModal.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { CheckIcon, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import AdvancedDatePicker from "./AdvancedDatePicker";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth-context";

interface FineFormData {
  studentId: string;
  amount: string;
  reason: string;
  dueDate: string;
  issuedBy: string;
  status: string;
}

interface Student {
  _id?: string;
  id?: string;
  name: string;
  registrationNumber?: string;
}

interface Faculty {
  _id?: string;
  id?: string;
  name: string;
}

interface FineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId?: string | null;
  // the form data is controlled from parent:
  formData: FineFormData;
  setFormData: (updater: any) => void;
  students: any[];
  faculty: any[];
  onSave: (data: FineFormData, editingId?: string | null) => void;
}

export default function FineModal({
  open,
  onOpenChange,
  editingId = null,
  formData,
  setFormData,
  students = [],
  faculty = [],
  onSave,
}: FineModalProps) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    if (!formData.studentId) return setError("Please select a student.");
    if (!formData.amount || Number(formData.amount) <= 0)
      return setError("Please enter a valid amount.");

    onSave(formData);
    onOpenChange(false); // close the dialog after saving
  }

  // compute selected student & faculty from controlled formData
  const selectedStudent =
    students.find((s) => (s._id ?? s.id) === formData.studentId) ?? null;
  const selectedFaculty =
    faculty.find((f) => (f._id ?? f.id) === formData.issuedBy) ?? null;

  useEffect(() => {
    if (user?.role === "faculty") {
      setFormData({ ...formData, issuedBy: user?.id });
    }
  }, []);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <div className="flex items-center justify-between mb-4">
          <AlertDialogHeader className="p-0">
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              {editingId ? "Edit Fine" : "Issue New Fine"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogCancel
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </AlertDialogCancel>
        </div>

        <div className="space-y-4">
          {/* Student (DropdownMenu) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`
                    w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-gray-900
                    hover:border-gray-400 focus:outline-none focus-visible:ring-0 outline-none
                  `}
                  aria-label="Select student"
                >
                  <span className="truncate">
                    {selectedStudent
                      ? `${selectedStudent.name}${
                          selectedStudent.registrationNumber
                            ? ` (${selectedStudent.registrationNumber})`
                            : ""
                        }`
                      : "Select a student"}
                  </span>
                  <ChevronDown className="ml-2 size-4" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="max-h-60 overflow-auto">
                {students.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No students
                  </div>
                ) : (
                  students.map((s) => {
                    const id = s._id ?? s.id ?? s.name;
                    const isSelected = formData.studentId === id;

                    // do NOT call preventDefault — allow Radix to close the menu automatically
                    return (
                      <DropdownMenuItem
                        key={id}
                        onClick={() =>
                          setFormData((prev: any) => ({
                            ...prev,
                            studentId: id,
                          }))
                        }
                        onSelect={() =>
                          setFormData((prev: any) => ({
                            ...prev,
                            studentId: id,
                          }))
                        }
                      >
                        {isSelected ? (
                          <CheckIcon className="size-4" />
                        ) : (
                          <span className="size-4 inline-block" />
                        )}

                        <span className="truncate">
                          {s.name}
                          {s.registrationNumber
                            ? ` (${s.registrationNumber})`
                            : ""}
                        </span>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              placeholder="500"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <input
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              placeholder="Late submission"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>

          {/* Due date */}
          <div>
            <AdvancedDatePicker
              value={formData.dueDate}
              onChange={(v) =>
                setFormData((prev: any) => ({ ...prev, dueDate: v || "" }))
              }
              placeholder="Select due date"
              label="Due date"
            />
          </div>

          {/* Issued By (DropdownMenu) */}
          {user?.role === "admin" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issued By
              </label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`
                    w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-gray-900
                    hover:border-gray-400 focus:outline-none focus-visible:ring-0 outline-none
                  `}
                    aria-label="Select faculty"
                  >
                    <span className="truncate">
                      {selectedFaculty
                        ? selectedFaculty.name
                        : "Select faculty"}
                    </span>
                    <ChevronDown className="ml-2 size-4" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="max-h-60 overflow-auto">
                  {faculty.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No faculty
                    </div>
                  ) : (
                    faculty.map((f) => {
                      const id = f._id ?? f.id ?? f.name;
                      const isSelected = formData.issuedBy === id;

                      return (
                        <DropdownMenuItem
                          key={id}
                          onClick={() =>
                            setFormData((prev: any) => ({
                              ...prev,
                              issuedBy: id,
                            }))
                          }
                          onSelect={() =>
                            setFormData((prev: any) => ({
                              ...prev,
                              issuedBy: id,
                            }))
                          }
                        >
                          {isSelected ? (
                            <CheckIcon className="size-4" />
                          ) : (
                            <span className="size-4 inline-block" />
                          )}

                          <span className="truncate">{f.name}</span>
                        </DropdownMenuItem>
                      );
                    })
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-center cursor-pointer">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              onClick={handleSave}
              className="flex-1 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              {"Issue"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
