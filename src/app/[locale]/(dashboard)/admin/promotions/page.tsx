"use client";

import { useState } from "react";
import { PromotionsTable } from "@/features/promotions/components/PromotionsTable";
import { CreatePromotionDialog } from "@/features/promotions/components/CreatePromotionDialog";
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from "@/features/promotions/hooks/usePromotions";
import { Promotion, PromotionQueryFilters, CreatePromotionPayload, UpdatePromotionPayload } from "@/features/promotions/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Promotions</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage discount codes, vouchers, and promotional campaigns.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreateClick} className="gap-2 bg-primary">
            <PlusCircle className="h-4 w-4" />
            New Promotion
          </Button>
        </div>
      </div>

      <PromotionsTable 
        data={data?.data || []}
        total={data?.meta?.total || 0}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={setFilters}
        onEdit={handleEdit}
        onDelete={setPromotionToDelete}
      />

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
              This action cannot be undone. This will permanently delete the promotion
              <span className="font-semibold text-foreground"> {promotionToDelete?.code} </span> 
              and it will no longer be valid for checkouts.
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
