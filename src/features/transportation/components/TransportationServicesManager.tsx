"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/axios";

type TransportationService = {
  id: string;
  name: string;
  serviceType: string;
  basePriceUsd: number;
  isActive: boolean;
  heroImage?: string | null;
};

type ServiceDraft = Omit<TransportationService, "id">;

const emptyDraft = (): ServiceDraft => ({
  name: "",
  serviceType: "",
  basePriceUsd: 0,
  isActive: true,
  heroImage: "",
});

export function TransportationServicesManager() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ServiceDraft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);

  const services = useQuery({
    queryKey: ["transportation-services"],
    queryFn: () => apiClient.get<TransportationService[], TransportationService[]>("/admin/transportation/services"),
  });

  const save = useMutation({
    mutationFn: () => editingId
      ? apiClient.put<TransportationService, TransportationService>(`/admin/transportation/services/${editingId}`, draft)
      : apiClient.post<TransportationService, TransportationService>("/admin/transportation/services", draft),
    onSuccess: () => {
      toast.success(editingId ? "Transportation service updated" : "Transportation service created");
      setDraft(emptyDraft());
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["transportation-services"] });
    },
    onError: (error: { message?: string }) => toast.error(error.message || "Could not save transportation service"),
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => apiClient.delete<TransportationService, TransportationService>(`/admin/transportation/services/${id}`),
    onSuccess: () => {
      toast.success("Transportation service deactivated");
      queryClient.invalidateQueries({ queryKey: ["transportation-services"] });
    },
    onError: (error: { message?: string }) => toast.error(error.message || "Could not deactivate transportation service"),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.serviceType.trim()) {
      toast.error("Name and service type are required");
      return;
    }
    save.mutate();
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-5">
          <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Service name" />
          <Input value={draft.serviceType} onChange={(event) => setDraft({ ...draft, serviceType: event.target.value })} placeholder="Service type (e.g. AIRPORT)" />
          <Input type="number" min="0" step="0.01" value={draft.basePriceUsd} onChange={(event) => setDraft({ ...draft, basePriceUsd: Number(event.target.value) })} placeholder="Base price (USD)" />
          <Input value={draft.heroImage || ""} onChange={(event) => setDraft({ ...draft, heroImage: event.target.value })} placeholder="Image URL (optional)" />
          <div className="flex gap-2">
            <Button type="submit" disabled={save.isPending}>{editingId ? "Save" : "Create"}</Button>
            {editingId ? <Button type="button" variant="outline" onClick={() => { setEditingId(null); setDraft(emptyDraft()); }}>Cancel</Button> : null}
          </div>
        </form>
      </Card>

      {services.isError ? <Card className="p-6 text-destructive">Transportation services could not be loaded from the backend.</Card> : null}
      {services.isLoading ? <Card className="p-6 text-muted-foreground">Loading transportation services…</Card> : null}
      <div className="space-y-3">
        {services.data?.map((service) => (
          <Card key={service.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">{service.name}</p>
              <p className="text-sm text-muted-foreground">{service.serviceType} · ${Number(service.basePriceUsd).toFixed(2)} USD · {service.isActive ? "Active" : "Inactive"}</p>
              {service.heroImage ? <p className="text-xs text-muted-foreground truncate max-w-md">Image: {service.heroImage}</p> : null}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setEditingId(service.id); setDraft({ name: service.name, serviceType: service.serviceType, basePriceUsd: Number(service.basePriceUsd), isActive: service.isActive, heroImage: service.heroImage || "" }); }}>Edit</Button>
              {service.isActive ? <Button variant="destructive" disabled={deactivate.isPending} onClick={() => deactivate.mutate(service.id)}>Deactivate</Button> : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
