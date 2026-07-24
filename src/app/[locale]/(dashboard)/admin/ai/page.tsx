"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Bot, UploadCloud, MessageSquare, Send, FileText, Database } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";

export default function AiAgentsPage() {
  const tAi = useTranslations("ai");
  const tCommon = useTranslations("common");

  const [prompt, setPrompt] = useState("");
  const [chatLog, setChatLog] = useState<{role: 'user' | 'agent', text: string}[]>([
    { role: 'agent', text: tAi("noAiData") }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!prompt.trim()) return;
    setChatLog([...chatLog, { role: 'user', text: prompt }]);
    setPrompt("");
    setIsTyping(true);
    
    setTimeout(() => {
      setChatLog(prev => [...prev, { role: 'agent', text: tAi("noAiData") }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tAi("title")}
        description={tAi("description")}
      />

      <Tabs defaultValue="simulator" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 border border-border/60">
          <TabsTrigger value="simulator" className="gap-2 text-xs font-semibold">
            <Bot className="h-3.5 w-3.5" /> {tAi("askAssistant")}
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2 text-xs font-semibold">
            <Database className="h-3.5 w-3.5" /> {tAi("generateItinerary")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="m-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/80 shadow-xs bg-card flex flex-col h-[560px]">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  {tAi("askAssistant")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {chatLog.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl p-3.5 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-xs' : 'bg-muted rounded-tl-xs'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl rounded-tl-xs p-3.5 text-sm flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-.3s]" />
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-.5s]" />
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t border-border/60 bg-muted/20">
                <div className="flex gap-2">
                  <Input 
                    placeholder={`${tCommon("searchPlaceholder")}...`} 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} size="sm" variant="gold" className="px-5">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/80 shadow-xs bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">{tAi("title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">{tCommon("description")}</label>
                    <Textarea 
                      defaultValue="Dunas Travel AI Concierge"
                      className="h-28 text-xs font-mono"
                    />
                  </div>
                  <Button className="w-full" variant="outline" size="sm">{tCommon("saveChanges")}</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="m-0">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">{tAi("generateItinerary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border/80 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-muted/20 transition-colors cursor-pointer">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <UploadCloud className="h-7 w-7 text-primary" />
                </div>
                <Button size="sm" variant="gold" onClick={() => toast.success(tCommon("success"))}>
                  {tCommon("upload")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
