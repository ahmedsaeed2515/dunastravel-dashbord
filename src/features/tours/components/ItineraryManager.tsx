"use client";

import { useState } from "react";
import { Tour } from "../types";
import { useAddTourItinerary, useRemoveTourItinerary, useUpdateTourItinerary } from "../hooks/useTours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash, Edit2, X, Save } from "lucide-react";

interface ItineraryManagerProps {
  tour: Tour;
}

export function ItineraryManager({ tour }: ItineraryManagerProps) {
  const { mutate: addItinerary, isPending: isAdding } = useAddTourItinerary();
  const { mutate: removeItinerary, isPending: isRemoving } = useRemoveTourItinerary();
  const { mutate: updateItinerary, isPending: isUpdating } = useUpdateTourItinerary();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [dayLabel, setDayLabel] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(tour.itineraries?.length ? tour.itineraries.length + 1 : 1);

  const resetForm = () => {
    setDayLabel("");
    setDescriptionEn("");
    setSortOrder(tour.itineraries?.length ? tour.itineraries.length + 1 : 1);
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItinerary({
      slug: tour.slug,
      data: {
        dayLabel,
        descriptionJsonb: { en: descriptionEn },
        sortOrder
      }
    }, {
      onSuccess: resetForm
    });
  };

  const handleEditSubmit = (e: React.FormEvent, dayId: string) => {
    e.preventDefault();
    updateItinerary({
      slug: tour.slug,
      dayId,
      data: {
        dayLabel,
        descriptionJsonb: { en: descriptionEn },
        sortOrder
      }
    }, {
      onSuccess: resetForm
    });
  };

  const startEditing = (it: any) => {
    setEditingId(it.id);
    setDayLabel(it.dayLabel);
    setDescriptionEn(it.descriptionJsonb?.["en"] || "");
    setSortOrder(it.sortOrder);
    setIsAddingNew(false);
  };

  const sortedItineraries = [...(tour.itineraries || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Itinerary Management</h3>
        {!isAddingNew && !editingId && (
          <Button size="sm" onClick={() => setIsAddingNew(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Day
          </Button>
        )}
      </div>

      {isAddingNew && (
        <form onSubmit={handleAddSubmit} className="border rounded-xl p-4 bg-muted/30 space-y-4 shadow-sm relative">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={resetForm}>
            <X className="h-4 w-4" />
          </Button>
          <h4 className="font-semibold text-sm">Add New Day</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Day Label</label>
              <Input required value={dayLabel} onChange={(e) => setDayLabel(e.target.value)} placeholder="e.g. Day 1: Arrival" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Sort Order</label>
              <Input required type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Description (EN)</label>
            <Textarea required value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder="Describe the day's events..." />
          </div>
          <Button size="sm" type="submit" disabled={isAdding}>
            <Save className="h-4 w-4 mr-2" /> Save Day
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {sortedItineraries.length > 0 ? (
          sortedItineraries.map((it, i) => (
            editingId === it.id ? (
              <form key={it.id} onSubmit={(e) => handleEditSubmit(e, it.id!)} className="border-2 border-primary/20 rounded-xl p-4 bg-muted/10 space-y-4 shadow-sm relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
                <h4 className="font-semibold text-sm">Edit Day</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Day Label</label>
                    <Input required value={dayLabel} onChange={(e) => setDayLabel(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Sort Order</label>
                    <Input required type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Description (EN)</label>
                  <Textarea required value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} />
                </div>
                <Button size="sm" type="submit" disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-2" /> Update Day
                </Button>
              </form>
            ) : (
              <div key={it.id || i} className="border rounded-xl p-5 bg-card shadow-sm space-y-3 group relative overflow-hidden">
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => startEditing(it)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => removeItinerary({ slug: tour.slug, dayId: it.id! })} disabled={isRemoving}>
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-semibold text-base text-primary">
                    {it.dayLabel || `Day ${it.sortOrder}`}
                  </span>
                  <Badge variant="outline">Step {it.sortOrder}</Badge>
                </div>
                <p className="text-sm text-foreground leading-relaxed pr-16">
                  {it.descriptionJsonb?.["en"] || "No description for this day."}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-xs">
                  <div>
                    <span className="text-muted-foreground block font-medium">Meals</span>
                    <span className="truncate block font-mono">{JSON.stringify(it.mealsJsonb || {})}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Hotels</span>
                    <span className="truncate block font-mono">{JSON.stringify(it.hotelsJsonb || {})}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Activities</span>
                    <span className="truncate block font-mono">{JSON.stringify(it.activitiesJsonb || {})}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Transport</span>
                    <span className="truncate block font-mono">{JSON.stringify(it.transportationJsonb || {})}</span>
                  </div>
                </div>
              </div>
            )
          ))
        ) : !isAddingNew && (
          <div className="text-center text-muted-foreground py-12 border rounded-xl bg-card">
            No itinerary day plans recorded for this tour.
          </div>
        )}
      </div>
    </div>
  );
}
