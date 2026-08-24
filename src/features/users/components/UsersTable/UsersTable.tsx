 
"use client";

import { useState } from "react";
import { useUsers } from "../../hooks/useUsers";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { getColumns } from "./columns";
import { User, UserRole } from "../../types";
import { UserDetailsDrawer } from "../Drawers/UserDetailsDrawer";
import { UserDialog } from "../Drawers/UserDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export function UsersTable() {
  const tUsers = useTranslations("users");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");

  // Filters & Pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const queryFilters = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...(search ? { search } : {}),
    ...(activeTab !== "ALL" ? { role: activeTab as UserRole } : {})
  };

  const { data, isLoading } = useUsers(queryFilters);

  // Drawer states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handlers
  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewDrawerOpen(true);
  };
  
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    console.log("Delete:", user);
  };

  const columns = getColumns(handleView, handleEdit, handleDelete, tUsers, tCommon);

  const renderToolbarActions = () => {
    return (
      <div className="flex items-center gap-2">
        <Input 
          aria-label={tCommon("search")}
          placeholder={`${tCommon("search")}...`} 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="h-8 w-[250px]"
        />
        <Button size="sm" className="h-8 gap-2" onClick={() => {
          setSelectedUser(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4" />
          {tUsers("addUser")}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="ALL" value={activeTab} onValueChange={(val: any) => setActiveTab(val || "ALL")} className="w-[500px]">
          <TabsList className="grid w-full grid-cols-5" aria-label={tCommon("role")}>
            <TabsTrigger value="ALL">{tCommon("all")}</TabsTrigger>
            <TabsTrigger value="ADMIN">{tStatus("ADMIN", { defaultValue: "Admin" })}</TabsTrigger>
            <TabsTrigger value="COMPANY">B2B</TabsTrigger>
            <TabsTrigger value="USER">{tUsers("title")}</TabsTrigger>
            <TabsTrigger value="GUEST">Guest</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        renderToolbarActions={renderToolbarActions}
        pageCount={data?.meta?.totalPages ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        manualPagination={true}
      />
      
      {/* Modals & Drawers Layer */}
      <UserDetailsDrawer
        user={selectedUser}
        open={isViewDrawerOpen}
        onOpenChange={setViewDrawerOpen}
      />
      <UserDialog 
        user={selectedUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
