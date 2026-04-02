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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ComputerSpec, OdooAsset } from "@/types/schema.types";

const formSchema = z.object({
  cpu: z.string().max(255).optional().or(z.literal("")),
  ram: z.string().max(100).optional().or(z.literal("")),
  storage: z.string().max(255).optional().or(z.literal("")),
  os: z.string().max(255).optional().or(z.literal("")),
  monitor: z.string().max(255).optional().or(z.literal("")),
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
      cpu: "",
      ram: "",
      storage: "",
      os: "",
      monitor: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (spec) {
        form.reset({
          cpu: spec.cpu || "",
          ram: spec.ram || "",
          storage: spec.storage || "",
          os: spec.os || "",
          monitor: spec.monitor || "",
          notes: spec.notes || "",
        });
      } else {
        form.reset({
          cpu: "",
          ram: "",
          storage: "",
          os: "",
          monitor: "",
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
              name="cpu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPU</FormLabel>
                  <FormControl>
                    <Input placeholder="Intel Core i5-12400" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RAM</FormLabel>
                  <FormControl>
                    <Input placeholder="16GB DDR4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hard Disk</FormLabel>
                  <FormControl>
                    <Input placeholder="512GB SSD + 1TB HDD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="os"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Үйлдлийн систем</FormLabel>
                  <FormControl>
                    <Input placeholder="Windows 11 Pro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monitor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Монитор</FormLabel>
                  <FormControl>
                    <Input placeholder='24" Dell P2422H' {...field} />
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
                      placeholder="Нэмэлт мэдээлэл..."
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
