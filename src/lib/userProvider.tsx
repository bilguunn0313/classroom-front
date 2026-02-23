"use client";

import { UserType } from "@/types/types";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { authAPI } from "./auth";

type UserProviderType = {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  loading: boolean;
  logout: () => void;
  isAuthenticated: boolean;
};

const UserContext = createContext<UserProviderType | undefined>(undefined);

export default function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await authAPI.verify();

        if (response.success && response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem(
            "currentUser",
            JSON.stringify(response.data.user)
          );
        } else {
          throw new Error("Invalid token response");
        }
      } catch (error: any) {
        console.error("Failed to load user", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setUser(null);
    router.push("/login");
  }, [router]);

  const isAuthenticated = !!user;

  return (
    <UserContext.Provider
      value={{ user, setUser, loading, logout, isAuthenticated }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};
