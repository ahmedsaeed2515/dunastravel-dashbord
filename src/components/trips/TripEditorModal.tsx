"use client";

import React, { useState, useEffect, useMemo, memo } from 'react';
import { TripModel, LanguageCode, AccommodationItem, ItineraryItem, TranslationDict } from '@/types/dunas-suite';
import { useDataContext } from '@/context/DataContext';
import { useQueryClient } from '@tanstack/react-query';
import { toursApi } from '@/features/tours/api/toursApi';
import { useLandingPages } from '@/features/tours/hooks/useLandingPages';
import { buildTripEditorPayload } from '@/features/tours/lib/tripEditorPayload';
import {
  ALL_LOCALES,
  TARGET_LOCALES,
  autoTranslateFullTrip,
  translateToAllLocales,
  clearLocaleContent,
} from '@/lib/translationService';
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
import { Badge } from '@/components/ui/badge';
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
  ListOrdered,
  Loader2,
  Wand2,
  Languages,
  RotateCcw,
  RefreshCw,
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
  destination: 'egypt',
  market: 'Global',
  language: 'ar',
  type: 'Classic',
  duration: '5 أيام / 4 ليالي',
  departures: 'Daily / Diário',
  hotelCategory: '5-Star Luxury',
  rating: 5,
  reviewCount: 0,
  popular: false,
  familyFriendly: true,
  honeymoon: false,
  luxury: true,
  cultural: true,
  adventure: false,
  overview: '',
  highlights: [],
  included: [],
  excluded: [],
  images: [],
  hotels: '5-Star Luxury Hotels',
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

export const TripEditorModal: React.FC<TripEditorModalProps> = memo(({
  trip,
  isOpen,
  onClose,
}) => {
  const { egyptPackages } = useDataContext();
  const { data: destinationData } = useLandingPages({ type: 'DESTINATION', status: 'PUBLISHED', isActive: true, limit: 50 });
  const destinations = useMemo(() => {
    const pages = Array.isArray(destinationData?.data) ? destinationData.data : [];
    if (pages.length > 0) {
      return pages.map((page) => ({
        id: page.slug,
        nameAr: page.titleJsonb?.ar || page.titleJsonb?.en || page.slug,
        nameEn: page.titleJsonb?.en || page.slug,
        flag: '',
      }));
    }
    return [
      { id: 'egypt', nameAr: 'مصر', nameEn: 'Egypt', flag: '🇪🇬' },
      { id: 'turkey', nameAr: 'تركيا', nameEn: 'Turkey', flag: '🇹🇷' },
      { id: 'jordan', nameAr: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴' },
      { id: 'morocco', nameAr: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦' },
      { id: 'dubai', nameAr: 'دبي والإمارات', nameEn: 'Dubai & UAE', flag: '🇦🇪' },
      { id: 'tunisia', nameAr: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳' },
      { id: 'greece', nameAr: 'اليونان', nameEn: 'Greece', flag: '🇬🇷' },
      { id: 'multi-country', nameAr: 'رحلات متعددة الوجهات', nameEn: 'Multi-Country Tours', flag: '🌍' },
    ];
  }, [destinationData]);

  const [formData, setFormData] = useState<Partial<TripModel>>(DEFAULT_TRIP);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [activeLang, setActiveLang] = useState<LanguageCode>('ar');
  const [selectedTargetLocales, setSelectedTargetLocales] = useState<LanguageCode[]>(['en', 'es', 'pt', 'it']);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateStatus, setTranslateStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (trip) {
      const cloned = JSON.parse(JSON.stringify(trip));
      if (!cloned.translations) {
        cloned.translations = { ar: {}, en: {}, es: {}, pt: {}, it: {} };
      }
      setFormData(cloned);
    } else {
      setFormData(DEFAULT_TRIP);
    }
  }, [trip, isOpen]);

  const queryClient = useQueryClient();

  const handleChange = (field: keyof TripModel, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getLocalizedText = (field: 'title' | 'subtitle' | 'overview' | 'duration' | 'departures'): string => {
    if (activeLang === 'ar') {
      return (formData[field] as string) || (formData.translations?.ar?.[field] as string) || '';
    }
    return (formData.translations?.[activeLang]?.[field] as string) || '';
  };

  const setLocalizedText = (field: 'title' | 'subtitle' | 'overview' | 'duration' | 'departures', value: string) => {
    setFormData(prev => {
      const trans = { ...(prev.translations || {}) };
      if (!trans[activeLang]) trans[activeLang] = {};
      trans[activeLang] = { ...trans[activeLang], [field]: value };

      if (activeLang === 'ar') {
        return { ...prev, [field]: value, translations: trans };
      }
      return { ...prev, translations: trans };
    });
  };

  const getLocalizedList = (field: 'highlights' | 'included' | 'excluded'): string[] => {
    if (activeLang === 'ar') {
      return (formData[field] as string[]) || (formData.translations?.ar?.[field] as string[]) || [];
    }
    return (formData.translations?.[activeLang]?.[field] as string[]) || [];
  };

  const setLocalizedList = (field: 'highlights' | 'included' | 'excluded', items: string[]) => {
    setFormData(prev => {
      const trans = { ...(prev.translations || {}) };
      if (!trans[activeLang]) trans[activeLang] = {};
      trans[activeLang] = { ...trans[activeLang], [field]: items };

      if (activeLang === 'ar') {
        return { ...prev, [field]: items, translations: trans };
      }
      return { ...prev, translations: trans };
    });
  };

  const handleArrayItemChange = (field: 'highlights' | 'included' | 'excluded', index: number, value: string) => {
    const list = [...getLocalizedList(field)];
    list[index] = value;
    setLocalizedList(field, list);
  };

  const addArrayItem = (field: 'highlights' | 'included' | 'excluded') => {
    const list = [...getLocalizedList(field), ''];
    setLocalizedList(field, list);
  };

  const removeArrayItem = (field: 'highlights' | 'included' | 'excluded', index: number) => {
    const list = [...getLocalizedList(field)];
    list.splice(index, 1);
    setLocalizedList(field, list);
  };

  const getLocalizedItinerary = (): ItineraryItem[] => {
    if (activeLang === 'ar') {
      return formData.itinerary || [];
    }
    const currentDays = formData.itinerary || [];
    const transItin = formData.translations?.[activeLang]?.itinerary || [];
    return currentDays.map((baseDay, idx) => {
      const transDay = transItin[idx];
      return {
        day: idx + 1,
        title: transDay?.title ?? '',
        description: transDay?.description ?? '',
        meals: transDay?.meals ?? '',
      };
    });
  };

  const updateItineraryField = (idx: number, field: keyof ItineraryItem, value: any) => {
    setFormData(prev => {
      const baseItin = [...(prev.itinerary || [])];
      if (!baseItin[idx]) {
        baseItin[idx] = { day: idx + 1, title: '', description: '', meals: '' };
      }

      if (activeLang === 'ar') {
        baseItin[idx] = { ...baseItin[idx], [field]: value };
      }

      const trans = { ...(prev.translations || {}) };
      if (!trans[activeLang]) trans[activeLang] = {};
      const transItin = [...(trans[activeLang]?.itinerary || [])];
      if (!transItin[idx]) {
        transItin[idx] = { day: idx + 1, title: '', description: '', meals: '' };
      }
      transItin[idx] = { ...transItin[idx], [field]: value };
      trans[activeLang] = { ...trans[activeLang], itinerary: transItin };

      return {
        ...prev,
        itinerary: baseItin,
        translations: trans,
      };
    });
  };

  const addItineraryDay = () => {
    const baseItin = [...(formData.itinerary || [])];
    const newDayNum = baseItin.length + 1;
    const newDay: ItineraryItem = {
      day: newDayNum,
      title: activeLang === 'ar' ? `اليوم ${newDayNum}` : `Day ${newDayNum}`,
      description: '',
      meals: activeLang === 'ar' ? 'الإفطار' : 'Breakfast',
    };
    baseItin.push(newDay);

    setFormData(prev => {
      const trans = { ...(prev.translations || {}) };
      ALL_LOCALES.forEach(loc => {
        if (!trans[loc.code]) trans[loc.code] = {};
        const it = [...(trans[loc.code]?.itinerary || [])];
        it.push({
          day: newDayNum,
          title: loc.code === 'ar' ? `اليوم ${newDayNum}` : `Day ${newDayNum}`,
          description: '',
          meals: loc.code === 'ar' ? 'الإفطار' : 'Breakfast',
        });
        trans[loc.code] = { ...trans[loc.code], itinerary: it };
      });
      return {
        ...prev,
        itinerary: baseItin,
        translations: trans,
      };
    });
  };

  const removeItineraryDay = (idx: number) => {
    setFormData(prev => {
      const baseItin = [...(prev.itinerary || [])];
      baseItin.splice(idx, 1);
      const reindexed = baseItin.map((d, i) => ({ ...d, day: i + 1 }));

      const trans = { ...(prev.translations || {}) };
      ALL_LOCALES.forEach(loc => {
        const currentLoc = trans[loc.code];
        if (currentLoc && Array.isArray(currentLoc.itinerary)) {
          const it = [...currentLoc.itinerary];
          it.splice(idx, 1);
          trans[loc.code] = {
            ...currentLoc,
            itinerary: it.map((d, i) => ({ ...d, day: i + 1 })),
          };
        }
      });

      return {
        ...prev,
        itinerary: reindexed,
        translations: trans,
      };
    });
  };

  const addAccommodationRow = () => {
    const rows = [...(formData.accommodation || [])];
    rows.push({ destination: 'Cairo', nights: 3, regime: 'Bed & Breakfast' });
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

  // 5-Language Completion Stats Calculation
  const localeStats = useMemo(() => {
    return ALL_LOCALES.map(loc => {
      let filled = 0;
      const total = 5; // title, overview, duration, itinerary, included

      if (loc.code === 'ar') {
        if (formData.title?.trim()) filled++;
        if (formData.overview?.trim()) filled++;
        if (formData.duration?.trim()) filled++;
        if ((formData.itinerary || []).length > 0) filled++;
        if ((formData.included || []).length > 0) filled++;
      } else {
        const trans = formData.translations?.[loc.code] || {};
        if (trans.title?.trim()) filled++;
        if (trans.overview?.trim()) filled++;
        if (trans.duration?.trim()) filled++;
        if ((trans.itinerary || []).length > 0) filled++;
        if ((trans.included || []).length > 0) filled++;
      }

      const percent = Math.round((filled / total) * 100);
      return {
        code: loc.code,
        name: loc.name,
        flag: loc.flag,
        percent,
        complete: percent === 100,
      };
    });
  }, [formData]);

  // Target locale checkbox toggle
  const toggleTargetLocale = (code: LanguageCode) => {
    setSelectedTargetLocales(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const selectAllTargetLocales = () => {
    setSelectedTargetLocales(['en', 'es', 'pt', 'it']);
  };

  const deselectAllTargetLocales = () => {
    setSelectedTargetLocales([]);
  };

  // Clear single language
  const handleClearSingleLanguage = (lang: LanguageCode) => {
    const locInfo = ALL_LOCALES.find(l => l.code === lang);
    const name = locInfo?.name || lang;
    if (!window.confirm(`هل أنت متأكد من حذف وتفريغ كافة بيانات لغة (${name})؟ ستتمكن بعد ذلك من إعادة كتابتها أو ترجمتها من جديد من المحتوى العربي.`)) {
      return;
    }
    const updated = clearLocaleContent(formData as TripModel, [lang]);
    setFormData(updated);
    toast.success(`تم تفريغ وحذف محتوى لغة (${name}) بنجاح.`);
  };

  // Clear selected languages
  const handleClearSelectedLanguages = () => {
    if (selectedTargetLocales.length === 0) {
      toast.error('يرجى تحديد لغة واحدة على الأقل من القائمة لتفريغ محتواها.');
      return;
    }
    const names = selectedTargetLocales.map(c => ALL_LOCALES.find(l => l.code === c)?.name || c).join(', ');
    if (!window.confirm(`هل أنت متأكد من تفريغ كافة بيانات اللغات المحددة (${names}) بالكامل؟`)) {
      return;
    }
    const updated = clearLocaleContent(formData as TripModel, selectedTargetLocales);
    setFormData(updated);
    toast.success(`تم تفريغ وحذف محتوى اللغات المحددة (${names}) بنجاح.`);
  };

  // Clear all non-Arabic translations
  const handleClearAllNonArabic = () => {
    if (!window.confirm('هل أنت متأكد من تفريغ كافة الترجمات غير العربية (EN, ES, PT, IT) للبدء بترجمة نظيفة جديدة؟')) {
      return;
    }
    const updated = clearLocaleContent(formData as TripModel, ['en', 'es', 'pt', 'it']);
    setFormData(updated);
    toast.success('تم تفريغ كافة الترجمات الأجنبية الأربعة بنجاح.');
  };

  // Auto-translate selected or all target languages
  const handleAutoTranslate = async (targetLocalesToUse?: LanguageCode[]) => {
    const sourceTitle = formData.title || formData.translations?.ar?.title || '';
    if (!sourceTitle.trim()) {
      toast.error('يرجى إدخال العنوان الرئيسي للرحلة بالعربي أولاً لتتمكن من الترجمة.');
      return;
    }

    const actualTargets = (targetLocalesToUse || selectedTargetLocales).filter(l => l !== 'ar');
    if (actualTargets.length === 0) {
      toast.error('يرجى تحديد اللغات المستهدفة للترجمة (EN, ES, PT, IT).');
      return;
    }

    setIsTranslating(true);
    const targetNames = actualTargets.map(c => ALL_LOCALES.find(l => l.code === c)?.name).join(', ');
    setTranslateStatus(`جاري الترجمة لـ (${targetNames})...`);

    try {
      const translated = await autoTranslateFullTrip(
        formData as TripModel,
        'ar',
        actualTargets,
        (step) => setTranslateStatus(step)
      );
      setFormData(translated);
      toast.success(`✨ تم توليد وترجمة كامل بيانات الرحلة بنجاح لـ: ${targetNames}!`);
    } catch (err: any) {
      console.error('Translation error:', err);
      toast.error('حدث خطأ أثناء الترجمة التلقائية: ' + (err.message || 'يرجى المحاولة لاحقاً'));
    } finally {
      setIsTranslating(false);
      setTranslateStatus('');
    }
  };

  const handleTranslateSingleField = async (field: 'title' | 'subtitle' | 'overview' | 'duration' | 'departures') => {
    const val = getLocalizedText(field);
    if (!val.trim()) {
      toast.error('يرجى كتابة نص في هذا الحقل أولاً.');
      return;
    }
    setIsTranslating(true);
    try {
      const translations = await translateToAllLocales(val, activeLang, TARGET_LOCALES);
      setFormData(prev => {
        const trans = { ...(prev.translations || {}) };
        ALL_LOCALES.forEach(loc => {
          if (!trans[loc.code]) trans[loc.code] = {};
          trans[loc.code] = { ...trans[loc.code], [field]: translations[loc.code] };
        });
        return {
          ...prev,
          ...(activeLang === 'ar' ? { [field]: val } : {}),
          translations: trans,
        };
      });
      const fieldNames: Record<string, string> = {
        title: 'العنوان',
        subtitle: 'العنوان الفرعي',
        overview: 'الوصف',
        duration: 'المدة',
        departures: 'المغادرات',
      };
      toast.success(`تمت ترجمة ${fieldNames[field] || field} للغات الـ 5!`);
    } catch (e: any) {
      toast.error('تعذر ترجمة الحقل.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.destination || (!trip && !formData.title)) {
      toast.error('يرجى ملء كافة البيانات الأساسية المطلوبة');
      return;
    }

    const price = Number(formData.price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error('يرجى إدخال سعر صحيح للرحلة قبل الحفظ.');
      return;
    }

    const rawSlug = formData.slug || formData.title || '';
    const cleanSlug = formatSlug(rawSlug) || `tour-${Date.now()}`;

    setIsSaving(true);
    try {
      const backendData = buildTripEditorPayload({ ...formData, slug: cleanSlug }, !trip);

      if (trip && trip.slug) {
        await toursApi.updateTour(trip.slug, backendData as any);
      } else {
        await toursApi.createTour(backendData as any);
      }
      queryClient.invalidateQueries();
      onClose();
      toast.success(trip ? 'تم تحديث الرحلة والترجمات الـ 5 وحفظها بنجاح!' : 'تمت إضافة الرحلة والترجمات وحفظها بنجاح!');
    } catch (err: any) {
      console.error('Backend API save failed:', err);
      toast.error(err?.message || 'تعذر حفظ الرحلة في قاعدة البيانات.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[96vw] max-h-[94vh] flex flex-col bg-card border border-border/80 rounded-3xl shadow-2xl p-0 overflow-hidden">
        {/* Top Header */}
        <DialogHeader className="p-5 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                <Sparkles className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
                  <span>{trip ? 'تعديل الرحلة والترجمات الـ 5 الفورية' : 'إضافة رحلة جديدة فاخرة'}</span>
                  <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[11px] font-black">
                    5 Languages AI Ready
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-semibold mt-0.5">
                  تحرير كامل الخصائص الفنية، الأيام، الفنادق، وترجمة المحتوى للغات الخمس بضغطة زر واحدة.
                </DialogDescription>
              </div>
            </div>

            {/* AI Auto-Translate Header Button */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                type="button"
                onClick={() => handleAutoTranslate(['en', 'es', 'pt', 'it'])}
                disabled={isTranslating}
                className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs gap-2 px-5 py-2.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{translateStatus || 'جاري الترجمة للغات الـ 5...'}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 stroke-[2.5]" />
                    <span>✨ ترجمة الرحلة كاملة للـ 4 لغات من العربي</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Active Language Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-border/40">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs font-bold text-muted-foreground me-1 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-amber-500" /> اللغة النشطة للتعديل:
              </span>
              {ALL_LOCALES.map(loc => {
                const stat = localeStats.find(s => s.code === loc.code);
                const isActive = activeLang === loc.code;
                return (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => setActiveLang(loc.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm shadow-amber-500/20 scale-102'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <span>{loc.flag}</span>
                    <span>{loc.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : stat?.complete ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      {stat?.percent}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions for Current Language */}
            <div className="flex items-center gap-2">
              {activeLang !== 'ar' ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAutoTranslate([activeLang])}
                    disabled={isTranslating}
                    className="text-xs text-amber-500 hover:bg-amber-500/10 gap-1 font-bold h-8 rounded-xl cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> ترجمة هذه اللغة ({activeLang.toUpperCase()})
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleClearSingleLanguage(activeLang)}
                    className="text-xs text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 gap-1 font-bold h-8 rounded-xl cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> تفريغ محتوى ({activeLang.toUpperCase()})
                  </Button>
                </>
              ) : (
                <div className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <span>🇸🇦</span>
                  <span>اللغة المصدر الأساسية (اكتب بالعربي ثم ترجم)</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* 6 Tabs Container */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="border-b border-border/60 bg-muted/40 px-6 pt-2 overflow-x-auto shrink-0 z-20">
            <TabsList className="bg-transparent h-11 gap-1 p-0">
              <TabsTrigger value="basic" className="rounded-xl px-3.5 py-2 text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xs cursor-pointer">
                <DollarSign className="w-3.5 h-3.5 me-1.5" /> 1. الأساسية والتسعير
              </TabsTrigger>
              <TabsTrigger value="overview" className="rounded-xl px-3.5 py-2 text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xs cursor-pointer">
                <Hotel className="w-3.5 h-3.5 me-1.5" /> 2. الوصف والإقامة
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="rounded-xl px-3.5 py-2 text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xs cursor-pointer">
                <Calendar className="w-3.5 h-3.5 me-1.5" /> 3. البرنامج اليومي ({formData.itinerary?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="inclusions" className="rounded-xl px-3.5 py-2 text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xs cursor-pointer">
                <CheckCircle2 className="w-3.5 h-3.5 me-1.5" /> 4. المشتملات والمميزات
              </TabsTrigger>
              <TabsTrigger value="gallery" className="rounded-xl px-3.5 py-2 text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xs cursor-pointer">
                <ImageIcon className="w-3.5 h-3.5 me-1.5" /> 5. معرض الصور ({formData.images?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="matrix" className="rounded-xl px-3.5 py-2 text-xs font-black data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-xs cursor-pointer">
                <Globe2 className="w-3.5 h-3.5 me-1.5" /> 6. جدول الترجمات الـ 5 🌐
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            {/* TAB 1: BASIC & PRICING */}
            <TabsContent value="basic" className="space-y-5 m-0">
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                  <span className="text-xs font-black text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
                    <span>{ALL_LOCALES.find(l => l.code === activeLang)?.flag}</span>
                    عناوين الرحلة باللغة ({ALL_LOCALES.find(l => l.code === activeLang)?.name}):
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTranslateSingleField('title')}
                    disabled={isTranslating}
                    className="text-xs text-amber-500 hover:bg-amber-500/10 gap-1 font-bold cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> ترجمة العنوان للـ 5 لغات
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1">
                      العنوان الرئيسي (Title) *
                      <span className="text-[10px] text-amber-500 font-extrabold uppercase">({activeLang})</span>
                    </label>
                    <Input
                      value={getLocalizedText('title')}
                      onChange={e => setLocalizedText('title', e.target.value)}
                      placeholder={activeLang === 'ar' ? 'مثال: القاهرة السريعة والأهرامات 4 أيام' : 'e.g. Cairo Express & Pyramids 4 Days'}
                      className="rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1">
                      العنوان الفرعي الترويجي (Subtitle)
                      <span className="text-[10px] text-amber-500 font-extrabold uppercase">({activeLang})</span>
                    </label>
                    <Input
                      value={getLocalizedText('subtitle')}
                      onChange={e => setLocalizedText('subtitle', e.target.value)}
                      placeholder={activeLang === 'ar' ? 'مثال: اكتشف عجائب الأهرامات وأسرار الفراعنة' : 'e.g. Discover the Wonders of the Pyramids'}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Core Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">الرابط الفرعي (Slug / Route Identifier)</label>
                  <Input
                    value={formData.slug || ''}
                    onChange={e => handleChange('slug', e.target.value)}
                    onBlur={e => handleChange('slug', formatSlug(e.target.value))}
                    placeholder="cairo-express-4d"
                    className="rounded-xl font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">الوجهة السياحية (Destination) *</label>
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
                  <label className="text-xs font-bold text-foreground">السوق المستهدف (Target Market)</label>
                  <Input
                    value={formData.market || 'Global'}
                    onChange={e => handleChange('market', e.target.value)}
                    placeholder="Global, Brasil, España, Italia..."
                    className="rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Egypt Destination Placement Selector */}
              {formData.destination === 'egypt' && (
                <div className="p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
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

                  {formData.packageId && (
                    <div className="pt-2 border-t border-amber-500/20 space-y-1.5">
                      <label className="text-xs font-bold text-foreground">اختر الباكدج المخصص:</label>
                      <select
                        value={formData.packageId}
                        onChange={e => handleChange('packageId', e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-amber-500/40 bg-card text-sm font-bold text-amber-500"
                      >
                        {egyptPackages.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.icon} {pkg.titleAr} ({pkg.badge || pkg.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing, Duration & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">السعر الأساسي بالدولار ($) *</label>
                  <Input
                    type="number"
                    value={formData.price ?? ''}
                    onChange={e => handleChange('price', e.target.value)}
                    placeholder="1250"
                    className="rounded-xl font-bold font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">المدة (Duration)</label>
                    <button
                      type="button"
                      onClick={() => handleTranslateSingleField('duration')}
                      className="text-[10px] text-amber-500 hover:underline font-bold"
                    >
                      ترجمة
                    </button>
                  </div>
                  <Input
                    value={getLocalizedText('duration')}
                    onChange={e => setLocalizedText('duration', e.target.value)}
                    placeholder={activeLang === 'ar' ? '5 أيام / 4 ليالي' : '5 Days / 4 Nights'}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">مواعيد المغادرة (Departures)</label>
                    <button
                      type="button"
                      onClick={() => handleTranslateSingleField('departures')}
                      className="text-[10px] text-amber-500 hover:underline font-bold"
                    >
                      ترجمة
                    </button>
                  </div>
                  <Input
                    value={getLocalizedText('departures')}
                    onChange={e => setLocalizedText('departures', e.target.value)}
                    placeholder={activeLang === 'ar' ? 'مغادرات يومية منتظمة' : 'Daily Departures'}
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

            {/* TAB 2: OVERVIEW & LODGING */}
            <TabsContent value="overview" className="space-y-5 m-0">
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                  <span className="text-xs font-black text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
                    <span>{ALL_LOCALES.find(l => l.code === activeLang)?.flag}</span>
                    نبذة ووصف الرحلة باللغة ({ALL_LOCALES.find(l => l.code === activeLang)?.name}):
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTranslateSingleField('overview')}
                    disabled={isTranslating}
                    className="text-xs text-amber-500 hover:bg-amber-500/10 gap-1 font-bold cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> ترجمة الوصف للـ 5 لغات
                  </Button>
                </div>

                <Textarea
                  value={getLocalizedText('overview')}
                  onChange={e => setLocalizedText('overview', e.target.value)}
                  rows={6}
                  placeholder={activeLang === 'ar' ? 'اكتب نبذة تسويقية وتفصيلية عن الرحلة، الأماكن التي سيتم زيارتها، والتجربة الفريدة...' : 'Write an attractive detailed overview of this luxury tour itinerary...'}
                  className="rounded-xl leading-relaxed text-sm font-medium"
                />
              </div>

              {/* Accommodation Items */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <Hotel className="w-4 h-4 text-amber-500" />
                    توزيع الإقامة والفنادق (Accommodation Plan):
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={addAccommodationRow}
                    className="text-xs text-amber-500 gap-1 font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة فندق / إقامة
                  </Button>
                </div>

                <div className="space-y-3">
                  {(formData.accommodation || []).map((acc, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-muted/30 border border-border/60 items-center">
                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground block mb-1">المدينة / الوجهة</label>
                        <Input
                          value={acc.destination || ''}
                          onChange={e => updateAccommodationRow(idx, 'destination', e.target.value)}
                          placeholder="Cairo, Luxor, Aswan..."
                          className="rounded-xl text-xs font-bold h-9"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground block mb-1">عدد الليالي</label>
                        <Input
                          type="number"
                          value={acc.nights ?? 1}
                          onChange={e => updateAccommodationRow(idx, 'nights', Number(e.target.value))}
                          className="rounded-xl text-xs font-bold h-9 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground block mb-1">نظام الإقامة</label>
                        <Input
                          value={acc.regime || ''}
                          onChange={e => updateAccommodationRow(idx, 'regime', e.target.value)}
                          placeholder="Bed & Breakfast, Full Board..."
                          className="rounded-xl text-xs font-semibold h-9"
                        />
                      </div>
                      <div className="flex justify-end items-end pt-5">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => removeAccommodationRow(idx)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(formData.accommodation || []).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">لا توجد خطة إقامة مضافة حتى الآن. اضغط "إضافة فندق / إقامة" بالأعلى.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: DAILY ITINERARY */}
            <TabsContent value="itinerary" className="space-y-5 m-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                <div>
                  <span className="text-xs font-black text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
                    <span>{ALL_LOCALES.find(l => l.code === activeLang)?.flag}</span>
                    برنامج الرحلة اليومي يوماً بيوم باللغة ({ALL_LOCALES.find(l => l.code === activeLang)?.name}):
                  </span>
                  <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                    إجمالي الأيام: {formData.itinerary?.length || 0} أيام محددة
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addItineraryDay}
                    className="text-xs gap-1.5 font-bold rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-500" /> إضافة يوم جديد +
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {getLocalizedItinerary().map((day, idx) => (
                  <div key={idx} className="p-4.5 rounded-2xl bg-card border border-border/80 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2.5">
                      <div className="flex items-center gap-2.5 flex-1">
                        <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 font-black text-xs flex items-center justify-center border border-amber-500/30 shrink-0">
                          {idx + 1}
                        </span>
                        <Input
                          value={day.title || ''}
                          onChange={e => updateItineraryField(idx, 'title', e.target.value)}
                          placeholder={activeLang === 'ar' ? `عنوان اليوم ${idx + 1} (مثال: الوصول إلى القاهرة وزيارة الأهرامات)` : `Day ${idx + 1} Title`}
                          className="rounded-xl font-bold text-sm h-10"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Input
                          value={day.meals || ''}
                          onChange={e => updateItineraryField(idx, 'meals', e.target.value)}
                          placeholder={activeLang === 'ar' ? 'الوجبات: إفطار، غداء' : 'Meals: Breakfast, Lunch'}
                          className="rounded-xl text-xs h-10 w-44 font-semibold"
                        />
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => removeItineraryDay(idx)}
                          className="text-destructive hover:bg-destructive/10 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      value={day.description || ''}
                      onChange={e => updateItineraryField(idx, 'description', e.target.value)}
                      rows={3}
                      placeholder={activeLang === 'ar' ? `تفاصيل أنشطة وجدول اليوم ${idx + 1}...` : `Activities and schedule for Day ${idx + 1}...`}
                      className="rounded-xl text-xs leading-relaxed font-medium"
                    />
                  </div>
                ))}

                {(formData.itinerary || []).length === 0 && (
                  <div className="p-10 text-center rounded-2xl border border-dashed border-border bg-muted/20 space-y-3">
                    <Calendar className="w-10 h-10 mx-auto text-muted-foreground/40" />
                    <p className="text-xs font-bold text-muted-foreground">لا يوجد أيام مضافة في البرنامج حتى الآن.</p>
                    <Button size="sm" onClick={addItineraryDay} className="rounded-xl bg-amber-500 text-slate-950 font-black text-xs">
                      إضافة اليوم الأول +
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 4: INCLUSIONS & HIGHLIGHTS */}
            <TabsContent value="inclusions" className="space-y-5 m-0">
              {/* Highlights */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-black text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    أبرز مميزات الرحلة (Highlights in {ALL_LOCALES.find(l => l.code === activeLang)?.name}):
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addArrayItem('highlights')}
                    className="text-xs text-amber-500 gap-1 font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة ميزة
                  </Button>
                </div>

                <div className="space-y-2">
                  {getLocalizedList('highlights').map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={hl}
                        onChange={e => handleArrayItemChange('highlights', idx, e.target.value)}
                        placeholder={activeLang === 'ar' ? `ميزة رقم ${idx + 1}...` : `Highlight #${idx + 1}...`}
                        className="rounded-xl text-xs font-semibold"
                      />
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => removeArrayItem('highlights', idx)}
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {getLocalizedList('highlights').length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">لا توجد مميزات مضافة. اضغط "إضافة ميزة" بالأعلى.</p>
                  )}
                </div>
              </div>

              {/* What's Included */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-black text-emerald-500 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    الخدمات المشمولة (What's Included in {ALL_LOCALES.find(l => l.code === activeLang)?.name}):
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addArrayItem('included')}
                    className="text-xs text-emerald-500 gap-1 font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة خدمة مشمولة
                  </Button>
                </div>

                <div className="space-y-2">
                  {getLocalizedList('included').map((inc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={inc}
                        onChange={e => handleArrayItemChange('included', idx, e.target.value)}
                        placeholder={activeLang === 'ar' ? `خدمة مشمولة (فنادق 5 نجوم، استقبال بالمطار...)` : `Included item #${idx + 1}...`}
                        className="rounded-xl text-xs font-semibold border-emerald-500/30"
                      />
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => removeArrayItem('included', idx)}
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {getLocalizedList('included').length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">لا توجد خدمات مشمولة مضافة.</p>
                  )}
                </div>
              </div>

              {/* What's Excluded */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-black text-rose-500 uppercase tracking-wide flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    الخدمات المستثناة (What's Excluded in {ALL_LOCALES.find(l => l.code === activeLang)?.name}):
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addArrayItem('excluded')}
                    className="text-xs text-rose-500 gap-1 font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة خدمة مستثناة
                  </Button>
                </div>

                <div className="space-y-2">
                  {getLocalizedList('excluded').map((exc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={exc}
                        onChange={e => handleArrayItemChange('excluded', idx, e.target.value)}
                        placeholder={activeLang === 'ar' ? `خدمة غير مشمولة (تذاكر الطيران الدولي، المصاريف الشخصية...)` : `Excluded item #${idx + 1}...`}
                        className="rounded-xl text-xs font-semibold border-rose-500/30"
                      />
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => removeArrayItem('excluded', idx)}
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {getLocalizedList('excluded').length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">لا توجد خدمات مستثناة مضافة.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: PHOTO GALLERY */}
            <TabsContent value="gallery" className="space-y-5 m-0">
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    روابط صور المعرض (Photo Gallery & Hero Image):
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const imgs = [...(formData.images || []), ''];
                      handleChange('images', imgs);
                    }}
                    className="text-xs text-amber-500 gap-1 font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة صورة +
                  </Button>
                </div>

                <div className="space-y-3">
                  {(formData.images || []).map((imgUrl, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/60">
                      <div className="w-16 h-12 rounded-xl bg-slate-950 overflow-hidden shrink-0 border">
                        {imgUrl ? (
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">No URL</div>
                        )}
                      </div>
                      <Input
                        value={imgUrl}
                        onChange={e => {
                          const imgs = [...(formData.images || [])];
                          imgs[idx] = e.target.value;
                          handleChange('images', imgs);
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="rounded-xl text-xs font-mono flex-1"
                      />
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${
                        idx === 0 ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-muted text-muted-foreground'
                      }`}>
                        {idx === 0 ? 'الصورة الرئيسية (Hero)' : `صورة #${idx + 1}`}
                      </span>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => {
                          const imgs = [...(formData.images || [])];
                          imgs.splice(idx, 1);
                          handleChange('images', imgs);
                        }}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {(formData.images || []).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-6">لا توجد صور مضافة حتى الآن.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 6: 5-LANG TRANSLATIONS MATRIX & MANAGEMENT */}
            <TabsContent value="matrix" className="space-y-5 m-0">
              {/* Management & Selection Control Box */}
              <div className="p-5 rounded-3xl bg-card border border-amber-500/30 space-y-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/40 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                      <Languages className="w-4 h-4 text-amber-500" />
                      إدارة وحذف الترجمات وتحديد اللغات المستهدفة (Translation Management)
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                      حدد لغة أو عدة لغات لحذف بياناتها بالكامل وإعادة توليدها من النص العربي، أو ترجمة لغات محددة بضغطة زر.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={selectAllTargetLocales}
                      className="text-xs font-bold rounded-xl h-8"
                    >
                      تحديد كل اللغات (4)
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={deselectAllTargetLocales}
                      className="text-xs text-muted-foreground font-bold rounded-xl h-8"
                    >
                      إلغاء التحديد
                    </Button>
                  </div>
                </div>

                {/* Target Language Selection Checkboxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TARGET_LOCALES.map(locCode => {
                    const loc = ALL_LOCALES.find(l => l.code === locCode)!;
                    const isSelected = selectedTargetLocales.includes(locCode);
                    const stat = localeStats.find(s => s.code === locCode);
                    return (
                      <div
                        key={locCode}
                        onClick={() => toggleTargetLocale(locCode)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-xs ring-1 ring-amber-500/40'
                            : 'bg-muted/20 border-border hover:border-border/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleTargetLocale(locCode)}
                          />
                          <div>
                            <span className="text-xs font-black flex items-center gap-1">
                              <span>{loc.flag}</span> {loc.name} ({loc.code.toUpperCase()})
                            </span>
                            <span className="text-[10px] text-muted-foreground block font-bold">
                              مكتمل بنسبة {stat?.percent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Batch Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAutoTranslate(selectedTargetLocales)}
                      disabled={isTranslating || selectedTargetLocales.length === 0}
                      className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs gap-1.5 px-4 h-9 shadow-xs cursor-pointer"
                    >
                      {isTranslating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{translateStatus || 'جاري الترجمة...'}</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>✨ ترجمة اللغات المحددة ({selectedTargetLocales.length}) من العربي</span>
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAutoTranslate(['en', 'es', 'pt', 'it'])}
                      disabled={isTranslating}
                      className="rounded-xl text-xs font-black gap-1.5 h-9 border-amber-500/40 hover:bg-amber-500/10 text-amber-500 cursor-pointer"
                    >
                      <Globe2 className="w-3.5 h-3.5" />
                      <span>✨ ترجمة كافة اللغات (الكل) 🌐</span>
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleClearSelectedLanguages}
                      disabled={selectedTargetLocales.length === 0}
                      className="rounded-xl text-xs font-black gap-1.5 h-9 border-rose-500/40 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف محتوى اللغات المحددة ({selectedTargetLocales.length})</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleClearAllNonArabic}
                      className="rounded-xl text-xs font-black gap-1.5 h-9 text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>تفريغ كافة الترجمات غير العربية</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* 5-Language Status & Details Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                  مصفوفة بطاقات اللغات الخمس (5-Language Overview & Quick Edit):
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
                  {ALL_LOCALES.map(loc => {
                    const trans = loc.code === 'ar'
                      ? {
                          title: formData.title,
                          subtitle: formData.subtitle,
                          overview: formData.overview,
                          duration: formData.duration,
                          departures: formData.departures,
                          highlights: formData.highlights,
                          included: formData.included,
                          excluded: formData.excluded,
                          itinerary: formData.itinerary,
                        }
                      : formData.translations?.[loc.code] || {};

                    const isCurrent = activeLang === loc.code;
                    const stat = localeStats.find(s => s.code === loc.code);

                    return (
                      <div
                        key={loc.code}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                          isCurrent
                            ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                            : 'bg-muted/20 border-border hover:border-amber-500/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-black flex items-center gap-1.5">
                              <span>{loc.flag}</span> {loc.name}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                              stat?.complete ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                            }`}>
                              {stat?.percent}%
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-muted-foreground block">العنوان:</span>
                              <p className="font-bold text-foreground line-clamp-1">{trans.title || '— بدون عنوان'}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-muted-foreground block">الوصف:</span>
                              <p className="text-muted-foreground text-[11px] line-clamp-2">{trans.overview || '— بدون وصف'}</p>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground pt-1 border-t border-border/40">
                              <span>الأيام: {trans.itinerary?.length || 0}</span>
                              <span>المميزات: {trans.highlights?.length || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-border/40">
                          <Button
                            size="sm"
                            variant={isCurrent ? 'default' : 'outline'}
                            onClick={() => setActiveLang(loc.code)}
                            className={`w-full text-xs font-black rounded-xl h-8 cursor-pointer ${
                              isCurrent ? 'bg-amber-500 text-slate-950' : ''
                            }`}
                          >
                            {isCurrent ? 'اللغة النشطة حالياً ✓' : 'تعديل هذه اللغة'}
                          </Button>

                          {loc.code !== 'ar' && (
                            <div className="grid grid-cols-2 gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAutoTranslate([loc.code])}
                                disabled={isTranslating}
                                className="text-[10px] text-amber-500 hover:bg-amber-500/10 font-bold h-7 rounded-lg cursor-pointer px-1"
                              >
                                <Wand2 className="w-3 h-3 me-1" /> ترجمة
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleClearSingleLanguage(loc.code)}
                                className="text-[10px] text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 font-bold h-7 rounded-lg cursor-pointer px-1"
                              >
                                <Trash2 className="w-3 h-3 me-1" /> تفريغ
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Fixed Footer */}
        <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-bold w-full sm:w-auto">
            إلغاء
          </Button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-7 py-2.5 text-xs shadow-md shadow-amber-500/20 cursor-pointer w-full sm:w-auto gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري حفظ الرحلة والترجمات...</span>
                </>
              ) : (
                <>
                  <span>حفظ الرحلة والترجمات الـ 5 الآن 💾</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

TripEditorModal.displayName = 'TripEditorModal';
