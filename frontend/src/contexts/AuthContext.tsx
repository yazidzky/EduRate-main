import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import fetchJson from "@/lib/fetchJson";

interface User {
  id: string;
  name: string;
  email: string;
  nim_nip?: string;
  role: "mahasiswa" | "dosen" | "admin";
  avatar?: string;
  department?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (nim_nip: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base handled via `api()` helper

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const login = async (nim_nip: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchJson(`/api/auth/login`, {
        method: "POST",
        body: { nim_nip, password },
      });

      if (data && data.success) {
        localStorage.setItem("edurate_token", data.token);
        setUser(data.user);
        return true;
      }

      setError(data?.message || "Login failed");
      return false;
    } catch (err) {
      setError((err as any)?.message || "Network error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem("edurate_token");
    if (!token) return;

    setIsLoading(true);
    try {
      const data = await fetchJson(`/api/auth/me`);
      if (data && data.success) {
        const u = data.user as any;
        const normalized = {
          id: u.id ?? u._id,
          name: u.name,
          email: u.email,
          nim_nip: u.nim_nip,
          role: u.role,
          avatar: u.avatar,
          department: u.department,
          phone: u.phone,
        } as User;
        setUser(normalized);
      }
      else logout();
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("edurate_token");
    if (token) {
      fetchUser();
    }
  }, [fetchUser]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("edurate_token");
    localStorage.removeItem("edurate_user");
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!user) return;

    const token = localStorage.getItem("edurate_token");
    if (!token) return;

    setIsLoading(true);
    try {
      const result = await fetchJson(`/api/users/${user.id}`, {
        method: "PUT",
        body: data,
      });

      if (result && result.success) {
        setUser({ ...user, ...((result.data as any) || data) });
      } else {
        setError(result?.message || "Update failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        fetchUser,
        updateProfile,
        isLoading,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
