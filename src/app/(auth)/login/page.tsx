"use client";

import { useRouter } from "next/navigation";
import { useUserContext } from "../../../lib/userProvider";
import { authAPI } from "../../../lib/auth";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoginForm } from "@/components/LoginForm";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUserContext();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Clear any existing data first
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");

      const response = await authAPI.login(data.email, data.password);

      if (!response.success) {
        console.error("❌ [LOGIN PAGE] Response not successful");
        throw new Error(response.message || "Login failed");
      }

      // Store token
      localStorage.setItem("token", response.data.token);

      // Verify token was stored
      const storedToken = localStorage.getItem("token");

      // Store user
      localStorage.setItem("currentUser", JSON.stringify(response.data.user));

      // Verify user was stored
      const storedUser = localStorage.getItem("currentUser");

      // Update context
      setUser(response.data.user);

      // Test the token immediately
      try {
        const testResponse = await authAPI.verify();
      } catch (testError) {
        console.error("❌ [LOGIN PAGE] Token test FAILED:", testError);
        console.error("⚠️ [LOGIN PAGE] This means the token doesn't work!");
      }

      // Use replace to prevent back button issues
      router.replace("/course");
    } catch (err) {
      if (err instanceof AxiosError) {
        console.error("Status:", err.response?.status);
        console.error("Response data:", err.response?.data);
        console.error("Request URL:", err.config?.url);

        form.setError("root", {
          message: err.response?.data?.message || "Login failed",
        });
      } else if (err instanceof Error) {
        console.error("Error message:", err.message);
        form.setError("root", { message: err.message });
      } else {
        console.error("Unknown error type");
        form.setError("root", { message: "Something went wrong" });
      }
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm form={form} onSubmit={onSubmit} />
      </div>
    </div>
  );
}
