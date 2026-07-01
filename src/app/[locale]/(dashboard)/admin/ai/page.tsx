"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Bot, UploadCloud, MessageSquare, Sparkles, Send, FileText, Database } from "lucide-react";
import { toast } from "sonner";

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
    
    // Simulate AI response
    setTimeout(() => {
      setChatLog(prev => [...prev, { role: 'agent', text: "I have analyzed your request. As an AI travel agent, I recommend luxury villas in Maldives based on your B2B clients' preferences." }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-playfair font-bold tracking-tight text-primary flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            AI Intelligence Hub
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Train your autonomous travel agents and upload proprietary knowledge bases.
          </p>
        </div>
      </div>

      <Tabs defaultValue="simulator" className="space-y-6">
        <TabsList className="bg-background/60 backdrop-blur-md border border-border/50">
          <TabsTrigger value="simulator" className="gap-2"><Bot className="h-4 w-4" /> Agent Simulator</TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2"><Database className="h-4 w-4" /> Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="m-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/40 shadow-sm backdrop-blur-xl bg-background/60 flex flex-col h-[600px]">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  Live Testing Environment
                </CardTitle>
                <CardDescription>Simulate customer interactions with your trained agents.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatLog.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-tl-sm p-4 text-sm flex gap-1 items-center">
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-.3s]" />
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-.5s]" />
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t border-border/50 bg-card/50 mt-auto">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type a message to test the AI..." 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-background"
                  />
                  <Button onClick={handleSend} className="px-8 shadow-md">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/40 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Agent Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">System Prompt</label>
                    <Textarea 
                      defaultValue="You are a luxury travel advisor for Dunas Travel. Be polite, concise, and prioritize high-margin properties."
                      className="h-32 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Temperature (Creativity)</label>
                    <Input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="w-full" />
                  </div>
                  <Button className="w-full" variant="outline">Save Configuration</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="m-0">
          <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60">
            <CardHeader>
              <CardTitle>Proprietary Knowledge Base</CardTitle>
              <CardDescription>Upload PDF itineraries, company policies, or historical bookings to fine-tune the model.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <UploadCloud className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Upload Documents</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  Drag and drop your PDF, DOCX, or TXT files here to index them into the vector database.
                </p>
                <Button onClick={() => toast.success("File upload simulator triggered.")}>
                  Select Files
                </Button>
              </div>

              <div className="mt-8 space-y-4">
                <h4 className="font-medium text-sm">Indexed Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-card/50">
                      <div className="p-2 bg-blue-500/10 rounded-md text-blue-500">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Maldives_Resorts_2026.pdf</p>
                        <p className="text-xs text-muted-foreground">Indexed 2 days ago</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
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
