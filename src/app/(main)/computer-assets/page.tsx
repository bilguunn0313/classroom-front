"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  QrCode,
  Search,
  Monitor,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ScanLine,
  History,
} from "lucide-react";
import {
  ComputerSpec,
  ComputerInspection,
  OdooAsset,
} from "@/types/schema.types";
import {
  useComputerSpecs,
  useOdooAssets,
  useSpecifiedAssetIds,
  useComputerInspections,
} from "@/hooks/useComputerSpecs";
import { computerSpecsAPI } from "@/lib/computer-specs";
import { ComputerSpecFormDialog } from "@/components/admin/ComputerSpecFormDialog";
import { QRCodeDialog } from "@/components/admin/QRCodeDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { InspectionFormDialog } from "@/components/admin/InspectionFormDialog";
import { InspectionHistoryDialog } from "@/components/admin/InspectionHistoryDialog";
import { SpecHistoryDialog } from "@/components/admin/SpecHistoryDialog";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const STATE_LABELS: Record<string, string> = {
  draft: "Ноорог",
  open: "Ашиглаж байгаа",
  close: "Хаагдсан",
};

export default function ComputerAssetsPage() {
  // Tab & search state
  const [activeTab, setActiveTab] = useState("odoo");
  const [odooSearch, setOdooSearch] = useState("");
  const [specsSearch, setSpecsSearch] = useState("");
  const [specsPage, setSpecsPage] = useState(1);
  const SPECS_LIMIT = 15;

  // Inspections tab state
  const [inspSearch, setInspSearch] = useState("");
  const [inspPage, setInspPage] = useState(1);
  const INSP_LIMIT = 15;

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [specHistoryOpen, setSpecHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState<ComputerSpec | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<OdooAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Inspection dialog state
  const [inspFormOpen, setInspFormOpen] = useState(false);
  const [inspHistoryOpen, setInspHistoryOpen] = useState(false);
  const [inspDeleteOpen, setInspDeleteOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] =
    useState<ComputerInspection | null>(null);
  const [isDeletingInsp, setIsDeletingInsp] = useState(false);

  // Data hooks
  const { assets, loading: assetsLoading } = useOdooAssets();
  const {
    specs,
    total: specsTotal,
    loading: specsLoading,
    refetch: refetchSpecs,
  } = useComputerSpecs(specsPage, SPECS_LIMIT, specsSearch || undefined);
  const { specifiedIds, refetch: refetchIds } = useSpecifiedAssetIds();
  const {
    inspections,
    total: inspTotal,
    loading: inspLoading,
    refetch: refetchInspections,
  } = useComputerInspections(inspPage, INSP_LIMIT, inspSearch || undefined);

  // Filter Odoo assets by search
  const filteredAssets = useMemo(() => {
    if (!odooSearch) return assets;
    const q = odooSearch.toLowerCase();
    return assets.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        (a.code &&
          typeof a.code === "string" &&
          a.code.toLowerCase().includes(q)) ||
        (a.barcode &&
          typeof a.barcode === "string" &&
          a.barcode.toLowerCase().includes(q)),
    );
  }, [assets, odooSearch]);

  const totalSpecsPages = Math.ceil(specsTotal / SPECS_LIMIT);
  const totalInspPages = Math.ceil(inspTotal / INSP_LIMIT);

  // Handlers
  const handleAddSpec = (asset: OdooAsset) => {
    setSelectedAsset(asset);
    setSelectedSpec(null);
    setFormOpen(true);
  };

  // Row click in the Odoo assets tab: if the asset already has a spec, jump to
  // the specs list filtered to it; otherwise open the add-spec dialog.
  const handleAssetRowClick = (asset: OdooAsset, hasSpec: boolean) => {
    if (!hasSpec) {
      handleAddSpec(asset);
      return;
    }
    const term =
      (typeof asset.barcode === "string" && asset.barcode) ||
      (typeof asset.code === "string" && asset.code) ||
      asset.name ||
      "";
    setSpecsSearch(term);
    setSpecsPage(1);
    setActiveTab("specs");
  };

  const handleEditSpec = (spec: ComputerSpec) => {
    setSelectedSpec(spec);
    setSelectedAsset(null);
    setFormOpen(true);
  };

  const handleViewQR = (spec: ComputerSpec) => {
    setSelectedSpec(spec);
    setQrOpen(true);
  };

  const handleViewSpecHistory = (spec: ComputerSpec) => {
    setSelectedSpec(spec);
    setSpecHistoryOpen(true);
  };

  const handleDeletePrompt = (spec: ComputerSpec) => {
    setSelectedSpec(spec);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (data: Record<string, string | undefined>) => {
    try {
      let res;
      if (selectedSpec) {
        // Edit
        res = await computerSpecsAPI.update(selectedSpec.id, {
          odooAssetCode: selectedSpec.odoo_asset_code,
          odooAssetBarcode: selectedSpec.odoo_asset_barcode,
          odooAssetName: selectedSpec.odoo_asset_name,
          descr: data.descr || null,
          notes: data.notes || null,
        });
        toast.success("Мэдээлэл амжилттай шинэчлэгдлээ");
      } else if (selectedAsset) {
        // Create
        res = await computerSpecsAPI.create({
          odooAssetId: selectedAsset.id,
          odooAssetCode:
            typeof selectedAsset.code === "string" ? selectedAsset.code : null,
          odooAssetBarcode:
            typeof selectedAsset.barcode === "string"
              ? selectedAsset.barcode
              : null,
          odooAssetName: selectedAsset.name,
          descr: data.descr || null,
          notes: data.notes || null,
        });
        toast.success("Мэдээлэл амжилттай нэмэгдлээ");
      }
      // Surface ERP sync outcome — data is saved locally regardless
      if (res && res.erp_synced === false) {
        toast.warning("ERP рүү бичих үед алдаа гарлаа. Дараа дахин оролдоно уу.");
      }
      refetchSpecs();
      refetchIds();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Мэдээлэл хадгалахад алдаа гарлаа",
      );
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedSpec) return;
    try {
      setIsDeleting(true);
      await computerSpecsAPI.delete(selectedSpec.id);
      toast.success("Мэдээлэл амжилттай устгагдлаа");
      refetchSpecs();
      refetchIds();
      setDeleteOpen(false);
      setSelectedSpec(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Устгахад алдаа гарлаа");
    } finally {
      setIsDeleting(false);
    }
  };

  // Inspection handlers
  const handleEditInspection = (insp: ComputerInspection) => {
    setSelectedInspection(insp);
    setInspFormOpen(true);
  };

  const handleDeleteInspPrompt = (insp: ComputerInspection) => {
    setSelectedInspection(insp);
    setInspDeleteOpen(true);
  };

  const handleViewHistory = (spec: ComputerSpec) => {
    setSelectedSpec(spec);
    setInspHistoryOpen(true);
  };

  const handleInspFormSubmit = async (data: {
    inspectionDate: string;
    status: "pass" | "fail";
    notes?: string;
  }) => {
    try {
      if (selectedInspection) {
        await computerSpecsAPI.updateInspection(selectedInspection.id, {
          inspectionDate: data.inspectionDate,
          status: data.status,
          notes: data.notes || null,
        });
        toast.success("Үзлэг амжилттай шинэчлэгдлээ");
      } else if (selectedSpec) {
        await computerSpecsAPI.createInspection({
          computerSpecId: selectedSpec.id,
          inspectionDate: data.inspectionDate,
          status: data.status,
          notes: data.notes || null,
        });
        toast.success("Үзлэг амжилттай бүртгэгдлээ");
      }
      refetchInspections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Хадгалахад алдаа гарлаа");
      throw error;
    }
  };

  const handleDeleteInspection = async () => {
    if (!selectedInspection) return;
    try {
      setIsDeletingInsp(true);
      await computerSpecsAPI.deleteInspection(selectedInspection.id);
      toast.success("Үзлэг амжилттай устгагдлаа");
      refetchInspections();
      setInspDeleteOpen(false);
      setSelectedInspection(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Устгахад алдаа гарлаа");
    } finally {
      setIsDeletingInsp(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <main className="container mx-auto px-6 py-10 max-w-screen-2xl">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                МАБТТАX үзлэг
              </h1>
              <p className="text-muted-foreground mt-1">
                Төхөөрөмжд техникийн мэдээлэл оруулж, QR код үүсгэх
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/computer-assets/scan">
                <ScanLine className="mr-2 h-4 w-4" />
                Скайнер
              </Link>
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="odoo">Төхөөрөмж</TabsTrigger>
              <TabsTrigger value="specs">Мэдээлэл жагсаалт</TabsTrigger>
              <TabsTrigger value="inspections">Үзлэг</TabsTrigger>
            </TabsList>

            {/* ── Odoo Assets Tab ── */}
            <TabsContent value="odoo" className="space-y-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Хөрөнгө хайх..."
                  value={odooSearch}
                  onChange={(e) => setOdooSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {assetsLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Ачааллаж байна...
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Нэр</TableHead>
                        <TableHead>Код</TableHead>
                        <TableHead>Баркод</TableHead>
                        <TableHead>Төлөв</TableHead>
                        <TableHead>Мэдээлэл</TableHead>
                        <TableHead className="text-right">Үйлдэл</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssets.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Хөрөнгө олдсонгүй
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAssets.map((asset) => {
                          const hasSpec = specifiedIds.includes(asset.id);
                          return (
                            <TableRow
                              key={asset.id}
                              onClick={() => handleAssetRowClick(asset, hasSpec)}
                              className="cursor-pointer hover:bg-muted/50"
                            >
                              <TableCell className="font-medium">
                                {asset.name}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {typeof asset.code === "string"
                                  ? asset.code
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {typeof asset.barcode === "string"
                                  ? asset.barcode
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    asset.state === "open"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {STATE_LABELS[asset.state] || asset.state}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {hasSpec ? (
                                  <Badge
                                    variant="outline"
                                    className="border-green-500 text-green-700"
                                  >
                                    <Monitor className="mr-1 h-3 w-3" />
                                    Оруулсан
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {!hasSpec && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddSpec(asset);
                                    }}
                                  >
                                    <Plus className="mr-1 h-4 w-4" />
                                    ERP руу нэмэх
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ── Specs List Tab ── */}
            <TabsContent value="specs" className="space-y-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Мэдээлэл хайх..."
                  value={specsSearch}
                  onChange={(e) => {
                    setSpecsSearch(e.target.value);
                    setSpecsPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              {specsLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Ачааллаж байна...
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Хөрөнгө</TableHead>
                        <TableHead>Код</TableHead>
                        <TableHead>Баркод</TableHead>
                        <TableHead>Тодорхойлолт</TableHead>
                        <TableHead>Тэмдэглэл</TableHead>
                        <TableHead>Огноо</TableHead>
                        <TableHead className="text-right">Үйлдэл</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {specs.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Мэдээлэл олдсонгүй
                          </TableCell>
                        </TableRow>
                      ) : (
                        specs.map((spec) => (
                          <TableRow key={spec.id}>
                            <TableCell className="font-medium">
                              {spec.odoo_asset_name || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {spec.odoo_asset_code || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {spec.odoo_asset_barcode || "—"}
                            </TableCell>
                            <TableCell className="max-w-[160px] truncate">
                              {spec.descr || "—"}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {spec.notes || "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {spec.updated_at
                                ? new Date(spec.updated_at).toLocaleDateString(
                                    "mn-MN",
                                  )
                                : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <TooltipProvider delayDuration={300}>
                                <div className="flex items-center justify-end gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleViewSpecHistory(spec)
                                        }
                                      >
                                        <History className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Мэдээллийн түүх
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewHistory(spec)}
                                      >
                                        <ClipboardCheck className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Үзлэгийн түүх</TooltipContent>
                                  </Tooltip>
                                  {/* QR код түр нуусан
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewQR(spec)}
                                      >
                                        <QrCode className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>QR код</TooltipContent>
                                  </Tooltip>
                                  */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditSpec(spec)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Засах</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeletePrompt(spec)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Устгах</TooltipContent>
                                  </Tooltip>
                                </div>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {totalSpecsPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Нийт {specsTotal} мэдээлэл
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={specsPage <= 1}
                      onClick={() => setSpecsPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {specsPage} / {totalSpecsPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={specsPage >= totalSpecsPages}
                      onClick={() => setSpecsPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── Inspections Tab ── */}
            <TabsContent value="inspections" className="space-y-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Үзлэг хайх..."
                  value={inspSearch}
                  onChange={(e) => {
                    setInspSearch(e.target.value);
                    setInspPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              {inspLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Ачааллаж байна...
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Хөрөнгө</TableHead>
                        <TableHead>Код</TableHead>
                        <TableHead>Баркод</TableHead>
                        <TableHead>Огноо</TableHead>
                        <TableHead>Төлөв</TableHead>
                        <TableHead>Шалгасан</TableHead>
                        <TableHead>Тэмдэглэл</TableHead>
                        <TableHead className="text-right">Үйлдэл</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inspections.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Үзлэгийн мэдээлэл олдсонгүй
                          </TableCell>
                        </TableRow>
                      ) : (
                        inspections.map((insp) => (
                          <TableRow key={insp.id}>
                            <TableCell className="font-medium">
                              {insp.odoo_asset_name || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {insp.odoo_asset_code || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {insp.odoo_asset_barcode || "—"}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                insp.inspection_date,
                              ).toLocaleDateString("mn-MN")}
                            </TableCell>
                            <TableCell>
                              {insp.status === "pass" ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  Хэвийн
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                  Асуудалтай
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {insp.inspected_by_name || "—"}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {insp.notes || "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <TooltipProvider delayDuration={300}>
                                <div className="flex items-center justify-end gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditInspection(insp)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Засах</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteInspPrompt(insp)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Устгах</TooltipContent>
                                  </Tooltip>
                                </div>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {totalInspPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Нийт {inspTotal} үзлэг
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={inspPage <= 1}
                      onClick={() => setInspPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {inspPage} / {totalInspPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={inspPage >= totalInspPages}
                      onClick={() => setInspPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Dialogs */}
          <ComputerSpecFormDialog
            isOpen={formOpen}
            onClose={() => {
              setFormOpen(false);
              setSelectedSpec(null);
              setSelectedAsset(null);
            }}
            onSubmit={handleFormSubmit}
            spec={selectedSpec}
            asset={selectedAsset}
          />

          <QRCodeDialog
            isOpen={qrOpen}
            onClose={() => {
              setQrOpen(false);
              setSelectedSpec(null);
            }}
            spec={selectedSpec}
          />

          <SpecHistoryDialog
            isOpen={specHistoryOpen}
            onClose={() => {
              setSpecHistoryOpen(false);
              setSelectedSpec(null);
            }}
            spec={selectedSpec}
          />

          <DeleteConfirmDialog
            isOpen={deleteOpen}
            onClose={() => {
              setDeleteOpen(false);
              setSelectedSpec(null);
            }}
            onConfirm={handleDelete}
            title="Мэдээлэл устгах"
            description={`"${selectedSpec?.odoo_asset_name || ""}" компьютерийн мэдээллийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`}
            isLoading={isDeleting}
          />

          <InspectionHistoryDialog
            isOpen={inspHistoryOpen}
            onClose={() => {
              setInspHistoryOpen(false);
              setSelectedSpec(null);
            }}
            spec={selectedSpec}
            onChanged={refetchInspections}
          />

          <InspectionFormDialog
            isOpen={inspFormOpen}
            onClose={() => {
              setInspFormOpen(false);
              setSelectedInspection(null);
            }}
            onSubmit={handleInspFormSubmit}
            inspection={selectedInspection}
            assetName={selectedInspection?.odoo_asset_name}
          />

          <DeleteConfirmDialog
            isOpen={inspDeleteOpen}
            onClose={() => {
              setInspDeleteOpen(false);
              setSelectedInspection(null);
            }}
            onConfirm={handleDeleteInspection}
            title="Үзлэг устгах"
            description="Энэ үзлэгийн мэдээллийг устгах уу? Энэ үйлдлийг буцаах боломжгүй."
            isLoading={isDeletingInsp}
          />
        </div>
      </main>
    </ProtectedRoute>
  );
}
