"use client";

import React from 'react';
import type { TripModel } from '@/types/dunas-suite';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TripEditForm } from '@/components/trips/TripEditForm';

interface TripEditorModalProps {
  trip?: TripModel | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal wrapper around the shared {@link TripEditForm}.
 *
 * Used for the quick "add new trip" flow and any legacy entry point that still
 * prefers a dialog. The full-page edit experience lives in
 * `admin/tours/[slug]/edit/page.tsx` which renders the same form as a page.
 */
export const TripEditorModal: React.FC<TripEditorModalProps> = ({ trip, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-full sm:w-[96vw] h-[100dvh] sm:h-[94vh] sm:max-h-[94vh] flex flex-col bg-card border-0 sm:border border-border/80 rounded-none sm:rounded-3xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{trip ? 'تعديل الرحلة والترجمات الـ 5' : 'إضافة رحلة جديدة فاخرة'}</DialogTitle>
          <DialogDescription>
            تحرير كامل الخصائص الفنية، الأيام، الفنادق، وترجمة المحتوى للغات الخمس بضغطة زر واحدة.
          </DialogDescription>
        </DialogHeader>
        <TripEditForm
          trip={trip}
          isOpen={isOpen}
          onClose={onClose}
          mode="modal"
        />
      </DialogContent>
    </Dialog>
  );
};

TripEditorModal.displayName = 'TripEditorModal';
