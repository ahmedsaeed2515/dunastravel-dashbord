"use client";

import { useState } from "react";
import { Archive, ArrowDown, ArrowUp, Edit, Globe, Loader2, MoreHorizontal, Package, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TourLandingPage } from "../../api/landingPagesApi";
import { useArchiveLandingPage, useDeleteLandingPage, useLandingPages, usePublishLandingPage, useReorderLandingPages, useUnpublishLandingPage } from "../../hooks/useLandingPages";
import { LandingPageEditorDrawer } from "../Drawers/LandingPageEditorDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type LandingPageType = "DESTINATION" | "THEME" | "COLLECTION";

export function LandingPagesTable({ fixedType }: { fixedType?: LandingPageType }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [selected, setSelected] = useState<TourLandingPage | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data, isLoading, error, refetch } = useLandingPages({
    type: fixedType,
    search: search.trim() || undefined,
    status: status === "ALL" ? undefined : status,
    limit: 50,
  });
  const publish = usePublishLandingPage();
  const unpublish = useUnpublishLandingPage();
  const archive = useArchiveLandingPage();
  const remove = useDeleteLandingPage();
  const reorder = useReorderLandingPages();
  const items = Array.isArray(data) ? data : (data?.data ?? []);

  const openCreate = () => {
    setSelected({
      id: "",
      slug: "",
      type: fixedType ?? "DESTINATION",
      titleJsonb: { en: "" },
      status: "DRAFT",
      isActive: false,
      sortOrder: items.length,
      createdAt: "",
      updatedAt: "",
    });
    setDrawerOpen(true);
  };

  const deletePage = async (page: TourLandingPage) => {
    if (!window.confirm(`Delete destination interface /${page.slug}? Attached tours remain in the global catalog.`)) return;
    try {
      await remove.mutateAsync(page.slug);
      toast.success("Interface deleted.");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Failed to delete interface.");
    }
  };

  const changeStatus = async (page: TourLandingPage, next: "publish" | "unpublish" | "archive") => {
    try {
      if (next === "publish") await publish.mutateAsync(page.slug);
      if (next === "unpublish") await unpublish.mutateAsync(page.slug);
      if (next === "archive") await archive.mutateAsync(page.slug);
      toast.success(`Interface ${next === "publish" ? "published" : next === "unpublish" ? "returned to draft" : "archived"}.`);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "The interface status could not be changed.");
    }
  };

  const movePage = async (index: number, direction: -1 | 1) => {
    const reordered = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= reordered.length) return;
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    try {
      await reorder.mutateAsync(reordered.map((page, sortOrder) => ({ id: page.id, sortOrder })));
      toast.success("Destination interface order updated.");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Failed to reorder destination interfaces.");
    }
  };

  return <div className="space-y-4">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row">
        <div className="relative max-w-sm flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9 rounded-xl font-medium text-xs" placeholder="بحث في صفحات الوجهات والتصنيفات..." /></div>
        <select aria-label="Filter destination interface status" className="h-10 rounded-xl border bg-background px-3 text-xs font-bold" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="ALL">كافة الحالات</option><option value="PUBLISHED">منشور (Published)</option><option value="DRAFT">مسودة (Draft)</option><option value="INACTIVE">غير نشط (Inactive)</option><option value="ARCHIVED">مؤرشف (Archived)</option>
        </select>
      </div>
      <Button onClick={openCreate} className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black cursor-pointer"><Plus className="mr-2 h-4 w-4" />{fixedType === "DESTINATION" ? "إنشاء وجهة سياحية ➕" : "إنشاء واجهة سياحية ➕"}</Button>
    </div>

    {error ? <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm font-bold text-destructive">تعذر تحميل الواجهات والصفحات. <Button variant="link" className="h-auto p-0 align-baseline text-destructive font-bold" onClick={() => refetch()}>إعادة المحاولة</Button></div> : <div className="overflow-hidden rounded-2xl border bg-card"><Table><TableHeader className="bg-muted/50"><TableRow><TableHead>الغلاف</TableHead><TableHead>العنوان والرابط</TableHead><TableHead>الحالة</TableHead><TableHead>اللغات المترجمة</TableHead><TableHead className="text-center">الرحلات المرتبطة</TableHead><TableHead className="text-right">إجراءات</TableHead></TableRow></TableHeader><TableBody>
      {isLoading ? <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow> : items.length === 0 ? <TableRow><TableCell colSpan={6} className="h-32 text-center text-xs font-bold text-muted-foreground">لا توجد صفحات أو وجهات تطابق معايير البحث الحالية.</TableCell></TableRow> : [...items].sort((a, b) => a.sortOrder - b.sortOrder).map((item, index, orderedItems) => <TableRow key={item.id}>
        <TableCell><div className="h-10 w-12 overflow-hidden rounded-lg border bg-muted">{item.heroImageUrl ? <img src={item.heroImageUrl} alt="" className="h-full w-full object-cover" /> : <Globe className="m-2.5 h-5 w-5 text-muted-foreground" />}</div></TableCell>
        <TableCell><div className="font-bold text-sm">{item.titleJsonb.ar || item.titleJsonb.en || item.slug}</div><div className="font-mono text-xs text-muted-foreground">/{item.slug}</div></TableCell>
        <TableCell><div className="flex flex-wrap gap-1"><Badge variant={item.status === "PUBLISHED" ? "default" : "secondary"} className="font-bold text-xs">{item.status === "PUBLISHED" ? "منشور" : item.status === "DRAFT" ? "مسودة" : item.status}</Badge>{!item.isActive && <Badge variant="destructive" className="font-bold text-xs">غير نشط</Badge>}</div></TableCell>
        <TableCell><div className="flex gap-1">{["en", "ar", "es", "pt", "it"].map((locale) => <span key={locale} title={`${locale.toUpperCase()} ${item.translationCompletion?.[locale]?.isComplete ? "مكتمل" : "غير مكتمل"}`} className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${item.translationCompletion?.[locale]?.isComplete ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : "border-amber-500/30 bg-amber-500/10 text-amber-700"}`}>{locale}</span>)}</div></TableCell>
        <TableCell className="text-center"><span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-bold"><Package className="h-3.5 w-3.5" />{item.totalToursCount ?? 0} رحلة</span></TableCell>
        <TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button aria-label={`Actions for ${item.slug}`} variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="font-bold text-xs"><DropdownMenuLabel>إجراءات الواجهة</DropdownMenuLabel><DropdownMenuItem onClick={() => { setSelected(item); setDrawerOpen(true); }}><Edit className="mr-2 h-4 w-4" />تعديل المحتوى والـ SEO والرحلات</DropdownMenuItem><DropdownMenuItem disabled={index === 0 || reorder.isPending} onClick={() => void movePage(index, -1)}><ArrowUp className="mr-2 h-4 w-4" />تحريك لأعلى</DropdownMenuItem><DropdownMenuItem disabled={index === orderedItems.length - 1 || reorder.isPending} onClick={() => void movePage(index, 1)}><ArrowDown className="mr-2 h-4 w-4" />تحريك لأسفل</DropdownMenuItem>{item.status === "PUBLISHED" ? <DropdownMenuItem onClick={() => void changeStatus(item, "unpublish")}>إلغاء النشر</DropdownMenuItem> : <DropdownMenuItem onClick={() => void changeStatus(item, "publish")}>نشر الصفحة</DropdownMenuItem>}{item.status !== "ARCHIVED" && <DropdownMenuItem onClick={() => void changeStatus(item, "archive")}><Archive className="mr-2 h-4 w-4" />أرشفة</DropdownMenuItem>}<DropdownMenuSeparator /><DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => void deletePage(item)}><Trash2 className="mr-2 h-4 w-4" />حذف الصفحة</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
      </TableRow>)}</TableBody></Table></div>}

    <LandingPageEditorDrawer landingPage={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
  </div>;
}
