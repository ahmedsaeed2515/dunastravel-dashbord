"use client";

import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { TripModel, LanguageCode, AccommodationItem, ItineraryItem, TranslationDict, SeasonPricingRuleItem } from '@/types/dunas-suite';
import { useDataContext } from '@/context/DataContext';
import { useQueryClient } from '@tanstack/react-query';
import { toursApi } from '@/features/tours/api/toursApi';
import { useLandingPages } from '@/features/tours/hooks/useLandingPages';
import { useHotels, useSeasons } from '@/features/hotels/hooks/useHotels';
import { buildTripEditorPayload, tourToTripModel } from '@/features/tours/lib/tripEditorPayload';
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
  Crown,
  ArrowUp,
  ArrowDown,
  Building,
  BedDouble,
  ShieldCheck,
  Lock,
  Info,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { MediaPickerModal } from '@/components/media/MediaPickerModal';
import {
  slugify,
  isValidSlug,
  generateTourSlug,
  generateTripHotelSlug,
  generateRoomSlug,
} from '@/lib/slug-util';

const PRESET_CITIES: { dbKey: string; nameAr: string; nameEn: string; coords: [number, number] }[] = [
  { dbKey: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo', coords: [30.0444, 31.2357] },
  { dbKey: 'giza', nameAr: 'الجيزة', nameEn: 'Giza', coords: [29.9792, 31.1342] },
  { dbKey: 'pyramids', nameAr: 'الأهرامات', nameEn: 'Pyramids', coords: [29.9792, 31.1342] },
  { dbKey: 'sphinx', nameAr: 'أبو الهول', nameEn: 'Sphinx', coords: [29.9753, 31.1376] },
  { dbKey: 'grand egyptian museum', nameAr: 'المتحف المصري الكبير', nameEn: 'Grand Egyptian Museum', coords: [29.9947, 31.1172] },
  { dbKey: 'egyptian museum', nameAr: 'المتحف المصري بالتحرير', nameEn: 'Egyptian Museum Tahrir', coords: [30.0478, 31.2336] },
  { dbKey: 'khan el khalili', nameAr: 'خان الخليلي', nameEn: 'Khan El-Khalili', coords: [30.0475, 31.2622] },
  { dbKey: 'citadel of saladin', nameAr: 'قلعة صلاح الدين', nameEn: 'Citadel of Saladin', coords: [30.0299, 31.2611] },
  { dbKey: 'saqqara', nameAr: 'سقارة', nameEn: 'Saqqara', coords: [29.8713, 31.2164] },
  { dbKey: 'dahshur', nameAr: 'دهشور', nameEn: 'Dahshur', coords: [29.8086, 31.2061] },
  { dbKey: 'luxor', nameAr: 'الأقصر', nameEn: 'Luxor', coords: [25.6872, 32.6396] },
  { dbKey: 'karnak', nameAr: 'معبد الكرنك', nameEn: 'Karnak Temple', coords: [25.7188, 32.6573] },
  { dbKey: 'luxor temple', nameAr: 'معبد الأقصر', nameEn: 'Luxor Temple', coords: [25.6996, 32.6392] },
  { dbKey: 'valley of the kings', nameAr: 'وادي الملوك', nameEn: 'Valley of the Kings', coords: [25.7402, 32.6014] },
  { dbKey: 'hatshepsut', nameAr: 'معبد حتشبسوت', nameEn: 'Hatshepsut Temple', coords: [25.7383, 32.6065] },
  { dbKey: 'colossi of memnon', nameAr: 'تمثالا ممنون', nameEn: 'Colossi of Memnon', coords: [25.7206, 32.6105] },
  { dbKey: 'aswan', nameAr: 'أسوان', nameEn: 'Aswan', coords: [24.0889, 32.8998] },
  { dbKey: 'philae', nameAr: 'معبد فيلة', nameEn: 'Philae Temple', coords: [24.0250, 32.8844] },
  { dbKey: 'high dam', nameAr: 'السد العالي', nameEn: 'High Dam', coords: [23.9702, 32.8770] },
  { dbKey: 'unfinished obelisk', nameAr: 'المسلة الناقصة', nameEn: 'Unfinished Obelisk', coords: [24.0769, 32.8953] },
  { dbKey: 'elephantine island', nameAr: 'جزيرة الفنتين', nameEn: 'Elephantine Island', coords: [24.0903, 32.8872] },
  { dbKey: 'abu simbel', nameAr: 'معابد أبو سمبل', nameEn: 'Abu Simbel Temples', coords: [22.3372, 31.6258] },
  { dbKey: 'kom ombo', nameAr: 'معبد كوم أمبو', nameEn: 'Kom Ombo Temple', coords: [24.4711, 32.9469] },
  { dbKey: 'edfu', nameAr: 'معبد إدفو', nameEn: 'Edfu Temple', coords: [24.9781, 32.8789] },
  { dbKey: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria', coords: [31.2001, 29.9187] },
  { dbKey: 'qaitbay citadel', nameAr: 'قلعة قايتباي', nameEn: 'Qaitbay Citadel', coords: [31.2141, 29.8854] },
  { dbKey: 'bibliotheca alexandrina', nameAr: 'مكتبة الإسكندرية', nameEn: 'Bibliotheca Alexandrina', coords: [31.2089, 29.9092] },
  { dbKey: 'montaza palace', nameAr: 'قصر المنتزه', nameEn: 'Montaza Palace', coords: [31.2883, 30.0163] },
  { dbKey: 'hurghada', nameAr: 'الغردقة', nameEn: 'Hurghada', coords: [27.2579, 33.8116] },
  { dbKey: 'giftun island', nameAr: 'جزيرة الجفتون', nameEn: 'Giftun Island', coords: [27.2341, 33.9452] },
  { dbKey: 'el gouna', nameAr: 'الجونة', nameEn: 'El Gouna', coords: [27.3951, 33.6781] },
  { dbKey: 'sahl hasheesh', nameAr: 'سهل حشيش', nameEn: 'Sahl Hasheesh', coords: [27.0494, 33.8863] },
  { dbKey: 'soma bay', nameAr: 'سوما باي', nameEn: 'Soma Bay', coords: [26.8524, 33.9392] },
  { dbKey: 'makadi bay', nameAr: 'خليج مكادي', nameEn: 'Makadi Bay', coords: [26.9897, 33.8967] },
  { dbKey: 'marsa alam', nameAr: 'مرسى علم', nameEn: 'Marsa Alam', coords: [25.0784, 34.8913] },
  { dbKey: 'sataya reef', nameAr: 'شعاب سطايح (دلفين ريف)', nameEn: 'Sataya Reef', coords: [24.1611, 35.4851] },
  { dbKey: 'sharm', nameAr: 'شرم الشيخ', nameEn: 'Sharm El Sheikh', coords: [27.9158, 34.3299] },
  { dbKey: 'ras mohammed', nameAr: 'محمية رأس محمد', nameEn: 'Ras Mohammed', coords: [27.7344, 34.2497] },
  { dbKey: 'naama bay', nameAr: 'خليج نعمة', nameEn: 'Naama Bay', coords: [27.9139, 34.3283] },
  { dbKey: 'dahab', nameAr: 'دهب', nameEn: 'Dahab', coords: [28.5097, 34.5136] },
  { dbKey: 'blue hole', nameAr: 'الثقب الأزرق (بلو هول)', nameEn: 'Blue Hole', coords: [28.5722, 34.5367] },
  { dbKey: 'nuweiba', nameAr: 'نويبع', nameEn: 'Nuweiba', coords: [29.0345, 34.6653] },
  { dbKey: 'taba', nameAr: 'طابا', nameEn: 'Taba', coords: [29.4925, 34.8958] },
  { dbKey: 'saint catherine', nameAr: 'دير سانت كاترين', nameEn: 'Saint Catherine Monastery', coords: [28.5559, 33.9762] },
  { dbKey: 'mount sinai', nameAr: 'جبل موسى', nameEn: 'Mount Sinai', coords: [28.5394, 33.9753] },
  { dbKey: 'siwa', nameAr: 'سيوة', nameEn: 'Siwa Oasis', coords: [29.2032, 25.5189] },
  { dbKey: 'fayoum', nameAr: 'الفيوم', nameEn: 'Fayoum Oasis', coords: [29.3084, 30.8428] },
  { dbKey: 'wadi el rayan', nameAr: 'وادي الريان', nameEn: 'Wadi El Rayan', coords: [29.1867, 30.4356] },
  { dbKey: 'magic lake', nameAr: 'البحيرة السحرية', nameEn: 'Magic Lake Fayoum', coords: [29.2134, 30.3951] },
  { dbKey: 'white desert', nameAr: 'الصحراء البيضاء', nameEn: 'White Desert', coords: [27.3242, 28.1756] },
  { dbKey: 'bahariya oasis', nameAr: 'الواحات البحرية', nameEn: 'Bahariya Oasis', coords: [28.3541, 28.8961] },
  { dbKey: 'ain sokhna', nameAr: 'العين السخنة', nameEn: 'Ain Sokhna', coords: [29.6019, 32.3275] },
  { dbKey: 'al alamein', nameAr: 'العلمين الجديدة', nameEn: 'New Alamein', coords: [30.8333, 28.9500] },
  { dbKey: 'marsa matrouh', nameAr: 'مرسى مطروح', nameEn: 'Marsa Matrouh', coords: [31.3543, 27.2373] },
  { dbKey: 'istanbul', nameAr: 'إسطنبول', nameEn: 'Istanbul', coords: [41.0082, 28.9784] },
  { dbKey: 'cappadocia', nameAr: 'كبادوكيا', nameEn: 'Cappadocia', coords: [38.6431, 34.8281] },
  { dbKey: 'pamukkale', nameAr: 'باموكالي', nameEn: 'Pamukkale', coords: [37.9221, 29.1212] },
  { dbKey: 'ephesus', nameAr: 'أفسس', nameEn: 'Ephesus', coords: [37.9394, 27.3410] },
  { dbKey: 'antalya', nameAr: 'أنطاليا', nameEn: 'Antalya', coords: [36.8969, 30.7133] },
  { dbKey: 'amman', nameAr: 'عمان', nameEn: 'Amman', coords: [31.9454, 35.9284] },
  { dbKey: 'petra', nameAr: 'البتراء', nameEn: 'Petra', coords: [30.3285, 35.4444] },
  { dbKey: 'wadi rum', nameAr: 'وادي رم', nameEn: 'Wadi Rum', coords: [29.5781, 35.4206] },
  { dbKey: 'dead sea', nameAr: 'البحر الميت', nameEn: 'Dead Sea', coords: [31.5590, 35.4732] },
  { dbKey: 'dubai', nameAr: 'دبي', nameEn: 'Dubai', coords: [25.2048, 55.2708] },
  { dbKey: 'abu dhabi', nameAr: 'أبوظبي', nameEn: 'Abu Dhabi', coords: [24.4539, 54.3773] },
  { dbKey: 'marrakech', nameAr: 'مراكش', nameEn: 'Marrakech', coords: [31.6295, -7.9811] },
  { dbKey: 'casablanca', nameAr: 'الدار البيضاء', nameEn: 'Casablanca', coords: [33.5731, -7.5898] },
  { dbKey: 'fes', nameAr: 'فاس', nameEn: 'Fes', coords: [34.0181, -5.0078] },
  { dbKey: 'jerusalem', nameAr: 'القدس', nameEn: 'Jerusalem', coords: [31.7683, 35.2137] },
  { dbKey: 'athens', nameAr: 'أثينا', nameEn: 'Athens', coords: [37.9838, 23.7275] },
  { dbKey: 'santorini', nameAr: 'سانتوريني', nameEn: 'Santorini', coords: [36.3932, 25.4615] },
  { dbKey: 'rome', nameAr: 'روما', nameEn: 'Rome', coords: [41.9028, 12.4964] },
  { dbKey: 'paris', nameAr: 'باريس', nameEn: 'Paris', coords: [48.8566, 2.3522] },
  { dbKey: 'london', nameAr: 'لندن', nameEn: 'London', coords: [51.5074, -0.1278] },
  { dbKey: 'barcelona', nameAr: 'برشلونة', nameEn: 'Barcelona', coords: [41.3851, 2.1734] },
  { dbKey: 'madrid', nameAr: 'مدريد', nameEn: 'Madrid', coords: [40.4168, -3.7038] },
];

const LocationSearchInput: React.FC<{
  value: string;
  onSelect: (name: string, lat: number, lng: number) => void;
  onChangeRaw: (val: string) => void;
  placeholder?: string;
}> = ({ value, onSelect, onChangeRaw, placeholder }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<{ display_name: string; name: string; lat: number; lng: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (text: string) => {
    setQuery(text);
    onChangeRaw(text);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!text.trim() || text.length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=7&accept-language=ar,en`
        );
        if (response.ok) {
          const data = await response.json();
          const mapped = data.map((item: any) => {
            const parts = (item.display_name || '').split(',');
            const shortName = item.name || parts[0] || text;
            return {
              display_name: item.display_name,
              name: shortName.trim(),
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            };
          });
          setResults(mapped);
        }
      } catch (err) {
        console.error('Location search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 350);
  };

  const handleSelectResult = (res: { name: string; lat: number; lng: number; display_name: string }) => {
    setQuery(res.name);
    onSelect(res.name, res.lat, res.lng);
    setIsOpen(false);
    toast.success(`📍 تم اختيار الموقع: ${res.name} (${res.lat.toFixed(4)}, ${res.lng.toFixed(4)})`);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative">
        <Input
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder={placeholder || 'ابحث عن أي موقع في العالم (مدينة، فندق، معلم سياحي)...'}
          className="h-10 text-xs font-bold rounded-xl pr-8 pl-8 bg-background shadow-2xs border-amber-500/30 focus:border-amber-500"
        />
        <MapPin className="w-4 h-4 text-amber-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-90" />
        {isLoading && (
          <Loader2 className="w-4 h-4 text-amber-500 animate-spin absolute left-2.5 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border/90 shadow-2xl rounded-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-border/30">
          {isLoading && results.length === 0 && (
            <div className="p-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
              جاري البحث عن الموقع عالمياً...
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="p-3 text-center text-xs text-muted-foreground">
              لم يتم العثور على خريطة مطابقة فورية، يمكنك إدخال الإحداثيات يدوياً.
            </div>
          )}

          {results.map((res, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectResult(res)}
              className="w-full text-right p-2.5 hover:bg-amber-500/15 transition-colors text-right flex items-start gap-2.5 group cursor-pointer"
            >
              <Globe2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-foreground group-hover:text-amber-500 truncate">
                  {res.name}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {res.display_name}
                </div>
                <div className="text-[9px] font-mono font-bold text-amber-600/90 mt-0.5">
                  📍 [{res.lat.toFixed(4)}, {res.lng.toFixed(4)}]
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface TripEditorModalProps {
  trip?: TripModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface TripSpecificHotelModel {
  id?: string;
  slug?: string;
  nameJsonb: Record<string, string>;
  stars: number;
  city: string;
  destinationSlug: string;
  descriptionJsonb?: Record<string, string>;
  heroImageUrl?: string;
  images?: Array<{ id?: string; url: string; altText?: string; isHero?: boolean; sortOrder?: number }>;
  amenitiesJsonb?: Record<string, any>;
  policiesJsonb?: Record<string, any>;
  rooms: Array<{
    id?: string;
    slug?: string;
    nameJsonb: Record<string, string>;
    ratePerNight: number;
    maxOccupancy: number;
    roomType?: string;
    mealPlan?: string;
    seasonPricings?: Array<{
      seasonId: string;
      ratePerNight: number;
      singleSupplement?: number;
      boardBasis?: string;
    }>;
  }>;
}

const createDefaultTripHotel = (tourCity?: string): TripSpecificHotelModel => ({
  nameJsonb: {
    ar: 'فندق الإقامة الفاخر الخاص بالرحلة',
    en: 'Dedicated Luxury Tour Hotel',
    es: 'Hotel de Lujo Dedicado al Tour',
    pt: 'Hotel de Luxo Dedicado ao Tour',
    it: 'Hotel di Lusso Dedicato al Tour',
  },
  stars: 5,
  city: tourCity || 'Cairo',
  destinationSlug: (tourCity || 'cairo').toLowerCase().replace(/\s+/g, '-'),
  descriptionJsonb: {
    ar: 'إقامة حصرية راقية مخصصة لضيوف هذه الرحلة تجمع بين الراحة والخدمة الملكية الفاخرة.',
    en: 'Exclusive upscale lodging dedicated to guests of this journey, combining royal comfort and five-star luxury service.',
    es: 'Alojamiento exclusivo de alta gama dedicado a los huéspedes de este viaje, que combina el confort real y el servicio de lujo de cinco estrellas.',
    pt: 'Hospedagem exclusiva de alto padrão dedicada aos hóspedes desta viagem, combinando conforto real e serviço de luxo cinco estrelas.',
    it: 'Alloggio esclusivo e di alto livello dedicato agli ospiti di questo viaggio, che unisce comfort reale e servizio di lusso a cinque stelle.',
  },
  heroImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200',
  images: [
    { id: 'h1', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', isHero: true, sortOrder: 0 },
    { id: 'h2', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200', isHero: false, sortOrder: 1 },
  ],
  amenitiesJsonb: {
    features: ['Wi-Fi مجاني فائق السرعة', 'إطلالة بانورامية', 'سبا ونادي صحي', 'خدمة الكونسيرج 24/7', 'مسبح فاخر'],
  },
  policiesJsonb: {
    checkIn: '15:00',
    checkOut: '12:00',
    cancellation: 'إلغاء مجاني حتى 48 ساعة قبل موعد الوصول',
  },
  rooms: [
    {
      nameJsonb: {
        ar: 'جناح ديلوكس فاخر (Deluxe Suite)',
        en: 'Luxury Deluxe Suite',
        es: 'Suite Deluxe de Lujo',
        pt: 'Suíte Deluxe de Luxo',
        it: 'Suite Deluxe di Lusso',
      },
      ratePerNight: 180,
      maxOccupancy: 2,
      roomType: 'King Bed Suite',
      mealPlan: 'BB',
      seasonPricings: [],
    },
  ],
});

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
  heroImage: '',
  images: [],
  hotels: '5-Star Luxury Hotels',
  accommodation: [],
  itinerary: [],
  routeMap: {
    title: 'Interactive Itinerary Journey Map',
    subtitle: 'Explore your day-by-day path across premier luxury landmarks',
    locations: [],
  },
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
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [hotelMode, setHotelMode] = useState<'GLOBAL' | 'TRIP_SPECIFIC'>('GLOBAL');
  const [tripHotel, setTripHotel] = useState<TripSpecificHotelModel | null>(null);
  const [isSavingTripHotel, setIsSavingTripHotel] = useState(false);
  const [isLoadingTripHotel, setIsLoadingTripHotel] = useState(false);
  const [tripHotelActiveLang, setTripHotelActiveLang] = useState<LanguageCode>('ar');
  const [newTripHotelPhotoUrl, setNewTripHotelPhotoUrl] = useState('');
  const [newTripHotelAmenity, setNewTripHotelAmenity] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const handleSafeClose = () => {
    if (isDirty) {
      if (confirm('لديك تعديلات غير محفوظة على بيانات الرحلة. هل أنت متأكد من الإغلاق وفقدان التعديلات؟')) {
        setIsDirty(false);
        setFieldErrors({});
        onClose();
      }
    } else {
      setFieldErrors({});
      onClose();
    }
  };

  const { data: hotelsCatalogData } = useHotels({ page: 1, limit: 100 });
  const catalogHotels = useMemo(
    () => (Array.isArray(hotelsCatalogData) ? hotelsCatalogData : (hotelsCatalogData?.data ?? [])),
    [hotelsCatalogData]
  );
  const { data: globalSeasonsData } = useSeasons();
  const globalSeasons = useMemo(
    () => (Array.isArray(globalSeasonsData) ? globalSeasonsData : []),
    [globalSeasonsData]
  );

  useEffect(() => {
    if (trip) {
      const cloned = JSON.parse(JSON.stringify(trip));
      if (!cloned.translations) {
        cloned.translations = { ar: {}, en: {}, es: {}, pt: {}, it: {} };
      }
      if (!cloned.heroImage && Array.isArray(cloned.images) && cloned.images.length > 0) {
        cloned.heroImage = cloned.images[0];
      }
      setFormData(cloned);

      if (trip.slug) {
        toursApi.getTourBySlug(trip.slug).then((fullTour) => {
          if (!fullTour) return;
          const hydrated = tourToTripModel(fullTour);
          const routeMapFromApi = fullTour.routeMapJsonb || (fullTour as any).routeMap;

          const apiRouteMap = routeMapFromApi ? {
            title: routeMapFromApi.titleJsonb?.ar || routeMapFromApi.title || 'Interactive Itinerary Journey Map',
            subtitle: routeMapFromApi.subtitleJsonb?.ar || routeMapFromApi.subtitle || 'Explore your day-by-day path across premier luxury landmarks',
            locations: Array.isArray(routeMapFromApi.locations)
              ? routeMapFromApi.locations.map((l: any, idx: number) => ({
                  id: l.id || `loc-${idx + 1}`,
                  dbKey: l.dbKey || 'cairo',
                  lat: typeof l.lat === 'number' ? l.lat : 0,
                  lng: typeof l.lng === 'number' ? l.lng : 0,
                  daysVisited: Array.isArray(l.daysVisited) ? l.daysVisited : [],
                  name: l.nameJsonb?.ar || l.name || '',
                  description: l.descriptionJsonb?.ar || l.description || '',
                }))
              : [],
          } : undefined;

          setFormData(prev => {
            const trans = { ...(prev.translations || {}) };
            (['ar', 'en', 'es', 'pt', 'it'] as LanguageCode[]).forEach(loc => {
              const hydLoc = hydrated.translations?.[loc] || {};
              if (!trans[loc]) trans[loc] = {};
              trans[loc] = {
                ...trans[loc],
                ...hydLoc,
                included: (hydLoc.included && hydLoc.included.length > 0) ? hydLoc.included : (trans[loc].included || []),
                excluded: (hydLoc.excluded && hydLoc.excluded.length > 0) ? hydLoc.excluded : (trans[loc].excluded || []),
                highlights: (hydLoc.highlights && hydLoc.highlights.length > 0) ? hydLoc.highlights : (trans[loc].highlights || []),
                itinerary: (hydLoc.itinerary && hydLoc.itinerary.length > 0) ? hydLoc.itinerary : (trans[loc].itinerary || []),
              };
              if (routeMapFromApi && (!trans[loc].routeMap || !trans[loc].routeMap.locations || trans[loc].routeMap.locations.length === 0)) {
                trans[loc].routeMap = {
                  title: routeMapFromApi.titleJsonb?.[loc] || routeMapFromApi.title || 'Interactive Itinerary Journey Map',
                  subtitle: routeMapFromApi.subtitleJsonb?.[loc] || routeMapFromApi.subtitle || 'Explore your day-by-day path across premier luxury landmarks',
                  locations: Array.isArray(routeMapFromApi.locations)
                    ? routeMapFromApi.locations.map((l: any) => ({
                        dbKey: l.dbKey || 'cairo',
                        lat: l.lat,
                        lng: l.lng,
                        daysVisited: l.daysVisited,
                        name: l.nameJsonb?.[loc] || l.name || '',
                        description: l.descriptionJsonb?.[loc] || l.description || '',
                      }))
                    : [],
                };
              }
            });

            return {
              ...prev,
              ...hydrated,
              heroImage: hydrated.heroImage || prev.heroImage || '',
              images: hydrated.images.length > 0 ? hydrated.images : (prev.images || []),
              included: hydrated.included.length > 0 ? hydrated.included : (prev.included || []),
              excluded: hydrated.excluded.length > 0 ? hydrated.excluded : (prev.excluded || []),
              highlights: hydrated.highlights.length > 0 ? hydrated.highlights : (prev.highlights || []),
              accommodation: hydrated.accommodation.length > 0 ? hydrated.accommodation : (prev.accommodation || []),
              seasonPricing: (hydrated.seasonPricing && hydrated.seasonPricing.length > 0) ? hydrated.seasonPricing : (prev.seasonPricing || []),
              itinerary: hydrated.itinerary.length > 0 ? hydrated.itinerary : (prev.itinerary || []),
              routeMap: (prev.routeMap && prev.routeMap.locations && prev.routeMap.locations.length > 0) ? prev.routeMap : apiRouteMap,
              translations: trans,
            };
          });
        }).catch(() => {});

        setIsLoadingTripHotel(true);
        toursApi.getTourTripHotel(trip.slug)
          .then((th) => {
            if (th && th.id) {
              setTripHotel({
                id: th.id,
                slug: th.slug,
                nameJsonb: th.nameJsonb || { en: th.name || '', ar: '' },
                stars: th.stars || 5,
                city: th.city || (trip as any)?.city || trip?.destination || 'Cairo',
                destinationSlug: th.destinationSlug || 'cairo',
                descriptionJsonb: th.descriptionJsonb || {},
                heroImageUrl: th.heroImageUrl || '',
                images: Array.isArray(th.images) ? th.images : [],
                amenitiesJsonb: th.amenitiesJsonb || th.amenities || {},
                policiesJsonb: th.policiesJsonb || th.policies || {},
                rooms: Array.isArray(th.rooms)
                  ? th.rooms.map((r: any) => ({
                      id: r.id,
                      slug: r.slug,
                      nameJsonb: r.nameJsonb || { en: r.name || '', ar: '' },
                      ratePerNight: r.ratePerNight || 0,
                      maxOccupancy: r.maxOccupancy || r.capacity || 2,
                      roomType: r.roomType || 'Standard',
                      mealPlan: r.mealPlan || 'BB',
                      seasonPricings: Array.isArray(r.seasonPricings)
                        ? r.seasonPricings.map((sp: any) => ({
                            seasonId: sp.seasonId,
                            ratePerNight: sp.ratePerNight || 0,
                            singleSupplement: sp.singleSupplement || 0,
                            boardBasis: sp.boardBasis || 'BB',
                          }))
                        : [],
                    }))
                  : [],
              });
              setHotelMode('TRIP_SPECIFIC');
            } else {
              setTripHotel(null);
            }
          })
          .catch(() => {})
          .finally(() => {
            setIsLoadingTripHotel(false);
          });
      } else {
        setTripHotel(null);
        setHotelMode('GLOBAL');
      }
    } else {
      setFormData(DEFAULT_TRIP);
      setTripHotel(null);
      setHotelMode('GLOBAL');
    }
  }, [trip, isOpen]);

  const queryClient = useQueryClient();

  const handleSaveTripHotel = async () => {
    const rawTourSlug = formData.slug || trip?.slug;
    const tourSlug = slugify(rawTourSlug);
    if (!tourSlug) {
      toast.error('يرجى حفظ بيانات الرحلة الأساسية أولاً لتحديد معرف الرحلة (Slug)');
      setActiveTab('basic');
      return;
    }
    if (!tripHotel) return;
    setIsSavingTripHotel(true);
    try {
      const hotelSlug = tripHotel.slug && isValidSlug(tripHotel.slug)
        ? tripHotel.slug
        : generateTripHotelSlug(tourSlug, tripHotel.nameJsonb?.en || tripHotel.nameJsonb?.ar);

      const destSlug = slugify(tripHotel.destinationSlug || formData.destination || 'cairo') || 'cairo';

      const payload: any = {
        slug: hotelSlug,
        destinationSlug: destSlug,
        nameJsonb: tripHotel.nameJsonb || { en: 'Trip Hotel', ar: 'فندق الرحلة' },
        descriptionJsonb: tripHotel.descriptionJsonb || {},
        stars: Number(tripHotel.stars || 5),
        city: tripHotel.city || (formData as any)?.city || formData.destination || 'Cairo',
        heroImageUrl: tripHotel.heroImageUrl,
        images: tripHotel.images || [],
        amenitiesJsonb: tripHotel.amenitiesJsonb || {},
        policiesJsonb: tripHotel.policiesJsonb || {},
        rooms: (tripHotel.rooms || []).map((r, rIdx) => {
          const roomNameEn = (r.nameJsonb as any)?.en || (typeof r.nameJsonb === 'string' ? r.nameJsonb : '');
          const roomSlug = r.slug && isValidSlug(r.slug)
            ? r.slug
            : generateRoomSlug(r.slug || roomNameEn, rIdx + 1);
          return {
            ...(r.id ? { id: r.id } : {}),
            slug: roomSlug,
            nameJsonb: r.nameJsonb || { ar: `غرفة ${rIdx + 1}`, en: `Room ${rIdx + 1}` },
            ratePerNight: Number(r.ratePerNight || 0),
            maxOccupancy: Number(r.maxOccupancy || 2),
            currency: 'USD',
            mealPlanJsonb: { en: r.mealPlan || 'BB', ar: r.mealPlan || 'BB' },
            descriptionJsonb: { bedType: { en: r.roomType || 'Standard Room', ar: r.roomType || 'غرفة قياسية' } },
            seasonPricings: (r.seasonPricings || []).map(sp => ({
              seasonId: sp.seasonId,
              ratePerNight: Number(sp.ratePerNight || 0),
              singleSupplement: Number(sp.singleSupplement || 0),
              boardBasis: sp.boardBasis || 'BB',
            })),
          };
        }),
      };

      const res = await toursApi.upsertTourTripHotel(tourSlug, payload);
      toast.success('✨ تم حفظ وتحديث فندق الرحلة المخصص بنجاح!');
      if (res && res.id) {
        setTripHotel(prev => prev ? { ...prev, id: res.id, slug: res.slug || hotelSlug } : null);
      }
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['tour', tourSlug] });
    } catch (err: any) {
      console.error('Save trip hotel error:', err);
      toast.error(err?.message || 'فشل حفظ فندق الرحلة');
    } finally {
      setIsSavingTripHotel(false);
    }
  };

  const handleDeleteTripHotel = async () => {
    const rawTourSlug = formData.slug || trip?.slug;
    const tourSlug = slugify(rawTourSlug);
    if (!tourSlug) return;
    if (!confirm('هل أنت متأكد من حذف الفندق المخصص لهذه الرحلة والعودة إلى خيار الفندق العام؟')) return;
    setIsSavingTripHotel(true);
    try {
      await toursApi.deleteTourTripHotel(tourSlug);
      toast.success('تم حذف فندق الرحلة المخصص والعودة للفندق العام.');
      setTripHotel(null);
      setHotelMode('GLOBAL');
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['tour', tourSlug] });
    } catch (err: any) {
      toast.error(err?.message || 'فشل حذف فندق الرحلة');
    } finally {
      setIsSavingTripHotel(false);
    }
  };

  const handleTripHotelAddRoom = () => {
    if (!tripHotel) return;
    const newRoom = {
      nameJsonb: {
        ar: 'غرفة فاخرة جديدة',
        en: 'New Deluxe Room',
        es: 'Nueva Habitación Deluxe',
        pt: 'Novo Quarto Deluxe',
        it: 'Nuova Camera Deluxe',
      },
      ratePerNight: 150,
      maxOccupancy: 2,
      roomType: 'Deluxe Room',
      mealPlan: 'BB',
      seasonPricings: [],
    };
    setTripHotel(prev => prev ? { ...prev, rooms: [...prev.rooms, newRoom] } : null);
  };

  const handleTripHotelRemoveRoom = (rIdx: number) => {
    if (!tripHotel) return;
    setTripHotel(prev => prev ? { ...prev, rooms: prev.rooms.filter((_, idx) => idx !== rIdx) } : null);
  };

  const handleTripHotelUpdateRoom = (rIdx: number, field: string, val: any) => {
    if (!tripHotel) return;
    setTripHotel(prev => {
      if (!prev) return null;
      const rooms = [...prev.rooms];
      rooms[rIdx] = { ...rooms[rIdx], [field]: val };
      return { ...prev, rooms };
    });
  };

  const handleTripHotelAddSeasonPricing = (rIdx: number) => {
    if (!tripHotel || globalSeasons.length === 0) return;
    const firstSeason = globalSeasons[0];
    setTripHotel(prev => {
      if (!prev) return null;
      const rooms = [...prev.rooms];
      const targetRoom = rooms[rIdx];
      const curPricings = targetRoom.seasonPricings || [];
      const newPricing = {
        seasonId: firstSeason.id,
        ratePerNight: targetRoom.ratePerNight || 150,
        singleSupplement: 40,
        boardBasis: targetRoom.mealPlan || 'BB',
      };
      rooms[rIdx] = { ...targetRoom, seasonPricings: [...curPricings, newPricing] };
      return { ...prev, rooms };
    });
  };

  const handleTripHotelRemoveSeasonPricing = (rIdx: number, spIdx: number) => {
    if (!tripHotel) return;
    setTripHotel(prev => {
      if (!prev) return null;
      const rooms = [...prev.rooms];
      const targetRoom = rooms[rIdx];
      rooms[rIdx] = {
        ...targetRoom,
        seasonPricings: (targetRoom.seasonPricings || []).filter((_, idx) => idx !== spIdx),
      };
      return { ...prev, rooms };
    });
  };

  const handleTranslateTripHotelName = async () => {
    if (!tripHotel) return;
    const sourceText = tripHotel.nameJsonb[tripHotelActiveLang] || tripHotel.nameJsonb.ar || tripHotel.nameJsonb.en;
    if (!sourceText) return;
    setIsTranslating(true);
    try {
      const translated = await translateToAllLocales(sourceText, tripHotelActiveLang, selectedTargetLocales);
      setTripHotel(prev => prev ? {
        ...prev,
        nameJsonb: {
          ...prev.nameJsonb,
          ...translated,
        },
      } : null);
      toast.success('تمت ترجمة اسم الفندق بنجاح');
    } catch {
      toast.error('فشلت ترجمة اسم الفندق');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateTripHotelDesc = async () => {
    if (!tripHotel) return;
    const sourceText = tripHotel.descriptionJsonb?.[tripHotelActiveLang] || tripHotel.descriptionJsonb?.ar || tripHotel.descriptionJsonb?.en;
    if (!sourceText) return;
    setIsTranslating(true);
    try {
      const translated = await translateToAllLocales(sourceText, tripHotelActiveLang, selectedTargetLocales);
      setTripHotel(prev => prev ? {
        ...prev,
        descriptionJsonb: {
          ...(prev.descriptionJsonb || {}),
          ...translated,
        },
      } : null);
      toast.success('تمت ترجمة وصف الفندق بنجاح');
    } catch {
      toast.error('فشلت ترجمة وصف الفندق');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleChange = (field: keyof TripModel, value: any) => {
    setIsDirty(true);
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getLocalizedText = (field: 'title' | 'subtitle' | 'overview' | 'duration' | 'departures'): string => {
    if (activeLang === 'ar') {
      return (formData[field] as string) || (formData.translations?.ar?.[field] as string) || '';
    }
    return (formData.translations?.[activeLang]?.[field] as string) || '';
  };

  const setLocalizedText = (field: 'title' | 'subtitle' | 'overview' | 'duration' | 'departures', value: string) => {
    setIsDirty(true);
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
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
    const firstHotel = catalogHotels[0];
    rows.push({
      hotelId: firstHotel?.id || '',
      roomId: firstHotel?.rooms?.[0]?.id || null,
      destination: firstHotel?.city || 'Cairo',
      nights: 3,
      regime: 'BB',
      categoryTier: '5_STAR',
      priceSupplementUsd: 0,
      isDefault: rows.length === 0,
      sortOrder: rows.length,
    });
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

  const addSeasonPricingRow = () => {
    const rules = [...(formData.seasonPricing || [])];
    const base = Number(formData.price) || 1000;
    rules.push({
      seasonCode: `SEASON_${rules.length + 1}`,
      seasonName: 'Peak Season',
      label: 'Peak Season',
      startDate: '2026-10-01',
      endDate: '2027-04-30',
      multiplier: 1.2,
      priceUsd: Math.round(base * 1.2),
    });
    handleChange('seasonPricing', rules);
  };

  const removeSeasonPricingRow = (index: number) => {
    const rules = [...(formData.seasonPricing || [])];
    rules.splice(index, 1);
    handleChange('seasonPricing', rules);
  };

  const updateSeasonPricingRow = (index: number, field: keyof SeasonPricingRuleItem, val: any) => {
    const rules = [...(formData.seasonPricing || [])];
    rules[index] = {
      ...rules[index],
      [field]: val,
      ...(field === 'label' ? { seasonName: val } : {}),
      ...(field === 'seasonName' ? { label: val } : {}),
    };
    handleChange('seasonPricing', rules);
  };

  const importGlobalSeasonsToTrip = () => {
    if (globalSeasons.length === 0) {
      toast.info('لا توجد مواسم عامة مسجلة حالياً في إدارة الفنادق.');
      return;
    }
    const base = Number(formData.price) || 1000;
    const rules: SeasonPricingRuleItem[] = globalSeasons.map((s) => {
      const seasonLabel = s.nameJsonb?.en || s.nameJsonb?.ar || s.code;
      return {
        seasonId: s.id,
        seasonCode: s.code,
        seasonName: seasonLabel,
        label: seasonLabel,
        startDate: (s.startDate || '').slice(0, 10),
        endDate: (s.endDate || '').slice(0, 10),
        multiplier: Number(s.multiplier) || 1.0,
        priceUsd: Math.round(base * (Number(s.multiplier) || 1.0)),
      };
    });
    handleChange('seasonPricing', rules);
    toast.success(`تم استيراد ${rules.length} مواسم تسعير بنجاح!`);
  };

  const getLocalizedRouteMapTitle = (): string => {
    if (activeLang === 'ar') return formData.routeMap?.title || 'Interactive Itinerary Journey Map';
    return formData.translations?.[activeLang]?.routeMap?.title || formData.routeMap?.title || 'Interactive Itinerary Journey Map';
  };

  const getLocalizedRouteMapSubtitle = (): string => {
    if (activeLang === 'ar') return formData.routeMap?.subtitle || 'Explore your day-by-day path across premier luxury landmarks';
    return formData.translations?.[activeLang]?.routeMap?.subtitle || formData.routeMap?.subtitle || 'Explore your day-by-day path across premier luxury landmarks';
  };

  const updateRouteMapTitle = (val: string) => {
    setFormData(prev => {
      const currentRoute = prev.routeMap || { title: 'Interactive Itinerary Journey Map', subtitle: 'Explore your day-by-day path across premier luxury landmarks', locations: [] };
      const updatedRoute = { ...currentRoute, title: activeLang === 'ar' ? val : currentRoute.title };
      const trans = { ...(prev.translations || {}) };
      if (!trans[activeLang]) trans[activeLang] = {};
      const transRoute = trans[activeLang]?.routeMap || { locations: [] };
      trans[activeLang] = { ...trans[activeLang], routeMap: { ...transRoute, title: val } };
      return { ...prev, routeMap: updatedRoute, translations: trans };
    });
  };

  const updateRouteMapSubtitle = (val: string) => {
    setFormData(prev => {
      const currentRoute = prev.routeMap || { title: 'Interactive Itinerary Journey Map', subtitle: 'Explore your day-by-day path across premier luxury landmarks', locations: [] };
      const updatedRoute = { ...currentRoute, subtitle: activeLang === 'ar' ? val : currentRoute.subtitle };
      const trans = { ...(prev.translations || {}) };
      if (!trans[activeLang]) trans[activeLang] = {};
      const transRoute = trans[activeLang]?.routeMap || { locations: [] };
      trans[activeLang] = { ...trans[activeLang], routeMap: { ...transRoute, subtitle: val } };
      return { ...prev, routeMap: updatedRoute, translations: trans };
    });
  };

  const getLocalizedRouteLocations = (): { dbKey: string; lat: number; lng: number; daysVisited: number[]; name: string; description: string }[] => {
    const baseLocations = formData.routeMap?.locations || [];
    if (activeLang === 'ar') {
      return baseLocations;
    }
    const transLocations = formData.translations?.[activeLang]?.routeMap?.locations || [];
    return baseLocations.map((loc, idx) => {
      const transLoc = transLocations[idx];
      return {
        ...loc,
        name: transLoc?.name ?? loc.name,
        description: transLoc?.description ?? loc.description,
      };
    });
  };

  const updateRouteLocationField = (idx: number, field: 'dbKey' | 'lat' | 'lng' | 'daysVisited' | 'name' | 'description', value: any) => {
    setFormData(prev => {
      const currentRoute = prev.routeMap || { title: 'Interactive Itinerary Journey Map', subtitle: 'Explore your day-by-day path across premier luxury landmarks', locations: [] };
      const baseLocations = [...(currentRoute.locations || [])];

      if (!baseLocations[idx]) {
        baseLocations[idx] = { dbKey: 'cairo', lat: 30.0444, lng: 31.2357, daysVisited: [1], name: 'القاهرة', description: '' };
      }

      if (field === 'dbKey') {
        const valStr = String(value || '').trim();
        const valLower = valStr.toLowerCase();

        // Check if value matches a preset city by dbKey, nameAr, nameEn, or option label
        const preset = PRESET_CITIES.find(p =>
          p.dbKey.toLowerCase() === valLower ||
          p.nameAr.toLowerCase() === valLower ||
          p.nameEn.toLowerCase() === valLower ||
          `${p.nameAr} (${p.nameEn})`.toLowerCase() === valLower
        );

        if (preset) {
          baseLocations[idx] = {
            ...baseLocations[idx],
            dbKey: preset.dbKey,
            lat: preset.coords[0],
            lng: preset.coords[1],
            name: activeLang === 'ar' ? preset.nameAr : preset.nameEn,
          };
        } else {
          // Custom place name typed by user!
          baseLocations[idx] = {
            ...baseLocations[idx],
            dbKey: valStr,
            name: valStr,
          };
        }
      } else if (field === 'daysVisited') {
        const days = typeof value === 'string'
          ? value.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n))
          : value;
        baseLocations[idx] = { ...baseLocations[idx], daysVisited: days };
      } else if (field === 'lat' || field === 'lng') {
        const numVal = typeof value === 'number' ? value : parseFloat(value);
        baseLocations[idx] = { ...baseLocations[idx], [field]: isNaN(numVal) ? 0 : numVal };
      } else if (activeLang === 'ar' || field === 'name' || field === 'description') {
        baseLocations[idx] = { ...baseLocations[idx], [field]: value };
      }

      // Sync active language translation block
      const trans = { ...(prev.translations || {}) };
      if (!trans[activeLang]) trans[activeLang] = {};
      const transRoute = trans[activeLang]?.routeMap || { locations: [] };
      const transLocations = [...(transRoute.locations || [])];
      if (!transLocations[idx]) {
        transLocations[idx] = {
          dbKey: baseLocations[idx].dbKey,
          lat: baseLocations[idx].lat,
          lng: baseLocations[idx].lng,
          daysVisited: baseLocations[idx].daysVisited,
          name: baseLocations[idx].name,
          description: baseLocations[idx].description,
        };
      }

      if (field === 'name' || field === 'description') {
        transLocations[idx] = { ...transLocations[idx], [field]: value };
      } else {
        transLocations[idx] = {
          ...transLocations[idx],
          dbKey: baseLocations[idx].dbKey,
          lat: baseLocations[idx].lat,
          lng: baseLocations[idx].lng,
          daysVisited: baseLocations[idx].daysVisited,
          name: baseLocations[idx].name,
        };
      }

      trans[activeLang] = { ...trans[activeLang], routeMap: { ...transRoute, locations: transLocations } };

      return {
        ...prev,
        routeMap: { ...currentRoute, locations: baseLocations },
        translations: trans,
      };
    });
  };

  const selectGeoLocation = (idx: number, name: string, lat: number, lng: number) => {
    setFormData(prev => {
      const currentRoute = prev.routeMap || { title: 'Interactive Itinerary Journey Map', subtitle: 'Explore your day-by-day path across premier luxury landmarks', locations: [] };
      const baseLocations = [...(currentRoute.locations || [])];

      const cleanLat = parseFloat(lat.toFixed(6));
      const cleanLng = parseFloat(lng.toFixed(6));

      if (!baseLocations[idx]) {
        baseLocations[idx] = { dbKey: name, lat: cleanLat, lng: cleanLng, daysVisited: [idx + 1], name, description: '' };
      } else {
        baseLocations[idx] = {
          ...baseLocations[idx],
          dbKey: name,
          name: name,
          lat: cleanLat,
          lng: cleanLng,
        };
      }

      const trans = { ...(prev.translations || {}) };
      if (!trans[activeLang]) trans[activeLang] = {};
      const transRoute = trans[activeLang]?.routeMap || { locations: [] };
      const transLocations = [...(transRoute.locations || [])];
      if (!transLocations[idx]) {
        transLocations[idx] = {
          dbKey: name,
          lat: cleanLat,
          lng: cleanLng,
          daysVisited: baseLocations[idx].daysVisited,
          name: name,
          description: baseLocations[idx].description || '',
        };
      } else {
        transLocations[idx] = {
          ...transLocations[idx],
          dbKey: name,
          lat: cleanLat,
          lng: cleanLng,
          name: name,
        };
      }

      trans[activeLang] = { ...trans[activeLang], routeMap: { ...transRoute, locations: transLocations } };

      return {
        ...prev,
        routeMap: { ...currentRoute, locations: baseLocations },
        translations: trans,
      };
    });
  };

  const addRouteLocation = () => {
    setFormData(prev => {
      const currentRoute = prev.routeMap || { title: 'Interactive Itinerary Journey Map', subtitle: 'Explore your day-by-day path across premier luxury landmarks', locations: [] };
      const baseLocations = [...(currentRoute.locations || [])];
      const newIdx = baseLocations.length + 1;
      const defaultPreset = PRESET_CITIES[newIdx % PRESET_CITIES.length] || PRESET_CITIES[0];
      const newLoc = {
        dbKey: defaultPreset.dbKey,
        lat: defaultPreset.coords[0],
        lng: defaultPreset.coords[1],
        daysVisited: [newIdx],
        name: activeLang === 'ar' ? defaultPreset.nameAr : defaultPreset.nameEn,
        description: `${activeLang === 'ar' ? 'زيارة' : 'Visit'} ${defaultPreset.nameEn}`,
      };
      baseLocations.push(newLoc);

      return {
        ...prev,
        routeMap: { ...currentRoute, locations: baseLocations },
      };
    });
  };

  const removeRouteLocation = (idx: number) => {
    setFormData(prev => {
      const currentRoute = prev.routeMap || { locations: [] };
      const baseLocations = [...(currentRoute.locations || [])];
      baseLocations.splice(idx, 1);
      return {
        ...prev,
        routeMap: { ...currentRoute, locations: baseLocations },
      };
    });
  };

  const moveRouteLocation = (idx: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const currentRoute = prev.routeMap || { locations: [] };
      const baseLocations = [...(currentRoute.locations || [])];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= baseLocations.length) return prev;
      const temp = baseLocations[idx];
      baseLocations[idx] = baseLocations[targetIdx];
      baseLocations[targetIdx] = temp;
      return {
        ...prev,
        routeMap: { ...currentRoute, locations: baseLocations },
      };
    });
  };

  const handleAutoGenerateRouteMap = () => {
    const itinerary = formData.itinerary || [];
    if (itinerary.length === 0) {
      toast.error('يرجى إضافة أيام للبرنامج اليومي أولاً لتوليد نقاط الخريطة تلقائياً.');
      return;
    }

    const autoLocations: any[] = [];
    const addedKeys = new Set<string>();

    itinerary.forEach((day, idx) => {
      const textToSearch = `${day.title || ''} ${day.description || ''}`.toLowerCase();
      PRESET_CITIES.forEach(city => {
        if (textToSearch.includes(city.dbKey) || textToSearch.includes(city.nameAr.toLowerCase()) || textToSearch.includes(city.nameEn.toLowerCase())) {
          if (!addedKeys.has(city.dbKey)) {
            addedKeys.add(city.dbKey);
            autoLocations.push({
              dbKey: city.dbKey,
              lat: city.coords[0],
              lng: city.coords[1],
              daysVisited: [idx + 1],
              name: city.nameAr,
              description: `اليوم ${idx + 1}: ${day.title || city.nameAr}`,
            });
          }
        }
      });
    });

    if (autoLocations.length === 0) {
      autoLocations.push(
        { dbKey: 'cairo', lat: 30.0444, lng: 31.2357, daysVisited: [1, 2], name: 'القاهرة والأهرامات', description: 'اليوم 1-2: استكشاف القاهرة وأهرامات الجيزة' },
        { dbKey: 'luxor', lat: 25.6872, lng: 32.6396, daysVisited: [3, 4], name: 'الأقصر والكرنك', description: 'اليوم 3-4: زيارة وادي الملوك ومعابد الأقصر' }
      );
    }

    setFormData(prev => ({
      ...prev,
      routeMap: {
        title: 'Interactive Itinerary Journey Map',
        subtitle: 'Explore your day-by-day path across premier luxury landmarks',
        locations: autoLocations,
      },
    }));
    toast.success(`تم توليد ${autoLocations.length} محطة سياحية للخريطة التفاعلية بنجاح!`);
  };

  const formatSlug = (input: string): string => {
    return slugify(input);
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
    // 1. Determine Source Language & Content
    let detectedSourceLang: LanguageCode = activeLang;
    let sourceTitle = (activeLang === 'ar' ? formData.title : formData.translations?.[activeLang]?.title) || formData.title || '';

    if (!sourceTitle.trim()) {
      // Find the first available title
      const foundLang = ALL_LOCALES.find(l => {
        const t = (l.code === 'ar' ? formData.title : formData.translations?.[l.code]?.title);
        return t && t.trim().length > 0;
      });
      if (foundLang) {
        detectedSourceLang = foundLang.code;
        sourceTitle = (foundLang.code === 'ar' ? formData.title : formData.translations?.[foundLang.code]?.title) || '';
      }
    }

    if (!sourceTitle.trim()) {
      toast.error('يرجى إدخال عنوان الرحلة في لغة واحدة على الأقل لتتمكن من الترجمة.');
      return;
    }

    const actualTargets = (targetLocalesToUse || selectedTargetLocales).filter(l => l !== detectedSourceLang);
    if (actualTargets.length === 0) {
      toast.error('يرجى تحديد لغة مستهدفة للترجمة.');
      return;
    }

    setIsTranslating(true);
    const targetNames = actualTargets.map(c => ALL_LOCALES.find(l => l.code === c)?.name).join(', ');
    setTranslateStatus(`جاري الترجمة لـ (${targetNames})...`);

    try {
      const translated = await autoTranslateFullTrip(
        formData as TripModel,
        detectedSourceLang,
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
    const validationErrors: Record<string, string> = {};

    const activeTitle = (formData.title || '').trim();
    if (!trip && !activeTitle) {
      validationErrors.title = 'يرجى إدخال عنوان الرحلة الرئيسي.';
    }

    const price = Number(formData.price ?? 0);
    if (!Number.isFinite(price) || price < 0) {
      validationErrors.price = 'يرجى إدخال سعر صحيح (0 أو أكبر) بالدولار الأمريكي.';
    }

    if (!formData.destination) {
      validationErrors.destination = 'يرجى اختيار الوجهة السياحية للرحلة.';
    }

    const candidateSlug = formData.slug?.trim()
      ? slugify(formData.slug)
      : generateTourSlug(null, formData.translations?.en?.title, formData.title, trip?.slug);

    if (!isValidSlug(candidateSlug)) {
      validationErrors.slug = 'يجب أن يتكون الرابط الفرعي (Slug) من أحرف إنجليزية صغيرة وأرقام وشرطات فقط وبطول حرفين إلى 100 حرف (مثل: cairo-express-4d).';
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      if (validationErrors.title || validationErrors.slug || validationErrors.price || validationErrors.destination) {
        setActiveTab('basic');
      }
      toast.error('يرجى تصحيح الحقول المحددة أدناه قبل حفظ الرحلة.');
      return;
    }

    setFieldErrors({});

    const activeHero = formData.heroImage || formData.images?.[0] || '';

    setIsSaving(true);
    try {
      const backendData = buildTripEditorPayload({
        ...formData,
        slug: candidateSlug,
        heroImage: activeHero,
      }, !trip);

      if (trip && trip.slug) {
        await toursApi.updateTour(trip.slug, backendData as any);
      } else {
        await toursApi.createTour(backendData as any);
      }
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['tour', candidateSlug] });
      if (trip && trip.slug && trip.slug !== candidateSlug) {
        queryClient.invalidateQueries({ queryKey: ['tour', trip.slug] });
      }
      onClose();
      toast.success(trip ? 'تم تحديث الرحلة والترجمات الـ 5 وحفظها بنجاح!' : 'تمت إضافة الرحلة والترجمات وحفظها بنجاح!');
    } catch (err: any) {
      console.error('Backend API save failed:', err);
      if (err?.errors && Object.keys(err.errors).length > 0) {
        setFieldErrors(err.errors);
        if (err.errors.slug || err.errors.title || err.errors.price) {
          setActiveTab('basic');
        }
      }
      toast.error(err?.message || 'تعذر حفظ الرحلة في قاعدة البيانات.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleSafeClose()}>
      <DialogContent className="max-w-6xl w-full sm:w-[96vw] h-[100dvh] sm:h-[94vh] sm:max-h-[94vh] flex flex-col bg-card border-0 sm:border border-border/80 rounded-none sm:rounded-3xl shadow-2xl p-0 overflow-hidden">
        {/* Top Header */}
        <DialogHeader className="p-3 sm:p-5 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base sm:text-xl font-black text-foreground flex items-center gap-2 truncate">
                  <span className="truncate">{trip ? 'تعديل الرحلة والترجمات الـ 5' : 'إضافة رحلة جديدة فاخرة'}</span>
                  <Badge className="hidden sm:inline-flex bg-amber-500/15 text-amber-500 border-amber-500/30 text-[11px] font-black shrink-0">
                    5 Languages AI
                  </Badge>
                </DialogTitle>
                <DialogDescription className="hidden sm:block text-xs text-muted-foreground font-semibold mt-0.5">
                  تحرير كامل الخصائص الفنية، الأيام، الفنادق، وترجمة المحتوى للغات الخمس بضغطة زر واحدة.
                </DialogDescription>
              </div>
            </div>

            {/* AI Auto-Translate Header Button */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                onClick={() => handleAutoTranslate(['en', 'es', 'pt', 'it'])}
                disabled={isTranslating}
                className="w-full sm:w-auto rounded-xl sm:rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 shadow-md shadow-amber-500/20 cursor-pointer h-9 sm:h-10"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span className="text-xs">{translateStatus || 'جاري الترجمة...'}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 stroke-[2.5]" />
                    <span>✨ ترجمة الرحلة كاملة للغات الـ 4</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Active Language Switcher Bar */}
          <div className="flex items-center justify-between gap-2 mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-border/40 overflow-x-auto">
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 max-w-full">
              <span className="text-[11px] sm:text-xs font-bold text-muted-foreground me-1 shrink-0 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-amber-500" /> اللغة:
              </span>
              {ALL_LOCALES.map(loc => {
                const stat = localeStats.find(s => s.code === loc.code);
                const isActive = activeLang === loc.code;
                return (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => setActiveLang(loc.code)}
                    className={`shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer border ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs scale-102'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <span>{loc.flag}</span>
                    <span>{loc.name}</span>
                    <span className={`text-[9px] sm:text-[10px] font-bold px-1 rounded-full ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : stat?.complete ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      {stat?.percent}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions for Current Language */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
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
                    <Wand2 className="w-3.5 h-3.5" /> ترجمة ({activeLang.toUpperCase()})
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleClearSingleLanguage(activeLang)}
                    className="text-xs text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 gap-1 font-bold h-8 rounded-xl cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> تفريغ ({activeLang.toUpperCase()})
                  </Button>
                </>
              ) : (
                <div className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <span>🇸🇦</span>
                  <span>اللغة المصدر الأساسية</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* 6 Tabs Container */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Mobile Section Selector (< sm) */}
          <div className="sm:hidden px-3 py-2 bg-muted/50 border-b border-border/60 flex items-center justify-between gap-2 shrink-0 z-20">
            <label className="text-[11px] font-black text-muted-foreground shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>قسم التعديل:</span>
            </label>
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value)}
              className="flex-1 h-9 rounded-xl bg-card border border-border/80 px-2.5 text-xs font-bold text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="basic">1. الأساسية والتسعير 💰</option>
              <option value="overview">2. الوصف والإقامة 🏨</option>
              <option value="itinerary">3. البرنامج اليومي ({formData.itinerary?.length || 0}) 📅</option>
              <option value="routemap">4. الخريطة والمدن ({formData.routeMap?.locations?.length || 0}) 📍</option>
              <option value="inclusions">5. المشتملات والمميزات ✅</option>
              <option value="gallery">6. معرض الصور ({formData.images?.length || 0}) 🖼️</option>
              <option value="matrix">7. جدول الترجمات الـ 5 🌐</option>
            </select>
          </div>

          {/* Desktop Tab Strip (hidden on < sm) */}
          <div className="hidden sm:block border-b border-border/60 bg-muted/40 px-6 pt-2 overflow-x-auto shrink-0 z-20">
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
              <TabsTrigger value="routemap" className="rounded-xl px-3.5 py-2 text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xs cursor-pointer">
                <MapPin className="w-3.5 h-3.5 me-1.5 text-amber-500" /> 4. الخريطة التفاعلية والمدن ({formData.routeMap?.locations?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="inclusions" className="rounded-xl px-3.5 py-2 text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xs cursor-pointer">
                <CheckCircle2 className="w-3.5 h-3.5 me-1.5" /> 5. المشتملات والمميزات
              </TabsTrigger>
              <TabsTrigger value="gallery" className="rounded-xl px-3.5 py-2 text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xs cursor-pointer">
                <ImageIcon className="w-3.5 h-3.5 me-1.5" /> 6. معرض الصور ({formData.images?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="matrix" className="rounded-xl px-3.5 py-2 text-xs font-black data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-xs cursor-pointer">
                <Globe2 className="w-3.5 h-3.5 me-1.5" /> 7. جدول الترجمات الـ 5 🌐
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-0">
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
                      onChange={e => {
                        setLocalizedText('title', e.target.value);
                        if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: '' }));
                        if (activeLang === 'en' && !formData.slug) {
                          handleChange('slug', slugify(e.target.value));
                        }
                      }}
                      placeholder={activeLang === 'ar' ? 'مثال: القاهرة السريعة والأهرامات 4 أيام' : 'e.g. Cairo Express & Pyramids 4 Days'}
                      className={`rounded-xl font-bold ${fieldErrors.title ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {fieldErrors.title && (
                      <p className="text-[11px] font-bold text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.title}</span>
                      </p>
                    )}
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
                  <label className="text-xs font-bold text-foreground">الرابط الفرعي (Slug / Route Identifier) *</label>
                  <Input
                    value={formData.slug || ''}
                    onChange={e => {
                      handleChange('slug', e.target.value);
                      if (fieldErrors.slug) setFieldErrors(prev => ({ ...prev, slug: '' }));
                    }}
                    onBlur={e => {
                      const formatted = slugify(e.target.value);
                      handleChange('slug', formatted);
                      if (formatted && !isValidSlug(formatted)) {
                        setFieldErrors(prev => ({
                          ...prev,
                          slug: 'يجب أن يتكون الرابط من أحرف إنجليزية صغيرة وأرقام وشرطات فقط وبطول حرفين إلى 100 حرف.',
                        }));
                      } else {
                        setFieldErrors(prev => ({ ...prev, slug: '' }));
                      }
                    }}
                    placeholder="cairo-express-4d"
                    className={`rounded-xl font-mono text-xs ${fieldErrors.slug ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {fieldErrors.slug ? (
                    <p className="text-[11px] font-bold text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.slug}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">معرف الرابط الفرعي للرحلة بالإنجليزية (مثال: cairo-express-4d)</p>
                  )}
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
                    onChange={e => {
                      handleChange('price', e.target.value);
                      if (fieldErrors.price) setFieldErrors(prev => ({ ...prev, price: '' }));
                    }}
                    placeholder="1250"
                    className={`rounded-xl font-bold font-mono ${fieldErrors.price ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {fieldErrors.price && (
                    <p className="text-[11px] font-bold text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.price}</span>
                    </p>
                  )}
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

              {/* Seasonal Pricing Rules (seasonPricingJsonb) */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                  <div>
                    <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      قواعد التسعير الموسمي للرحلة (Seasonal Pricing Tiers):
                    </span>
                    <p className="text-[11px] text-muted-foreground font-semibold">
                      تحديد معاملات الأسعار أو السعر المخصص لكل موسم (ذروة، صيف، أعياد).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {globalSeasons.length > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={importGlobalSeasonsToTrip}
                        className="text-xs border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-bold rounded-xl h-8 cursor-pointer"
                      >
                        استيراد المواسم المعتمدة ({globalSeasons.length})
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={addSeasonPricingRow}
                      className="text-xs text-amber-500 gap-1 font-bold h-8 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> إضافة موسم تسعير
                    </Button>
                  </div>
                </div>

                {(formData.seasonPricing || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    لا توجد قواعد تسعير موسمية مخصصة لهذه الرحلة (يُطبق السعر الأساسي أو المواسم العامة تلقائياً).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(formData.seasonPricing || []).map((rule, rIdx) => (
                      <div
                        key={rIdx}
                        className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/60 items-end"
                      >
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-1">كود الموسم</label>
                          <Input
                            value={rule.seasonCode || ''}
                            onChange={e => updateSeasonPricingRow(rIdx, 'seasonCode', e.target.value.toUpperCase())}
                            placeholder="HIGH_WINTER"
                            className="h-8 text-xs font-mono font-bold rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-1">اسم الموسم</label>
                          <Input
                            value={rule.label || rule.seasonName || ''}
                            onChange={e => updateSeasonPricingRow(rIdx, 'label', e.target.value)}
                            placeholder="Peak Winter"
                            className="h-8 text-xs font-semibold rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-1">من تاريخ</label>
                          <Input
                            type="date"
                            value={(rule.startDate || '').slice(0, 10)}
                            onChange={e => updateSeasonPricingRow(rIdx, 'startDate', e.target.value)}
                            className="h-8 text-xs font-mono rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-1">إلى تاريخ</label>
                          <Input
                            type="date"
                            value={(rule.endDate || '').slice(0, 10)}
                            onChange={e => updateSeasonPricingRow(rIdx, 'endDate', e.target.value)}
                            className="h-8 text-xs font-mono rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-1">المعامل (×)</label>
                          <Input
                            type="number"
                            step="0.05"
                            value={rule.multiplier ?? 1}
                            onChange={e => updateSeasonPricingRow(rIdx, 'multiplier', Number(e.target.value))}
                            className="h-8 text-xs font-mono font-bold rounded-lg"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-muted-foreground block mb-1">السعر ($)</label>
                            <Input
                              type="number"
                              value={rule.priceUsd ?? Math.round((Number(formData.price) || 0) * (Number(rule.multiplier) || 1))}
                              onChange={e => updateSeasonPricingRow(rIdx, 'priceUsd', Number(e.target.value))}
                              className="h-8 text-xs font-mono font-bold text-amber-500 rounded-lg"
                            />
                          </div>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => removeSeasonPricingRow(rIdx)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

              {/* ACCOMMODATION MANAGEMENT: DUAL-MODE (OPTION A: GLOBAL CATALOG HOTEL VS OPTION B: TRIP-SPECIFIC HOTEL) */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-5 shadow-xs">
                {/* Mode Selector Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
                  <div>
                    <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                      <Hotel className="w-4 h-4 text-amber-500" />
                      إدارة وخطة الإقامة الفندقية (Tour Lodging & Accommodation):
                    </span>
                    <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                      اختر بين ربط فندق عام معتمد من دليل الفنادق، أو إنشاء فندق حصري خاص بهذه الرحلة فقط.
                    </p>
                  </div>

                  {/* Mode Pill Switcher */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/60 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setHotelMode('GLOBAL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        hotelMode === 'GLOBAL'
                          ? 'bg-amber-500 text-black font-black shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5" />
                      خيار أ: فندق عام من الدليل
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHotelMode('TRIP_SPECIFIC');
                        if (!tripHotel) {
                          setTripHotel(createDefaultTripHotel((formData as any)?.city || formData.destination || 'Cairo'));
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        hotelMode === 'TRIP_SPECIFIC'
                          ? 'bg-amber-500 text-black font-black shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      خيار ب: فندق خاص بالرحلة
                    </button>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* MODE A: GLOBAL REUSABLE HOTEL CATALOG */}
                {/* ---------------------------------------------------- */}
                {hotelMode === 'GLOBAL' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[11px] font-bold border-amber-500/30 text-amber-500 bg-amber-500/5">
                          <Building className="w-3 h-3 ml-1" />
                          دليل الفنادق العامة المشتركة
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          الفنادق المختارة قابلة للاستخدام في رحلات متعددة ولا ترتبط برحلة واحدة.
                        </span>
                      </div>
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
                      {(formData.accommodation || []).map((acc, idx) => {
                        const selectedHotelObj = catalogHotels.find((h) => h.id === acc.hotelId);
                        const hotelRooms = selectedHotelObj?.rooms || [];

                        return (
                          <div key={idx} className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Relational Hotel Picker */}
                              <div>
                                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                                  الفندق المعتمد (Partner Hotel)
                                </label>
                                <select
                                  value={acc.hotelId || ''}
                                  onChange={e => {
                                    const hId = e.target.value;
                                    const hObj = catalogHotels.find((h) => h.id === hId);
                                    const rows = [...(formData.accommodation || [])];
                                    rows[idx] = {
                                      ...rows[idx],
                                      hotelId: hId || undefined,
                                      roomId: hObj?.rooms?.[0]?.id || null,
                                      destination: hObj?.city || rows[idx].destination || 'Cairo',
                                      categoryTier: hObj?.stars === 5 ? '5_STAR' : hObj?.stars === 4 ? '4_STAR' : 'LUXURY',
                                    };
                                    handleChange('accommodation', rows);
                                  }}
                                  className="w-full h-9 px-2.5 rounded-xl border border-input bg-background text-xs font-bold"
                                >
                                  <option value="">-- بدون فندق محدد (مدينة فقط) --</option>
                                  {catalogHotels.map((h) => (
                                    <option key={h.id} value={h.id}>
                                      🏨 {h.nameJsonb?.en || h.nameJsonb?.ar || h.slug} ({h.city} • {h.stars}⭐)
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Relational Room Picker */}
                              <div>
                                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                                  فئة الغرفة (Assigned Room Tier)
                                </label>
                                <select
                                  value={acc.roomId || ''}
                                  disabled={!selectedHotelObj || hotelRooms.length === 0}
                                  onChange={e => updateAccommodationRow(idx, 'roomId', e.target.value || null)}
                                  className="w-full h-9 px-2.5 rounded-xl border border-input bg-background text-xs font-bold disabled:opacity-50"
                                >
                                  <option value="">-- الغرفة القياسية للفندق --</option>
                                  {hotelRooms.map((rm: { id: string; slug?: string; name?: unknown; ratePerNight?: number }) => (
                                    <option key={rm.id} value={rm.id}>
                                      🛏️ {(rm.name as any)?.en || (rm.name as any)?.ar || (typeof rm.name === 'string' ? rm.name : rm.slug)} (${rm.ratePerNight ?? 0}/nt)
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Destination / City */}
                              <div>
                                <label className="text-[11px] font-bold text-muted-foreground block mb-1">المدينة / الوجهة</label>
                                <Input
                                  value={acc.destination || ''}
                                  onChange={e => updateAccommodationRow(idx, 'destination', e.target.value)}
                                  placeholder="Cairo, Luxor, Aswan..."
                                  className="rounded-xl text-xs font-bold h-9"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                              <div>
                                <label className="text-[11px] font-bold text-muted-foreground block mb-1">عدد الليالي</label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={acc.nights ?? 1}
                                  onChange={e => updateAccommodationRow(idx, 'nights', Number(e.target.value))}
                                  className="rounded-xl text-xs font-bold h-9 font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-muted-foreground block mb-1">نظام الوجبات (Regime)</label>
                                <select
                                  value={acc.regime || 'BB'}
                                  onChange={e => updateAccommodationRow(idx, 'regime', e.target.value)}
                                  className="w-full h-9 px-2.5 rounded-xl border border-input bg-background text-xs font-bold"
                                >
                                  <option value="BB">BB — Bed & Breakfast</option>
                                  <option value="HB">HB — Half Board</option>
                                  <option value="FB">FB — Full Board</option>
                                  <option value="AI">AI — All Inclusive</option>
                                  <option value="RO">RO — Room Only</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-muted-foreground block mb-1">الفئة (Tier)</label>
                                <select
                                  value={acc.categoryTier || '5_STAR'}
                                  onChange={e => updateAccommodationRow(idx, 'categoryTier', e.target.value)}
                                  className="w-full h-9 px-2.5 rounded-xl border border-input bg-background text-xs font-bold"
                                >
                                  <option value="5_STAR">⭐⭐⭐⭐⭐ 5-Star Luxury</option>
                                  <option value="4_STAR">⭐⭐⭐⭐ 4-Star Superior</option>
                                  <option value="VIP">👑 Royal VIP Tier</option>
                                  <option value="CRUISE">🚢 Deluxe Nile Cruise</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-muted-foreground block mb-1">فرق السعر (+$ USD)</label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={acc.priceSupplementUsd ?? 0}
                                  onChange={e => updateAccommodationRow(idx, 'priceSupplementUsd', Number(e.target.value))}
                                  className="rounded-xl text-xs font-bold h-9 font-mono text-amber-500"
                                />
                              </div>
                              <div className="flex justify-end items-center gap-2">
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => removeAccommodationRow(idx)}
                                  className="text-destructive hover:bg-destructive/10 h-9 w-9 rounded-xl"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {(formData.accommodation || []).length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">لا توجد خطة إقامة مضافة حتى الآن. اضغط "إضافة فندق / إقامة" بالأعلى.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* MODE B: TRIP-SPECIFIC DEDICATED HOTEL */}
                {/* ---------------------------------------------------- */}
                {hotelMode === 'TRIP_SPECIFIC' && (
                  <div className="space-y-5">
                    {/* Isolation Guarantee Banner */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 shadow-xs">
                      <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-black text-amber-500 flex items-center gap-2">
                            <span>فندق حصري وخاص بهذه الرحلة فقط (Trip-Specific Hotel)</span>
                            {tripHotel?.id && (
                              <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/30 font-bold">
                                مفعّل ومربوط بقاعدة البيانات
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed">
                            🔒 هذا الفندق ملكية خاصة ومحصورة برحلة <strong className="text-foreground">"{formData.title || formData.slug || 'الحالية'}"</strong>. لن يظهر مطلقاً في إدارة الفنادق العامة، ولا في كتالوج الفنادق العام، ولا في أي رحلة أخرى.
                          </p>
                        </div>
                      </div>

                      {/* Top Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {tripHotel?.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDeleteTripHotel}
                            disabled={isSavingTripHotel}
                            className="text-xs text-destructive hover:bg-destructive/10 font-bold cursor-pointer h-9 px-3"
                          >
                            <Trash2 className="w-3.5 h-3.5 ml-1" /> حذف فندق الرحلة
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={handleSaveTripHotel}
                          disabled={isSavingTripHotel}
                          className="text-xs bg-amber-500 hover:bg-amber-600 text-black font-black cursor-pointer h-9 px-4 shadow-sm"
                        >
                          {isSavingTripHotel ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 ml-1.5 animate-spin" /> جاري الحفظ...
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 ml-1.5" /> حفظ فندق الرحلة
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {isLoadingTripHotel ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                        <span className="text-xs font-bold">جاري تحميل بيانات فندق الرحلة...</span>
                      </div>
                    ) : tripHotel ? (
                      <div className="space-y-5">
                        {/* 1. Language selector for Hotel */}
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                          <div className="flex items-center gap-1.5 overflow-x-auto">
                            <span className="text-[11px] font-black text-muted-foreground ml-2">لغة إدخال بيانات الفندق:</span>
                            {ALL_LOCALES.map(loc => (
                              <button
                                key={loc.code}
                                type="button"
                                onClick={() => setTripHotelActiveLang(loc.code)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  tripHotelActiveLang === loc.code
                                    ? 'bg-amber-500 text-black font-black shadow-xs'
                                    : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                                }`}
                              >
                                <span>{loc.flag}</span>
                                <span>{loc.name}</span>
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleTranslateTripHotelName}
                              disabled={isTranslating}
                              className="text-[11px] text-amber-500 hover:bg-amber-500/10 gap-1 font-bold h-8 cursor-pointer"
                            >
                              <Wand2 className="w-3 h-3" /> ترجمة اسم الفندق
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleTranslateTripHotelDesc}
                              disabled={isTranslating}
                              className="text-[11px] text-amber-500 hover:bg-amber-500/10 gap-1 font-bold h-8 cursor-pointer"
                            >
                              <Wand2 className="w-3 h-3" /> ترجمة وصف الفندق
                            </Button>
                          </div>
                        </div>

                        {/* 2. Hotel Basic Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/60">
                          {/* Hotel Name */}
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-black text-foreground block">
                              اسم الفندق ({ALL_LOCALES.find(l => l.code === tripHotelActiveLang)?.name})
                            </label>
                            <Input
                              value={tripHotel.nameJsonb[tripHotelActiveLang] || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setTripHotel(prev => prev ? {
                                  ...prev,
                                  nameJsonb: { ...prev.nameJsonb, [tripHotelActiveLang]: val },
                                } : null);
                              }}
                              placeholder="مثال: Nile Ritz Luxury Cruise & Resort"
                              className="rounded-xl text-xs font-bold h-9"
                            />
                          </div>

                          {/* Star Rating */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-foreground block">
                              تصنيف النجوم (Stars)
                            </label>
                            <div className="flex items-center gap-1 h-9 px-2.5 rounded-xl border border-input bg-background">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setTripHotel(prev => prev ? { ...prev, stars: star } : null)}
                                  className="text-amber-500 hover:scale-125 transition-transform cursor-pointer"
                                >
                                  <Star className={`w-4 h-4 ${star <= (tripHotel.stars || 5) ? 'fill-amber-500' : 'text-muted-foreground/40'}`} />
                                </button>
                              ))}
                              <span className="text-xs font-mono font-bold text-foreground mr-1.5">
                                ({tripHotel.stars || 5} نجوم)
                              </span>
                            </div>
                          </div>

                          {/* City */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-foreground block">المدينة / الموقع</label>
                            <Input
                              value={tripHotel.city || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setTripHotel(prev => prev ? {
                                  ...prev,
                                  city: val,
                                  destinationSlug: val.toLowerCase().replace(/\s+/g, '-'),
                                } : null);
                              }}
                              placeholder="Cairo, Luxor, Aswan..."
                              className="rounded-xl text-xs font-bold h-9"
                            />
                          </div>

                          {/* Hotel Description */}
                          <div className="sm:col-span-4 space-y-1.5">
                            <label className="text-[11px] font-black text-foreground block">
                              وصف ونبذة الفندق باللغة ({ALL_LOCALES.find(l => l.code === tripHotelActiveLang)?.name})
                            </label>
                            <Textarea
                              rows={3}
                              value={tripHotel.descriptionJsonb?.[tripHotelActiveLang] || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setTripHotel(prev => prev ? {
                                  ...prev,
                                  descriptionJsonb: { ...(prev.descriptionJsonb || {}), [tripHotelActiveLang]: val },
                                } : null);
                              }}
                              placeholder="اكتب نبذة عن الفندق، موقعه المميز، الخدمات والمرافق الملكية..."
                              className="rounded-xl text-xs font-medium leading-relaxed"
                            />
                          </div>
                        </div>

                        {/* 3. Media: Hero Image & Gallery */}
                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-3">
                          <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-amber-500" />
                            صور ومعرض الفندق (Hotel Media & Photos):
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Hero Image */}
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-muted-foreground block">رابط الصورة الرئيسية للفندق (Hero Image URL)</label>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={tripHotel.heroImageUrl || ''}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setTripHotel(prev => prev ? { ...prev, heroImageUrl: val } : null);
                                  }}
                                  placeholder="https://images.unsplash.com/..."
                                  className="rounded-xl text-xs font-mono h-9 flex-1"
                                />
                              </div>
                              {tripHotel.heroImageUrl && (
                                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-border/80 mt-1">
                                  <img
                                    src={tripHotel.heroImageUrl}
                                    alt="Hotel Hero"
                                    className="w-full h-full object-cover"
                                    onError={e => { (e.target as any).style.display = 'none'; }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Gallery Photos */}
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-muted-foreground block">معرض صور الفندق الإضافية (Gallery)</label>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={newTripHotelPhotoUrl}
                                  onChange={e => setNewTripHotelPhotoUrl(e.target.value)}
                                  placeholder="رابط صورة جديدة..."
                                  className="rounded-xl text-xs font-mono h-9 flex-1"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => {
                                    if (!newTripHotelPhotoUrl.trim()) return;
                                    setTripHotel(prev => {
                                      if (!prev) return null;
                                      const images = [...(prev.images || [])];
                                      images.push({
                                        id: `img-${Date.now()}`,
                                        url: newTripHotelPhotoUrl.trim(),
                                        isHero: false,
                                        sortOrder: images.length,
                                      });
                                      return { ...prev, images };
                                    });
                                    setNewTripHotelPhotoUrl('');
                                  }}
                                  className="text-xs bg-amber-500 hover:bg-amber-600 text-black font-bold h-9 px-3"
                                >
                                  <Plus className="w-3.5 h-3.5" /> إضافة
                                </Button>
                              </div>

                              <div className="flex items-center gap-2 overflow-x-auto py-1">
                                {(tripHotel.images || []).map((img, iIdx) => (
                                  <div key={img.id || iIdx} className="relative w-20 h-16 rounded-lg overflow-hidden border border-border/80 shrink-0 group">
                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTripHotel(prev => prev ? {
                                          ...prev,
                                          images: (prev.images || []).filter((_, idx) => idx !== iIdx),
                                        } : null);
                                      }}
                                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 4. Curated Amenities & Hotel Policies */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/60">
                          {/* Amenities Manager */}
                          <div className="space-y-3">
                            <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              خدمات ومرافق الفندق (Amenities & Features):
                            </span>

                            {/* Preset Quick Chips */}
                            <div className="flex flex-wrap gap-1.5">
                              {['Wi-Fi مجاني', 'سبا ونادي صحي', 'مسبح فاخر', 'إطلالة بانورامية', 'خدمة كونسيرج 24/7', 'مطعم فاخر'].map((preset) => {
                                const currentFeatures = tripHotel.amenitiesJsonb?.features || [];
                                const isSelected = currentFeatures.includes(preset);
                                return (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => {
                                      const updated = isSelected
                                        ? currentFeatures.filter((f: string) => f !== preset)
                                        : [...currentFeatures, preset];
                                      setTripHotel(prev => prev ? {
                                        ...prev,
                                        amenitiesJsonb: { ...(prev.amenitiesJsonb || {}), features: updated },
                                      } : null);
                                    }}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-amber-500 text-black font-black'
                                        : 'bg-background hover:bg-muted text-muted-foreground border border-border/60'
                                    }`}
                                  >
                                    {isSelected ? '✓ ' : '+ '}
                                    {preset}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Add Custom Amenity Tag */}
                            <div className="flex items-center gap-2">
                              <Input
                                value={newTripHotelAmenity}
                                onChange={e => setNewTripHotelAmenity(e.target.value)}
                                placeholder="إضافة ميزة مخصصة..."
                                className="h-8 text-xs rounded-xl"
                              />
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  if (!newTripHotelAmenity.trim()) return;
                                  const currentFeatures = tripHotel.amenitiesJsonb?.features || [];
                                  if (!currentFeatures.includes(newTripHotelAmenity.trim())) {
                                    setTripHotel(prev => prev ? {
                                      ...prev,
                                      amenitiesJsonb: {
                                        ...(prev.amenitiesJsonb || {}),
                                        features: [...currentFeatures, newTripHotelAmenity.trim()],
                                      },
                                    } : null);
                                  }
                                  setNewTripHotelAmenity('');
                                }}
                                className="h-8 px-3 text-xs bg-amber-500 hover:bg-amber-600 text-black font-bold"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            {/* Active Amenities Chips */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(tripHotel.amenitiesJsonb?.features || []).map((feat: string, fIdx: number) => (
                                <span
                                  key={fIdx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-amber-500/30 text-[11px] font-bold text-foreground"
                                >
                                  <span>{feat}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = (tripHotel.amenitiesJsonb?.features || []).filter((_: any, idx: number) => idx !== fIdx);
                                      setTripHotel(prev => prev ? {
                                        ...prev,
                                        amenitiesJsonb: { ...(prev.amenitiesJsonb || {}), features: updated },
                                      } : null);
                                    }}
                                    className="text-destructive hover:scale-125 transition-transform cursor-pointer"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Policies Manager */}
                          <div className="space-y-3">
                            <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-amber-500" />
                              سياسات الفندق (Hotel Policies):
                            </span>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                                  موعد تسجيل الدخول (Check-In)
                                </label>
                                <Input
                                  value={tripHotel.policiesJsonb?.checkIn || '15:00'}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setTripHotel(prev => prev ? {
                                      ...prev,
                                      policiesJsonb: { ...(prev.policiesJsonb || {}), checkIn: val },
                                    } : null);
                                  }}
                                  placeholder="15:00"
                                  className="h-8 text-xs font-mono rounded-xl"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                                  موعد تسجيل المغادرة (Check-Out)
                                </label>
                                <Input
                                  value={tripHotel.policiesJsonb?.checkOut || '12:00'}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setTripHotel(prev => prev ? {
                                      ...prev,
                                      policiesJsonb: { ...(prev.policiesJsonb || {}), checkOut: val },
                                    } : null);
                                  }}
                                  placeholder="12:00"
                                  className="h-8 text-xs font-mono rounded-xl"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                                سياسة الإلغاء (Cancellation Policy)
                              </label>
                              <Input
                                value={tripHotel.policiesJsonb?.cancellation || 'إلغاء مجاني حتى 48 ساعة قبل موعد الوصول'}
                                onChange={e => {
                                  const val = e.target.value;
                                  setTripHotel(prev => prev ? {
                                    ...prev,
                                    policiesJsonb: { ...(prev.policiesJsonb || {}), cancellation: val },
                                  } : null);
                                }}
                                placeholder="إلغاء مجاني حتى 48 ساعة قبل الوصول..."
                                className="h-8 text-xs rounded-xl"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 5. Rooms & Pricing Engine */}
                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-4">
                          <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <div>
                              <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                                <BedDouble className="w-4 h-4 text-amber-500" />
                                غرف وأجنحة فندق الرحلة والأسعار (Rooms, Suites & Pricing):
                              </span>
                              <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                                حدد فئات الغرف وسعر الليلة والوجبات والقواعد الموسمية الخاصة بكل غرفة.
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={handleTripHotelAddRoom}
                              className="text-xs text-amber-500 gap-1 font-bold cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> إضافة فئة غرفة جديدة
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {tripHotel.rooms.map((room, rIdx) => (
                              <div key={room.id || rIdx} className="p-4 rounded-2xl bg-background border border-border/80 space-y-3 shadow-xs">
                                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                                  <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-black flex items-center justify-center">
                                      {rIdx + 1}
                                    </span>
                                    {room.nameJsonb[tripHotelActiveLang] || room.nameJsonb.ar || room.nameJsonb.en || `غرفة ${rIdx + 1}`}
                                  </span>
                                  {tripHotel.rooms.length > 1 && (
                                    <Button
                                      type="button"
                                      size="icon-sm"
                                      variant="ghost"
                                      onClick={() => handleTripHotelRemoveRoom(rIdx)}
                                      className="text-destructive hover:bg-destructive/10 h-7 w-7 rounded-lg"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                                  {/* Room Name */}
                                  <div className="col-span-2 sm:col-span-2">
                                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">اسم الغرفة ({ALL_LOCALES.find(l => l.code === tripHotelActiveLang)?.name})</label>
                                    <Input
                                      value={room.nameJsonb[tripHotelActiveLang] || ''}
                                      onChange={e => {
                                        const val = e.target.value;
                                        handleTripHotelUpdateRoom(rIdx, 'nameJsonb', { ...room.nameJsonb, [tripHotelActiveLang]: val });
                                      }}
                                      placeholder="مثال: Deluxe Sea View Suite"
                                      className="rounded-xl text-xs font-bold h-9"
                                    />
                                  </div>

                                  {/* Bed / Room Type */}
                                  <div>
                                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">نوع السرير (Bed Type)</label>
                                    <Input
                                      value={room.roomType || ''}
                                      onChange={e => handleTripHotelUpdateRoom(rIdx, 'roomType', e.target.value)}
                                      placeholder="King Bed / Twin"
                                      className="rounded-xl text-xs font-bold h-9"
                                    />
                                  </div>

                                  {/* Max Occupancy */}
                                  <div>
                                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">السعة (النزلاء)</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={room.maxOccupancy ?? 2}
                                      onChange={e => handleTripHotelUpdateRoom(rIdx, 'maxOccupancy', Number(e.target.value))}
                                      className="rounded-xl text-xs font-mono font-bold h-9"
                                    />
                                  </div>

                                  {/* Base Rate Per Night */}
                                  <div>
                                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">سعر الليلة ($ USD)</label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={room.ratePerNight ?? 0}
                                      onChange={e => handleTripHotelUpdateRoom(rIdx, 'ratePerNight', Number(e.target.value))}
                                      className="rounded-xl text-xs font-mono font-bold text-amber-500 h-9"
                                    />
                                  </div>

                                  {/* Meal Plan */}
                                  <div>
                                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">الوجبات (Regime)</label>
                                    <select
                                      value={room.mealPlan || 'BB'}
                                      onChange={e => handleTripHotelUpdateRoom(rIdx, 'mealPlan', e.target.value)}
                                      className="w-full h-9 px-2.5 rounded-xl border border-input bg-background text-xs font-bold"
                                    >
                                      <option value="BB">BB — Bed & Breakfast</option>
                                      <option value="HB">HB — Half Board</option>
                                      <option value="FB">FB — Full Board</option>
                                      <option value="AI">AI — All Inclusive</option>
                                      <option value="RO">RO — Room Only</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Room Seasonal Pricing Overrides */}
                                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-muted-foreground flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                      الأسعار الموسمية لهذه الغرفة (Seasonal Pricing):
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleTripHotelAddSeasonPricing(rIdx)}
                                      className="text-[10px] font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" /> إضافة تسعير موسمي
                                    </button>
                                  </div>

                                  {(room.seasonPricings || []).map((sp, spIdx) => (
                                    <div key={spIdx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-background/60 p-2 rounded-lg border border-border/40">
                                      <div>
                                        <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">الموسم</label>
                                        <select
                                          value={sp.seasonId}
                                          onChange={e => {
                                            const updatedSp = [...(room.seasonPricings || [])];
                                            updatedSp[spIdx] = { ...updatedSp[spIdx], seasonId: e.target.value };
                                            handleTripHotelUpdateRoom(rIdx, 'seasonPricings', updatedSp);
                                          }}
                                          className="w-full h-7 px-2 rounded-md border border-input bg-background text-[11px] font-bold"
                                        >
                                          {globalSeasons.map(s => (
                                            <option key={s.id} value={s.id}>
                                              {s.code || s.id} ({s.multiplier}x)
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">سعر الليلة ($)</label>
                                        <Input
                                          type="number"
                                          value={sp.ratePerNight}
                                          onChange={e => {
                                            const updatedSp = [...(room.seasonPricings || [])];
                                            updatedSp[spIdx] = { ...updatedSp[spIdx], ratePerNight: Number(e.target.value) };
                                            handleTripHotelUpdateRoom(rIdx, 'seasonPricings', updatedSp);
                                          }}
                                          className="h-7 text-xs font-mono font-bold text-amber-500 rounded-md"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">ملحق الغرفة المفردة ($)</label>
                                        <Input
                                          type="number"
                                          value={sp.singleSupplement || 0}
                                          onChange={e => {
                                            const updatedSp = [...(room.seasonPricings || [])];
                                            updatedSp[spIdx] = { ...updatedSp[spIdx], singleSupplement: Number(e.target.value) };
                                            handleTripHotelUpdateRoom(rIdx, 'seasonPricings', updatedSp);
                                          }}
                                          className="h-7 text-xs font-mono font-bold rounded-md"
                                        />
                                      </div>
                                      <div className="flex justify-end items-center pt-3">
                                        <Button
                                          type="button"
                                          size="icon-sm"
                                          variant="ghost"
                                          onClick={() => handleTripHotelRemoveSeasonPricing(rIdx, spIdx)}
                                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}

                                  {(room.seasonPricings || []).length === 0 && (
                                    <p className="text-[10px] text-muted-foreground/80 py-1">لا توجد مواسم خاصة محددة لهذه الغرفة (يطبق السعر القياسي).</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Save Bar for Trip Hotel */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                          <Button
                            size="sm"
                            onClick={handleSaveTripHotel}
                            disabled={isSavingTripHotel}
                            className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs cursor-pointer h-9 px-5 shadow-sm"
                          >
                            {isSavingTripHotel ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 ml-1.5 animate-spin" /> جاري الحفظ...
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5 ml-1.5" /> حفظ فندق الرحلة المخصص
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center space-y-3">
                        <p className="text-xs text-muted-foreground font-semibold">لم يتم إنشاء فندق مخصص لهذه الرحلة بعد.</p>
                        <Button
                          size="sm"
                          onClick={() => setTripHotel(createDefaultTripHotel((formData as any)?.city || formData.destination || 'Cairo'))}
                          className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs cursor-pointer h-9 px-4"
                        >
                          <Sparkles className="w-3.5 h-3.5 ml-1.5" /> إنشاء فندق خاص بالرحلة الآن
                        </Button>
                      </div>
                    )}
                  </div>
                )}
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

            {/* TAB 4: INTERACTIVE JOURNEY ROUTE MAP */}
            <TabsContent value="routemap" className="space-y-5 m-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                <div>
                  <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    خريطة مسار الرحلة التفاعلية (Interactive Itinerary Journey Map)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                    Explore Your Day-By-Day Path Across Premier Luxury Landmarks — حدد المدن والمعالم التي تزورها الرحلة بالتفصيل مع الإحداثيات وأيام الزيارة.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAutoGenerateRouteMap}
                    className="text-xs font-bold text-amber-600 border-amber-500/40 hover:bg-amber-500/10 gap-1.5 rounded-xl cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-500" /> توليد تلقائي من أيام البرنامج
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addRouteLocation}
                    className="text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 gap-1.5 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة مدينة / معلم +
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">عنوان الخريطة في الموقع ({activeLang.toUpperCase()})</label>
                  <Input
                    value={getLocalizedRouteMapTitle()}
                    onChange={e => updateRouteMapTitle(e.target.value)}
                    placeholder="Interactive Itinerary Journey Map"
                    className="rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">الوصف الفرعي للخريطة ({activeLang.toUpperCase()})</label>
                  <Input
                    value={getLocalizedRouteMapSubtitle()}
                    onChange={e => updateRouteMapSubtitle(e.target.value)}
                    placeholder="Explore your day-by-day path across premier luxury landmarks"
                    className="rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {getLocalizedRouteLocations().map((loc, idx) => (
                  <div key={idx} className="p-4.5 rounded-2xl bg-card border border-border/80 space-y-3 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-2.5">
                      <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
                        <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-500 font-black text-xs flex items-center justify-center border border-amber-500/30 shrink-0">
                          {idx + 1}
                        </span>
                        {/* Interactive Location Input with Global Geocoding & Presets */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 min-w-[280px]">
                          <LocationSearchInput
                            value={loc.name || loc.dbKey || ''}
                            onSelect={(name, lat, lng) => selectGeoLocation(idx, name, lat, lng)}
                            onChangeRaw={val => updateRouteLocationField(idx, 'dbKey', val)}
                            placeholder="ابحث عن أي موقع، فندق، أو معلم في العالم (مثل: Eiffel Tower, برج خليفة, مرسى علم)..."
                          />

                          <select
                            value={
                              PRESET_CITIES.some(p =>
                                p.dbKey.toLowerCase() === (loc.dbKey || '').toLowerCase() ||
                                p.nameAr === loc.name ||
                                p.nameEn === loc.name
                              )
                                ? (PRESET_CITIES.find(p =>
                                    p.dbKey.toLowerCase() === (loc.dbKey || '').toLowerCase() ||
                                    p.nameAr === loc.name ||
                                    p.nameEn === loc.name
                                  )?.dbKey || '')
                                : ''
                            }
                            onChange={e => {
                              if (e.target.value) {
                                updateRouteLocationField(idx, 'dbKey', e.target.value);
                              }
                            }}
                            className="h-10 px-2.5 rounded-xl border border-input bg-background/90 text-[11px] font-bold sm:w-[190px] shrink-0 text-muted-foreground focus:text-foreground cursor-pointer"
                            title="اختيار سريع من الأماكن الجاهزة"
                          >
                            <option value="">-- أو اختر مكان جاهز --</option>
                            {PRESET_CITIES.map(city => (
                              <option key={city.dbKey} value={city.dbKey}>
                                📍 {city.nameAr} ({city.nameEn})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Reorder and Delete */}
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          disabled={idx === 0}
                          onClick={() => moveRouteLocation(idx, 'up')}
                          className="text-muted-foreground hover:text-foreground rounded-xl"
                          title="تحريك لأعلى"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          disabled={idx === getLocalizedRouteLocations().length - 1}
                          onClick={() => moveRouteLocation(idx, 'down')}
                          className="text-muted-foreground hover:text-foreground rounded-xl"
                          title="تحريك لأسفل"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => removeRouteLocation(idx)}
                          className="text-destructive hover:bg-destructive/10 rounded-xl"
                          title="حذف المحطة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* Custom Localized Name */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground">اسم المحطة / المدينة ({activeLang.toUpperCase()})</label>
                        <Input
                          value={loc.name || ''}
                          onChange={e => updateRouteLocationField(idx, 'name', e.target.value)}
                          placeholder="مثال: القاهرة وأهرامات الجيزة"
                          className="rounded-xl text-xs font-bold"
                        />
                      </div>

                      {/* Days Visited */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground">أيام الزيارة (مثال: 1, 2 أو 3)</label>
                        <Input
                          value={Array.isArray(loc.daysVisited) ? loc.daysVisited.join(', ') : ''}
                          onChange={e => updateRouteLocationField(idx, 'daysVisited', e.target.value)}
                          placeholder="1, 2"
                          className="rounded-xl text-xs font-semibold font-mono"
                        />
                      </div>

                      {/* Coordinates (Lat, Lng) */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-muted-foreground">Lat</label>
                          <Input
                            type="number"
                            step="any"
                            value={loc.lat ?? 0}
                            onChange={e => updateRouteLocationField(idx, 'lat', parseFloat(e.target.value) || 0)}
                            className="rounded-xl text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-muted-foreground">Lng</label>
                          <Input
                            type="number"
                            step="any"
                            value={loc.lng ?? 0}
                            onChange={e => updateRouteLocationField(idx, 'lng', parseFloat(e.target.value) || 0)}
                            className="rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description / Summary */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-bold text-muted-foreground">وصف المحطة / المعلم للمسافرين ({activeLang.toUpperCase()})</label>
                      <Input
                        value={loc.description || ''}
                        onChange={e => updateRouteLocationField(idx, 'description', e.target.value)}
                        placeholder="مثال: اليوم 1-2: جولة خاصة بمدينة القاهرة وزيارة الأهرامات والمتحف الكبير..."
                        className="rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>
                ))}

                {(formData.routeMap?.locations || []).length === 0 && (
                  <div className="p-10 text-center rounded-2xl border border-dashed border-border bg-muted/20 space-y-3">
                    <MapPin className="w-10 h-10 mx-auto text-amber-500/50" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-foreground">لم يتم تخصيص محطات الخريطة التفاعلية يدوياً حتى الآن.</h4>
                      <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                        (النظام حالياً يتعرف على المدن تلقائياً من أيام البرنامج، ولكن يمكنك الضغط أدناه لتخصيص الخريطة بالكامل)
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Button size="sm" onClick={handleAutoGenerateRouteMap} variant="outline" className="rounded-xl border-amber-500/40 text-amber-600 font-bold text-xs">
                        <Wand2 className="w-3.5 h-3.5 text-amber-500 me-1" /> توليد محطات من البرنامج تلقائياً
                      </Button>
                      <Button size="sm" onClick={addRouteLocation} className="rounded-xl bg-amber-500 text-slate-950 font-black text-xs">
                        <Plus className="w-3.5 h-3.5 me-1" /> إضافة مدينة / معلم يدوي +
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 5: INCLUSIONS & HIGHLIGHTS */}
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

            {/* TAB 5: PHOTO GALLERY & HERO IMAGE */}
            <TabsContent value="gallery" className="space-y-5 m-0">
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
                  <div>
                    <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      معرض الصور وتحديد صورة الهيرو والكرت (Photo Gallery & Hero Image):
                    </span>
                    <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                      الصورة المحددة كـ (Hero) تكون هي الصورة الرئيسية للرحلة وتظهر تلقائياً ككرت الرحلة في جميع القوائم والموقع العام.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setMediaPickerOpen(true)}
                      className="text-xs text-amber-500 border-amber-500/30 hover:bg-amber-500/10 gap-1.5 font-bold cursor-pointer rounded-xl"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> اختيار من مكتبة الوسائط 🖼️
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const imgs = [...(formData.images || []), ''];
                        handleChange('images', imgs);
                      }}
                      className="text-xs text-amber-500 gap-1 font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> إضافة رابط يدوي +
                    </Button>
                  </div>
                </div>

                {/* Hero / Card Preview Banner */}
                {(() => {
                  const currentHero = formData.heroImage || formData.images?.[0] || '';
                  if (!currentHero) return null;
                  return (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center gap-4 shadow-xs">
                      <div className="w-20 h-14 rounded-xl bg-slate-950 overflow-hidden shrink-0 border-2 border-amber-500/60 shadow-md">
                        <img src={currentHero} alt="Hero & Card Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-500 text-slate-950 border-amber-500 font-black text-[11px] gap-1 shadow-xs">
                            <Crown className="w-3 h-3 fill-current" />
                            صورة الهيرو وكرت الرحلة المعتمدة حالياً
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-semibold">Hero & Tour Card Image</span>
                        </div>
                        <p className="text-xs font-mono text-foreground/80 truncate mt-1">{currentHero}</p>
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-3">
                  {(formData.images || []).map((imgUrl, idx) => {
                    const isCurrentHero = formData.heroImage ? formData.heroImage === imgUrl : idx === 0;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          isCurrentHero
                            ? 'bg-amber-500/10 border-amber-500/50 shadow-xs ring-1 ring-amber-500/30'
                            : 'bg-muted/30 border-border/60 hover:border-border'
                        }`}
                      >
                        <div className="w-16 h-12 rounded-xl bg-slate-950 overflow-hidden shrink-0 border relative">
                          {imgUrl ? (
                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">No URL</div>
                          )}
                          {isCurrentHero && (
                            <div className="absolute top-1 start-1 bg-amber-500 text-slate-950 p-0.5 rounded-md shadow-xs">
                              <Crown className="w-2.5 h-2.5 fill-current" />
                            </div>
                          )}
                        </div>

                        <Input
                          value={imgUrl}
                          onChange={e => {
                            const newUrl = e.target.value;
                            const imgs = [...(formData.images || [])];
                            const wasHero = isCurrentHero;
                            imgs[idx] = newUrl;
                            setFormData(prev => ({
                              ...prev,
                              images: imgs,
                              ...(wasHero ? { heroImage: newUrl } : {}),
                            }));
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="rounded-xl text-xs font-mono flex-1"
                        />

                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-0.5">
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            disabled={idx === 0}
                            onClick={() => {
                              if (idx === 0) return;
                              const imgs = [...(formData.images || [])];
                              const [moved] = imgs.splice(idx, 1);
                              imgs.splice(idx - 1, 0, moved);
                              setFormData(prev => ({
                                ...prev,
                                images: imgs,
                                heroImage: imgs[0],
                              }));
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                            title="تحريك لأعلى"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            disabled={idx === (formData.images?.length || 1) - 1}
                            onClick={() => {
                              const imgs = [...(formData.images || [])];
                              if (idx >= imgs.length - 1) return;
                              const [moved] = imgs.splice(idx, 1);
                              imgs.splice(idx + 1, 0, moved);
                              setFormData(prev => ({
                                ...prev,
                                images: imgs,
                                heroImage: imgs[0],
                              }));
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                            title="تحريك لأسفل"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        {/* Hero Badge or Set as Hero Button */}
                        {isCurrentHero ? (
                          <span className="text-[11px] font-black px-2.5 py-1.5 rounded-xl border bg-amber-500 text-slate-950 border-amber-500 flex items-center gap-1.5 shrink-0 shadow-xs">
                            <Crown className="w-3.5 h-3.5 fill-current" />
                            <span>الهيرو والكرت (Hero & Card)</span>
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (!imgUrl) {
                                toast.error('يرجى كتابة رابط للصورة أولاً.');
                                return;
                              }
                              const imgs = [...(formData.images || [])];
                              const [selected] = imgs.splice(idx, 1);
                              imgs.unshift(selected);
                              setFormData(prev => ({
                                ...prev,
                                heroImage: selected,
                                images: imgs,
                              }));
                              toast.success('👑 تم تعيين الصورة كصورة رئيسية (Hero) وكرت للرحلة!');
                            }}
                            className="text-xs text-amber-500 hover:bg-amber-500/10 border-amber-500/30 gap-1 rounded-xl font-bold shrink-0 cursor-pointer h-8"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            تعيين كهيرو وكرت
                          </Button>
                        )}

                        {/* Delete Button */}
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => {
                            const imgs = [...(formData.images || [])];
                            const removed = imgs.splice(idx, 1)[0];
                            const nextHero = isCurrentHero ? (imgs[0] || '') : (formData.heroImage || imgs[0] || '');
                            setFormData(prev => ({
                              ...prev,
                              heroImage: nextHero,
                              images: imgs,
                            }));
                          }}
                          className="text-destructive hover:bg-destructive/10 shrink-0"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}

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
        <DialogFooter className="p-3 sm:p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between gap-2 sm:gap-3 shrink-0">
          <Button variant="outline" onClick={handleSafeClose} className="rounded-xl text-xs font-bold shrink-0">
            إلغاء
          </Button>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 sm:px-7 py-2.5 text-xs shadow-md shadow-amber-500/20 cursor-pointer w-full sm:w-auto gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
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

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        multiple
        onSelectMultiple={(urls) => {
          const existing = formData.images || [];
          const newImgs = [...existing, ...urls.filter(u => !existing.includes(u))];
          setFormData(prev => ({
            ...prev,
            images: newImgs,
            heroImage: prev.heroImage || newImgs[0] || '',
          }));
          toast.success(`تمت إضافة ${urls.length} صور من المكتبة بنجاح!`);
        }}
        onSelect={(url) => {
          const existing = formData.images || [];
          if (!existing.includes(url)) {
            const newImgs = [...existing, url];
            setFormData(prev => ({
              ...prev,
              images: newImgs,
              heroImage: prev.heroImage || newImgs[0] || '',
            }));
            toast.success('تمت إضافة الصورة بنجاح!');
          }
        }}
      />
    </Dialog>
  );
});

TripEditorModal.displayName = 'TripEditorModal';
