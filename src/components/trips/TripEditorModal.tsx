"use client";

import React, { useState, useEffect, useMemo, memo } from 'react';
import { TripModel, LanguageCode, AccommodationItem, ItineraryItem } from '@/types/dunas-suite';
import { useDataContext } from '@/context/DataContext';
import { useQueryClient } from '@tanstack/react-query';
import { toursApi } from '@/features/tours/api/toursApi';
import { useLandingPages } from '@/features/tours/hooks/useLandingPages';
import { buildTripEditorPayload } from '@/features/tours/lib/tripEditorPayload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Globe2,
  Calendar,
  DollarSign,
  Hotel,
  Layers,
  CheckCircle2,
  XCircle,
  Star,
  Flame,
  Check,
  MapPin,
  ListOrdered
} from 'lucide-react';
import { toast } from 'sonner';

interface TripEditorModalProps {
  trip?: TripModel | null;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_TRIP: Partial<TripModel> = {
  title: '',
  subtitle: '',
  slug: '',
  destination: '',
  market: '',
  language: '',
  type: '',
  duration: '',
  departures: '',
  hotelCategory: '',
  rating: 0,
  reviewCount: 0,
  popular: false,
  familyFriendly: false,
  honeymoon: false,
  luxury: false,
  cultural: false,
  adventure: false,
  overview: '',
  highlights: [],
  included: [],
  excluded: [],
  images: [],
  hotels: '',
  accommodation: [],
  itinerary: [],
  translations: {
    ar: {},
    en: {},
    es: {},
    pt: {},
    it: {},
  },
};

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

export const TripEditorModal: React.FC<TripEditorModalProps> = memo(({
  trip,
  isOpen,
  onClose,
}) => {
  const { egyptPackages } = useDataContext();
  const { data: destinationData } = useLandingPages({ type: 'DESTINATION', status: 'PUBLISHED', isActive: true, limit: 50 });
  const destinations = useMemo(() => {
    const pages = Array.isArray(destinationData?.data) ? destinationData.data : [];
    return pages.map((page) => ({
      id: page.slug,
      nameAr: page.titleJsonb?.ar || page.titleJsonb?.en || page.slug,
      nameEn: page.titleJsonb?.en || page.slug,
      flag: '',
    }));
  }, [destinationData]);
  const [formData, setFormData] = useState<Partial<TripModel>>(DEFAULT_TRIP);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [translationLang, setTranslationLang] = useState<LanguageCode>('en');

  useEffect(() => {
    if (trip) {
      setFormData(JSON.parse(JSON.stringify(trip)));
    } else {
      setFormData(DEFAULT_TRIP);
    }
  }, [trip, isOpen]);

  const queryClient = useQueryClient();

  const handleChange = (field: keyof TripModel, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatSlug = (input: string): string => {
    if (!input) return '';
    return input
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\/[^\/]+/, '')
      .replace(/^\/?tours\//, '')
      .replace(/^\//, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSave = async () => {
    if (!formData.destination || (!trip && !formData.title)) {
      toast.error('يرجى ملء كافة البيانات الأساسية المطلوبة');
      return;
    }

    const price = Number(formData.price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Enter the actual base price before saving. No placeholder price will be applied.');
      return;
    }

    const rawSlug = formData.slug || formData.title || '';
    const cleanSlug = formatSlug(rawSlug) || `tour-${Date.now()}`;

    const backendData = buildTripEditorPayload({ ...formData, slug: cleanSlug }, !trip);

    // Persist through the Backend first. The catalogue is backend-authoritative;
    // failed requests must not be presented as locally saved changes.
    try {
      if (trip && trip.slug) {
        await toursApi.updateTour(trip.slug, backendData as any);
      } else {
        await toursApi.createTour(backendData as any);
      }
      queryClient.invalidateQueries();
      onClose();
      toast.success(trip ? 'تم تحديث الرحلة والترجمات وحفظها بنجاح!' : 'تمت إضافة الرحلة والترجمات وحفظها بنجاح!');
    } catch (err: any) {
      console.error('Backend API save failed:', err);
      toast.error(err?.message || 'تعذر حفظ الرحلة في قاعدة البيانات. لم يتم تطبيق أي تغيير.');
      return;
    }
  };

  // Accommodation helper
  const addAccommodationRow = () => {
    const rows = [...(formData.accommodation || [])];
    rows.push({ destination: '', nights: 1, regime: 'Bed & Breakfast' });
    handleChange('accommodation', rows);
  };

  const removeAccommodationRow = (index: number) => {
    const rows = [...(formData.accommodation || [])];
    rows.splice(index, 1);
    handleChange('accommodation', rows);
  };

  const updateAccommodationRow = (index: number, field: keyof AccommodationItem, val: any) => {
    const rows = [...(formData.accommodation || [])];
    rows[index] = { ...rows[index], [field]: val };
    handleChange('accommodation', rows);
  };

  // Itinerary helper
  const addLegacyItineraryDay = () => {
    const days = [...(formData.itinerary || [])];
    const nextDayNum = days.length + 1;
    days.push({ day: nextDayNum, title: `عنوان اليوم ${nextDayNum}`, description: '', meals: 'الإفطار' });
    handleChange('itinerary', days);
  };

  const addItineraryDay = () => {
    const days = [...(formData.itinerary || [])];
    days.push({ day: days.length + 1, title: '', description: '', meals: '' });
    handleChange('itinerary', days);
  };

  const removeItineraryDay = (index: number) => {
    const days = [...(formData.itinerary || [])];
    days.splice(index, 1);
    const reindexed = days.map((d, i) => ({ ...d, day: i + 1 }));
    handleChange('itinerary', reindexed);
  };

  const updateItineraryDay = (index: number, field: keyof ItineraryItem, val: any) => {
    const days = [...(formData.itinerary || [])];
    days[index] = { ...days[index], [field]: val };
    handleChange('itinerary', days);
  };

  // List helpers (Highlights, Included, Excluded, Images)
  const handleArrayChange = (field: 'highlights' | 'included' | 'excluded' | 'images', index: number, val: string) => {
    const arr = [...(formData[field] || [])];
    arr[index] = val;
    handleChange(field, arr);
  };

  const addArrayItem = (field: 'highlights' | 'included' | 'excluded' | 'images') => {
    const arr = [...(formData[field] || []), ''];
    handleChange(field, arr);
  };

  const removeArrayItem = (field: 'highlights' | 'included' | 'excluded' | 'images', index: number) => {
    const arr = [...(formData[field] || [])];
    arr.splice(index, 1);
    handleChange(field, arr);
  };

  // Translation helpers
  const handleTranslationChange = (lang: LanguageCode, key: string, val: any) => {
    const trans = { ...(formData.translations || {}) };
    if (!trans[lang]) trans[lang] = {};
    trans[lang] = { ...trans[lang], [key]: val };
    handleChange('translations', trans);
  };

  // Array translation helper for highlights, included, excluded
  const handleTranslationArrayChange = (lang: LanguageCode, field: 'highlights' | 'included' | 'excluded', index: number, val: string) => {
    const trans = { ...(formData.translations || {}) };
    if (!trans[lang]) trans[lang] = {};
    const arr = [...(trans[lang]?.[field] || [])];
    arr[index] = val;
    trans[lang] = { ...trans[lang], [field]: arr };
    handleChange('translations', trans);
  };

  const addTranslationArrayItem = (lang: LanguageCode, field: 'highlights' | 'included' | 'excluded') => {
    const trans = { ...(formData.translations || {}) };
    if (!trans[lang]) trans[lang] = {};
    const arr = [...(trans[lang]?.[field] || []), ''];
    trans[lang] = { ...trans[lang], [field]: arr };
    handleChange('translations', trans);
  };

  const removeTranslationArrayItem = (lang: LanguageCode, field: 'highlights' | 'included' | 'excluded', index: number) => {
    const trans = { ...(formData.translations || {}) };
    if (!trans[lang]) trans[lang] = {};
    const arr = [...(trans[lang]?.[field] || [])];
    arr.splice(index, 1);
    trans[lang] = { ...trans[lang], [field]: arr };
    handleChange('translations', trans);
  };

  // Itinerary translation helper
  const handleTranslationItineraryChange = (lang: LanguageCode, dayIndex: number, field: 'title' | 'description' | 'meals', val: string) => {
    const trans = { ...(formData.translations || {}) };
    if (!trans[lang]) trans[lang] = {};
    const itin = [...(trans[lang]?.itinerary || [])];
    if (!itin[dayIndex]) itin[dayIndex] = { day: dayIndex + 1, title: '', description: '', meals: '' };
    itin[dayIndex] = { ...itin[dayIndex], [field]: val };
    trans[lang] = { ...trans[lang], itinerary: itin };
    handleChange('translations', trans);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-card border border-border/80 rounded-3xl shadow-2xl p-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="p-5 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold font-heading text-foreground">
                {trip ? 'تعديل الرحلة والترجمات الـ 5 (Edit Trip & 5-Lang Translations)' : 'إضافة رحلة جديدة (Add New Trip)'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-medium mt-0.5">
                تحرير كامل الخصائص الفنية، الأيام، الفنادق والترجمات باللغات الخمس (Key Highlights, Itinerary, What's Included & Excluded).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 6 Tabs Container with Fixed Top Tabs Bar */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="border-b border-border/60 bg-muted/40 px-6 pt-2 overflow-x-auto shrink-0 z-20">
            <TabsList className="bg-transparent h-11 gap-1 p-0">
              <TabsTrigger value="basic" className="rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xs cursor-pointer">
                <DollarSign className="w-3.5 h-3.5 me-1.5" /> 1. الأساسية والتسعير
              </TabsTrigger>
              <TabsTrigger value="overview" className="rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xs cursor-pointer">
                <Hotel className="w-3.5 h-3.5 me-1.5" /> 2. الوصف والإقامة
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xs cursor-pointer">
                <Calendar className="w-3.5 h-3.5 me-1.5" /> 3. البرنامج اليومي
              </TabsTrigger>
              <TabsTrigger value="inclusions" className="rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xs cursor-pointer">
                <CheckCircle2 className="w-3.5 h-3.5 me-1.5" /> 4. المشتملات والمميزات
              </TabsTrigger>
              <TabsTrigger value="gallery" className="rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xs cursor-pointer">
                <ImageIcon className="w-3.5 h-3.5 me-1.5" /> 5. معرض الصور
              </TabsTrigger>
              <TabsTrigger value="translations" className="rounded-xl px-3.5 py-2 text-xs font-black data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-xs cursor-pointer">
                <Globe2 className="w-3.5 h-3.5 me-1.5" /> 6. الترجمات 🌐
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            {/* TAB 1: BASIC & PRICING */}
            <TabsContent value="basic" className="space-y-5 m-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">العنوان الرئيسي (Title) *</label>
                  <Input
                    value={formData.title || ''}
                    onChange={e => handleChange('title', e.target.value)}
                    placeholder="مثال: القاهرة السريعة والأهرامات 4 أيام"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">العنوان الفرعي الترويجي (Subtitle)</label>
                  <Input
                    value={formData.subtitle || ''}
                    onChange={e => handleChange('subtitle', e.target.value)}
                    placeholder="مثال: اكتشف عجائب الأهرامات"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">الرابط الفرعي (Slug)</label>
                  <Input
                    value={formData.slug || ''}
                    onChange={e => handleChange('slug', e.target.value)}
                    onBlur={e => handleChange('slug', formatSlug(e.target.value))}
                    placeholder="cairo-express-4d"
                    className="rounded-xl font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">الوجهة السياحية الـ 8 (Destination) *</label>
                  <select
                    value={formData.destination || 'egypt'}
                    onChange={e => handleChange('destination', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-semibold"
                  >
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.flag} {d.nameAr} ({d.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">السوق المستهدف (Market)</label>
                  <Input
                    value={formData.market || 'Global'}
                    onChange={e => handleChange('market', e.target.value)}
                    placeholder="Global, Brasil, España..."
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Egypt Destination Placement Selector */}
              {formData.destination === 'egypt' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-500" />
                      إدراج وموقع الرحلة في واجهة مصر (Egypt Destination Placement):
                    </span>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                      🇪🇬 مصر
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Main Tours */}
                    <button
                      type="button"
                      onClick={() => handleChange('packageId', undefined)}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                        !formData.packageId
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-bold'
                          : 'bg-card text-foreground border-border hover:border-amber-500/40'
                      }`}
                    >
                      <span className="text-2xl">🏛️</span>
                      <div>
                        <span className="text-xs font-black block">إضافة للرحلات الرئيسية لمصر</span>
                        <span className={`text-[10px] block mt-0.5 ${!formData.packageId ? 'text-slate-950 font-semibold' : 'text-muted-foreground'}`}>
                          رحلة سياحية أساسية (أهرامات، الأقصر، الغردقة) بدون ربط بباكج معين.
                        </span>
                      </div>
                    </button>

                    {/* Option 2: Special Packages */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.packageId) {
                          handleChange('packageId', egyptPackages[0]?.id || 'egypt-classic');
                        }
                      }}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                        formData.packageId
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-bold'
                          : 'bg-card text-foreground border-border hover:border-amber-500/40'
                      }`}
                    >
                      <span className="text-2xl">👑</span>
                      <div>
                        <span className="text-xs font-black block">إضافة لإحدى باكدجات مصر الـ 5</span>
                        <span className={`text-[10px] block mt-0.5 ${formData.packageId ? 'text-slate-950 font-semibold' : 'text-muted-foreground'}`}>
                          ربط الرحلة ببرنامج فاخر مخصص (كلاسيكي، شهر عسل، نايل كروز، إلخ).
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Sub Package Dropdown Selector if Option 2 active */}
                  {formData.packageId && (
                    <div className="pt-2 border-t border-amber-500/20 space-y-1.5">
                      <label className="text-xs font-black text-foreground block">
                        اختر الباكج المخصص للرحلة (Egypt Package Assignment):
                      </label>
                      <select
                        value={formData.packageId}
                        onChange={e => handleChange('packageId', e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-amber-500/50 bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      >
                        {egyptPackages.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.icon} {pkg.titleAr} ({pkg.badge || pkg.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">السعر بالدولار ($) *</label>
                  <Input
                    type="number"
                    value={formData.price || 0}
                    onChange={e => handleChange('price', parseFloat(e.target.value))}
                    className="rounded-xl font-bold text-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">المدة (Duration)</label>
                  <Input
                    value={formData.duration || ''}
                    onChange={e => handleChange('duration', e.target.value)}
                    placeholder="4 Days / 3 Nights"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">مواعيد المغادرة (Departures)</label>
                  <Input
                    value={formData.departures || ''}
                    onChange={e => handleChange('departures', e.target.value)}
                    placeholder="Daily / Diário"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">درجة الفندق (Hotel Category)</label>
                  <Input
                    value={formData.hotelCategory || ''}
                    onChange={e => handleChange('hotelCategory', e.target.value)}
                    placeholder="5-Star Luxury"
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Badges & Category Checkboxes */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
                <span className="text-xs font-bold text-foreground block">وسوم وتصنيفات الرحلة (Category Tags):</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <Checkbox
                      checked={formData.popular}
                      onCheckedChange={v => handleChange('popular', !!v)}
                    />
                    <span className="text-rose-500 flex items-center gap-1 font-bold">
                      <Flame className="w-3.5 h-3.5" /> 🔥 الأكثر إقبالاً (Popular)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <Checkbox
                      checked={formData.familyFriendly}
                      onCheckedChange={v => handleChange('familyFriendly', !!v)}
                    />
                    <span>👨‍👩‍👧‍👦 مناسبة للعائلات</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <Checkbox
                      checked={formData.honeymoon}
                      onCheckedChange={v => handleChange('honeymoon', !!v)}
                    />
                    <span>💍 مناسبة لشهر العسل</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <Checkbox
                      checked={formData.luxury}
                      onCheckedChange={v => handleChange('luxury', !!v)}
                    />
                    <span>⭐ رحلة فاخرة VIP</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <Checkbox
                      checked={formData.cultural}
                      onCheckedChange={v => handleChange('cultural', !!v)}
                    />
                    <span>🏛️ جولة ثقافية وتاريخية</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <Checkbox
                      checked={formData.adventure}
                      onCheckedChange={v => handleChange('adventure', !!v)}
                    />
                    <span>🐪 مغامرات وصحراء</span>
                  </label>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: OVERVIEW & ACCOMMODATION */}
            <TabsContent value="overview" className="space-y-5 m-0">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">الوصف التفصيلي للبرنامج (Overview)</label>
                <Textarea
                  value={formData.overview || ''}
                  onChange={e => handleChange('overview', e.target.value)}
                  rows={4}
                  placeholder="اكتب وصفاً شاملاً للرحلة..."
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">أسماء الفنادق والملاحظات (Hotels Notes)</label>
                <Input
                  value={formData.hotels || ''}
                  onChange={e => handleChange('hotels', e.target.value)}
                  placeholder="مثال: فندق ماريوت مينا هاوس / باخرة سونستا نايل كروز"
                  className="rounded-xl"
                />
              </div>

              {/* Accommodation Breakdown Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">توزيع الليالي والإقامة حسب المدينة (Accommodation Breakdown):</label>
                  <Button size="sm" variant="outline" onClick={addAccommodationRow} className="rounded-xl text-xs gap-1">
                    <Plus className="w-3.5 h-3.5" /> إضافة مدينة
                  </Button>
                </div>

                <div className="space-y-2">
                  {(formData.accommodation || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/50">
                      <Input
                        value={item.destination}
                        onChange={e => updateAccommodationRow(idx, 'destination', e.target.value)}
                        placeholder="المدينة (Cairo, Luxor...)"
                        className="rounded-lg text-xs"
                      />
                      <Input
                        type="number"
                        value={item.nights}
                        onChange={e => updateAccommodationRow(idx, 'nights', parseInt(e.target.value))}
                        placeholder="الليالي"
                        className="rounded-lg text-xs w-24"
                      />
                      <Input
                        value={item.regime}
                        onChange={e => updateAccommodationRow(idx, 'regime', e.target.value)}
                        placeholder="نظام الوجبات (Bed & Breakfast...)"
                        className="rounded-lg text-xs"
                      />
                      <Button size="icon-sm" variant="ghost" onClick={() => removeAccommodationRow(idx)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: ITINERARY */}
            <TabsContent value="itinerary" className="space-y-4 m-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">جدول برنامج اليوم بيوم (Day-by-Day Itinerary):</span>
                <Button size="sm" variant="outline" onClick={addItineraryDay} className="rounded-xl text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" /> إضافة يوم جديد
                </Button>
              </div>

              <div className="space-y-3">
                {(formData.itinerary || []).map((day, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-card border border-border/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 font-bold text-xs flex items-center justify-center border border-amber-500/20">
                          {day.day}
                        </span>
                        <Input
                          value={day.title}
                          onChange={e => updateItineraryDay(idx, 'title', e.target.value)}
                          placeholder="عنوان اليوم"
                          className="rounded-xl text-xs font-bold h-8"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={day.meals}
                          onChange={e => updateItineraryDay(idx, 'meals', e.target.value)}
                          placeholder="الوجبة (الإفطار، الغداء...)"
                          className="rounded-xl text-xs h-8 w-36"
                        />
                        <Button size="icon-sm" variant="ghost" onClick={() => removeItineraryDay(idx)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={day.description}
                      onChange={e => updateItineraryDay(idx, 'description', e.target.value)}
                      rows={2}
                      placeholder="تفاصيل الأنشطة والزيارات لهذا اليوم..."
                      className="rounded-xl text-xs"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 4: INCLUSIONS & HIGHLIGHTS */}
            <TabsContent value="inclusions" className="space-y-5 m-0">
              {/* Highlights */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">أبرز المعالم والمميزات (Highlights):</label>
                  <Button size="sm" variant="ghost" onClick={() => addArrayItem('highlights')} className="text-xs gap-1">
                    <Plus className="w-3.5 h-3.5" /> إضافة ميزة
                  </Button>
                </div>
                {(formData.highlights || []).map((hl, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={hl}
                      onChange={e => handleArrayChange('highlights', idx, e.target.value)}
                      placeholder="ميزة جديدة..."
                      className="rounded-xl text-xs"
                    />
                    <Button size="icon-sm" variant="ghost" onClick={() => removeArrayItem('highlights', idx)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Included (Emerald) */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> الخدمات المشمولة (Included):
                  </label>
                  <Button size="sm" variant="ghost" onClick={() => addArrayItem('included')} className="text-xs text-emerald-500 gap-1">
                    <Plus className="w-3.5 h-3.5" /> إضافة مشمول
                  </Button>
                </div>
                {(formData.included || []).map((inc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={inc}
                      onChange={e => handleArrayChange('included', idx, e.target.value)}
                      placeholder="خدمة مشمولة..."
                      className="rounded-xl text-xs border-emerald-500/30"
                    />
                    <Button size="icon-sm" variant="ghost" onClick={() => removeArrayItem('included', idx)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Excluded (Rose Red) */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-500 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> غير المشمول في الرحلة (Excluded):
                  </label>
                  <Button size="sm" variant="ghost" onClick={() => addArrayItem('excluded')} className="text-xs text-rose-500 gap-1">
                    <Plus className="w-3.5 h-3.5" /> إضافة غير مشمول
                  </Button>
                </div>
                {(formData.excluded || []).map((exc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={exc}
                      onChange={e => handleArrayChange('excluded', idx, e.target.value)}
                      placeholder="غير مشمول..."
                      className="rounded-xl text-xs border-rose-500/30"
                    />
                    <Button size="icon-sm" variant="ghost" onClick={() => removeArrayItem('excluded', idx)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 5: GALLERY */}
            <TabsContent value="gallery" className="space-y-4 m-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">روابط ومعرض الصور (Images Gallery):</span>
                <Button size="sm" variant="outline" onClick={() => addArrayItem('images')} className="rounded-xl text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" /> إضافة رابط صورة
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(formData.images || []).map((imgUrl, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={imgUrl}
                        onChange={e => handleArrayChange('images', idx, e.target.value)}
                        placeholder="https://..."
                        className="rounded-xl text-xs font-mono"
                      />
                      <Button size="icon-sm" variant="ghost" onClick={() => removeArrayItem('images', idx)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {imgUrl && (
                      <div className="h-32 rounded-xl overflow-hidden bg-slate-900 relative">
                        <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 6: 5-LANGUAGE TRANSLATIONS (Key Highlights, Itinerary, What's Included & Excluded) */}
            <TabsContent value="translations" className="space-y-6 m-0">
              {/* Minimal 5-Language Switcher Bar */}
              <div className="flex items-center justify-start gap-1.5 overflow-x-auto pb-2 border-b border-border/60">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setTranslationLang(l.code)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      translationLang === l.code
                        ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {l.flag} {l.label} ({l.code.toUpperCase()})
                  </button>
                ))}
              </div>

              {/* 1. Basic Info Translation Section */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-4 shadow-xs">
                <span className="text-xs font-black text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  1. ترجمة البيانات والوصف العام ({translationLang.toUpperCase()})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">العنوان المترجم ({translationLang.toUpperCase()})</label>
                    <Input
                      value={formData.translations?.[translationLang]?.title || ''}
                      onChange={e => handleTranslationChange(translationLang, 'title', e.target.value)}
                      placeholder={`Title in ${translationLang.toUpperCase()}...`}
                      className="rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">العنوان الفرعي المترجم ({translationLang.toUpperCase()})</label>
                    <Input
                      value={formData.translations?.[translationLang]?.subtitle || ''}
                      onChange={e => handleTranslationChange(translationLang, 'subtitle', e.target.value)}
                      placeholder={`Subtitle in ${translationLang.toUpperCase()}...`}
                      className="rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">الوصف التفصيلي المترجم ({translationLang.toUpperCase()})</label>
                  <Textarea
                    value={formData.translations?.[translationLang]?.overview || ''}
                    onChange={e => handleTranslationChange(translationLang, 'overview', e.target.value)}
                    rows={3}
                    placeholder={`Overview & Description in ${translationLang.toUpperCase()}...`}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* 2. Key Highlights Translation Section */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-black text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-500" />
                    2. ترجمة مميزات ومحطات الرحلة (Key Highlights in {translationLang.toUpperCase()})
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addTranslationArrayItem(translationLang, 'highlights')}
                    className="text-xs text-amber-500 gap-1 font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة ميزة مترجمة
                  </Button>
                </div>

                <div className="space-y-2">
                  {(formData.translations?.[translationLang]?.highlights || ['']).map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={hl}
                        onChange={e => handleTranslationArrayChange(translationLang, 'highlights', idx, e.target.value)}
                        placeholder={`Highlight #${idx + 1} in ${translationLang.toUpperCase()}...`}
                        className="rounded-xl text-xs font-semibold"
                      />
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => removeTranslationArrayItem(translationLang, 'highlights', idx)}
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Itinerary Day-by-Day Translation Section */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-black text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
                    <ListOrdered className="w-4 h-4" />
                    3. ترجمة جدول برنامج الرحلة اليومي (Day-by-Day Itinerary in {translationLang.toUpperCase()})
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    ({(formData.itinerary || []).length} أيام محددة)
                  </span>
                </div>

                <div className="space-y-3">
                  {(formData.itinerary || []).map((day, idx) => {
                    const itinTrans = (formData.translations?.[translationLang]?.itinerary?.[idx] || {}) as Record<string, string>;
                    return (
                      <div key={idx} className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 font-black text-xs flex items-center justify-center border border-amber-500/30 shrink-0">
                              {day.day}
                            </span>
                            <Input
                              value={itinTrans.title || ''}
                              onChange={e => handleTranslationItineraryChange(translationLang, idx, 'title', e.target.value)}
                              placeholder={`Day ${day.day} Title in ${translationLang.toUpperCase()} (e.g. ${day.title})...`}
                              className="rounded-xl text-xs font-bold h-8"
                            />
                          </div>
                          <Input
                            value={itinTrans.meals || ''}
                            onChange={e => handleTranslationItineraryChange(translationLang, idx, 'meals', e.target.value)}
                            placeholder={`Meals (${translationLang.toUpperCase()})...`}
                            className="rounded-xl text-xs h-8 w-36 shrink-0"
                          />
                        </div>
                        <Textarea
                          value={itinTrans.description || ''}
                          onChange={e => handleTranslationItineraryChange(translationLang, idx, 'description', e.target.value)}
                          rows={2}
                          placeholder={`Day ${day.day} Activities & Details in ${translationLang.toUpperCase()}...`}
                          className="rounded-xl text-xs font-medium"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. What's Included & Excluded Translation Section */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-4 shadow-xs">
                <span className="text-xs font-black text-amber-500 uppercase tracking-wide flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  4. ترجمة المشمولات والمستثنيات (What's Included & Excluded in {translationLang.toUpperCase()})
                </span>

                {/* Included Translation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ترجمة الخدمات المشمولة (Included in {translationLang.toUpperCase()}):
                    </label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addTranslationArrayItem(translationLang, 'included')}
                      className="text-xs text-emerald-500 gap-1 font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> إضافة مشمول مترجم
                    </Button>
                  </div>
                  {(formData.translations?.[translationLang]?.included || ['']).map((inc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={inc}
                        onChange={e => handleTranslationArrayChange(translationLang, 'included', idx, e.target.value)}
                        placeholder={`Included item #${idx + 1} in ${translationLang.toUpperCase()}...`}
                        className="rounded-xl text-xs border-emerald-500/30 font-semibold"
                      />
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => removeTranslationArrayItem(translationLang, 'included', idx)}
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Excluded Translation */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-rose-500 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> ترجمة الخدمات غير المشمولة (Excluded in {translationLang.toUpperCase()}):
                    </label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addTranslationArrayItem(translationLang, 'excluded')}
                      className="text-xs text-rose-500 gap-1 font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> إضافة مستثنى مترجم
                    </Button>
                  </div>
                  {(formData.translations?.[translationLang]?.excluded || ['']).map((exc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={exc}
                        onChange={e => handleTranslationArrayChange(translationLang, 'excluded', idx, e.target.value)}
                        placeholder={`Excluded item #${idx + 1} in ${translationLang.toUpperCase()}...`}
                        className="rounded-xl text-xs border-rose-500/30 font-semibold"
                      />
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => removeTranslationArrayItem(translationLang, 'excluded', idx)}
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-bold">
            إلغاء
          </Button>
          <Button onClick={handleSave} className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 text-xs shadow-md shadow-amber-500/20 cursor-pointer">
            حفظ الرحلة والترجمات الـ 5 الآن 💾
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

TripEditorModal.displayName = 'TripEditorModal';
