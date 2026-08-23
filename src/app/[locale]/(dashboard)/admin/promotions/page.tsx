"use client";

import { useState } from "react";
import { PromotionsTable } from "@/features/promotions/components/PromotionsTable";
import { CreatePromotionDialog } from "@/features/promotions/components/CreatePromotionDialog";
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from "@/features/promotions/hooks/usePromotions";
import { Promotion, PromotionQueryFilters, CreatePromotionPayload, UpdatePromotionPayload } from "@/features/promotions/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { usePermissions } from "@/hooks/usePermissions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PromotionsPage() {
  const tPromotions = useTranslations("promotions");
  const tCommon = useTranslations("common");
  const { isSuperAdmin } = usePermissions();

  const [filters, setFilters] = useState<PromotionQueryFilters>({ page: 1, limit: 10 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);

  const { data, isLoading, isError, refetch } = usePromotions(filters);
  const { mutate: createPromotion, isPending: isCreating } = useCreatePromotion();
  const { mutate: updatePromotion, isPending: isUpdating } = useUpdatePromotion();
  const { mutate: deletePromotion, isPending: isDeleting } = useDeletePromotion();

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsDialogOpen(true);
  };

  const handleCreateClick = () => {
    setEditingPromotion(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = (payload: CreatePromotionPayload | UpdatePromotionPayload) => {
    if (editingPromotion) {
      updatePromotion(
        { id: editingPromotion.id, data: payload as UpdatePromotionPayload },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingPromotion(null);
          },
        }
      );
    } else {
      createPromotion(payload as CreatePromotionPayload, {
        onSuccess: () => {
          setIsDialogOpen(false);
        },
      });
    }
  };

  const confirmDelete = () => {
    if (promotionToDelete) {
      deletePromotion(promotionToDelete.id, {
        onSuccess: () => setPromotionToDelete(null),
      });
    }
  };

  if (isError) {
    return <QueryErrorState message="تعذر تحميل العروض والخصومات من الباك إند." onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tPromotions("title")}
        description={tPromotions("description")}
        actions={isSuperAdmin ?
          <Button onClick={handleCreateClick} size="sm" variant="gold" className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            <span>{tPromotions("createPromotion")}</span>
          </Button> : undefined
        }
      />

      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
        <PromotionsTable 
          data={Array.isArray(data) ? data : (data?.data || [])}
          total={Array.isArray(data) ? data.length : (data?.meta?.total || 0)}
          isLoading={isLoading}
          filters={filters}
          onFilterChange={setFilters}
          onEdit={handleEdit}
          onDelete={setPromotionToDelete}
          canManage={isSuperAdmin}
        />
      </div>

      {isSuperAdmin && <CreatePromotionDialog
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingPromotion(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        initialData={editingPromotion}
      />}

      <AlertDialog open={!!promotionToDelete} onOpenChange={(open) => !open && setPromotionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon("confirm")} {tCommon("delete")}?</AlertDialogTitle>
            <AlertDialogDescription>
              {promotionToDelete?.code}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? tCommon("deleting") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
