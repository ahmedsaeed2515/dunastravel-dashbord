"use client";

import { useState } from "react";
import { TourLandingPage } from "../../api/landingPagesApi";
import { useLandingPages, useDeleteLandingPage, usePublishLandingPage, useUnpublishLandingPage } from "../../hooks/useLandingPages";
import { LandingPageEditorDrawer } from "../Drawers/LandingPageEditorDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, Search, Plus, MoreHorizontal, Edit, Globe, CheckCircle2, AlertCircle, Trash2, Eye, ExternalLink, Package } from "lucide-react";
import { toast } from "sonner";

export function LandingPagesTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedPage, setSelectedPage] = useState<TourLandingPage | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data, isLoading } = useLandingPages({
    search: search || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const deleteMutation = useDeleteLandingPage();
  const publishMutation = usePublishLandingPage();
  const unpublishMutation = useUnpublishLandingPage();

  const handleEdit = (page: TourLandingPage) => {
    setSelectedPage(page);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (slug: string) => {
    if (confirm(`Are you sure you want to delete landing page interface '/${slug}'?`)) {
      try {
        await deleteMutation.mutateAsync(slug);
        toast.success("Interface deleted.");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete interface.");
      }
    }
  };

  const items = data?.data || [];

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search interfaces..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <select
            className="h-10 px-3 rounded-md border bg-background text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setSelectedPage({
                id: "",
                slug: "new-interface-" + Date.now().toString().slice(-4),
                type: "DESTINATION",
                titleJsonb: { en: "New Tour Interface" },
                status: "DRAFT",
                isActive: true,
                sortOrder: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as any);
              setIsDrawerOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Create New Interface
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-15">Cover</TableHead>
              <TableHead>Interface Title & Slug</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Assigned Tours</TableHead>
              <TableHead>Locales</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No tour landing page interfaces found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const comp = item.translationCompletion || {};
                const enTitle = item.titleJsonb?.en || item.slug;
                const arTitle = item.titleJsonb?.ar;

                return (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="w-12 h-10 rounded bg-muted overflow-hidden border">
                        {item.heroImageUrl ? (
                          <img src={item.heroImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Globe className="w-5 h-5 m-2.5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {enTitle}
                          {arTitle && <span className="text-xs text-muted-foreground font-normal">({arTitle})</span>}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground">
                          /{item.slug}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={item.status === "PUBLISHED" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                        {!item.isActive && (
                          <Badge variant="destructive" className="text-[10px]">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-medium">
                      <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-1 rounded text-xs">
                        <Package className="w-3.5 h-3.5 text-primary" />
                        {item.totalToursCount ?? item.tours?.length ?? 0} tours
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        {["en", "ar", "es", "pt", "it"].map((loc) => {
                          const isComp = comp[loc]?.isComplete;
                          return (
                            <span
                              key={loc}
                              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                isComp
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              }`}
                              title={`${loc.toUpperCase()}: ${isComp ? "Complete" : "Incomplete"}`}
                            >
                              {loc}
                            </span>
                          );
                        })}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Interface Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="w-4 h-4 mr-2" /> Full Edit & Manage Tours
                          </DropdownMenuItem>
                          {item.status === "PUBLISHED" ? (
                            <DropdownMenuItem onClick={() => unpublishMutation.mutate(item.slug)}>
                              Unpublish
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => publishMutation.mutate(item.slug)}>
                              Publish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(item.slug)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Interface
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Editor Drawer */}
      <LandingPageEditorDrawer
        landingPage={selectedPage}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />

    </div>
  );
}
