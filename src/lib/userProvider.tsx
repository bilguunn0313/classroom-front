"use client";

import { UserType } from "@/types/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";

type UserProviderType = {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  loading: boolean;
  logout: () => void;
  isAuthenticated: boolean;
};

const UserContext = createContext<UserProviderType>({
  user: null,
  setUser: () => {},
  loading: true,
  logout: () => {},
  isAuthenticated: false,
});

export default function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("currentUser");

        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success && response.data.data.user) {
          setUser(response.data.data.user);
          localStorage.setItem(
            "currentUser",
            JSON.stringify(response.data.data.user)
          );
        } else {
          throw new Error("Invalid token response");
        }
      } catch (error) {
        console.error("Failed to load user", error);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [user]);

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
