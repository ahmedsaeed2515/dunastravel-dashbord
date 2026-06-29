"use client";

import { useState } from "react";
import { useCreateTour } from "../../hooks/useTours";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Sparkles, Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function CreateTourWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const createTour = useCreateTour();
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [slug, setSlug] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [category, setCategory] = useState("ADVENTURE");
  const [basePriceUsd, setBasePriceUsd] = useState("1200");
  const [capacity, setCapacity] = useState("12");
  const [country, setCountry] = useState("Egypt");
  const [city, setCity] = useState("Cairo");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [itineraryDays, setItineraryDays] = useState([{ dayLabel: "Day 1: Arrival", description: "Welcome to Cairo and check-in to luxury hotel." }]);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1200&auto=format&fit=crop");

  const addItineraryDay = () => {
    setItineraryDays([...itineraryDays, { dayLabel: `Day ${itineraryDays.length + 1}: `, description: "" }]);
  };

  const updateItineraryDay = (index: number, field: string, value: string) => {
    const updated = [...itineraryDays];
    updated[index] = { ...updated[index], [field]: value };
    setItineraryDays(updated);
  };

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleSave = async () => {
    if (!slug || !titleEn) {
      toast.error("Please provide a valid slug and title.");
      return;
    }

    try {
      setIsLoading(true);
      await createTour.mutateAsync({
        slug,
        titleJsonb: { en: titleEn },
        descriptionJsonb: { en: descriptionEn },
        category,
        basePriceUsd: parseFloat(basePriceUsd) || 0,
        capacity: parseInt(capacity) || 10,
        remainingSeats: parseInt(capacity) || 10,
        country,
        city,
        isFeatured,
        status,
        itineraries: itineraryDays.map((it, idx) => ({
          dayLabel: it.dayLabel,
          descriptionJsonb: { en: it.description },
          sortOrder: idx + 1,
        })),
        images: [
          {
            imageUrl,
            isHero: true,
            sortOrder: 1,
          }
        ]
      });
      setOpen(false);
      setStep(1);
      // Reset form
      setSlug("");
      setTitleEn("");
      setDescriptionEn("");
    } catch (error) {
      // toast error handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="sm" className="h-9 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 font-medium px-4">
          <Plus className="h-4 w-4" />
          <span>Create New Tour</span>
        </Button>
      } />
      <DialogContent className="sm:max-w-2xl p-6 bg-card border rounded-2xl shadow-xl">
        <DialogHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold font-serif flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                Create Enterprise Tour Package
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-muted-foreground">
                Step {step} of 4: {step === 1 ? "Core Details & Taxonomy" : step === 2 ? "Geography & Logistics" : step === 3 ? "Itinerary Builder" : "Publishing & Media"}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted p-2 rounded-lg">
              <span>Step {step}/4</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </DialogHeader>

        <div className="min-h-[320px] max-h-[60vh] overflow-y-auto pr-2 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">TOUR SLUG / UNIQUE ID</label>
                  <Input 
                    value={slug} 
                    onChange={(e) => setSlug(e.target.value)} 
                    placeholder="e.g. luxury-nile-cruise-2026"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">TOUR TITLE (ENGLISH)</label>
                  <Input 
                    value={titleEn} 
                    onChange={(e) => setTitleEn(e.target.value)} 
                    placeholder="e.g. 7-Day Royal Nile Cruise & Pyramids"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">FULL DESCRIPTION (ENGLISH)</label>
                <Textarea 
                  value={descriptionEn} 
                  onChange={(e) => setDescriptionEn(e.target.value)} 
                  placeholder="Provide an enticing, premium description of the travel experience..."
                  className="h-28 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">CATEGORY</label>
                  <Select value={category} onValueChange={(val) => val && setCategory(val)}>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LUXURY">Luxury Private</SelectItem>
                      <SelectItem value="ADVENTURE">Adventure & Safari</SelectItem>
                      <SelectItem value="CULTURAL">Historical & Cultural</SelectItem>
                      <SelectItem value="CRUISE">Nile Cruise</SelectItem>
                      <SelectItem value="WELLNESS">Wellness & Spa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">BASE PRICE (USD)</label>
                  <Input 
                    type="number"
                    value={basePriceUsd} 
                    onChange={(e) => setBasePriceUsd(e.target.value)} 
                    placeholder="1200"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">COUNTRY</label>
                  <Input 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)} 
                    placeholder="Egypt" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">CITY / REGION</label>
                  <Input 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    placeholder="Cairo" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">TOTAL CAPACITY / SEATS</label>
                  <Input 
                    type="number" 
                    value={capacity} 
                    onChange={(e) => setCapacity(e.target.value)} 
                    placeholder="12" 
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-muted-foreground block">DAILY ITINERARY STAGES</label>
                <Button variant="outline" size="sm" onClick={addItineraryDay} className="h-8 text-xs flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add Day
                </Button>
              </div>

              <div className="space-y-3">
                {itineraryDays.map((it, index) => (
                  <div key={index} className="border p-4 rounded-xl bg-muted/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input 
                        value={it.dayLabel} 
                        onChange={(e) => updateItineraryDay(index, "dayLabel", e.target.value)}
                        placeholder="Day 1: Arrival & Welcome"
                        className="font-semibold text-sm max-w-[280px]"
                      />
                      <span className="text-xs font-mono text-muted-foreground">Day #{index + 1}</span>
                    </div>
                    <Textarea 
                      value={it.description} 
                      onChange={(e) => updateItineraryDay(index, "description", e.target.value)}
                      placeholder="Enter day highlights, meals, and visits..."
                      className="h-20 text-sm bg-background"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">HERO ASSET IMAGE URL</label>
                <Input 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  placeholder="https://..." 
                  className="font-mono text-sm"
                />
              </div>

              <div className="border p-4 rounded-xl bg-card flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Featured Tour Status</h4>
                  <p className="text-xs text-muted-foreground">Mark this tour as a top priority on the Executive Dashboard.</p>
                </div>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>

              <div className="border p-4 rounded-xl bg-card flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Initial Publish State</h4>
                  <p className="text-xs text-muted-foreground">Save as active draft or publish immediately to client portals.</p>
                </div>
                <Select value={status} onValueChange={(val: any) => val && setStatus(val)}>
                  <SelectTrigger className="w-36 h-9 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-4 mt-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrev} 
            disabled={step === 1 || isLoading}
            className="flex items-center gap-1.5 h-9"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          {step < 4 ? (
            <Button 
              size="sm" 
              onClick={handleNext} 
              className="flex items-center gap-1.5 h-9 bg-primary text-primary-foreground"
            >
              <span>Next Step</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={isLoading}
              className="flex items-center gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 shadow-md"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              <span>Finish & Create Tour</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
