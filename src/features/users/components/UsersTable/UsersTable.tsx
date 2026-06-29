"use client";

import { useState } from "react";
import { useUsers } from "../../hooks/useUsers";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { getColumns } from "./columns";
import { User } from "../../types";
import { UserDetailsDrawer } from "../Drawers/UserDetailsDrawer";

export function UsersTable() {
  // Filters state
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const { data, isLoading } = useUsers(filters);

  // Drawer states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDrawerOpen, setViewDrawerOpen] = useState(false);

  // Handlers
  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewDrawerOpen(true);
  };
  
  const handleEdit = (user: User) => {
    // Scaffolded edit trigger
    console.log("Edit:", user);
  };

  const handleDelete = (user: User) => {
    // Scaffolded delete trigger
    console.log("Delete:", user);
  };

  const columns = getColumns(handleView, handleEdit, handleDelete);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        searchKey="name"
      />
      
      {/* Modals & Drawers Layer */}
      <UserDetailsDrawer
        user={selectedUser}
        open={isViewDrawerOpen}
        onOpenChange={setViewDrawerOpen}
      />
    </div>
  );
}
