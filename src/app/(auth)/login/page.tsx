"use client";
import { useRouter } from "next/navigation";
import { useUserContext } from "../../../lib/userProvider";
import { authAPI } from "../../../lib/auth";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/form/Input";
import { Button } from "@/components/form/Button";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUserContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Clear any existing data first
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");

      const response = await authAPI.login(data.email, data.password);

      console.log("📦 [LOGIN PAGE] Response received:", {
        success: response.success,
        hasToken: !!response.data?.token,
        hasUser: !!response.data?.user,
      });

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
        console.log("✅ [LOGIN PAGE] Token test successful:", testResponse);
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

        setError("root", {
          message: err.response?.data?.message || "Login failed",
        });
      } else if (err instanceof Error) {
        console.error("Error message:", err.message);
        setError("root", { message: err.message });
      } else {
        console.error("Unknown error type");
        setError("root", { message: "Something went wrong" });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 rounded-lg border border-gray-200 shadow-sm p-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Cosmo Training
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Имэйл"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              id="password"
              type="password"
              label="Нууц үг"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          <Button type="submit" loading={isSubmitting}>
            Нэвтрэх
          </Button>
        </form>
      </div>
    </div>
  );
}
