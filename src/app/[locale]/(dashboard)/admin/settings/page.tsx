"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, DollarSign, Settings2, RefreshCw, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-playfair font-bold tracking-tight text-primary flex items-center gap-2">
            <Settings2 className="h-6 w-6" />
            Platform Settings
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage localization, exchange rates, and global parameters.
          </p>
        </div>
      </div>

      <Tabs defaultValue="localization" className="space-y-6">
        <TabsList className="bg-background/60 backdrop-blur-md border border-border/50">
          <TabsTrigger value="localization" className="gap-2"><Globe className="h-4 w-4" /> Localization & Translations</TabsTrigger>
          <TabsTrigger value="currencies" className="gap-2"><DollarSign className="h-4 w-4" /> Currencies & Rates</TabsTrigger>
        </TabsList>

        <TabsContent value="localization" className="m-0">
          <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60">
            <CardHeader>
              <CardTitle>Supported Languages</CardTitle>
              <CardDescription>Manage active languages and string overrides.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg bg-card/50">
                <div>
                  <h4 className="font-semibold">English (en)</h4>
                  <p className="text-xs text-muted-foreground">Default system language</p>
                </div>
                <Button variant="outline" size="sm">Manage Strings</Button>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-lg bg-card/50">
                <div>
                  <h4 className="font-semibold">Arabic (ar)</h4>
                  <p className="text-xs text-muted-foreground">RTL layout enabled</p>
                </div>
                <Button variant="outline" size="sm">Manage Strings</Button>
              </div>
              <Button className="w-full" variant="secondary">Add Language</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currencies" className="m-0">
          <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Exchange Rates</CardTitle>
                  <CardDescription>Base currency is USD. Rates are automatically fetched from ECB daily.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Sync Now
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">USD (Base)</label>
                  <Input value="1.0000" disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">AED</label>
                  <Input defaultValue="3.6725" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">EUR</label>
                  <Input defaultValue="0.9145" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">GBP</label>
                  <Input defaultValue="0.7834" />
                </div>
              </div>
              <Button className="gap-2 mt-4">
                <Save className="h-4 w-4" /> Save Rate Overrides
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
