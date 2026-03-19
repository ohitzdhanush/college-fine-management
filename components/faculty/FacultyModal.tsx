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
} from "@/components/ui/alert-dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type FacultyForm = {
  name: string;
  email: string;
  department: string;
};

interface FacultyAlertModalProps {
  show: boolean;
  setShow: (v: boolean) => void;
  formData: FacultyForm;
  setFormData: (
    updater: FacultyForm | ((s: FacultyForm) => FacultyForm)
  ) => void;
  handleSaveFaculty: () => Promise<void> | void;
  editingId: string | null;
}

const FacultyModal = ({
  show,
  setShow,
  formData,
  setFormData,
  handleSaveFaculty,
  editingId,
}: FacultyAlertModalProps) => {
  const onCancel = () => {
    setShow(false);
  };

  const onSave = async () => {
    try {
      await handleSaveFaculty();
      setShow(false);
    } catch (err) {
      // keep modal open so parent can show error
      console.error("Save Faculty error:", err);
    }
  };

  return (
    <AlertDialog open={show} onOpenChange={(open) => setShow(open)}>
      <AlertDialogPortal>
        <AlertDialogOverlay />

        <AlertDialogContent className="max-w-md w-full p-6">
          <AlertDialogHeader className="mb-2">
            <AlertDialogTitle className="text-lg font-semibold">
              {editingId ? "Edit Faculty" : "Add New Faculty"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {editingId
                ? "Update Faculty details below."
                : "Fill in the details to add a new Faculty."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Faculty name"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Email{" "}
                <span className="text-[10px] text-red-500">
                  {!!editingId && "(Email Cannot be Editable)"}
                </span>
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Faculty Email"
                disabled={!!editingId}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </Label>
              <Input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Faculty Department"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel
              onClick={onCancel}
              className="mr-2 transition-all duration-300 cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={onSave}
              className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 cursor-pointer"
            >
              {editingId ? "Update" : "Add"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

export default FacultyModal;
