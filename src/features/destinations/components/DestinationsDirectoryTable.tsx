"use client";

import { useState, useMemo } from "react";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Edit,
  Globe,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { DestinationItem } from "../api/destinationsApi";
import {
  useAdminDestinations,
  usePublishDestination,
  useUnpublishDestination,
  useArchiveDestination,
  useDeleteDestination,
  useReorderDestinations,
} from "../hooks/useDestinationsAdmin";
import { DestinationEditorDrawer } from "./DestinationEditorDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DestinationsDirectoryTableProps {
  onSelectDestinationForTours?: (slug: string) => void;
}

export function DestinationsDirectoryTable({
  onSelectDestinationForTours,
}: DestinationsDirectoryTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [selectedDestination, setSelectedDestination] =
    useState<DestinationItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, error, refetch } = useAdminDestinations({
    search: search.trim() || undefined,
    status: status === "ALL" ? undefined : status,
    limit: 50,
  });

  const publishMutation = usePublishDestination();
  const unpublishMutation = useUnpublishDestination();
  const archiveMutation = useArchiveDestination();
  const deleteMutation = useDeleteDestination();
  const reorderMutation = useReorderDestinations();

  const items = useMemo(() => {
    return Array.isArray(data) ? data : data?.data ?? [];
  }, [data]);

  const openCreate = () => {
    setSelectedDestination(null);
    setDrawerOpen(true);
  };

  const openEdit = (dest: DestinationItem) => {
    setSelectedDestination(dest);
    setDrawerOpen(true);
  };

  const handleDelete = async (dest: DestinationItem) => {
    const name = dest.titleJsonb?.ar || dest.titleJsonb?.en || dest.slug;
    if (
      !window.confirm(
        `هل أنت متأكد من حذف وجهة "${name}" (/destinations/${dest.slug})؟\n\nلن يتم حذف الرحلات من الكتالوج، وسيتم فقط فك ارتباطها من هذه الوجهة.`
      )
    ) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(dest.slug || dest.id);
    } catch {
      // Toast handled by mutation
    }
  };

  const handleStatusChange = async (
    dest: DestinationItem,
    action: "publish" | "unpublish" | "archive"
  ) => {
    const slug = dest.slug || dest.id;
    try {
      if (action === "publish") await publishMutation.mutateAsync(slug);
      if (action === "unpublish") await unpublishMutation.mutateAsync(slug);
      if (action === "archive") await archiveMutation.mutateAsync(slug);
    } catch {
      // Handled by mutation toast
    }
  };

  const handleMoveOrder = async (index: number, direction: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    [sorted[index], sorted[swapIndex]] = [sorted[swapIndex], sorted[index]];

    try {
      await reorderMutation.mutateAsync(
        sorted.map((item, sortOrder) => ({ id: item.id, sortOrder }))
      );
    } catch {
      // Handled by toast
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Toolbar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl font-medium text-xs"
              placeholder="بحث في الوجهات السياحية بالاسم أو الرابط..."
            />
          </div>
          <select
            aria-label="تصفية حالة الوجهة"
            className="h-10 rounded-xl border bg-background px-3 text-xs font-bold"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">كافة الحالات</option>
            <option value="PUBLISHED">منشور (Published)</option>
            <option value="DRAFT">مسودة (Draft)</option>
            <option value="INACTIVE">غير نشط (Inactive)</option>
            <option value="ARCHIVED">مؤرشف (Archived)</option>
          </select>
        </div>

        <Button
          onClick={openCreate}
          className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black cursor-pointer shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          إضافة وجهة سياحية جديدة ➕
        </Button>
      </div>

      {/* Error state */}
      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm font-bold text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>تعذر تحميل قائمة الوجهات السياحية. تأكد من عمل الخادم.</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl font-bold"
          >
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        /* Data Table */
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-16">الغلاف</TableHead>
                <TableHead>الوجهة والرابط</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>اللغات المترجمة (5)</TableHead>
                <TableHead className="text-center">الرحلات المندرجة</TableHead>
                <TableHead className="text-center">الترتيب</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-amber-500" />
                    <span className="text-xs font-bold text-muted-foreground mt-2 block">
                      جاري تحميل بيانات الوجهات السياحية...
                    </span>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-36 text-center text-xs font-bold text-muted-foreground"
                  >
                    لا توجد وجهات سياحية تطابق معايير البحث الحالية.
                  </TableCell>
                </TableRow>
              ) : (
                [...items]
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((dest, index, sortedItems) => {
                    const primaryTitle =
                      dest.titleJsonb?.ar || dest.titleJsonb?.en || dest.slug;
                    const secondaryTitle =
                      dest.titleJsonb?.en && dest.titleJsonb?.en !== primaryTitle
                        ? dest.titleJsonb.en
                        : "";

                    const toursCount =
                      dest.totalToursCount ??
                      (Array.isArray(dest.tours) ? dest.tours.length : 0);

                    return (
                      <TableRow key={dest.id || dest.slug} className="hover:bg-muted/20">
                        {/* Thumbnail */}
                        <TableCell>
                          <div className="h-11 w-14 overflow-hidden rounded-xl border bg-muted shrink-0 shadow-2xs">
                            {dest.heroImageUrl ? (
                              <img
                                src={dest.heroImageUrl}
                                alt={primaryTitle}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Globe className="h-5 w-5 text-muted-foreground/60" />
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Title & Slug */}
                        <TableCell>
                          <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            <span>{primaryTitle}</span>
                            {secondaryTitle && (
                              <span className="text-xs text-muted-foreground font-normal">
                                ({secondaryTitle})
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <span>/destinations/{dest.slug}</span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1 items-center">
                            <Badge
                              variant={
                                dest.status === "PUBLISHED"
                                  ? "default"
                                  : dest.status === "DRAFT"
                                  ? "secondary"
                                  : "outline"
                              }
                              className={`font-bold text-xs ${
                                dest.status === "PUBLISHED"
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                                  : dest.status === "DRAFT"
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                                  : ""
                              }`}
                            >
                              {dest.status === "PUBLISHED"
                                ? "منشور"
                                : dest.status === "DRAFT"
                                ? "مسودة"
                                : dest.status === "INACTIVE"
                                ? "غير نشط"
                                : "مؤرشف"}
                            </Badge>
                            {!dest.isActive && (
                              <Badge variant="destructive" className="font-bold text-[10px]">
                                معطل
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* 5 Locales completion */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {["ar", "en", "es", "pt", "it"].map((locale) => {
                              const isComplete =
                                dest.translationCompletion?.[locale]?.isComplete ??
                                Boolean(dest.titleJsonb?.[locale]?.trim());
                              return (
                                <span
                                  key={locale}
                                  title={`${locale.toUpperCase()}: ${
                                    isComplete ? "مكتمل" : "غير مكتمل"
                                  }`}
                                  className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                                    isComplete
                                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                      : "border-muted text-muted-foreground/50 opacity-60"
                                  }`}
                                >
                                  {locale}
                                </span>
                              );
                            })}
                          </div>
                        </TableCell>

                        {/* Tours count & click to explore */}
                        <TableCell className="text-center">
                          <button
                            type="button"
                            onClick={() => onSelectDestinationForTours?.(dest.slug)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 hover:bg-muted px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer"
                            title="عرض وتوزيع رحلات هذه الوجهة"
                          >
                            <Package className="h-3.5 w-3.5 text-amber-500" />
                            <span>{toursCount} رحلة</span>
                          </button>
                        </TableCell>

                        {/* Reorder Up / Down */}
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={index === 0 || reorderMutation.isPending}
                              onClick={() => void handleMoveOrder(index, -1)}
                              className="h-7 w-7 p-0 rounded-lg"
                              title="تحريك لأعلى"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={
                                index === sortedItems.length - 1 ||
                                reorderMutation.isPending
                              }
                              onClick={() => void handleMoveOrder(index, 1)}
                              className="h-7 w-7 p-0 rounded-lg"
                              title="تحريك لأسفل"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-left">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-label={`إجراءات ${primaryTitle}`}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-xl cursor-pointer"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="font-bold text-xs w-48">
                              <DropdownMenuLabel>إجراءات الوجهة</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => openEdit(dest)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4 text-amber-500" />
                                تعديل الوجهة والرحلات
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  window.open(`/destinations/${dest.slug}`, "_blank");
                                }}
                                className="cursor-pointer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4 text-blue-500" />
                                معاينة على الموقع
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {dest.status === "PUBLISHED" ? (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(dest, "unpublish")}
                                  className="cursor-pointer"
                                >
                                  تحويل لمسودة (إلغاء النشر)
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(dest, "publish")}
                                  className="cursor-pointer"
                                >
                                  نشر الوجهة على الموقع
                                </DropdownMenuItem>
                              )}

                              {dest.status !== "ARCHIVED" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(dest, "archive")}
                                  className="cursor-pointer"
                                >
                                  <Archive className="mr-2 h-4 w-4" />
                                  أرشفة الوجهة
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleDelete(dest)}
                                className="text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                حذف الوجهة
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Drawer */}
      <DestinationEditorDrawer
        destination={selectedDestination}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
