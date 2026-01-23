"use client";

import { useRouter } from "next/navigation";
import { useUserContext } from "../../../lib/userProvider";
import { authAPI } from "../../../lib/auth";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold">
            Cosmo Training
          </CardTitle>
          <CardDescription className="text-center">
            Нэвтрэх
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {form.formState.errors.root.message}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имэйл</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Нууц үг</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Нэвтэрч байна...
                  </>
                ) : (
                  "Нэвтрэх"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
