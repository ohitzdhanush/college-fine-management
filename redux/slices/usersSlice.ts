// lib/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "admin" | "faculty" | "student";

export interface User {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  registrationNumber?: string;
  createdAt?: string;
  [k: string]: any;
}

interface UsersState {
  student: User[]; // array of students
  faculty: User[]; // array of faculty
  all: User[]; // optional: keep full list
}

const initialState: UsersState = {
  student: [],
  faculty: [],
  all: [],
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // payload expects arrays
    setUsers(
      _state,
      action: PayloadAction<{ student?: User[]; faculty?: User[]; all?: User[] }>
    ) {
      const { student, faculty, all } = action.payload;
      _state.student = student ?? [];
      _state.faculty = faculty ?? [];
      _state.all = all ?? [];
    },
    // optional helpers
    setAllUsers(_state, action: PayloadAction<User[]>) {
      _state.all = action.payload ?? [];
    },
    clearUsers(_state) {
      _state.student = [];
      _state.faculty = [];
      _state.all = [];
    },
  },
});

export const { setUsers, setAllUsers, clearUsers } = usersSlice.actions;
export default usersSlice.reducer;
