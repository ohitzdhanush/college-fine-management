"use client";

import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export type UserRole = "admin" | "faculty" | "student";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  register_number?: string;
  department?: string;
  createdAt?: string;
  // add other fields returned by backend as needed
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const USER_KEY = "app_user";
export const TOKEN_KEY = "app_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Load user + token from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedUser && storedToken) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setToken(storedToken);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to load auth from localStorage:", error);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  /**
   * Call server login API, persist token + user, and update context state.
   * Throws an Error when login fails (so callers can show error messages).
   */
  const login = async (email: string, password: string) => {
    if (!email || !password) {
      toast.error("Email and password are required");
    }

    try {
      const res = await axios.post(
        "/api/auth/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // optional, if your API uses cookies
        }
      );

      const payload = res.data;

      // expected backend shape: { user: { _id, name, email, ... }, token: "..." }
      const backendUser = payload.user;
      const jwt = payload.token;

      if (!backendUser || !jwt) {
        throw new Error("Invalid server response from login");
      }

      const {
        email: any,
        name,
        role,
        department,
        register_number,
        createdAt,
      } = backendUser;

      // normalize backend user -> client User
      const mappedUser: User = {
        id: backendUser._id ?? backendUser.id,
        email,
        name,
        role,
        department,
        register_number,
        createdAt,
      };

      // persist
      localStorage.setItem(USER_KEY, JSON.stringify(mappedUser));
      localStorage.setItem(TOKEN_KEY, jwt);

      // update state
      setUser(mappedUser);
      setToken(jwt);
      setIsAuthenticated(true);
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
