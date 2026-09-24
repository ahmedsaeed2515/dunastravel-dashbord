"use client";

import { useState } from "react";
import { useUsers, useDeleteUser } from "../../hooks/useUsers";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { getColumns } from "./columns";
import { User, UserRole } from "../../types";
import { UserDetailsDrawer } from "../Drawers/UserDetailsDrawer";
import { UserDialog } from "../Drawers/UserDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";

interface UsersTableProps {
  initialStatus?: string;
}

export function UsersTable({ initialStatus }: UsersTableProps) {
  const tUsers = useTranslations("users");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [roleTab, setRoleTab] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus || "ALL");

  const queryFilters = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...(search ? { search } : {}),
    ...(roleTab !== "ALL" ? { role: roleTab as UserRole } : {}),
    ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
  };

  const { data, isLoading, error } = useUsers(queryFilters);
  const { mutate: deleteUser } = useDeleteUser();

  // Drawer & Dialog states (must be declared before any conditional return)
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (
    error &&
    ((error as any)?.response?.status === 403 ||
      (error as any)?.statusCode === 403 ||
      (error as any)?.status === 403)
  ) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {tCommon("permissionDenied")}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {tCommon("permissionDeniedDescription")}
        </p>
      </div>
    );
  }

  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewDrawerOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    if (confirm(tCommon("confirmDelete"))) {
      deleteUser(user.id);
    }
  };

  const columns = getColumns(handleView, handleEdit, handleDelete, tUsers, tCommon);

  const renderToolbarActions = () => {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            aria-label={tCommon("search")}
            placeholder={`${tCommon("search")}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="h-8 ps-8 text-xs rounded-lg"
          />
        </div>

        {/* Status Quick Filter */}
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/80 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              statusFilter === "ALL"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tCommon("all")}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              statusFilter === "ACTIVE"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tUsers("active")}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("SUSPENDED")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              statusFilter === "SUSPENDED"
                ? "bg-red-500/15 text-red-600 dark:text-red-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tUsers("suspended")}
          </button>
        </div>

        <Button
          size="sm"
          className="h-8 gap-1.5 font-bold rounded-lg"
          onClick={() => {
            setSelectedUser(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{tUsers("addUser")}</span>
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Role Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          defaultValue="ALL"
          value={roleTab}
          onValueChange={(val: any) => {
            setRoleTab(val || "ALL");
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-6 h-9 p-1 bg-muted/60 rounded-xl" aria-label={tCommon("role")}>
            <TabsTrigger value="ALL" className="text-xs font-bold rounded-lg">{tCommon("all")}</TabsTrigger>
            <TabsTrigger value="ADMIN" className="text-xs font-bold rounded-lg">{tStatus("ADMIN")}</TabsTrigger>
            <TabsTrigger value="AGENT" className="text-xs font-bold rounded-lg">{tStatus("AGENT")}</TabsTrigger>
            <TabsTrigger value="COMPANY" className="text-xs font-bold rounded-lg">B2B</TabsTrigger>
            <TabsTrigger value="USER" className="text-xs font-bold rounded-lg">{tUsers("title")}</TabsTrigger>
            <TabsTrigger value="GUEST" className="text-xs font-bold rounded-lg">Guest</TabsTrigger>
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

      {/* Deep Inspection Drawer */}
      <UserDetailsDrawer
        user={selectedUser}
        open={isViewDrawerOpen}
        onOpenChange={setViewDrawerOpen}
        onEdit={(u) => {
          setSelectedUser(u);
          setViewDrawerOpen(false);
          setIsDialogOpen(true);
        }}
      />

      {/* Edit/Create User Dialog */}
      <UserDialog
        user={selectedUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
