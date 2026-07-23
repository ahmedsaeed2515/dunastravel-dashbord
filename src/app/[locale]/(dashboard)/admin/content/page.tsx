"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileText, LayoutTemplate, Search, Plus, ExternalLink, Save, Loader2 } from "lucide-react";
import { useContentBlocks, useUpdateContentBlock } from "@/features/content/hooks/useContent";
import { ContentBlock } from "@/features/content/types";

export default function ContentPage() {
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

  // Safely extract from blocks array
  const seoBlock = blocks.find(b => b?.key === "global_seo");

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-playfair font-bold tracking-tight text-primary flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6" />
            Content & CMS
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage dynamic pages, legal policies, and global SEO metadata.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Page
        </Button>
      </div>

      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList className="bg-background/60 backdrop-blur-md border border-border/50">
          <TabsTrigger value="pages" className="gap-2"><FileText className="h-4 w-4" /> Dynamic Pages & Blocks</TabsTrigger>
          <TabsTrigger value="seo" className="gap-2"><Search className="h-4 w-4" /> Global SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="m-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Loading CMS content blocks...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blocks.map((block) => (
                <Card key={block.id || block.key} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                    </div>
                    <CardTitle className="text-lg font-mono">{block.key}</CardTitle>
                    <CardDescription className="truncate font-sans">
                      {typeof block.content === 'object' 
                        ? (block.content?.en || JSON.stringify(block.content)) 
                        : String(block.content || "")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button variant="outline" className="flex-1">Edit Content</Button>
                    <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4 text-muted-foreground" /></Button>
                  </CardContent>
                </Card>
              ))}

              {/* Standard Page Templates */}
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">Terms & Conditions</CardTitle>
                  <CardDescription>/legal/terms</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button variant="outline" className="flex-1">Edit Content</Button>
                  <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4 text-muted-foreground" /></Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">Privacy Policy</CardTitle>
                  <CardDescription>/legal/privacy</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button variant="outline" className="flex-1">Edit Content</Button>
                  <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4 text-muted-foreground" /></Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="seo" className="m-0">
          <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                Global SEO Configuration
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </CardTitle>
              <CardDescription>Default meta tags for pages without specific SEO overrides.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-3xl">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Title Suffix</label>
                <Input 
                  value={seoBlock?.content?.titleSuffix || seoForm.titleSuffix}
                  onChange={(e) => setSeoForm({ ...seoForm, titleSuffix: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Global Meta Description</label>
                <Textarea 
                  value={seoBlock?.content?.metaDescription || seoForm.metaDescription}
                  onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                  className="h-24"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default OpenGraph Image URL</label>
                <Input 
                  value={seoBlock?.content?.ogImageUrl || seoForm.ogImageUrl}
                  onChange={(e) => setSeoForm({ ...seoForm, ogImageUrl: e.target.value })}
                />
              </div>
              <Button className="gap-2 mt-4" onClick={handleSaveSeo} disabled={updateBlock.isPending}>
                <Save className="h-4 w-4" /> 
                {updateBlock.isPending ? "Saving..." : "Save SEO Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
