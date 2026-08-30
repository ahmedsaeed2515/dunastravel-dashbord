"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MediaCategoryItem } from "../types";
import {
  useCreateMediaCategory,
  useUpdateMediaCategory,
  useDeleteMediaCategory,
} from "../hooks/useMedia";
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  AlertTriangle,
  FolderPlus,
} from "lucide-react";
import { toast } from "sonner";

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: MediaCategoryItem[];
  isAr?: boolean;
}

const COLOR_OPTIONS = [
  { name: "amber", bg: "bg-amber-500", text: "text-amber-500" },
  { name: "sky", bg: "bg-sky-500", text: "text-sky-500" },
  { name: "violet", bg: "bg-violet-500", text: "text-violet-500" },
  { name: "emerald", bg: "bg-emerald-500", text: "text-emerald-500" },
  { name: "rose", bg: "bg-rose-500", text: "text-rose-500" },
  { name: "indigo", bg: "bg-indigo-500", text: "text-indigo-500" },
  { name: "teal", bg: "bg-teal-500", text: "text-teal-500" },
  { name: "orange", bg: "bg-orange-500", text: "text-orange-500" },
];

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function ManageCategoriesDialog({
  open,
  onOpenChange,
  categories,
  isAr = false,
}: ManageCategoriesDialogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  // New Category Form
  const [newCat, setNewCat] = useState({
    nameEn: "",
    nameAr: "",
    slug: "",
    color: "amber",
    description: "",
  });

  // Edit Category Form
  const [editCat, setEditCat] = useState({
    nameEn: "",
    nameAr: "",
    color: "amber",
    description: "",
  });

  const createMutation = useCreateMediaCategory();
  const updateMutation = useUpdateMediaCategory();
  const deleteMutation = useDeleteMediaCategory();

  const handleStartAdd = () => {
    setNewCat({
      nameEn: "",
      nameAr: "",
      slug: "",
      color: "amber",
      description: "",
    });
    setIsAdding(true);
    setEditingSlug(null);
  };

  const handleCreate = async () => {
    if (!newCat.nameEn.trim()) {
      toast.error(isAr ? "يرجى كتابة اسم الفئة بالإنجليزية." : "English name is required.");
      return;
    }
    const cleanSlug = slugify(newCat.slug || newCat.nameEn);
    if (!cleanSlug) {
      toast.error(isAr ? "يرجى إدخال رمز الرابط (Slug)." : "Slug is required.");
      return;
    }

    await createMutation.mutateAsync({
      nameEn: newCat.nameEn.trim(),
      nameAr: newCat.nameAr.trim() || newCat.nameEn.trim(),
      slug: cleanSlug,
      color: newCat.color,
      description: newCat.description.trim() || undefined,
    });
    setIsAdding(false);
  };

  const handleStartEdit = (cat: MediaCategoryItem) => {
    setEditingSlug(cat.slug);
    setEditCat({
      nameEn: cat.nameEn,
      nameAr: cat.nameAr,
      color: cat.color || "amber",
      description: cat.description || "",
    });
    setIsAdding(false);
  };

  const handleUpdate = async (slug: string) => {
    if (!editCat.nameEn.trim()) {
      toast.error(isAr ? "يرجى كتابة اسم الفئة بالإنجليزية." : "English name is required.");
      return;
    }
    await updateMutation.mutateAsync({
      slug,
      payload: {
        nameEn: editCat.nameEn.trim(),
        nameAr: editCat.nameAr.trim() || editCat.nameEn.trim(),
        color: editCat.color,
        description: editCat.description.trim() || undefined,
      },
    });
    setEditingSlug(null);
  };

  const handleDelete = async (cat: MediaCategoryItem) => {
    if (cat.isSystem) {
      toast.error(isAr ? "لا يمكن حذف الفئات الأساسية للنظام." : "System categories cannot be deleted.");
      return;
    }
    if (
      !window.confirm(
        isAr
          ? `هل أنت متأكد من حذف فئة "${cat.nameAr}"؟ سيتم نقل كافة الصور التابعة لها إلى المكتبة العامة.`
          : `Are you sure you want to delete category "${cat.nameEn}"? All images in it will be moved to General Library.`
      )
    ) {
      return;
    }
    await deleteMutation.mutateAsync(cat.slug);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-3xl border border-border/80 shadow-2xl bg-card">
        <DialogHeader className="p-6 pb-4 bg-linear-to-r from-amber-500/10 via-primary/10 to-transparent border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-black flex items-center gap-2.5 text-foreground">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
              <Tags className="w-5 h-5" />
            </div>
            <span>{isAr ? "إدارة وتصنيف فئات الصور" : "Manage Media Categories & Folders"}</span>
          </DialogTitle>

          {!isAdding && (
            <Button
              size="sm"
              onClick={handleStartAdd}
              className="h-8 text-xs font-bold gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? "إضافة فئة جديدة" : "New Category"}</span>
            </Button>
          )}
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Create New Category Form */}
          {isAdding && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-500 flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4" />
                  <span>{isAr ? "إضافة فئة مخصصة جديدة" : "Create New Custom Category"}</span>
                </h4>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground"
                  onClick={() => setIsAdding(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-extrabold">{isAr ? "الاسم بالإنجليزية *" : "Name (EN) *"}</Label>
                  <Input
                    placeholder="e.g. VIP Suites & Luxury"
                    value={newCat.nameEn}
                    onChange={(e) =>
                      setNewCat((prev) => ({
                        ...prev,
                        nameEn: e.target.value,
                        slug: slugify(e.target.value),
                      }))
                    }
                    className="h-9 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-extrabold">{isAr ? "الاسم بالعربية *" : "Name (AR) *"}</Label>
                  <Input
                    placeholder="مثال: الأجنحة الملكية والفاخرة"
                    value={newCat.nameAr}
                    onChange={(e) => setNewCat((prev) => ({ ...prev, nameAr: e.target.value }))}
                    className="h-9 text-xs font-bold"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-extrabold">{isAr ? "رمز الرابط (Slug) *" : "Slug *"}</Label>
                  <Input
                    placeholder="vip-suites"
                    value={newCat.slug}
                    onChange={(e) => setNewCat((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-extrabold">{isAr ? "لون الشارة" : "Badge Color"}</Label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setNewCat((prev) => ({ ...prev, color: c.name }))}
                        className={`w-6 h-6 rounded-full ${c.bg} transition-all cursor-pointer ${
                          newCat.color === c.name ? "ring-2 ring-foreground scale-110" : "opacity-60 hover:opacity-100"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs cursor-pointer"
                  onClick={() => setIsAdding(false)}
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="h-8 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer gap-1"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{isAr ? "حفظ الفئة" : "Save Category"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isAr ? `الفئات المتاحة (${categories.length})` : `Available Categories (${categories.length})`}
            </h4>

            <div className="divide-y divide-border/60 border rounded-2xl overflow-hidden bg-card">
              {categories.map((cat) => {
                const isEditing = editingSlug === cat.slug;

                if (isEditing) {
                  return (
                    <div key={cat.slug} className="p-3.5 bg-muted/40 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold">الاسم بالإنجليزية (English)</Label>
                          <Input
                            value={editCat.nameEn}
                            onChange={(e) => setEditCat((prev) => ({ ...prev, nameEn: e.target.value }))}
                            className="h-8 text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold">الاسم بالعربية</Label>
                          <Input
                            value={editCat.nameAr}
                            onChange={(e) => setEditCat((prev) => ({ ...prev, nameAr: e.target.value }))}
                            className="h-8 text-xs font-bold"
                            dir="rtl"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          {COLOR_OPTIONS.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => setEditCat((prev) => ({ ...prev, color: c.name }))}
                              className={`w-5 h-5 rounded-full ${c.bg} transition-all cursor-pointer ${
                                editCat.color === c.name ? "ring-2 ring-foreground scale-110" : "opacity-50"
                              }`}
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => setEditingSlug(null)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950"
                            onClick={() => handleUpdate(cat.slug)}
                            disabled={updateMutation.isPending}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            {isAr ? "حفظ" : "Save"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat.slug}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-foreground truncate">
                            {isAr ? cat.nameAr : cat.nameEn}
                          </span>
                          {cat.isSystem && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                              {isAr ? "أساسي" : "System"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          slug: <span className="text-foreground">{cat.slug}</span> · {cat.nameEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="font-mono text-xs font-bold">
                        {cat.count ?? 0} {isAr ? "صور" : "images"}
                      </Badge>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => handleStartEdit(cat)}
                        title={isAr ? "تعديل" : "Edit"}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>

                      {!cat.isSystem && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                          onClick={() => handleDelete(cat)}
                          title={isAr ? "حذف" : "Delete"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted/30 border-t flex flex-row items-center justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs font-semibold cursor-pointer"
          >
            {isAr ? "إغلاق" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
