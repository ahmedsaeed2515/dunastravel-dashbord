"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  FileText,
  Search,
  Sparkles,
  RefreshCw,
  Save,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Home,
  HelpCircle,
  Building,
  Globe,
  Share2,
  PhoneCall,
  CheckCircle2,
  Code,
  Eye,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  useContentBlocks,
  useUpdateContentBlock,
  useSeedDefaults,
  useDeleteContentBlock,
} from "../hooks/useContent";
import { ContentBlock } from "../types";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

export function ContentCmsStudio() {
  const params = useParams();
  const currentLocale = (params?.locale as string) || "en";
  const isAr = currentLocale === "ar";
  const tContent = useTranslations("content");
  const tCommon = useTranslations("common");

  // Selected language for content editing
  const [activeLang, setActiveLang] = useState<string>(currentLocale);
  const [studioTab, setStudioTab] = useState<string>("homepage");

  // Queries & Mutations
  const { data: rawBlocks, isLoading, refetch, isRefetching } = useContentBlocks();
  const blocks: ContentBlock[] = useMemo(() => rawBlocks?.data ?? [], [rawBlocks]);

  const updateBlockMutation = useUpdateContentBlock();
  const seedDefaultsMutation = useSeedDefaults();
  const deleteBlockMutation = useDeleteContentBlock();

  // Helper to extract or fallback localized value
  const getLocalized = (obj: any, lang: string, fallback = ""): string => {
    if (!obj) return fallback;
    if (typeof obj === "string") return obj;
    if (typeof obj === "object") {
      return obj[lang] || obj["en"] || obj["ar"] || Object.values(obj)[0] || fallback;
    }
    return String(obj);
  };

  // --- Block: Homepage Hero ---
  const heroBlock = useMemo(() => blocks.find((b) => b.key === "homepage_hero" || b.key === "homepage.hero"), [blocks]);
  const [heroForm, setHeroForm] = useState({
    badge: { en: "", ar: "", es: "", pt: "", it: "" },
    title: { en: "", ar: "", es: "", pt: "", it: "" },
    subtitle: { en: "", ar: "", es: "", pt: "", it: "" },
    ctaText: { en: "", ar: "", es: "", pt: "", it: "" },
    ctaLink: "/tours",
    heroImageUrl: "/imgs/hero/pyramids-luxury.jpg",
    stats: { experienceYears: 15, happyTravelers: 45000, satisfactionRate: 99, destinationsCount: 12 },
  });

  useEffect(() => {
    if (heroBlock?.content && typeof heroBlock.content === "object") {
      const c = heroBlock.content;
      setHeroForm({
        badge: typeof c.badge === "object" ? { ...c.badge } : { en: c.badge || "", ar: c.badge || "" },
        title: typeof c.title === "object" ? { ...c.title } : { en: c.title || "", ar: c.title || "" },
        subtitle: typeof c.subtitle === "object" ? { ...c.subtitle } : { en: c.subtitle || "", ar: c.subtitle || "" },
        ctaText: typeof c.ctaText === "object" ? { ...c.ctaText } : { en: c.ctaText || "", ar: c.ctaText || "" },
        ctaLink: c.ctaLink || "/tours",
        heroImageUrl: c.heroImageUrl || "/imgs/hero/pyramids-luxury.jpg",
        stats: c.stats || { experienceYears: 15, happyTravelers: 45000, satisfactionRate: 99, destinationsCount: 12 },
      });
    }
  }, [heroBlock]);

  const handleSaveHomepage = () => {
    updateBlockMutation.mutate({
      key: "homepage_hero",
      payload: {
        content: heroForm,
        status: "PUBLISHED",
        expectedVersion: heroBlock?.version,
      },
    });
  };

  // --- Block: FAQ Page ---
  const faqBlock = useMemo(() => blocks.find((b) => b.key === "faq_page"), [blocks]);
  const [faqForm, setFaqForm] = useState({
    heading: { en: "", ar: "", es: "", pt: "", it: "" },
    helpCenter: { en: "", ar: "", es: "", pt: "", it: "" },
    items: [] as Array<{
      id: string;
      category: string;
      question: Record<string, string>;
      answer: Record<string, string>;
    }>,
  });

  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqDraft, setFaqDraft] = useState({
    id: "",
    category: "general",
    question: { en: "", ar: "", es: "", pt: "", it: "" },
    answer: { en: "", ar: "", es: "", pt: "", it: "" },
  });

  useEffect(() => {
    if (faqBlock?.content && typeof faqBlock.content === "object") {
      const c = faqBlock.content;
      setFaqForm({
        heading: typeof c.heading === "object" ? { ...c.heading } : { en: c.heading || "", ar: c.heading || "" },
        helpCenter: typeof c.helpCenter === "object" ? { ...c.helpCenter } : { en: c.helpCenter || "", ar: c.helpCenter || "" },
        items: Array.isArray(c.items) ? c.items : [],
      });
    }
  }, [faqBlock]);

  const handleSaveFaq = () => {
    updateBlockMutation.mutate({
      key: "faq_page",
      payload: {
        content: faqForm,
        status: "PUBLISHED",
        expectedVersion: faqBlock?.version,
      },
    });
  };

  const handleOpenFaqModal = (index: number | null = null) => {
    if (index !== null && faqForm.items[index]) {
      const item = faqForm.items[index];
      setEditingFaqIndex(index);
      const qObj = typeof item.question === "object" && item.question ? item.question : {};
      const aObj = typeof item.answer === "object" && item.answer ? item.answer : {};
      const qVal = typeof item.question === "string" ? item.question : "";
      const aVal = typeof item.answer === "string" ? item.answer : "";
      setFaqDraft({
        id: item.id || `faq-${Date.now()}`,
        category: item.category || "general",
        question: {
          en: qObj.en || (activeLang === "en" ? qVal : ""),
          ar: qObj.ar || (activeLang === "ar" ? qVal : ""),
          es: qObj.es || (activeLang === "es" ? qVal : ""),
          pt: qObj.pt || (activeLang === "pt" ? qVal : ""),
          it: qObj.it || (activeLang === "it" ? qVal : ""),
        },
        answer: {
          en: aObj.en || (activeLang === "en" ? aVal : ""),
          ar: aObj.ar || (activeLang === "ar" ? aVal : ""),
          es: aObj.es || (activeLang === "es" ? aVal : ""),
          pt: aObj.pt || (activeLang === "pt" ? aVal : ""),
          it: aObj.it || (activeLang === "it" ? aVal : ""),
        },
      });
    } else {
      setEditingFaqIndex(null);
      setFaqDraft({
        id: `faq-${Date.now()}`,
        category: "general",
        question: { en: "", ar: "", es: "", pt: "", it: "" },
        answer: { en: "", ar: "", es: "", pt: "", it: "" },
      });
    }
    setFaqModalOpen(true);
  };

  const handleSaveFaqItem = () => {
    const updatedItems = [...faqForm.items];
    if (editingFaqIndex !== null) {
      updatedItems[editingFaqIndex] = faqDraft;
    } else {
      updatedItems.push(faqDraft);
    }
    setFaqForm({ ...faqForm, items: updatedItems });
    setFaqModalOpen(false);
  };

  const handleDeleteFaqItem = (index: number) => {
    const updatedItems = faqForm.items.filter((_, i) => i !== index);
    setFaqForm({ ...faqForm, items: updatedItems });
  };

  // --- Block: About Page ---
  const aboutBlock = useMemo(() => blocks.find((b) => b.key === "about_page" || b.key === "about"), [blocks]);
  const [aboutForm, setAboutForm] = useState({
    title: { en: "", ar: "", es: "", pt: "", it: "" },
    subtitle: { en: "", ar: "", es: "", pt: "", it: "" },
    story: { en: "", ar: "", es: "", pt: "", it: "" },
    vision: { en: "", ar: "", es: "", pt: "", it: "" },
    stats: { years: "15+", travelers: "45,000+", destinations: "12+", partners: "350+" },
  });

  useEffect(() => {
    if (aboutBlock?.content && typeof aboutBlock.content === "object") {
      const c = aboutBlock.content;
      setAboutForm({
        title: typeof c.title === "object" ? { ...c.title } : { en: c.title || "", ar: c.title || "" },
        subtitle: typeof c.subtitle === "object" ? { ...c.subtitle } : { en: c.subtitle || "", ar: c.subtitle || "" },
        story: typeof c.story === "object" ? { ...c.story } : { en: c.story || "", ar: c.story || "" },
        vision: typeof c.vision === "object" ? { ...c.vision } : { en: c.vision || "", ar: c.vision || "" },
        stats: c.stats || { years: "15+", travelers: "45,000+", destinations: "12+", partners: "350+" },
      });
    }
  }, [aboutBlock]);

  const handleSaveAbout = () => {
    updateBlockMutation.mutate({
      key: "about_page",
      payload: {
        content: aboutForm,
        status: "PUBLISHED",
        expectedVersion: aboutBlock?.version,
      },
    });
  };

  // --- Block: Global SEO ---
  const seoBlock = useMemo(() => blocks.find((b) => b.key === "global_seo"), [blocks]);
  const [seoForm, setSeoForm] = useState({
    titleSuffix: " | Dunas Travel Luxury Expeditions",
    metaDescription: { en: "", ar: "", es: "", pt: "", it: "" },
    ogImageUrl: "/imgs/og-dunas-luxury.jpg",
    keywords: "luxury travel, egypt tours, turkey luxury tours, private pyramids tour, nile cruise vip, dunas travel",
    twitterHandle: "@DunasTravel",
  });

  useEffect(() => {
    if (seoBlock?.content && typeof seoBlock.content === "object") {
      const c = seoBlock.content;
      setSeoForm({
        titleSuffix: String(c.titleSuffix || " | Dunas Travel Luxury Expeditions"),
        metaDescription: typeof c.metaDescription === "object" ? { ...c.metaDescription } : { en: c.metaDescription || "", ar: c.metaDescription || "" },
        ogImageUrl: String(c.ogImageUrl || "/imgs/og-dunas-luxury.jpg"),
        keywords: String(c.keywords || "luxury travel, egypt tours, turkey luxury tours"),
        twitterHandle: String(c.twitterHandle || "@DunasTravel"),
      });
    }
  }, [seoBlock]);

  const handleSaveSeo = () => {
    updateBlockMutation.mutate({
      key: "global_seo",
      payload: {
        content: seoForm,
        status: "PUBLISHED",
        expectedVersion: seoBlock?.version,
      },
    });
  };

  // --- Block: Footer Info ---
  const footerBlock = useMemo(() => blocks.find((b) => b.key === "footer_info"), [blocks]);
  const [footerForm, setFooterForm] = useState({
    copyright: { en: "", ar: "", es: "", pt: "", it: "" },
    supportEmail: "concierge@dunastravel.com",
    vipWhatsapp: "+20 100 000 0000",
    phone: "+20 2 2700 0000",
    address: { en: "", ar: "", es: "", pt: "", it: "" },
    socialLinks: {
      instagram: "https://instagram.com/dunastravel",
      facebook: "https://facebook.com/dunastravel",
      youtube: "https://youtube.com/@dunastravel",
      tripadvisor: "https://tripadvisor.com/dunastravel",
    },
  });

  useEffect(() => {
    if (footerBlock?.content && typeof footerBlock.content === "object") {
      const c = footerBlock.content;
      setFooterForm({
        copyright: typeof c.copyright === "object" ? { ...c.copyright } : { en: c.copyright || "", ar: c.copyright || "" },
        supportEmail: c.supportEmail || "concierge@dunastravel.com",
        vipWhatsapp: c.vipWhatsapp || "+20 100 000 0000",
        phone: c.phone || "+20 2 2700 0000",
        address: typeof c.address === "object" ? { ...c.address } : { en: c.address || "", ar: c.address || "" },
        socialLinks: c.socialLinks || { instagram: "", facebook: "", youtube: "", tripadvisor: "" },
      });
    }
  }, [footerBlock]);

  const handleSaveFooter = () => {
    updateBlockMutation.mutate({
      key: "footer_info",
      payload: {
        content: footerForm,
        status: "PUBLISHED",
        expectedVersion: footerBlock?.version,
      },
    });
  };

  // --- Raw JSON Block Editor Dialog ---
  const [rawEditingBlock, setRawEditingBlock] = useState<ContentBlock | null>(null);
  const [rawJsonText, setRawJsonText] = useState("");

  const handleOpenRawEditor = (block: ContentBlock) => {
    setRawEditingBlock(block);
    setRawJsonText(JSON.stringify(block.content, null, 2));
  };

  const handleSaveRawJson = () => {
    if (!rawEditingBlock) return;
    try {
      const parsed = JSON.parse(rawJsonText);
      updateBlockMutation.mutate(
        {
          key: rawEditingBlock.key,
          payload: {
            content: parsed,
            status: rawEditingBlock.status,
            expectedVersion: rawEditingBlock.version,
          },
        },
        { onSuccess: () => setRawEditingBlock(null) }
      );
    } catch {
      toast.error("Invalid JSON syntax. Please check formatting.");
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 1. Header & Studio Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
                  {isAr ? "استوديو إدارة المحتوى والصفحات" : "Content & CMS Studio"}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-bold px-2 py-0.5"
                >
                  Visual Studio
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {isAr
                  ? "إدارة وتعديل محتوى الصفحة الرئيسية، الأسئلة الشائعة، قصة الشركة، بيانات السيو، والفوتر."
                  : "Visually manage Homepage Hero, FAQ Center, About Story, Global SEO, and Footer."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="rounded-xl gap-2 text-xs font-semibold h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            <span>{isAr ? "تحديث" : "Refresh"}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => seedDefaultsMutation.mutate()}
            disabled={seedDefaultsMutation.isPending}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl gap-2 text-xs h-9 shadow-xs cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${seedDefaultsMutation.isPending ? "animate-spin" : ""}`} />
            <span>{isAr ? "استعادة المحتوى الفاخر الافتراضي" : "Restore Curated Content"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Global Multi-Language Switcher Toolbar */}
      <Card className="p-3.5 rounded-3xl bg-card border-border/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <Globe className="w-4 h-4 text-amber-500" />
          <span>{isAr ? "لغة المحتوى الحالية للتعديل:" : "Editing Content Language:"}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/60">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setActiveLang(lang.code)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeLang === lang.code
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* 3. Main Studio Tabs */}
      <Tabs value={studioTab} onValueChange={setStudioTab} className="space-y-6">
        <TabsList className="bg-muted/60 p-1 border border-border/60 flex-wrap h-auto gap-1 rounded-2xl">
          <TabsTrigger value="homepage" className="gap-2 text-xs font-bold rounded-xl">
            <Home className="h-4 w-4 text-amber-500" />
            <span>{isAr ? "الصفحة الرئيسية (Hero)" : "Homepage Hero"}</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-2 text-xs font-bold rounded-xl">
            <HelpCircle className="h-4 w-4 text-amber-500" />
            <span>{isAr ? "الأسئلة الشائعة (FAQ)" : "FAQ Center"}</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="gap-2 text-xs font-bold rounded-xl">
            <Building className="h-4 w-4 text-amber-500" />
            <span>{isAr ? "من نحن وقصة الشركة" : "About Us"}</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2 text-xs font-bold rounded-xl">
            <Search className="h-4 w-4 text-amber-500" />
            <span>{isAr ? "السيو ومحركات البحث" : "Global SEO"}</span>
          </TabsTrigger>
          <TabsTrigger value="footer" className="gap-2 text-xs font-bold rounded-xl">
            <PhoneCall className="h-4 w-4 text-amber-500" />
            <span>{isAr ? "الفوتر والتواصل" : "Footer & Contact"}</span>
          </TabsTrigger>
          <TabsTrigger value="raw" className="gap-2 text-xs font-bold rounded-xl">
            <Code className="h-4 w-4 text-muted-foreground" />
            <span>{isAr ? "الكتل البرمجية (Raw)" : "All Raw Blocks"}</span>
          </TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: HOMEPAGE HERO STUDIO                          */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="homepage" className="m-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Inputs */}
            <Card className="lg:col-span-7 p-6 rounded-3xl bg-card border-border/80 space-y-5 shadow-xs">
              <div className="border-b border-border/80 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground font-heading">
                    {isAr ? "محتوى البانر الرئيسي للصفحة الرئيسية" : "Homepage Hero Banner Content"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isAr ? `تعديل النصوص باللغة: ${activeLang.toUpperCase()}` : `Editing in: ${activeLang.toUpperCase()}`}
                  </p>
                </div>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                  homepage_hero
                </Badge>
              </div>

              {/* Badge */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? "الشارة العلوية (Hero Eyebrow Badge)" : "Hero Eyebrow Badge"}
                </Label>
                <Input
                  value={(heroForm.badge as any)?.[activeLang] || ""}
                  onChange={(e) =>
                    setHeroForm({
                      ...heroForm,
                      badge: { ...heroForm.badge, [activeLang]: e.target.value },
                    })
                  }
                  placeholder="e.g. Exclusive Luxury Journeys"
                  className="rounded-xl text-xs bg-background border-border"
                />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? "العنوان الرئيسي الفاخر (Hero Main Title)" : "Hero Main Title"}
                </Label>
                <Textarea
                  rows={2}
                  value={(heroForm.title as any)?.[activeLang] || ""}
                  onChange={(e) =>
                    setHeroForm({
                      ...heroForm,
                      title: { ...heroForm.title, [activeLang]: e.target.value },
                    })
                  }
                  placeholder="e.g. Discover Egypt, Turkey & Beyond in Unmatched Luxury"
                  className="rounded-xl text-xs bg-background border-border font-heading text-sm"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? "الوصف التسويقي الفرعي (Hero Subtitle)" : "Hero Subtitle"}
                </Label>
                <Textarea
                  rows={3}
                  value={(heroForm.subtitle as any)?.[activeLang] || ""}
                  onChange={(e) =>
                    setHeroForm({
                      ...heroForm,
                      subtitle: { ...heroForm.subtitle, [activeLang]: e.target.value },
                    })
                  }
                  placeholder="e.g. Handcrafted bespoke itineraries, 5-star private VIP transport..."
                  className="rounded-xl text-xs bg-background border-border"
                />
              </div>

              {/* CTA Button & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {isAr ? "نص زر الدعوة للإجراء (CTA Button Text)" : "CTA Button Text"}
                  </Label>
                  <Input
                    value={(heroForm.ctaText as any)?.[activeLang] || ""}
                    onChange={(e) =>
                      setHeroForm({
                        ...heroForm,
                        ctaText: { ...heroForm.ctaText, [activeLang]: e.target.value },
                      })
                    }
                    placeholder="e.g. Explore Luxury Tours"
                    className="rounded-xl text-xs bg-background border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {isAr ? "رابط التوجيه (CTA Link)" : "CTA Link"}
                  </Label>
                  <Input
                    value={heroForm.ctaLink}
                    onChange={(e) => setHeroForm({ ...heroForm, ctaLink: e.target.value })}
                    placeholder="/tours"
                    className="rounded-xl text-xs bg-background border-border font-mono"
                  />
                </div>
              </div>

              {/* Stats Counters */}
              <div className="space-y-2 pt-2 border-t border-border/80">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isAr ? "أرقام وإحصائيات الثقة (Trust Stats)" : "Trust Statistics Counters"}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1 bg-muted/40 p-2.5 rounded-xl border border-border">
                    <span className="text-[10px] text-muted-foreground font-bold">{isAr ? "سنوات الخبرة" : "Years Experience"}</span>
                    <Input
                      type="number"
                      value={heroForm.stats?.experienceYears || 15}
                      onChange={(e) =>
                        setHeroForm({
                          ...heroForm,
                          stats: { ...heroForm.stats, experienceYears: Number(e.target.value) },
                        })
                      }
                      className="h-8 text-xs font-bold rounded-lg font-mono"
                    />
                  </div>
                  <div className="space-y-1 bg-muted/40 p-2.5 rounded-xl border border-border">
                    <span className="text-[10px] text-muted-foreground font-bold">{isAr ? "المسافرون السعداء" : "Happy Travelers"}</span>
                    <Input
                      type="number"
                      value={heroForm.stats?.happyTravelers || 45000}
                      onChange={(e) =>
                        setHeroForm({
                          ...heroForm,
                          stats: { ...heroForm.stats, happyTravelers: Number(e.target.value) },
                        })
                      }
                      className="h-8 text-xs font-bold rounded-lg font-mono"
                    />
                  </div>
                  <div className="space-y-1 bg-muted/40 p-2.5 rounded-xl border border-border">
                    <span className="text-[10px] text-muted-foreground font-bold">{isAr ? "نسبة الرضا %" : "Satisfaction %"}</span>
                    <Input
                      type="number"
                      value={heroForm.stats?.satisfactionRate || 99}
                      onChange={(e) =>
                        setHeroForm({
                          ...heroForm,
                          stats: { ...heroForm.stats, satisfactionRate: Number(e.target.value) },
                        })
                      }
                      className="h-8 text-xs font-bold rounded-lg font-mono"
                    />
                  </div>
                  <div className="space-y-1 bg-muted/40 p-2.5 rounded-xl border border-border">
                    <span className="text-[10px] text-muted-foreground font-bold">{isAr ? "الوجهات السياحية" : "Destinations"}</span>
                    <Input
                      type="number"
                      value={heroForm.stats?.destinationsCount || 12}
                      onChange={(e) =>
                        setHeroForm({
                          ...heroForm,
                          stats: { ...heroForm.stats, destinationsCount: Number(e.target.value) },
                        })
                      }
                      className="h-8 text-xs font-bold rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <Button
                  onClick={handleSaveHomepage}
                  disabled={updateBlockMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs gap-2 px-6 h-9 cursor-pointer"
                >
                  {updateBlockMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{tCommon("saveChanges")}</span>
                </Button>
              </div>
            </Card>

            {/* Live Visual Preview */}
            <Card className="lg:col-span-5 p-6 rounded-3xl bg-card border-border/80 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground pb-3 border-b border-border/80">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? "معاينة حية للمظهر على الموقع" : "Live Frontend Hero Preview"}</span>
                </div>

                <div
                  className="mt-4 rounded-2xl p-6 text-white text-center relative overflow-hidden shadow-2xl"
                  style={{ background: "linear-gradient(135deg, #070D19 0%, #0D2040 100%)" }}
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-2">
                    {getLocalized(heroForm.badge, activeLang, "Exclusive Luxury Journeys")}
                  </span>
                  <h2 className="text-xl font-bold font-heading mb-3 text-white leading-tight">
                    {getLocalized(heroForm.title, activeLang, "Discover Egypt, Turkey & Beyond in Unmatched Luxury")}
                  </h2>
                  <p className="text-xs text-white/70 leading-relaxed max-w-md mx-auto mb-5">
                    {getLocalized(heroForm.subtitle, activeLang, "Handcrafted bespoke itineraries, 5-star private VIP transport...")}
                  </p>
                  <div className="inline-block bg-amber-500 text-slate-950 text-xs font-black px-5 py-2.5 rounded-full shadow-lg">
                    {getLocalized(heroForm.ctaText, activeLang, "Explore Luxury Tours")} →
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="block font-black text-amber-400 text-sm">{heroForm.stats?.experienceYears}+</span>
                      <span className="text-[9px] text-white/60 uppercase">{isAr ? "سنوات خبرة" : "Years Exp"}</span>
                    </div>
                    <div>
                      <span className="block font-black text-amber-400 text-sm">{(heroForm.stats?.happyTravelers || 0) / 1000}k+</span>
                      <span className="text-[9px] text-white/60 uppercase">{isAr ? "مسافر سعيد" : "Travelers"}</span>
                    </div>
                    <div>
                      <span className="block font-black text-amber-400 text-sm">{heroForm.stats?.satisfactionRate}%</span>
                      <span className="text-[9px] text-white/60 uppercase">{isAr ? "نسبة الرضا" : "Satisfaction"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                💡 {isAr ? "التعديلات ستنعكس فوراً على زوار الموقع بمجرد الضغط على حفظ." : "Changes are cached and synced live to frontend visitors upon saving."}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 2: FAQ & HELP CENTER BUILDER                     */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="faq" className="m-0 space-y-6">
          <Card className="p-6 rounded-3xl bg-card border-border/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground font-heading">
                  {isAr ? "استوديو الأسئلة الشائعة ومركز المساعدة" : "FAQ & Help Center Builder"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "إدارة وتعديل الأسئلة الشائعة والأجوبة بشكل مرئي وبجميع اللغات." : "Manage questions and answers visually with multi-language support."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleOpenFaqModal(null)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl gap-1.5 text-xs h-9"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? "إضافة سؤال جديد" : "Add FAQ Question"}</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveFaq}
                  disabled={updateBlockMutation.isPending}
                  className="rounded-xl gap-1.5 text-xs h-9 font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAr ? "حفظ التغييرات" : "Save FAQs"}</span>
                </Button>
              </div>
            </div>

            {/* Header Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border/60">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? "عنوان صفحة الأسئلة الشائعة" : "FAQ Page Heading"}
                </Label>
                <Input
                  value={(faqForm.heading as any)?.[activeLang] || ""}
                  onChange={(e) =>
                    setFaqForm({
                      ...faqForm,
                      heading: { ...faqForm.heading, [activeLang]: e.target.value },
                    })
                  }
                  placeholder="Frequently Asked Questions"
                  className="rounded-xl text-xs bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? "شارة مركز المساعدة" : "Help Center Eyebrow"}
                </Label>
                <Input
                  value={(faqForm.helpCenter as any)?.[activeLang] || ""}
                  onChange={(e) =>
                    setFaqForm({
                      ...faqForm,
                      helpCenter: { ...faqForm.helpCenter, [activeLang]: e.target.value },
                    })
                  }
                  placeholder="DUNAS TRAVEL HELP CENTER"
                  className="rounded-xl text-xs bg-background border-border"
                />
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isAr ? `قائمة الأسئلة الشائعة (${faqForm.items.length} سؤال)` : `FAQ Items (${faqForm.items.length} Questions)`}
              </Label>

              {faqForm.items.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border border-dashed border-border bg-muted/20 space-y-2">
                  <HelpCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs font-medium text-muted-foreground">
                    {isAr ? "لا توجد أسئلة شائعة مضافة حالياً. اضغط على استعادة المحتوى الفاخر أو أضف سؤالاً جديداً." : "No FAQ questions yet. Click 'Restore Curated Content' or add a new question."}
                  </p>
                </div>
              ) : (
                faqForm.items.map((item, idx) => {
                  const qText = getLocalized(item.question, activeLang, "Question text not provided");
                  const aText = getLocalized(item.answer, activeLang, "Answer text not provided");

                  return (
                    <Card
                      key={item.id || idx}
                      className="p-4 rounded-2xl bg-card border-border/80 shadow-xs hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                            {qText}
                          </h4>
                          <Badge variant="outline" className="text-[10px] font-mono capitalize">
                            {item.category || "general"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 ps-7">
                          {aText}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenFaqModal(idx)}
                          className="h-8 px-2.5 rounded-xl text-xs gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{tCommon("edit")}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteFaqItem(idx)}
                          className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 3: ABOUT US STORY & VISION                       */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="about" className="m-0 space-y-6">
          <Card className="p-6 rounded-3xl bg-card border-border/80 shadow-xs space-y-5">
            <div className="border-b border-border/80 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground font-heading">
                  {isAr ? "محتوى صفحة من نحن وقصة الشركة" : "About Us Page & Company Story"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isAr ? `تعديل قصة ورؤية ديوناس ترافيل باللغة: ${activeLang.toUpperCase()}` : `Editing Story & Vision in: ${activeLang.toUpperCase()}`}
                </p>
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                about_page
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? "العنوان الرئيسي (Page Title)" : "Page Main Title"}
                </Label>
                <Input
                  value={(aboutForm.title as any)?.[activeLang] || ""}
                  onChange={(e) =>
                    setAboutForm({
                      ...aboutForm,
                      title: { ...aboutForm.title, [activeLang]: e.target.value },
                    })
                  }
                  placeholder="e.g. Crafting Legendary Travel Experiences Since 2011"
                  className="rounded-xl text-xs bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? "الشعار الفرعي (Company Subtitle)" : "Company Subtitle"}
                </Label>
                <Input
                  value={(aboutForm.subtitle as any)?.[activeLang] || ""}
                  onChange={(e) =>
                    setAboutForm({
                      ...aboutForm,
                      subtitle: { ...aboutForm.subtitle, [activeLang]: e.target.value },
                    })
                  }
                  placeholder="Dunas Travel Luxury Expeditions"
                  className="rounded-xl text-xs bg-background border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isAr ? "قصة التأسيس والتراث (Our Story & Heritage)" : "Our Story & Heritage"}
              </Label>
              <Textarea
                rows={4}
                value={(aboutForm.story as any)?.[activeLang] || ""}
                onChange={(e) =>
                  setAboutForm({
                    ...aboutForm,
                    story: { ...aboutForm.story, [activeLang]: e.target.value },
                  })
                }
                placeholder="Founded with a vision to redefine luxury travel..."
                className="rounded-xl text-xs bg-background border-border leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isAr ? "رؤية الشركة ورسالتها (Company Vision)" : "Company Vision & Mission"}
              </Label>
              <Textarea
                rows={3}
                value={(aboutForm.vision as any)?.[activeLang] || ""}
                onChange={(e) =>
                  setAboutForm({
                    ...aboutForm,
                    vision: { ...aboutForm.vision, [activeLang]: e.target.value },
                  })
                }
                placeholder="To be the world’s most trusted luxury gateway to the Middle East..."
                className="rounded-xl text-xs bg-background border-border leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button
                onClick={handleSaveAbout}
                disabled={updateBlockMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs gap-2 px-6 h-9"
              >
                {updateBlockMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{tCommon("saveChanges")}</span>
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 4: GLOBAL SEO & SOCIAL SHARING                   */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="seo" className="m-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-7 p-6 rounded-3xl bg-card border-border/80 shadow-xs space-y-4">
              <div className="border-b border-border/80 pb-3">
                <h3 className="text-base font-bold text-foreground font-heading">
                  {isAr ? "إعدادات تهيئة محركات البحث (Global SEO)" : "Global SEO & Social Meta Settings"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "تحسين ظهور موقعك في نتائج بحث Google وبطاقات المشاركة على فيسبوك وتويتر." : "Optimize website ranking on Google search and social media previews."}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? "لاحقة عنوان الصفحات (Default Title Suffix)" : "Default Title Suffix"}
                </Label>
                <Input
                  value={seoForm.titleSuffix}
                  onChange={(e) => setSeoForm({ ...seoForm, titleSuffix: e.target.value })}
                  placeholder=" | Dunas Travel Luxury Expeditions"
                  className="rounded-xl text-xs bg-background border-border dir-ltr text-start"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? `الوصف لمحركات البحث (Meta Description) [${activeLang.toUpperCase()}]` : `Global Meta Description [${activeLang.toUpperCase()}]`}
                </Label>
                <Textarea
                  rows={3}
                  value={(seoForm.metaDescription as any)?.[activeLang] || ""}
                  onChange={(e) =>
                    setSeoForm({
                      ...seoForm,
                      metaDescription: { ...seoForm.metaDescription, [activeLang]: e.target.value },
                    })
                  }
                  placeholder="Discover Egypt, Turkey, and beyond with Dunas Travel. Bespoke luxury tours..."
                  className="rounded-xl text-xs bg-background border-border"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {isAr ? "رابط صورة المشاركة (OpenGraph Image URL)" : "OpenGraph Social Image URL"}
                  </Label>
                  <Input
                    value={seoForm.ogImageUrl}
                    onChange={(e) => setSeoForm({ ...seoForm, ogImageUrl: e.target.value })}
                    placeholder="/imgs/og-dunas-luxury.jpg"
                    className="rounded-xl text-xs bg-background border-border font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {isAr ? "حساب Twitter / X" : "Twitter Handle"}
                  </Label>
                  <Input
                    value={seoForm.twitterHandle}
                    onChange={(e) => setSeoForm({ ...seoForm, twitterHandle: e.target.value })}
                    placeholder="@DunasTravel"
                    className="rounded-xl text-xs bg-background border-border font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? "الكلمات المفتاحية (Target Meta Keywords)" : "Meta Keywords (Comma separated)"}
                </Label>
                <Input
                  value={seoForm.keywords}
                  onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })}
                  placeholder="luxury travel, egypt tours, turkey luxury tours"
                  className="rounded-xl text-xs bg-background border-border"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <Button
                  onClick={handleSaveSeo}
                  disabled={updateBlockMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs gap-2 px-6 h-9"
                >
                  {updateBlockMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{tCommon("saveChanges")}</span>
                </Button>
              </div>
            </Card>

            {/* Google Search Live Snippet Preview */}
            <Card className="lg:col-span-5 p-6 rounded-3xl bg-card border-border/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground pb-3 border-b border-border/80">
                <Search className="w-4 h-4 text-amber-500" />
                <span>{isAr ? "معاينة المظهر على محرك بحث Google" : "Live Google Search Snippet Preview"}</span>
              </div>

              <div className="bg-background p-4 rounded-2xl border border-border/80 space-y-1 text-start dir-ltr font-sans shadow-xs">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-[9px]">
                    D
                  </div>
                  <span className="text-[11px] truncate">https://dunastravel.com › tours</span>
                </div>
                <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  Dunas Travel Luxury Expeditions{seoForm.titleSuffix}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {getLocalized(seoForm.metaDescription, activeLang, "Discover Egypt, Turkey, and beyond with Dunas Travel. Bespoke luxury tours, 5-star private VIP transport, and unforgettable cultural journeys.")}
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 5: FOOTER & CONTACT INFO                         */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="footer" className="m-0 space-y-6">
          <Card className="p-6 rounded-3xl bg-card border-border/80 shadow-xs space-y-5">
            <div className="border-b border-border/80 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground font-heading">
                  {isAr ? "معلومات الفوتر والتواصل الرسمي" : "Footer, Legal & Official Contact Details"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "إدارة حقوق النشر، وسائل التواصل الاجتماعي، وأرقام الكونسيرج." : "Manage official copyright notices, hotline numbers, and VIP WhatsApp."}
                </p>
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                footer_info
              </Badge>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isAr ? "إشعار حقوق النشر (Copyright Notice)" : "Copyright Notice"}
              </Label>
              <Input
                value={(footerForm.copyright as any)?.[activeLang] || ""}
                onChange={(e) =>
                  setFooterForm({
                    ...footerForm,
                    copyright: { ...footerForm.copyright, [activeLang]: e.target.value },
                  })
                }
                placeholder="© 2026 Dunas Travel. All rights reserved. Registered Tourism License #1892."
                className="rounded-xl text-xs bg-background border-border"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? "البريد الإلكتروني الرسمي" : "Support Email"}
                </Label>
                <Input
                  value={footerForm.supportEmail}
                  onChange={(e) => setFooterForm({ ...footerForm, supportEmail: e.target.value })}
                  placeholder="concierge@dunastravel.com"
                  className="rounded-xl text-xs bg-background border-border font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? "واتساب VIP للكونسيرج" : "VIP Concierge WhatsApp"}
                </Label>
                <Input
                  value={footerForm.vipWhatsapp}
                  onChange={(e) => setFooterForm({ ...footerForm, vipWhatsapp: e.target.value })}
                  placeholder="+20 100 000 0000"
                  className="rounded-xl text-xs bg-background border-border font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? "الخط الساخن / الهاتف" : "Hotline / Telephone"}
                </Label>
                <Input
                  value={footerForm.phone}
                  onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })}
                  placeholder="+20 2 2700 0000"
                  className="rounded-xl text-xs bg-background border-border font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isAr ? "عنوان المقر الرئيسي" : "Headquarters Address"}
              </Label>
              <Input
                value={(footerForm.address as any)?.[activeLang] || ""}
                onChange={(e) =>
                  setFooterForm({
                    ...footerForm,
                    address: { ...footerForm.address, [activeLang]: e.target.value },
                  })
                }
                placeholder="Dunas Luxury Tower, El-Nile Corniche, Cairo, Egypt"
                className="rounded-xl text-xs bg-background border-border"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button
                onClick={handleSaveFooter}
                disabled={updateBlockMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs gap-2 px-6 h-9"
              >
                {updateBlockMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{tCommon("saveChanges")}</span>
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 6: ALL RAW CMS BLOCKS (DEVELOPER OVERVIEW)       */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="raw" className="m-0 space-y-6">
          <Card className="p-6 rounded-3xl bg-card border-border/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground font-heading">
                  {isAr ? "إجمالي الكتل المسجلة في النظام" : "All Registered Database Blocks"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "فحص حالة النشر والتحكم المباشر في بيانات الـ JSON لجميع الكتل." : "Direct JSON inspection for developer maintenance and backups."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blocks.map((block) => (
                <Card
                  key={block.key}
                  className="p-4 rounded-2xl bg-card border-border/80 shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                        {block.key}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          block.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"
                        }
                      >
                        {block.status || "PUBLISHED"} (v{block.version || 1})
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 font-mono text-[11px] bg-muted/30 p-2 rounded-xl">
                      {typeof block.content === "object"
                        ? JSON.stringify(block.content)
                        : String(block.content || "{}")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenRawEditor(block)}
                      className="flex-1 rounded-xl text-xs font-bold h-8"
                    >
                      <Code className="w-3.5 h-3.5 me-1.5 text-amber-500" />
                      <span>{isAr ? "تعديل الكود" : "Edit JSON"}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteBlockMutation.mutate(block.key)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      title="Delete block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 4. Edit FAQ Item Dialog */}
      <Dialog open={faqModalOpen} onOpenChange={setFaqModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border text-foreground p-6 rounded-3xl shadow-2xl">
          <DialogHeader className="border-b border-border/80 pb-3">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2 font-heading">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              <span>{editingFaqIndex !== null ? (isAr ? "تعديل السؤال" : "Edit FAQ Item") : (isAr ? "إضافة سؤال جديد" : "Add FAQ Item")}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isAr ? "تصنيف السؤال (Category)" : "Category"}
              </Label>
              <select
                value={faqDraft.category}
                onChange={(e) => setFaqDraft({ ...faqDraft, category: e.target.value })}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground"
              >
                <option value="general">General (عام)</option>
                <option value="bookings">Bookings & Reservations (الحجوزات)</option>
                <option value="transport">Transportation & Fleet (النقل والأسطول)</option>
                <option value="hotels">Hotels & Accommodation (الفنادق)</option>
                <option value="cancellations">Cancellations & Refunds (الإلغاء والاسترداد)</option>
                <option value="visas">Visas & Requirements (التأشيرات)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isAr ? `نص السؤال [${activeLang.toUpperCase()}]` : `Question Text [${activeLang.toUpperCase()}]`} *
              </Label>
              <Input
                required
                value={(faqDraft.question as any)?.[activeLang] || ""}
                onChange={(e) =>
                  setFaqDraft({
                    ...faqDraft,
                    question: { ...faqDraft.question, [activeLang]: e.target.value },
                  })
                }
                placeholder="e.g. How do I book a private tour?"
                className="rounded-xl text-xs bg-background border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isAr ? `نص الإجابة [${activeLang.toUpperCase()}]` : `Answer Text [${activeLang.toUpperCase()}]`} *
              </Label>
              <Textarea
                required
                rows={4}
                value={(faqDraft.answer as any)?.[activeLang] || ""}
                onChange={(e) =>
                  setFaqDraft({
                    ...faqDraft,
                    answer: { ...faqDraft.answer, [activeLang]: e.target.value },
                  })
                }
                placeholder="Enter detailed answer here..."
                className="rounded-xl text-xs bg-background border-border"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border/80 pt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFaqModalOpen(false)}
              className="rounded-xl text-xs font-semibold"
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSaveFaqItem}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
            >
              <span>{isAr ? "حفظ السؤال" : "Save Question"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Edit Raw JSON Dialog */}
      {rawEditingBlock && (
        <Dialog open={!!rawEditingBlock} onOpenChange={() => setRawEditingBlock(null)}>
          <DialogContent className="max-w-2xl bg-card border-border text-foreground p-6 rounded-3xl shadow-2xl">
            <DialogHeader className="border-b border-border/80 pb-3">
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2 font-heading font-mono">
                <Code className="w-5 h-5 text-amber-500" />
                <span>Edit {rawEditingBlock.key} (JSON)</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Direct raw JSON editing with schema verification.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 pt-1">
              <Textarea
                rows={12}
                value={rawJsonText}
                onChange={(e) => setRawJsonText(e.target.value)}
                className="font-mono text-xs bg-background border-border rounded-xl"
              />
            </div>

            <DialogFooter className="border-t border-border/80 pt-3 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRawEditingBlock(null)}
                className="rounded-xl text-xs font-semibold"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleSaveRawJson}
                disabled={updateBlockMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
              >
                {updateBlockMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{tCommon("saveChanges")}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
