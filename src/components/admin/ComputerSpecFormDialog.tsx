"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ComputerSpec, OdooAsset } from "@/types/schema.types";

const formSchema = z.object({
  descr: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface ComputerSpecFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
  spec?: ComputerSpec | null;
  asset?: OdooAsset | null;
}

export function ComputerSpecFormDialog({
  isOpen,
  onClose,
  onSubmit,
  spec,
  asset,
}: ComputerSpecFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!spec;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descr: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (spec) {
        form.reset({
          descr: spec.descr || "",
          notes: spec.notes || "",
        });
      } else {
        form.reset({
          descr: "",
          notes: "",
        });
      }
    }
  }, [spec, isOpen, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error saving computer spec:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const assetName = spec?.odoo_asset_name || asset?.name || "";
  const assetCode = spec?.odoo_asset_code || asset?.code || "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Мэдээлэл засах" : "Мэдээлэл нэмэх"}
          </DialogTitle>
          <DialogDescription>
            {assetName && (
              <span className="font-medium text-foreground">{assetName}</span>
            )}
            {assetCode && (
              <span className="ml-2 text-muted-foreground">({assetCode})</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="descr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тодорхойлолт</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Техникийн үзүүлэлт, тоног төхөөрөмжийн мэдээлэл..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тэмдэглэл</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Асуудал, анхаарах зүйлс..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Болих
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Хадгалж байна...
                  </>
                ) : isEditing ? (
                  "Хадгалах"
                ) : (
                  "Нэмэх"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
