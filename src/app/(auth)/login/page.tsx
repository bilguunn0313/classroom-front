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
  email: z.string().email("Invalid email address"),
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
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-white ">
        <div className="flex justify-center gap-2 md:justify-start ">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-10 items-center justify-center">
              <Image
                src="/cosmo-logo.png"
                alt="Cosmo Training"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            Cosmo Training
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm form={form} onSubmit={onSubmit} />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-[#2488C7] lg:block">
        <Image
          src="/cosmo-logo.png"
          alt="Cosmo Training"
          fill
          className="object-contain p-20 w-1"
          priority
        />
      </div>
    </div>
  );
}
