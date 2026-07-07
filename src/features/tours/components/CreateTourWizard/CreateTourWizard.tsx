"use client";

import { useState } from "react";
import { useCreateTour } from "../../hooks/useTours";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Sparkles, Loader2, ArrowRight, ArrowLeft, CheckCircle, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

export function CreateTourWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const createTour = useCreateTour();
  const [isLoading, setIsLoading] = useState(false);

  // --- Form States ---
  // Step 1: Basics
  const [slug, setSlug] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [category, setCategory] = useState("ADVENTURE");

  // Step 2: Logistics & Pricing
  const [country, setCountry] = useState("Egypt");
  const [city, setCity] = useState("Cairo");
  const [basePriceUsd, setBasePriceUsd] = useState("1200");
  const [capacity, setCapacity] = useState("12");
  const [minParticipants, setMinParticipants] = useState("2");

  // Step 3: Itinerary
  const [itineraryDays, setItineraryDays] = useState([{ dayLabel: "Day 1", description: "" }]);

  // Step 4: Includes / Excludes
  const [includesEn, setIncludesEn] = useState("");
  const [excludesEn, setExcludesEn] = useState("");

  // Step 5: Policies
  const [importantNotesEn, setImportantNotesEn] = useState("");
  const [cancellationEn, setCancellationEn] = useState("");

  // Step 6: SEO & Tags
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [tagsString, setTagsString] = useState("");

  // Step 7: Media
  const [images, setImages] = useState([{ url: "", isHero: true }]);

  // Step 8: Publishing
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");

  const TOTAL_STEPS = 8;

  // --- Handlers ---
  const handleNext = () => setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const addItineraryDay = () => setItineraryDays([...itineraryDays, { dayLabel: `Day ${itineraryDays.length + 1}`, description: "" }]);
  const updateItineraryDay = (index: number, field: string, value: string) => {
    const updated = [...itineraryDays];
    updated[index] = { ...updated[index], [field]: value };
    setItineraryDays(updated);
  };
  const removeItineraryDay = (index: number) => {
    setItineraryDays(itineraryDays.filter((_, i) => i !== index));
  };

  const addImage = () => setImages([...images, { url: "", isHero: false }]);
  const updateImage = (index: number, url: string) => {
    const updated = [...images];
    updated[index].url = url;
    setImages(updated);
  };
  const setHeroImage = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, isHero: i === index })));
  };
  const removeImage = (index: number) => {
    if (images.length > 1) {
      const updated = images.filter((_, i) => i !== index);
      if (images[index].isHero) updated[0].isHero = true; // ensure at least one hero
      setImages(updated);
    }
  };

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
        currency: "USD",
        isActive: status === "PUBLISHED",
        status,
        isFeatured,
        country,
        city,
        capacity: parseInt(capacity) || 10,
        minParticipants: parseInt(minParticipants) || 1,
        remainingSeats: parseInt(capacity) || 10,
        inclusionJsonb: includesEn ? { en: includesEn } : null,
        exclusionJsonb: excludesEn ? { en: excludesEn } : null,
        importantNotesJsonb: importantNotesEn ? { en: importantNotesEn } : null,
        cancellationPolicyJsonb: cancellationEn ? { en: cancellationEn } : null,
        seoTitle,
        seoDescription,
        tags: tagsString.split(',').map(t => t.trim()).filter(Boolean),
        itineraries: itineraryDays.map((it, idx) => ({
          dayLabel: it.dayLabel,
          descriptionJsonb: { en: it.description },
          sortOrder: idx + 1,
        })),
        images: images.filter(img => img.url).map((img, idx) => ({
          imageUrl: img.url,
          isHero: img.isHero,
          sortOrder: idx + 1,
        }))
      });
      
      toast.success("Tour created successfully");
      setOpen(false);
      setStep(1);
      // Optional: Reset form state fully here
    } catch (error: any) {
      // Error toast is handled in the mutation hook, but we can catch it here if we want to stop closing
      toast.error(error.message || "Failed to create tour");
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
      
      <DialogContent className="sm:max-w-3xl p-0 bg-card border rounded-2xl shadow-xl overflow-hidden flex flex-col h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold font-display flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-gold-500 animate-pulse" />
                Enterprise Tour Builder
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Step {step} of {TOTAL_STEPS}: {
                  step === 1 ? "Core Details & Taxonomy" : 
                  step === 2 ? "Geography & Logistics" : 
                  step === 3 ? "Itinerary Builder" : 
                  step === 4 ? "Includes & Excludes" :
                  step === 5 ? "Policies & Notes" :
                  step === 6 ? "SEO & Metadata" :
                  step === 7 ? "Media Gallery" :
                  "Publishing & B2B Visibility"
                }
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted p-2 rounded-lg">
              <span>Step {step}/{TOTAL_STEPS}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-muted h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-2xl mx-auto pb-4">
            {step === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Tour Slug (Unique ID)</Label>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. luxury-nile-cruise-2026" className="font-mono text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Category</Label>
                    <Select value={category} onValueChange={(val) => setCategory(val || "ADVENTURE")}>
                      <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADVENTURE">Adventure & Safari</SelectItem>
                        <SelectItem value="CULTURAL">Cultural & Historical</SelectItem>
                        <SelectItem value="CRUISE">Luxury Cruise</SelectItem>
                        <SelectItem value="RELAXATION">Resort & Relaxation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Tour Title (English)</Label>
                  <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="e.g. 7-Day Royal Nile Cruise & Pyramids" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Full Description (English)</Label>
                  <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder="Elaborate on the luxury experience..." className="h-32 resize-none" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in slide-in-from-right-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Country</Label>
                    <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Egypt" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">City / Region</Label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Luxor & Aswan" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Base Price (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                      <Input type="number" value={basePriceUsd} onChange={(e) => setBasePriceUsd(e.target.value)} className="pl-7" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase">Min Pax</Label>
                      <Input type="number" value={minParticipants} onChange={(e) => setMinParticipants(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase">Max Capacity</Label>
                      <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Itinerary Days</h3>
                    <p className="text-xs text-muted-foreground">Define the day-by-day luxury experience.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addItineraryDay}><Plus className="h-4 w-4 mr-1" /> Add Day</Button>
                </div>
                
                <div className="space-y-4">
                  {itineraryDays.map((it, idx) => (
                    <div key={idx} className="p-4 border rounded-xl bg-card space-y-3 relative group">
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-destructive h-8 w-8" onClick={() => removeItineraryDay(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid gap-3">
                        <Input value={it.dayLabel} onChange={(e) => updateItineraryDay(idx, "dayLabel", e.target.value)} className="font-medium bg-transparent border-none p-0 h-8 focus-visible:ring-0 text-primary" placeholder="e.g. Day 1: Arrival & Check-in" />
                        <Textarea value={it.description} onChange={(e) => updateItineraryDay(idx, "description", e.target.value)} placeholder="Describe the day's activities, meals, and accommodations..." className="text-sm min-h-[80px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">What's Included</Label>
                  <Textarea value={includesEn} onChange={(e) => setIncludesEn(e.target.value)} placeholder="- 5 Star Hotel Accommodation&#10;- Domestic Flights&#10;- Private Egyptologist" className="h-40 font-mono text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">What's Excluded</Label>
                  <Textarea value={excludesEn} onChange={(e) => setExcludesEn(e.target.value)} placeholder="- International Flights&#10;- Entry Visas&#10;- Personal Expenses" className="h-40 font-mono text-sm" />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Important Notes</Label>
                  <Textarea value={importantNotesEn} onChange={(e) => setImportantNotesEn(e.target.value)} placeholder="Dress code, fitness level requirements, visa information..." className="h-32 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Cancellation Policy</Label>
                  <Textarea value={cancellationEn} onChange={(e) => setCancellationEn(e.target.value)} placeholder="Free cancellation up to 30 days before departure..." className="h-32 text-sm" />
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">SEO Meta Title</Label>
                  <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="7-Day Luxury Nile Cruise | Dunas Travel" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">SEO Meta Description</Label>
                  <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Experience the ultimate luxury on the Nile..." className="h-24" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Tags (Comma separated)</Label>
                  <Input value={tagsString} onChange={(e) => setTagsString(e.target.value)} placeholder="luxury, cruise, cultural, honeymoon" />
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Media Gallery</h3>
                    <p className="text-xs text-muted-foreground">Provide image URLs for the tour gallery.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addImage}><ImageIcon className="h-4 w-4 mr-1" /> Add Image</Button>
                </div>
                
                <div className="space-y-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex gap-3 items-center p-3 border rounded-xl bg-card">
                      <div className="flex-1">
                        <Input value={img.url} onChange={(e) => updateImage(idx, e.target.value)} placeholder="https://..." className="text-sm" />
                      </div>
                      <Button 
                        variant={img.isHero ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setHeroImage(idx)}
                        className="w-24"
                      >
                        {img.isHero ? "Hero Image" : "Set Hero"}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeImage(idx)} className="text-destructive h-9 w-9">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 8 && (
              <div className="space-y-8 animate-in slide-in-from-right-4">
                <div className="p-5 border rounded-xl bg-card flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Draft Mode vs Published</h3>
                    <p className="text-sm text-muted-foreground mt-1">Drafts are hidden from public and B2B agents.</p>
                  </div>
                  <Select value={status} onValueChange={(val: any) => setStatus(val || "DRAFT")}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Save as Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Publish Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-5 border rounded-xl bg-card flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-gold-500" /> Featured Tour
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Pin this tour to the homepage and top of catalog.</p>
                  </div>
                  <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-muted/20 flex items-center justify-between mt-auto">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1 || isLoading} className="w-24">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          {step < TOTAL_STEPS ? (
            <Button onClick={handleNext} className="w-32 bg-primary hover:bg-primary/90 text-primary-foreground">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isLoading} className="w-40 bg-gold-500 hover:bg-gold-600 text-white shadow-gold">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle className="mr-2 h-4 w-4" /> Finalize Tour</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
