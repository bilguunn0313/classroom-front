"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "../../../lib/userProvider";
import { authAPI } from "../../../lib/auth";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoginForm } from "@/components/LoginForm";

const loginSchema = z.object({
  email: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, loading, isAuthenticated } = useUserContext();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/course");
    }
  }, [loading, isAuthenticated, router]);

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
        throw new Error(response.message || "Login failed");
      }

      // Store token and user
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("currentUser", JSON.stringify(response.data.user));

      // Update context
      setUser(response.data.user);

      // Use replace to prevent back button issues
      router.replace("/course");
    } catch (err) {
      if (err instanceof AxiosError) {
        form.setError("root", {
          message: err.response?.data?.message || "Login failed",
        });
      } else if (err instanceof Error) {
        form.setError("root", { message: err.message });
      } else {
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
