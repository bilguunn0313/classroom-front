// components/ProtectedRoute.tsx
"use client";

import { useUserContext } from "@/lib/userProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useUserContext();
  const router = useRouter();

  const hasRole = () => {
    if (!requiredRole || !user) return true;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  };

  useEffect(() => {
    // Wait for loading to finish
    if (loading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // If role is required and user doesn't have it
    if (requiredRole && !hasRole()) {
      router.push("/unauthorized");
    }
  }, [loading, isAuthenticated, user, requiredRole, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if role required and user doesn't have it
  if (requiredRole && !hasRole()) {
    return null;
  }

  return <>{children}</>;
}
