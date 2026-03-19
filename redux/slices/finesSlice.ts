// redux/slices/finesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type FineStatus = "pending" | "paid" | "overdue";

export interface UserRef {
  _id?: string;
  name?: string;
  email?: string;
  register_number?: string;
  role?: string;
  department?: string;
  // other user fields (password excluded)
  [k: string]: any;
}

export interface Fine {
  _id?: string;
  student: string | UserRef;
  amount: number;
  reason: string;
  issuedBy: string | UserRef;
  issuedDate: string | Date;
  dueDate: string | Date;
  status: FineStatus;
  paymentDate?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [k: string]: any;
}

interface FinesState {
  fines: Fine[];
  selectedFine: Fine | null;
}

const initialState: FinesState = {
  fines: [],
  selectedFine: null,
};

const finesSlice = createSlice({
  name: "fines",
  initialState,
  reducers: {
    // payload: { fines: Fine[] }
    setFines(state, action: PayloadAction<{ fines: Fine[] }>) {
      state.fines = action.payload.fines ?? [];
    },

    addFine(state, action: PayloadAction<Fine>) {
      state.fines.unshift(action.payload);
    },

    updateFine(state, action: PayloadAction<Fine>) {
      const updated = action.payload;
      const idx = state.fines.findIndex((f: any) => f._id === updated._id);
      if (idx !== -1) {
        state.fines[idx] = { ...state.fines[idx], ...updated };
      } else {
        // if not found, push at top
        state.fines.unshift(updated);
      }
      // also update selectedFine if it matches
      if (state.selectedFine?._id === updated._id) {
        state.selectedFine = { ...state.selectedFine, ...updated };
      }
    },

    removeFine(state, action: PayloadAction<string>) {
      state.fines = state.fines.filter((f) => f._id !== action.payload);
      if (state.selectedFine?._id === action.payload) {
        state.selectedFine = null;
      }
    },

    setSelectedFine(state, action: PayloadAction<Fine | null>) {
      state.selectedFine = action.payload;
    },

    clearFines(state) {
      state.fines = [];
      state.selectedFine = null;
    },
  },
});

export const {
  setFines,
  addFine,
  updateFine: updateFineAction,
  removeFine,
  setSelectedFine,
  clearFines,
} = finesSlice.actions;

export default finesSlice.reducer;

// Selectors (usage: useAppSelector(selectFines) )
export const selectFines = (state: { fines: FinesState }) => state.fines.fines;
export const selectSelectedFine = (state: { fines: FinesState }) =>
  state.fines.selectedFine;
