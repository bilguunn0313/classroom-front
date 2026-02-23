import { useEffect, useCallback } from "react";
import { useUserContext } from "../lib/userProvider";
import { authAPI } from "../lib/auth";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  iat: number;
  id: number;
  email: string;
  role: string;
}

export function useTokenRefresh() {
  const { setUser, logout } = useUserContext();

  const checkAndRefreshToken = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      // Decode token to check expiration (without verifying)
      const decoded = jwtDecode<DecodedToken>(token);

      if (!decoded || !decoded.exp) return;

      // Calculate time until expiration
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      // If token expires in less than 1 day (86400000 ms), refresh it
      const ONE_DAY = 24 * 60 * 60 * 1000;

      if (timeUntilExpiration < ONE_DAY && timeUntilExpiration > 0) {
        console.log("Token expiring soon, refreshing...");

        const response = await authAPI.refreshToken();

        if (response.success && response.data.token) {
          localStorage.setItem("token", response.data.token);
          console.log("Token refreshed successfully");
        }
      } else if (timeUntilExpiration <= 0) {
        // Token already expired
        console.log("Token expired, logging out");
        logout();
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Don't logout on refresh failure, token might still be valid
    }
  }, [setUser, logout]);

  useEffect(() => {
    // Check token on mount
    checkAndRefreshToken();

    // Check every hour
    const interval = setInterval(checkAndRefreshToken, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAndRefreshToken]);
}
