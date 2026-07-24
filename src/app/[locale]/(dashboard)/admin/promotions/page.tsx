"use client";

import { useState } from "react";
import { PromotionsTable } from "@/features/promotions/components/PromotionsTable";
import { CreatePromotionDialog } from "@/features/promotions/components/CreatePromotionDialog";
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from "@/features/promotions/hooks/usePromotions";
import { Promotion, PromotionQueryFilters, CreatePromotionPayload, UpdatePromotionPayload } from "@/features/promotions/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
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
  const [filters, setFilters] = useState<PromotionQueryFilters>({ page: 1, limit: 10 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);

  const { data, isLoading } = usePromotions(filters);
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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Promotions & Discounts"
        description="Manage promotional codes, campaign vouchers, validity dates, maximum usage bounds, and discount rules."
        actions={
          <Button onClick={handleCreateClick} size="sm" variant="gold" className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            <span>New Promotion</span>
          </Button>
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
        />
      </div>

      <CreatePromotionDialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingPromotion(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        initialData={editingPromotion}
      />

      <AlertDialog open={!!promotionToDelete} onOpenChange={(open) => !open && setPromotionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete promotion code
              <span className="font-semibold text-foreground"> {promotionToDelete?.code} </span> 
              and deactivate it for future checkouts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Promotion"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
