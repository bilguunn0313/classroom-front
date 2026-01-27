import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface LoginFormProps {
  form: UseFormReturn<{ email: string; password: string }>;
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  className?: string;
}

export function LoginForm({ form, onSubmit, className }: LoginFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden p-0 ">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Нэвтрэх</h1>
                <p className="text-muted-foreground text-balance">
                  Байгууллагын имэйл хаягаар нэвтэрнэ үү
                </p>
              </div>

              {form.formState.errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {form.formState.errors.root.message}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Имэйл</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@cosmo.mn"
                  autoComplete="email"
                  {...form.register("email")}
                />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Нууц үг</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...form.register("password")}
                />
                <FieldError errors={[form.formState.errors.password]} />
              </Field>

              <Field>
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
              </Field>
            </FieldGroup>
          </form>
          <div className=" relative hidden md:flex items-center justify-center p-10 bg-[#171717] ">
            <img
              src="/cosmo-logo.png"
              alt="Logo"
              className=" object-contain dark:brightness-[0.9] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
