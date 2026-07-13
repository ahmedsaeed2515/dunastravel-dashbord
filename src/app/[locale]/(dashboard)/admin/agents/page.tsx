"use client";

import { useState } from "react";
import { AgentsTable } from "@/features/agents/components/AgentsTable";
import { CreateAgentDialog } from "@/features/agents/components/CreateAgentDialog";
import { useAgents, useCreateAgent, useUpdateAgent, useDeleteAgent } from "@/features/agents/hooks/useAgents";
import { Agent, AgentQueryFilters, CreateAgentPayload, UpdateAgentPayload } from "@/features/agents/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Agents</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage travel agents, independent reps, and company affiliates.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreateClick} className="gap-2 bg-primary">
            <PlusCircle className="h-4 w-4" />
            New Agent
          </Button>
        </div>
      </div>

      <AgentsTable 
        data={data?.data || []}
        total={data?.meta?.total || 0}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={setFilters}
        onEdit={handleEdit}
        onDelete={setAgentToDelete}
      />

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
              This action cannot be undone. This will permanently delete the agent
              <span className="font-semibold text-foreground"> {agentToDelete?.name} </span> 
              and revoke their access to the system.
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
