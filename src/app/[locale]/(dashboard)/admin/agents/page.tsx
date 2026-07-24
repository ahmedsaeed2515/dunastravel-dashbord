"use client";

import { useState } from "react";
import { AgentsTable } from "@/features/agents/components/AgentsTable";
import { CreateAgentDialog } from "@/features/agents/components/CreateAgentDialog";
import { useAgents, useCreateAgent, useUpdateAgent, useDeleteAgent } from "@/features/agents/hooks/useAgents";
import { Agent, AgentQueryFilters, CreateAgentPayload, UpdateAgentPayload } from "@/features/agents/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";
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

export default function AgentsPage() {
  const tAgents = useTranslations("agents");
  const tCommon = useTranslations("common");

  const [filters, setFilters] = useState<AgentQueryFilters>({ page: 1, limit: 10 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  const { data, isLoading } = useAgents(filters);
  const { mutate: createAgent, isPending: isCreating } = useCreateAgent();
  const { mutate: updateAgent, isPending: isUpdating } = useUpdateAgent();
  const { mutate: deleteAgent, isPending: isDeleting } = useDeleteAgent();

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setIsDialogOpen(true);
  };

  const handleCreateClick = () => {
    setEditingAgent(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = (payload: CreateAgentPayload | UpdateAgentPayload) => {
    if (editingAgent) {
      updateAgent(
        { id: editingAgent.id, data: payload as UpdateAgentPayload },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingAgent(null);
          },
        }
      );
    } else {
      createAgent(payload as CreateAgentPayload, {
        onSuccess: () => {
          setIsDialogOpen(false);
        },
      });
    }
  };

  const confirmDelete = () => {
    if (agentToDelete) {
      deleteAgent(agentToDelete.id, {
        onSuccess: () => setAgentToDelete(null),
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tAgents("title")}
        description={tAgents("description")}
        actions={
          <Button onClick={handleCreateClick} size="sm" variant="gold" className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            <span>{tCommon("create")}</span>
          </Button>
        }
      />

      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
        <AgentsTable 
          data={Array.isArray(data) ? data : (data?.data || [])}
          total={Array.isArray(data) ? data.length : (data?.meta?.total || 0)}
          isLoading={isLoading}
          filters={filters}
          onFilterChange={setFilters}
          onEdit={handleEdit}
          onDelete={setAgentToDelete}
        />
      </div>

      <CreateAgentDialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingAgent(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        initialData={editingAgent}
      />

      <AlertDialog open={!!agentToDelete} onOpenChange={(open) => !open && setAgentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon("confirm")} {tCommon("delete")}?</AlertDialogTitle>
            <AlertDialogDescription>
              {agentToDelete?.name}
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
