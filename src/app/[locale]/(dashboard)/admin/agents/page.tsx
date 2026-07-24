"use client";

import { useState } from "react";
import { AgentsTable } from "@/features/agents/components/AgentsTable";
import { CreateAgentDialog } from "@/features/agents/components/CreateAgentDialog";
import { useAgents, useCreateAgent, useUpdateAgent, useDeleteAgent } from "@/features/agents/hooks/useAgents";
import { Agent, AgentQueryFilters, CreateAgentPayload, UpdateAgentPayload } from "@/features/agents/types";
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

export default function AgentsPage() {
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
        title="Travel Agents"
        description="Manage independent travel representatives, B2B sales agents, company affiliate assignments, and performance credentials."
        actions={
          <Button onClick={handleCreateClick} size="sm" variant="gold" className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            <span>New Agent</span>
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete agent
              <span className="font-semibold text-foreground"> {agentToDelete?.name} </span> 
              and revoke their system access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Agent"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
