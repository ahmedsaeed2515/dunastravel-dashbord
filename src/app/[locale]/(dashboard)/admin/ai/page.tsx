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

export default function AiAgentsPage() {
  const [prompt, setPrompt] = useState("");
  const [chatLog, setChatLog] = useState<{role: 'user' | 'agent', text: string}[]>([
    { role: 'agent', text: "Hello! I am the Dunas Travel AI Assistant. How can I help you today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!prompt.trim()) return;
    setChatLog([...chatLog, { role: 'user', text: prompt }]);
    setPrompt("");
    setIsTyping(true);
    
    setTimeout(() => {
      setChatLog(prev => [...prev, { role: 'agent', text: "I have analyzed your inquiry. As an AI concierge, I recommend luxury Nile Cruise packages in Egypt tailored to your client's travel window." }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="AI Intelligence Hub"
        description="Configure autonomous AI concierge assistants, fine-tune system prompts, and upload proprietary travel knowledge bases."
      />

      <Tabs defaultValue="simulator" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 border border-border/60">
          <TabsTrigger value="simulator" className="gap-2 text-xs font-semibold">
            <Bot className="h-3.5 w-3.5" /> Agent Simulator
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2 text-xs font-semibold">
            <Database className="h-3.5 w-3.5" /> Knowledge Base
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="m-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/80 shadow-xs bg-card flex flex-col h-[560px]">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Live Testing Environment
                </CardTitle>
                <CardDescription className="text-xs">Simulate traveler inquiries with your trained agent model.</CardDescription>
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
                    placeholder="Type a message to test the AI..." 
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
                  <CardTitle className="text-base font-semibold">Agent Model Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">System Prompt</label>
                    <Textarea 
                      defaultValue="You are a luxury travel advisor for Dunas Travel. Be polite, concise, and prioritize bespoke tour packages."
                      className="h-28 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Temperature (Creativity)</label>
                    <Input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="w-full" />
                  </div>
                  <Button className="w-full" variant="outline" size="sm">Save Model Settings</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="m-0">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Proprietary Knowledge Base</CardTitle>
              <CardDescription className="text-xs">Upload PDF itineraries, company policies, and historical tours to index into vector store.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border/80 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-muted/20 transition-colors cursor-pointer">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <UploadCloud className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-1">Upload Knowledge Documents</h3>
                <p className="text-muted-foreground text-xs max-w-sm mb-4">
                  Drag and drop PDF, DOCX, or TXT tour brochures to index into vector storage.
                </p>
                <Button size="sm" variant="gold" onClick={() => toast.success("File upload simulator triggered.")}>
                  Select Documents
                </Button>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Indexed Vector Sources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-border/70 rounded-lg bg-muted/20">
                      <div className="p-2 bg-primary/10 rounded-md text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">Dunas_Luxury_Tours_2026.pdf</p>
                        <p className="text-[10px] text-muted-foreground">Indexed 2 days ago</p>
                      </div>
                      <Button variant="ghost" size="icon-xs" className="text-destructive">
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
