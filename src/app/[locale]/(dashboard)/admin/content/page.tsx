"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Search, Save, Loader2 } from "lucide-react";
import { useContentBlocks, useUpdateContentBlock } from "@/features/content/hooks/useContent";
import { ContentBlock } from "@/features/content/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";
import { QueryErrorState } from "@/components/shared/QueryErrorState";

export default function ContentPage() {
  const tContent = useTranslations("content");
  const tCommon = useTranslations("common");

  const blocksQuery = useContentBlocks();
  const { data: rawBlocks, isLoading } = blocksQuery;
  const blocks: ContentBlock[] = Array.isArray(rawBlocks) 
    ? rawBlocks 
    : (rawBlocks as any)?.data && Array.isArray((rawBlocks as any).data) 
    ? (rawBlocks as any).data 
    : [];

  const updateBlock = useUpdateContentBlock();

  const [seoForm, setSeoForm] = useState<Partial<Record<"titleSuffix" | "metaDescription" | "ogImageUrl", string>>>({});
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
  const [blockContent, setBlockContent] = useState("");

  const seoBlock = blocks.find(b => b?.key === "global_seo");
  const storedSeo = seoBlock?.content && typeof seoBlock.content === "object" ? seoBlock.content : {};
  const seoValues = {
    titleSuffix: seoForm.titleSuffix ?? storedSeo.titleSuffix ?? "",
    metaDescription: seoForm.metaDescription ?? storedSeo.metaDescription ?? "",
    ogImageUrl: seoForm.ogImageUrl ?? storedSeo.ogImageUrl ?? "",
  };

  const handleSaveSeo = () => {
    updateBlock.mutate({
      key: "global_seo",
      payload: { content: seoValues }
    });
  };

  const editBlock = (block: ContentBlock) => {
    setSelectedBlock(block);
    setBlockContent(typeof block.content === "string" ? block.content : JSON.stringify(block.content, null, 2));
  };

  const saveBlock = () => {
    if (!selectedBlock) return;
    let content: unknown = blockContent;
    try { content = JSON.parse(blockContent); } catch { /* Plain text is valid CMS content. */ }
    updateBlock.mutate({ key: selectedBlock.key, payload: { content } });
  };

  if (blocksQuery.isError) {
    return <QueryErrorState message="تعذر تحميل المحتوى من الباك إند." onRetry={() => void blocksQuery.refetch()} />;
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tContent("title")}
        description={tContent("description")}
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
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => editBlock(block)}>{tCommon("edit")}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {selectedBlock && (
            <Card className="mt-5 border-amber-500/30">
              <CardHeader><CardTitle className="font-mono text-base">{selectedBlock.key}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea value={blockContent} onChange={(event) => setBlockContent(event.target.value)} className="min-h-64 font-mono text-xs" />
                <Button onClick={saveBlock} disabled={updateBlock.isPending} className="gap-2"><Save className="h-4 w-4" />{updateBlock.isPending ? tCommon("saving") : tCommon("saveChanges")}</Button>
              </CardContent>
            </Card>
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
                  value={seoValues.titleSuffix}
                  onChange={(e) => setSeoForm({ ...seoForm, titleSuffix: e.target.value })}
                  className="dir-ltr text-start"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Global Meta Description</label>
                <Textarea 
                  value={seoValues.metaDescription}
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
