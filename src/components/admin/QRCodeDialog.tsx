"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ComputerSpec } from "@/types/schema.types";

interface QRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  spec: ComputerSpec | null;
}

export function QRCodeDialog({ isOpen, onClose, spec }: QRCodeDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!spec) return null;

  const clientUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrUrl = `${clientUrl}/computer/${spec.odoo_asset_code}`;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR - ${spec.odoo_asset_name || spec.odoo_asset_code}</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .container {
              text-align: center;
              padding: 24px;
            }
            .name {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .code {
              font-size: 14px;
              color: #666;
              margin-bottom: 16px;
            }
            svg {
              margin: 0 auto;
            }
            .url {
              font-size: 11px;
              color: #999;
              margin-top: 12px;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="name">${spec.odoo_asset_name || ""}</div>
            <div class="code">${spec.odoo_asset_code || ""}</div>
            ${printContent.querySelector("svg")?.outerHTML || ""}
            <div class="url">${qrUrl}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>QR код</DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="flex flex-col items-center py-4 space-y-3">
          <p className="font-semibold text-lg">{spec.odoo_asset_name}</p>
          <p className="text-sm text-muted-foreground">{spec.odoo_asset_code}</p>
          <QRCodeSVG value={qrUrl} size={200} level="M" />
          <p className="text-xs text-muted-foreground break-all text-center max-w-[280px]">
            {qrUrl}
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Хэвлэх
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
