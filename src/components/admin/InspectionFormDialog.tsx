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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ComputerInspection } from "@/types/schema.types";

const formSchema = z.object({
  inspectionDate: z.string().min(1, "Огноо шаардлагатай"),
  status: z.enum(["pass", "fail"], {
    error: "Төлөв сонгоно уу",
  }),
  notes: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface InspectionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
  inspection?: ComputerInspection | null;
  assetName?: string;
}

export function InspectionFormDialog({
  isOpen,
  onClose,
  onSubmit,
  inspection,
  assetName,
}: InspectionFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!inspection;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inspectionDate: new Date().toISOString().split("T")[0],
      status: "pass",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (inspection) {
        form.reset({
          inspectionDate: inspection.inspection_date.split("T")[0],
          status: inspection.status,
          notes: inspection.notes || "",
        });
      } else {
        form.reset({
          inspectionDate: new Date().toISOString().split("T")[0],
          status: "pass",
          notes: "",
        });
      }
    }
  }, [inspection, isOpen, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error saving inspection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Үзлэг засах" : "Үзлэг нэмэх"}
          </DialogTitle>
          {assetName && (
            <DialogDescription>
              <span className="font-medium text-foreground">{assetName}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="inspectionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Үзлэгийн огноо</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Төлөв</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Төлөв сонгоно уу" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pass">Хэвийн</SelectItem>
                      <SelectItem value="fail">Асуудалтай</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="Нэмэлт тэмдэглэл..."
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
