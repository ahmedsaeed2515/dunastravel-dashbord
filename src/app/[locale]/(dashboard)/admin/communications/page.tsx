"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, MessageSquare, BellRing, Smartphone, Plus, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-playfair font-bold tracking-tight text-primary flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Communications & Notifications
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage Email/SMS templates, automated triggers, and review delivery logs.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background/60 backdrop-blur-md border border-border/50">
          <TabsTrigger value="templates" className="gap-2"><MessageSquare className="h-4 w-4" /> Message Templates</TabsTrigger>
          <TabsTrigger value="logs" className="gap-2"><BellRing className="h-4 w-4" /> Delivery Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="m-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">Email</Badge>
                </div>
                <CardTitle className="text-lg">Booking Confirmation</CardTitle>
                <CardDescription>Triggered automatically upon successful payment.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground line-clamp-3">
                  Dear {"{{client_name}}"}, your booking for {"{{tour_name}}"} is confirmed. Ref: {"{{ref_code}}"}. We look forward to welcoming you...
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">SMS</Badge>
                </div>
                <CardTitle className="text-lg">Trip Reminder</CardTitle>
                <CardDescription>Sent 48 hours before departure.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground line-clamp-3">
                  Dunas Travel: Your trip to {"{{destination}}"} starts in 48 hours. Don't forget your passport! Safe travels.
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer group border-dashed bg-muted/30 flex flex-col items-center justify-center min-h-[200px]">
              <div className="p-4 bg-primary/10 rounded-full text-primary mb-3 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-sm">Create New Template</h3>
              <p className="text-xs text-muted-foreground mt-1">Email, SMS, or WhatsApp</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="m-0">
          <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle>System Delivery Logs</CardTitle>
                <CardDescription>Real-time audit of all outgoing communications.</CardDescription>
              </div>
              <Input placeholder="Search recipient..." className="w-64" />
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject / Context</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Badge variant="outline" className="gap-1.5">
                          {i % 2 === 0 ? <Smartphone className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                          {i % 2 === 0 ? 'SMS' : 'Email'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {i % 2 === 0 ? '+971 50 123 4567' : 'client@luxury.com'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {i % 2 === 0 ? 'Trip Reminder' : 'Invoice REF-1002'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-none">
                          <CheckCircle className="h-3 w-3 mr-1" /> Delivered
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        Today, {10 - i}:00 AM
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
