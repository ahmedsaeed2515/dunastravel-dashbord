"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  Calendar,
  User,
  Tag,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useBlogsAdmin,
  useCreateBlog,
  useUpdateBlog,
  useDeleteBlog,
} from "@/features/blogs/hooks/useBlogsAdmin";
import { BlogArticle, BlogDraft } from "@/features/blogs/types";

const defaultDraft: BlogDraft = {
  slug: "",
  titleEn: "",
  titleAr: "",
  excerptEn: "",
  excerptAr: "",
  contentEn: "",
  contentAr: "",
  coverImage: "",
  author: "Dunas Editorial",
  category: "Egypt Travel",
  status: "PUBLISHED",
  isPublished: true,
};

export function BlogsManager() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
  const [draft, setDraft] = useState<BlogDraft>(defaultDraft);

  const { data: blogsResponse, isLoading, error } = useBlogsAdmin();
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();

  const articles: BlogArticle[] = Array.isArray(blogsResponse?.data)
    ? blogsResponse.data
    : Array.isArray(blogsResponse)
      ? (blogsResponse as unknown as BlogArticle[])
      : [];

  const filteredArticles = articles.filter((a) => {
    const term = search.toLowerCase();
    const title = typeof a.title === "string" ? a.title.toLowerCase() : "";
    const slug = a.slug ? a.slug.toLowerCase() : "";
    const category = a.category ? a.category.toLowerCase() : "";
    return title.includes(term) || slug.includes(term) || category.includes(term);
  });

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setDraft({
      ...defaultDraft,
      slug: `article-${Date.now()}`,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (article: BlogArticle) => {
    setEditingArticle(article);
    setDraft({
      slug: article.slug || "",
      titleEn: article.titleJsonb?.en || (typeof article.title === "string" ? article.title : ""),
      titleAr: article.titleJsonb?.ar || "",
      excerptEn: article.excerptJsonb?.en || article.excerpt || "",
      excerptAr: article.excerptJsonb?.ar || "",
      contentEn: article.contentJsonb?.en || article.content || "",
      contentAr: article.contentJsonb?.ar || "",
      coverImage: article.coverImage || "",
      author: article.author || "Dunas Editorial",
      category: article.category || "Egypt Travel",
      status: article.status || "PUBLISHED",
      isPublished: article.isPublished ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!draft.slug.trim() || !draft.titleEn.trim() || !draft.contentEn.trim()) {
      toast.error("Slug, English title, and content are required.");
      return;
    }

    const payload = {
      slug: draft.slug.trim().toLowerCase(),
      titleJsonb: {
        en: draft.titleEn.trim(),
        ar: draft.titleAr.trim() || draft.titleEn.trim(),
      },
      excerptJsonb: {
        en: draft.excerptEn.trim(),
        ar: draft.excerptAr.trim() || draft.excerptEn.trim(),
      },
      contentJsonb: {
        en: draft.contentEn.trim(),
        ar: draft.contentAr.trim() || draft.contentEn.trim(),
      },
      coverImage: draft.coverImage.trim() || undefined,
      author: draft.author.trim() || "Dunas Editorial",
      category: draft.category.trim() || "Egypt Travel",
      status: draft.status || "PUBLISHED",
      isPublished: draft.isPublished,
    };

    if (editingArticle) {
      updateBlog.mutate(
        { idOrSlug: editingArticle.id || editingArticle.slug, payload },
        {
          onSuccess: () => setIsDialogOpen(false),
        }
      );
    } else {
      createBlog.mutate(payload, {
        onSuccess: () => setIsDialogOpen(false),
      });
    }
  };

  const handleDelete = (article: BlogArticle) => {
    if (confirm(`Are you sure you want to delete article "${article.title || article.slug}"?`)) {
      deleteBlog.mutate(article.id || article.slug);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles by title, slug, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0 bg-amber-500 hover:bg-amber-600 text-black font-semibold">
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          <span>Loading articles...</span>
        </div>
      )}

      {error && (
        <Card className="p-6 text-destructive border-destructive/20 bg-destructive/5">
          Failed to load blog articles from backend.
        </Card>
      )}

      {/* Articles Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Card
              key={article.id || article.slug}
              className="overflow-hidden border border-border hover:border-amber-500/40 transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-48 bg-muted overflow-hidden">
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt={typeof article.title === "string" ? article.title : article.slug}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <BookOpen className="h-10 w-10 opacity-30" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="secondary" className="bg-background/90 backdrop-blur-xs text-xs font-semibold">
                    {article.category || "Journal"}
                  </Badge>
                  {article.status === "PUBLISHED" ? (
                    <Badge className="bg-emerald-500/90 text-white text-[10px]">Published</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-background/90 text-xs">Draft</Badge>
                  )}
                </div>
              </div>

              <CardHeader className="p-5 flex-1">
                <CardTitle className="text-base line-clamp-2 leading-snug group-hover:text-amber-500 transition-colors">
                  {typeof article.title === "string" ? article.title : article.slug}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-xs mt-2">
                  {article.excerpt || "No summary provided."}
                </CardDescription>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3 text-amber-500" />
                    {article.author || "Editorial"}
                  </span>
                  {article.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-amber-500" />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs font-medium"
                  onClick={() => handleOpenEdit(article)}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs px-2.5"
                  onClick={() => handleDelete(article)}
                  disabled={deleteBlog.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {filteredArticles.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground">
              No blog articles found. Click "New Article" to create your first post.
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? "Edit Blog Article" : "Create New Blog Article"}</DialogTitle>
            <DialogDescription>
              Write content for your luxury travel journal. Published articles appear on the main website.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Slug (URL identifier) *</label>
                <Input
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  placeholder="e.g. nile-cruise-guide"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Category</label>
                <Input
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  placeholder="e.g. Egypt Travel, Cruises"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Author</label>
                <Input
                  value={draft.author}
                  onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                  placeholder="e.g. Dunas Editorial"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Cover Image URL (HTTPS)</label>
                <Input
                  value={draft.coverImage}
                  onChange={(e) => setDraft({ ...draft, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Title (English) *</label>
              <Input
                value={draft.titleEn}
                onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })}
                placeholder="Enter compelling article title"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Excerpt / Summary</label>
              <Textarea
                value={draft.excerptEn}
                onChange={(e) => setDraft({ ...draft, excerptEn: e.target.value })}
                placeholder="Brief 1-2 sentence description"
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Article Content (HTML or Markdown) *</label>
              <Textarea
                value={draft.contentEn}
                onChange={(e) => setDraft({ ...draft, contentEn: e.target.value })}
                placeholder="<p>Write your article content here...</p>"
                rows={8}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createBlog.isPending || updateBlog.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              {createBlog.isPending || updateBlog.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : editingArticle ? (
                "Save Changes"
              ) : (
                "Publish Article"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
