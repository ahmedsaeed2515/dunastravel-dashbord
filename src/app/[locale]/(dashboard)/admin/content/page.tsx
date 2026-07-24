"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Search, Plus, ExternalLink, Save, Loader2 } from "lucide-react";
import { useContentBlocks, useUpdateContentBlock } from "@/features/content/hooks/useContent";
import { ContentBlock } from "@/features/content/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";

export default function ContentPage() {
  const tContent = useTranslations("content");
  const tCommon = useTranslations("common");

  const { data: rawBlocks, isLoading } = useContentBlocks();
  const blocks: ContentBlock[] = Array.isArray(rawBlocks) 
    ? rawBlocks 
    : (rawBlocks as any)?.data && Array.isArray((rawBlocks as any).data) 
    ? (rawBlocks as any).data 
    : [];

  const updateBlock = useUpdateContentBlock();

  const [seoForm, setSeoForm] = useState({
    titleSuffix: " | Dunas Travel - Luxury Experiences",
    metaDescription: "Discover the world's most exclusive luxury travel destinations, bespoke itineraries, and premium B2B travel agency services with Dunas Travel.",
    ogImageUrl: "https://dunas.travel/og-default.jpg"
  });

  const handleSaveSeo = () => {
    updateBlock.mutate({
      key: "global_seo",
      payload: { content: seoForm }
    });
  };

  const seoBlock = blocks.find(b => b?.key === "global_seo");

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tContent("title")}
        description={tContent("description")}
        actions={
          <Button size="sm" variant="gold" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>{tCommon("create")}</span>
          </Button>
        }
      />

      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 border border-border/60">
          <TabsTrigger value="pages" className="gap-2 text-xs font-semibold">
            <FileText className="h-3.5 w-3.5" /> Pages & Blocks
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2 text-xs font-semibold">
            <Search className="h-3.5 w-3.5" /> Global SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="m-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>{tCommon("loading")}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {blocks.map((block) => (
                <Card key={block.id || block.key} className="hover:border-amber-500/40 transition-colors shadow-xs">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-1">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                    <CardTitle className="text-base font-mono dir-ltr text-start">{block.key}</CardTitle>
                    <CardDescription className="truncate font-sans text-xs">
                      {typeof block.content === 'object' 
                        ? (block.content?.en || JSON.stringify(block.content)) 
                        : String(block.content || "")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">{tCommon("edit")}</Button>
                    <Button variant="ghost" size="icon-sm"><ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="seo" className="m-0">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center text-lg">
                Global SEO
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Default Title Suffix</label>
                <Input 
                  value={seoBlock?.content?.titleSuffix || seoForm.titleSuffix}
                  onChange={(e) => setSeoForm({ ...seoForm, titleSuffix: e.target.value })}
                  className="dir-ltr text-start"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Global Meta Description</label>
                <Textarea 
                  value={seoBlock?.content?.metaDescription || seoForm.metaDescription}
                  onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                  className="h-24"
                />
              </div>
              <Button size="sm" variant="gold" className="gap-2 mt-4" onClick={handleSaveSeo} disabled={updateBlock.isPending}>
                <Save className="h-4 w-4" /> 
                {updateBlock.isPending ? tCommon("saving") : tCommon("saveChanges")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
