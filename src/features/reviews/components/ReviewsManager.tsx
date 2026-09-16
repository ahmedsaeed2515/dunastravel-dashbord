"use client";
import { PageHelpTooltip } from "@/components/shared/ui/PageHelpTooltip";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { reviewsApi } from "../api/reviewsApi";
import { getFrontendTourUrl } from "@/lib/frontend-urls";
import { useTranslations } from "next-intl";
import {
  Star,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Trash2,
  CornerDownRight,
  UserCheck,
  User,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useReviews,
  useUpdateReviewStatus,
  useBatchUpdateReviewStatus,
  usePublishReview,
  useRejectReview,
  useReplyReview,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from "../hooks/useReviews";
import { useTours } from "@/features/tours/hooks/useTours";
import { Review, ReviewStatus, CreateReviewDraft, UpdateReviewDraft } from "../types";
import { format } from "date-fns";

const AVATAR_GRADIENTS = [
  "from-amber-500 to-orange-600",
  "from-indigo-600 to-blue-500",
  "from-purple-600 to-pink-500",
  "from-emerald-600 to-teal-500",
  "from-rose-500 to-pink-600",
  "from-cyan-600 to-blue-500",
];

function getAvatarInitials(name: string): string {
  if (!name) return "GT";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAvatarGradient(name: string): string {
  if (!name) return AVATAR_GRADIENTS[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return AVATAR_GRADIENTS[sum % AVATAR_GRADIENTS.length];
}

function StarRating({
  rating,
  onRate,
  readonly = true,
  size = "md",
}: {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-1 dir-ltr inline-flex">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= rating;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onRate?.(star)}
            className={`${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } transition-transform focus:outline-none`}
            title={`${star} Stars`}
          >
            <Star
              className={`${starSizes[size]} ${
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30 fill-muted/20"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function ReviewsManager() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const tReviews = useTranslations("reviews");
  const tCommon = useTranslations("common");

  // Filters State
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [selectedRating, setSelectedRating] = useState<number | "ALL">("ALL");
  const [selectedTourId, setSelectedTourId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");

  const [createDraft, setCreateDraft] = useState<CreateReviewDraft>({
    tourId: "",
    reviewerName: "",
    rating: 5,
    comment: "",
    adminReply: "",
    status: "APPROVED",
    isPublished: true,
  });

  const [editDraft, setEditDraft] = useState<UpdateReviewDraft>({
    id: "",
    tourId: "",
    reviewerName: "",
    rating: 5,
    comment: "",
    adminReply: "",
    status: "APPROVED",
    isPublished: true,
  });

  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);

  // Queries & Mutations
  const { data: reviewsResponse, isLoading, refetch, isRefetching } = useReviews({ limit: 100 });
  const { data: toursData } = useTours({ limit: 100 });
  const toursList = toursData?.data ?? [];

  const publishMutation = usePublishReview();
  const rejectMutation = useRejectReview();
  const batchUpdateMutation = useBatchUpdateReviewStatus();
  const replyMutation = useReplyReview();
  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();
  const deleteMutation = useDeleteReview();

  const searchParams = useSearchParams();
  const urlReviewId = searchParams?.get("reviewId") || searchParams?.get("highlight") || null;
  const [highlightedReviewId, setHighlightedReviewId] = useState<string | null>(urlReviewId);
  const [injectedReview, setInjectedReview] = useState<Review | null>(null);
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Listen to in-app custom event for immediate glow when clicked inside dashboard
  useEffect(() => {
    const handleHighlightEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ highlightId?: string; referenceCode?: string }>;
      const id = customEvent.detail?.highlightId || customEvent.detail?.referenceCode;
      if (id) {
        setHighlightedReviewId(id);
      }
    };

    window.addEventListener("dunas:notification-highlight", handleHighlightEvent);
    return () => {
      window.removeEventListener("dunas:notification-highlight", handleHighlightEvent);
    };
  }, []);

  // React to searchParams change
  useEffect(() => {
    if (urlReviewId) {
      setHighlightedReviewId(urlReviewId);
    }
  }, [urlReviewId]);

  const allReviews: Review[] = useMemo(() => {
    const raw = reviewsResponse?.data;
    let list: Review[] = [];
    if (Array.isArray(raw)) list = [...raw];
    else if (Array.isArray((reviewsResponse as any)?.items)) list = [...(reviewsResponse as any).items];

    if (injectedReview && !list.some((r) => r.id === injectedReview.id)) {
      list.unshift(injectedReview);
    }
    return list;
  }, [reviewsResponse, injectedReview]);

  // Handle auto-scroll and pagination recovery when highlightedReviewId is set
  useEffect(() => {
    if (!highlightedReviewId) return;

    let active = true;

    // Check if review is in the currently loaded list
    const found = allReviews.some((r) => r.id === highlightedReviewId);

    if (!found) {
      // Pagination fallback: fetch the review directly from backend
      reviewsApi
        .getReviewById(highlightedReviewId)
        .then((rev) => {
          if (active && rev && rev.id) {
            setInjectedReview(rev);
            setActiveTab("ALL");
          }
        })
        .catch((err) => {
          console.warn("Could not fetch target review for highlight:", err);
        });
    }

    // Scroll into view
    const scrollTimer = setTimeout(() => {
      const tableRow = document.getElementById(`review-row-${highlightedReviewId}`);
      const gridCard = document.getElementById(`review-card-${highlightedReviewId}`);
      const targetEl = tableRow || gridCard;
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 450);

    // Auto-remove highlight after 7 seconds
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      if (active) {
        setHighlightedReviewId(null);
      }
    }, 7000);

    return () => {
      active = false;
      clearTimeout(scrollTimer);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, [highlightedReviewId, allReviews]);

  // Executive KPI stats
  const stats = useMemo(() => {
    const total = allReviews.length;
    const pending = allReviews.filter((r) => r.status === "PENDING").length;
    const approved = allReviews.filter((r) => r.status === "APPROVED" && r.isPublished).length;
    const rejected = allReviews.filter((r) => r.status === "REJECTED").length;
    const avgRating = total > 0
      ? (allReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / total).toFixed(1)
      : "5.0";

    return { total, pending, approved, rejected, avgRating };
  }, [allReviews]);

  // Filtered dataset
  const filteredReviews = useMemo(() => {
    return allReviews.filter((review) => {
      // 1. Tab Status Filter
      if (activeTab === "PENDING") {
        if (review.status !== "PENDING") return false;
      } else if (activeTab === "APPROVED") {
        if (review.status !== "APPROVED" || !review.isPublished) return false;
      } else if (activeTab === "REJECTED") {
        if (review.status !== "REJECTED") return false;
      }

      // 2. Star Rating Filter
      if (selectedRating !== "ALL" && review.rating !== selectedRating) {
        return false;
      }

      // 3. Tour Filter
      if (selectedTourId !== "ALL" && review.tourId !== selectedTourId) {
        return false;
      }

      // 4. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const reviewer = (review.reviewerName || "").toLowerCase();
        const comment = (review.comment || "").toLowerCase();
        const tourTitle = (
          review.tour?.titleJsonb?.[locale] ||
          review.tour?.titleJsonb?.en ||
          review.tour?.title ||
          ""
        ).toLowerCase();
        const adminReply = (review.adminReply || "").toLowerCase();

        if (
          !reviewer.includes(q) &&
          !comment.includes(q) &&
          !tourTitle.includes(q) &&
          !adminReply.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [allReviews, activeTab, selectedRating, selectedTourId, searchQuery, locale]);

  // Batch Selection Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (filteredReviews.length > 0 && selectedReviewIds.length === filteredReviews.length) {
      setSelectedReviewIds([]);
    } else {
      setSelectedReviewIds(filteredReviews.map((r) => r.id));
    }
  };

  const handleBatchApprove = async () => {
    if (selectedReviewIds.length === 0) return;
    await batchUpdateMutation.mutateAsync({
      reviewIds: selectedReviewIds,
      status: "APPROVED",
      isPublished: true,
    });
    setSelectedReviewIds([]);
  };

  const handleBatchReject = async () => {
    if (selectedReviewIds.length === 0) return;
    await batchUpdateMutation.mutateAsync({
      reviewIds: selectedReviewIds,
      status: "REJECTED",
      isPublished: false,
    });
    setSelectedReviewIds([]);
  };

  // Handlers
  const handleOpenReply = (review: Review) => {
    setActiveReview(review);
    setReplyText(review.adminReply || "");
    setIsReplyOpen(true);
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview) return;
    await replyMutation.mutateAsync({ id: activeReview.id, reply: replyText });
    setIsReplyOpen(false);
    setActiveReview(null);
  };

  const handleOpenEdit = (review: Review) => {
    setActiveReview(review);
    setEditDraft({
      id: review.id,
      tourId: review.tourId,
      reviewerName: review.reviewerName,
      rating: review.rating,
      comment: review.comment || "",
      adminReply: review.adminReply || "",
      status: review.status,
      isPublished: review.isPublished,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDraft.id) return;
    await updateMutation.mutateAsync({
      id: editDraft.id,
      draft: editDraft,
    });
    setIsEditOpen(false);
  };

  const handleOpenCreate = () => {
    const firstTourId = toursList.length > 0 ? toursList[0].id : "";
    setCreateDraft({
      tourId: firstTourId,
      reviewerName: "",
      rating: 5,
      comment: "",
      adminReply: "",
      status: "APPROVED",
      isPublished: true,
    });
    setIsCreateOpen(true);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createDraft.tourId || !createDraft.reviewerName) return;
    await createMutation.mutateAsync(createDraft);
    setIsCreateOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    await deleteMutation.mutateAsync(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to resolve localized tour title
  const getTourTitle = (review: Review) => {
    const tJson = review.tour?.titleJsonb;
    if (tJson && typeof tJson === "object") {
      return tJson[locale] || tJson.en || tJson.ar || (review.tour as any)?.title || review.tour?.slug || "Dunas Tour";
    }
    return (review.tour as any)?.title || review.tour?.slug || "Dunas Luxury Tour";
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 1. Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
              <Star className="h-6 w-6 fill-amber-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading flex items-center gap-2">
                  <span>{tReviews("title")}</span>
                  <PageHelpTooltip description="تقييمات العملاء — مراجعة وإدارة تقييمات الجولات المرسلة من العملاء." />
                </h1>
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-bold px-2 py-0.5"
                >
                  Verified Reviews
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {tReviews("description")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="rounded-xl gap-2 text-xs font-semibold h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            <span>{isAr ? "تحديث البيانات" : "Refresh"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl gap-2 text-xs h-9 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{tReviews("addReview")}</span>
          </Button>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <Card className="p-4 sm:p-5 rounded-3xl bg-card border-border/80 shadow-xs hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {tReviews("statsTotal")}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground font-heading">
              {stats.total}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              {isAr ? "مراجعة مسجلة" : "total entries"}
            </span>
          </div>
        </Card>

        {/* Pending Moderation */}
        <Card className="p-4 sm:p-5 rounded-3xl bg-card border-border/80 shadow-xs hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {tReviews("statsPending")}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-heading">
              {stats.pending}
            </span>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-bold">
              {isAr ? "تتطلب قرارك" : "needs action"}
            </span>
          </div>
        </Card>

        {/* Published Live */}
        <Card className="p-4 sm:p-5 rounded-3xl bg-card border-border/80 shadow-xs hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {tReviews("statsApproved")}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
              {stats.approved}
            </span>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-bold">
              {isAr ? "تظهر للزوار" : "live on site"}
            </span>
          </div>
        </Card>

        {/* Average Rating */}
        <Card className="p-4 sm:p-5 rounded-3xl bg-card border-border/80 shadow-xs hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {tReviews("statsAverage")}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground font-heading">
              {stats.avgRating}
            </span>
            <StarRating rating={Math.round(Number(stats.avgRating))} size="sm" />
          </div>
        </Card>
      </div>

      {/* 3. Advanced Filtering & Search Bar */}
      <Card className="p-4 rounded-3xl bg-card border-border/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/60">
            {[
              { id: "ALL", label: tReviews("all"), count: stats.total },
              { id: "PENDING", label: tReviews("pending"), count: stats.pending, badgeColor: "bg-amber-500/20 text-amber-600 dark:text-amber-400" },
              { id: "APPROVED", label: tReviews("approved"), count: stats.approved, badgeColor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" },
              { id: "REJECTED", label: tReviews("rejected"), count: stats.rejected, badgeColor: "bg-rose-500/20 text-rose-600 dark:text-rose-400" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    tab.badgeColor || "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/60 self-end lg:self-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-card text-amber-500 shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-card text-amber-500 shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Filters: Search + Star Filter + Tour Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-border/60">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tReviews("searchPlaceholder")}
              className="ps-9 rounded-xl text-xs bg-background border-border h-9.5"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Star Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedRating}
              onChange={(e) =>
                setSelectedRating(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
              }
              className="w-full h-9.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">⭐ {tReviews("allRatings")}</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>
          </div>

          {/* Tour Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedTourId}
              onChange={(e) => setSelectedTourId(e.target.value)}
              className="w-full h-9.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground truncate focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">🗺️ {tReviews("filterByTour")}</option>
              {toursList.map((tour) => {
                const title =
                  (tour.titleJsonb as any)?.[locale] ||
                  (tour.titleJsonb as any)?.en ||
                  (tour as any).title ||
                  tour.slug;
                return (
                  <option key={tour.id} value={tour.id}>
                    {title}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </Card>

      {/* Bulk Moderation Action Bar */}
      {selectedReviewIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-amber-500/40 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-0.5">
              {selectedReviewIds.length}
            </Badge>
            <span className="text-xs font-bold">
              {isAr ? "مراجعات محددة للإجراء الجماعي:" : "Reviews selected for bulk action:"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleBatchApprove}
              disabled={batchUpdateMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs gap-1.5 cursor-pointer shadow-xs"
            >
              {batchUpdateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{isAr ? "اعتماد ونشر المحدد ✅" : "Approve Selected"}</span>
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={handleBatchReject}
              disabled={batchUpdateMutation.isPending}
              className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
            >
              {batchUpdateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>{isAr ? "حجب ورفض المحدد 🚫" : "Reject Selected"}</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedReviewIds([])}
              className="text-white/70 hover:text-white rounded-xl text-xs cursor-pointer"
            >
              {isAr ? "إلغاء التحديد" : "Cancel"}
            </Button>
          </div>
        </div>
      )}

      {/* 4. Main Content: Table or Grid View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-medium">{tCommon("loading")}</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl bg-card border-border/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground font-heading">
            {tReviews("noReviews")}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {tReviews("noReviewsDesc")}
          </p>
          {(activeTab !== "ALL" || selectedRating !== "ALL" || selectedTourId !== "ALL" || searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab("ALL");
                setSelectedRating("ALL");
                setSelectedTourId("ALL");
                setSearchQuery("");
              }}
              className="rounded-xl text-xs font-semibold mt-2"
            >
              {tCommon("reset")}
            </Button>
          )}
        </Card>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <Card className="rounded-3xl border-border/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start dir-ltr">
              <thead className="bg-muted/60 border-b border-border/80 text-muted-foreground font-bold">
                <tr>
                  <th className="p-3.5 text-center w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all reviews"
                      checked={
                        filteredReviews.length > 0 &&
                        selectedReviewIds.length === filteredReviews.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-border text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5 text-start">{tReviews("tour")}</th>
                  <th className="p-3.5 text-start">{tReviews("reviewer")}</th>
                  <th className="p-3.5 text-start">{tReviews("rating")}</th>
                  <th className="p-3.5 text-start min-w-[280px]">{tReviews("comment")}</th>
                  <th className="p-3.5 text-center">{tReviews("status")}</th>
                  <th className="p-3.5 text-center">{tReviews("date")}</th>
                  <th className="p-3.5 text-end">{tReviews("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredReviews.map((review) => {
                  const tourTitle = getTourTitle(review);
                  const isExpanded = expandedComments[review.id];
                  const commentText = review.comment || "—";
                  const isLongComment = commentText.length > 90;
                  const isApproved = review.status === "APPROVED" || review.isPublished;
                  const isRejected = review.status === "REJECTED";
                  const isHighlighted = highlightedReviewId === review.id;

                  return (
                    <tr
                      key={review.id}
                      id={`review-row-${review.id}`}
                      className={`transition-all duration-500 ${
                        isHighlighted
                          ? "bg-amber-500/20 dark:bg-amber-500/25 border-s-4 border-amber-500 ring-2 ring-amber-500/50 shadow-lg"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Select review by ${review.reviewerName}`}
                          checked={selectedReviewIds.includes(review.id)}
                          onChange={() => handleToggleSelect(review.id)}
                          className="rounded border-border text-amber-500 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>

                      {/* Tour */}
                      <td className="p-3.5 max-w-[220px]">
                        <div className="flex items-center gap-1.5">
                          <div className="font-bold text-foreground line-clamp-2" title={tourTitle}>
                            {tourTitle}
                          </div>
                          {isHighlighted && (
                            <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0 shrink-0 animate-pulse">
                              {isAr ? "محددة ✨" : "Selected ✨"}
                            </Badge>
                          )}
                        </div>
                        {review.tour?.slug && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[110px]">
                              /{review.tour.slug}
                            </span>
                            <a
                              href={`${getFrontendTourUrl(review.tour.slug)}?reviewId=${review.id}#reviews`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:underline shrink-0"
                              title={isAr ? "فتح الرحلة في الموقع العام" : "Open tour on public website"}
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span>{isAr ? "عرض الرحلة" : "View Trip"}</span>
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Reviewer */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                              review.reviewerName
                            )} text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0`}
                          >
                            {getAvatarInitials(review.reviewerName)}
                          </div>
                          <div>
                            <div className="font-bold text-foreground flex items-center gap-1.5">
                              <span>{review.reviewerName || "Anonymous"}</span>
                              {review.userId && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                >
                                  Verified
                                </Badge>
                              )}
                            </div>
                            {review.user?.email && (
                              <div className="text-[10px] text-muted-foreground font-mono">
                                {review.user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="font-black text-amber-500 text-xs">
                            {review.rating}.0
                          </span>
                        </div>
                      </td>

                      {/* Comment & Admin Reply */}
                      <td className="p-3.5">
                        <div className="space-y-1.5">
                          <p className="text-foreground text-xs leading-relaxed">
                            {isLongComment && !isExpanded
                              ? `${commentText.slice(0, 90)}...`
                              : commentText}
                          </p>
                          {isLongComment && (
                            <button
                              onClick={() => toggleExpand(review.id)}
                              className="text-[10px] font-bold text-amber-500 hover:underline cursor-pointer flex items-center gap-0.5"
                            >
                              {isExpanded ? (
                                <>عرض أقل <ChevronUp className="w-3 h-3" /></>
                              ) : (
                                <>قراءة المزيد <ChevronDown className="w-3 h-3" /></>
                              )}
                            </button>
                          )}

                          {/* Admin Reply preview bubble */}
                          {review.adminReply && (
                            <div className="mt-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-0.5">
                                <CornerDownRight className="w-3 h-3" />
                                <span>رد إدارة دوناس ترافيل:</span>
                              </div>
                              <p className="text-foreground/90 text-[11px] leading-relaxed">
                                {review.adminReply}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        {isApproved ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            {tReviews("published")}
                          </Badge>
                        ) : isRejected ? (
                          <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                            {tReviews("rejectedStatus")}
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold animate-pulse">
                            {tReviews("pendingApproval")}
                          </Badge>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-3.5 text-center text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                        {review.createdAt ? format(new Date(review.createdAt), "MMM d, yyyy") : "—"}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Moderation Actions */}
                          {review.status === "PENDING" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => publishMutation.mutate(review.id)}
                                disabled={publishMutation.isPending}
                                className="h-8 px-2.5 rounded-xl border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold gap-1 cursor-pointer"
                                title="اعتماد المراجعة ونشرها"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">{isAr ? "اعتماد" : "Approve"}</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectMutation.mutate(review.id)}
                                disabled={rejectMutation.isPending}
                                className="h-8 px-2.5 rounded-xl border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-bold gap-1 cursor-pointer"
                                title="حجب ورفض المراجعة"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">{isAr ? "رفض" : "Reject"}</span>
                              </Button>
                            </>
                          ) : isApproved ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectMutation.mutate(review.id)}
                              disabled={rejectMutation.isPending}
                              className="h-8 px-2.5 rounded-xl border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-bold gap-1 cursor-pointer"
                              title={tReviews("quickReject")}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">{isAr ? "حجب" : "Unpublish"}</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => publishMutation.mutate(review.id)}
                              disabled={publishMutation.isPending}
                              className="h-8 px-2.5 rounded-xl border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-xs font-bold gap-1 cursor-pointer"
                              title={tReviews("quickApprove")}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">{isAr ? "اعتماد" : "Approve"}</span>
                            </Button>
                          )}

                          {/* Reply Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenReply(review)}
                            className="h-8 w-8 p-0 rounded-xl text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                            title={tReviews("adminReply")}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </Button>

                          {/* Edit Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEdit(review)}
                            className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                            title={tReviews("editReview")}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>

                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteConfirmId(review.id)}
                            className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            title={tReviews("deleteReview")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((review) => {
            const tourTitle = getTourTitle(review);
            const isApproved = review.status === "APPROVED" || review.isPublished;
            const isRejected = review.status === "REJECTED";
            const isHighlighted = highlightedReviewId === review.id;

            return (
              <Card
                key={review.id}
                id={`review-card-${review.id}`}
                className={`p-5 rounded-3xl bg-card border-border/80 shadow-xs flex flex-col justify-between transition-all space-y-4 ${
                  isHighlighted
                    ? "border-amber-500 ring-2 ring-amber-500/70 shadow-xl shadow-amber-500/20 bg-amber-500/5"
                    : "hover:border-amber-500/40"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Header: Avatar + Name + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        aria-label={`Select review by ${review.reviewerName}`}
                        checked={selectedReviewIds.includes(review.id)}
                        onChange={() => handleToggleSelect(review.id)}
                        className="rounded border-border text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <div
                        className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(
                          review.reviewerName
                        )} text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0`}
                      >
                        {getAvatarInitials(review.reviewerName)}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm line-clamp-1">
                          {review.reviewerName || "Anonymous"}
                        </h4>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {review.createdAt ? format(new Date(review.createdAt), "MMM d, yyyy") : "—"}
                        </div>
                      </div>
                    </div>

                    {isHighlighted ? (
                      <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 animate-pulse">
                        {isAr ? "محددة ✨" : "Selected ✨"}
                      </Badge>
                    ) : isApproved ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        {tReviews("published")}
                      </Badge>
                    ) : isRejected ? (
                      <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                        {tReviews("rejectedStatus")}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold animate-pulse">
                        {tReviews("pendingApproval")}
                      </Badge>
                    )}
                  </div>

                  {/* Rating + Tour Tag + View Trip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="font-black text-amber-500 text-xs">
                        {review.rating}.0
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] font-semibold max-w-[130px] truncate">
                        {tourTitle}
                      </Badge>
                      {review.tour?.slug && (
                        <a
                          href={`${getFrontendTourUrl(review.tour.slug)}?reviewId=${review.id}#reviews`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:underline"
                          title={isAr ? "فتح الرحلة في الموقع العام" : "Open tour on public website"}
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>{isAr ? "عرض" : "Trip"}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs text-foreground/90 leading-relaxed italic bg-muted/30 p-3 rounded-2xl border border-border/50">
                    “{review.comment || "No written comment"}”
                  </p>

                  {/* Admin Reply */}
                  {review.adminReply && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1">
                        <CornerDownRight className="w-3 h-3" />
                        <span>Dunas Travel Reply:</span>
                      </div>
                      <p className="text-foreground/90 text-[11px] leading-relaxed">
                        {review.adminReply}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Action Bar */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {review.status === "PENDING" ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => publishMutation.mutate(review.id)}
                          disabled={publishMutation.isPending}
                          className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl font-bold gap-1 px-2.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isAr ? "اعتماد" : "Approve"}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectMutation.mutate(review.id)}
                          disabled={rejectMutation.isPending}
                          className="h-8 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs rounded-xl font-bold gap-1 px-2.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isAr ? "رفض" : "Reject"}</span>
                        </Button>
                      </>
                    ) : isApproved ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectMutation.mutate(review.id)}
                        disabled={rejectMutation.isPending}
                        className="h-8 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs rounded-xl font-bold gap-1 px-3 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{isAr ? "إخفاء" : "Unpublish"}</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => publishMutation.mutate(review.id)}
                        disabled={publishMutation.isPending}
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl font-bold gap-1 px-3 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAr ? "اعتماد" : "Approve"}</span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenReply(review)}
                      className="h-8 rounded-xl text-xs gap-1 font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                      <span>{review.adminReply ? (isAr ? "تعديل الرد" : "Edit Reply") : (isAr ? "رد" : "Reply")}</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(review)}
                      className="h-8 w-8 p-0 rounded-xl"
                      title={tReviews("editReview")}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirmId(review.id)}
                      className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title={tReviews("deleteReview")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. Create Manual Review Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl bg-card border-border text-foreground p-6 rounded-3xl shadow-2xl">
          <DialogHeader className="border-b border-border/80 pb-4">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2 font-heading">
              <Plus className="w-5 h-5 text-amber-500" />
              <span>{tReviews("addReview")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isAr
                ? "إضافة مراجعة أو شهادة عميل واردة من WhatsApp أو البريد أو الاستبيانات الورقية."
                : "Add a manual traveler testimonial or feedback received offline."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCreate} className="space-y-4 pt-2">
            {/* Tour Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {tReviews("tour")} *
              </Label>
              <select
                required
                value={createDraft.tourId}
                onChange={(e) => setCreateDraft({ ...createDraft, tourId: e.target.value })}
                className="w-full h-9.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="" disabled>
                  {isAr ? "اختر البرنامج السياحي" : "Select Tour Package"}
                </option>
                {toursList.map((tour) => {
                  const title =
                    (tour.titleJsonb as any)?.[locale] ||
                    (tour.titleJsonb as any)?.en ||
                    (tour as any).title ||
                    tour.slug;
                  return (
                    <option key={tour.id} value={tour.id}>
                      {title}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Reviewer Name & Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {tReviews("reviewer")} *
                </Label>
                <Input
                  required
                  value={createDraft.reviewerName}
                  onChange={(e) =>
                    setCreateDraft({ ...createDraft, reviewerName: e.target.value })
                  }
                  placeholder="e.g. John Doe, Carlos Silva"
                  className="rounded-xl text-xs bg-background border-border h-9.5"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {tReviews("rating")} (1-5 ⭐)
                </Label>
                <div className="pt-1.5">
                  <StarRating
                    rating={createDraft.rating}
                    onRate={(rating) => setCreateDraft({ ...createDraft, rating })}
                    readonly={false}
                    size="md"
                  />
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {tReviews("comment")}
              </Label>
              <Textarea
                rows={3}
                value={createDraft.comment || ""}
                onChange={(e) => setCreateDraft({ ...createDraft, comment: e.target.value })}
                placeholder={
                  isAr
                    ? "اكتب مراجعة العميل وتعليقه على الرحلة والخدمات..."
                    : "Enter traveler feedback and review comment..."
                }
                className="rounded-xl text-xs bg-background border-border"
              />
            </div>

            {/* Admin Reply (Optional) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {tReviews("adminReply")} ({isAr ? "اختياري" : "Optional"})
              </Label>
              <Textarea
                rows={2}
                value={createDraft.adminReply || ""}
                onChange={(e) => setCreateDraft({ ...createDraft, adminReply: e.target.value })}
                placeholder={tReviews("replyPlaceholder")}
                className="rounded-xl text-xs bg-background border-border"
              />
            </div>

            {/* Publish Immediately Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold text-foreground">
                  {isAr ? "نشر التقييم مباشرة في الموقع" : "Publish Live Immediately"}
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {isAr
                    ? "عند التفعيل سيظهر التقييم فوراً في صفحة الرحلة"
                    : "Make this review visible on the public tour page"}
                </p>
              </div>
              <Switch
                checked={createDraft.isPublished}
                onCheckedChange={(checked) =>
                  setCreateDraft({
                    ...createDraft,
                    isPublished: checked,
                    status: checked ? "APPROVED" : "PENDING",
                  })
                }
              />
            </div>

            <DialogFooter className="border-t border-border/80 pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs gap-1.5"
              >
                {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{tReviews("addReview")}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Edit Review Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl bg-card border-border text-foreground p-6 rounded-3xl shadow-2xl">
          <DialogHeader className="border-b border-border/80 pb-4">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2 font-heading">
              <Edit3 className="w-5 h-5 text-amber-500" />
              <span>{tReviews("editReview")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isAr
                ? "تعديل بيانات التقييم، الاسم، عدد النجوم، وحالة النشر."
                : "Update review details, score, text, and moderation status."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            {/* Tour Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {tReviews("tour")}
              </Label>
              <select
                value={editDraft.tourId}
                onChange={(e) => setEditDraft({ ...editDraft, tourId: e.target.value })}
                className="w-full h-9.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {toursList.map((tour) => {
                  const title =
                    (tour.titleJsonb as any)?.[locale] ||
                    (tour.titleJsonb as any)?.en ||
                    (tour as any).title ||
                    tour.slug;
                  return (
                    <option key={tour.id} value={tour.id}>
                      {title}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Reviewer Name & Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {tReviews("reviewer")}
                </Label>
                <Input
                  required
                  value={editDraft.reviewerName || ""}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, reviewerName: e.target.value })
                  }
                  className="rounded-xl text-xs bg-background border-border h-9.5"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {tReviews("rating")} (1-5 ⭐)
                </Label>
                <div className="pt-1.5">
                  <StarRating
                    rating={editDraft.rating || 5}
                    onRate={(rating) => setEditDraft({ ...editDraft, rating })}
                    readonly={false}
                    size="md"
                  />
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {tReviews("comment")}
              </Label>
              <Textarea
                rows={3}
                value={editDraft.comment || ""}
                onChange={(e) => setEditDraft({ ...editDraft, comment: e.target.value })}
                className="rounded-xl text-xs bg-background border-border"
              />
            </div>

            {/* Admin Reply */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {tReviews("adminReply")}
              </Label>
              <Textarea
                rows={2}
                value={editDraft.adminReply || ""}
                onChange={(e) => setEditDraft({ ...editDraft, adminReply: e.target.value })}
                placeholder={tReviews("replyPlaceholder")}
                className="rounded-xl text-xs bg-background border-border"
              />
            </div>

            {/* Status & Publication */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {tReviews("status")}
                </Label>
                <select
                  value={editDraft.status || "APPROVED"}
                  onChange={(e) =>
                    setEditDraft({
                      ...editDraft,
                      status: e.target.value as ReviewStatus,
                      isPublished: e.target.value === "APPROVED",
                    })
                  }
                  className="w-full h-9.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="APPROVED">✅ APPROVED (Approved & Published)</option>
                  <option value="PENDING">⏳ PENDING (Awaiting Moderation)</option>
                  <option value="REJECTED">🚫 REJECTED (Hidden / Rejected)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-foreground">
                    {tReviews("published")}
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    {isAr ? "حالة الظهور بالموقع" : "Live Visibility"}
                  </p>
                </div>
                <Switch
                  checked={editDraft.isPublished ?? false}
                  onCheckedChange={(checked) =>
                    setEditDraft({
                      ...editDraft,
                      isPublished: checked,
                      status: checked ? "APPROVED" : "REJECTED",
                    })
                  }
                />
              </div>
            </div>

            <DialogFooter className="border-t border-border/80 pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs gap-1.5"
              >
                {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{tCommon("saveChanges")}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 7. Admin Reply Modal with Quick Templates */}
      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent className="max-w-lg bg-card border-border text-foreground p-6 rounded-3xl shadow-2xl">
          <DialogHeader className="border-b border-border/80 pb-3">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2 font-heading">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <span>{tReviews("adminReply")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isAr
                ? `الرد الرسمي من ديوناس ترافيل على مراجعة ${activeReview?.reviewerName || ""}`
                : `Official response from Dunas Travel to ${activeReview?.reviewerName || ""}'s review.`}
            </DialogDescription>
          </DialogHeader>

          {activeReview && (
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-1">
              <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                <span className="font-bold">{activeReview.reviewerName}</span>
                <StarRating rating={activeReview.rating} size="sm" />
              </div>
              <p className="text-foreground/90 italic line-clamp-2">
                “{activeReview.comment || "—"}”
              </p>
            </div>
          )}

          <form onSubmit={handleSaveReply} className="space-y-4 pt-1">
            {/* Quick Templates */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {isAr ? "ردود سريعة جاهزة" : "Quick Reply Templates"}
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  isAr
                    ? "شكراً جزيلاً لك على مشاركتنا تجربتك الرائعة! يسعدنا دائماً تقديم أعلى معايير الضيافة والفخامة."
                    : "Thank you so much for sharing your wonderful experience with us! We are thrilled you enjoyed every moment of your luxury journey.",
                  isAr
                    ? "نقدّر ثقتكم الغالية في ديوناس ترافيل ونتطلع للترحيب بكم في رحلاتكم القادمة."
                    : "We truly appreciate your trust in Dunas Travel and look forward to welcoming you back on future journeys.",
                  isAr
                    ? "شكراً لملاحظاتكم القيمة، رضاكم هو أولويتنا القصوى وسنعمل دائماً على تحسين خدماتنا."
                    : "Thank you for your valuable feedback. Your satisfaction is our top priority and we continually strive to exceed expectations.",
                ].map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(tmpl)}
                    className="text-[10px] bg-muted hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 border border-border px-2.5 py-1 rounded-lg transition-colors text-start cursor-pointer line-clamp-1 max-w-full"
                  >
                    💡 {tmpl.slice(0, 45)}...
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {tReviews("adminReply")} *
              </Label>
              <Textarea
                required
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={tReviews("replyPlaceholder")}
                className="rounded-xl text-xs bg-background border-border"
              />
            </div>

            <DialogFooter className="border-t border-border/80 pt-3 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReplyOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={replyMutation.isPending || !replyText.trim()}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs gap-1.5"
              >
                {replyMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isAr ? "نشر الرد" : "Post Reply"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 8. Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="max-w-md bg-card border-border text-foreground p-6 rounded-3xl shadow-2xl">
            <DialogHeader className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <DialogTitle className="text-center text-lg font-bold text-foreground font-heading">
                {tReviews("confirmDelete")}
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground">
                {isAr
                  ? "هل أنت متأكد من رغبتك في حذف هذا التقييم؟ سيتم إخفاؤه نهائياً من الموقع ولوحة التحكم."
                  : "Are you sure you want to delete this review? It will be permanently removed from public display."}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl text-xs font-semibold"
              >
                {tCommon("cancel")}
              </Button>

              <Button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                variant="destructive"
                className="font-bold rounded-xl text-xs gap-1.5"
              >
                {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{tReviews("deleteReview")}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
