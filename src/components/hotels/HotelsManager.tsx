"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Hotel,
  Plus,
  Search,
  Star,
  MapPin,
  Edit3,
  Trash2,
  Globe2,
  Building2,
  Sparkles,
  CheckCircle2,
  Compass,
  Phone,
  Mail,
  ExternalLink,
  BedDouble,
  ShieldCheck,
  Coffee,
  Wifi,
  Waves,
  Utensils,
  Dumbbell,
  Clock,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Eye,
  Users,
  DollarSign,
  Copy,
  Check,
  Layers,
  UtensilsCrossed,
  Car,
  Wine,
  Sun,
  Flame,
  Tv,
  Palmtree,
  Shield,
  Briefcase,
  ChevronDown,
  RefreshCw,
  X,
  UploadCloud,
  FolderOpen,
  Link as LinkIcon,
  Archive,
  ArchiveRestore,
  RotateCcw,
  Wand2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateHotel,
  useCreateSeason,
  useDeleteHotel,
  useDeleteSeason,
  useHotelLifecycle,
  useHotels,
  useSeasons,
  useUpdateHotel,
  useUpdateSeason,
} from "@/features/hotels/hooks/useHotels";
import {
  useHotelBookings,
  useUpdateHotelBookingStatus,
} from "@/features/hotels/hooks/useHotelBookings";
import {
  AdminHotel,
  HotelPayload,
  HotelRoomPayload,
  HotelStatus,
  HotelBooking,
  HotelBookingStatus,
  RoomSeasonPricingItem,
  SeasonPayload,
  SeasonRecord,
} from "@/features/hotels/types";
import { format } from "date-fns";
import { useMediaAssets, useUploadMedia, useUpdateMedia } from "@/features/media/hooks/useMedia";
import { MediaAsset, MediaEntityType } from "@/features/media/types";
import { autoTranslateMissingEntityFields } from "@/lib/translationService";

// ----------------------------------------------------
// Constants & Presets
// ----------------------------------------------------
export const DESTINATION_OPTIONS = [
  { slug: "egypt", nameEn: "Egypt", nameAr: "مصر", flag: "🇪🇬", defaultCities: ["Cairo", "Giza", "Luxor", "Aswan", "Sharm El Sheikh", "Hurghada", "Alexandria", "Marsa Alam", "Dahab", "Siwa"] },
  { slug: "turkey", nameEn: "Turkey", nameAr: "تركيا", flag: "🇹🇷", defaultCities: ["Istanbul", "Cappadocia", "Antalya", "Bodrum", "Pamukkale", "Trabzon", "Izmir"] },
  { slug: "jordan", nameEn: "Jordan", nameAr: "الأردن", flag: "🇯🇴", defaultCities: ["Amman", "Petra", "Dead Sea", "Aqaba", "Wadi Rum", "Jerash"] },
  { slug: "dubai", nameEn: "Dubai & UAE", nameAr: "دبي والإمارات", flag: "🇦🇪", defaultCities: ["Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah", "Fujairah"] },
  { slug: "morocco", nameEn: "Morocco", nameAr: "المغرب", flag: "🇲🇦", defaultCities: ["Marrakech", "Casablanca", "Fes", "Tangier", "Rabat", "Chefchaouen", "Agadir"] },
  { slug: "greece", nameEn: "Greece", nameAr: "اليونان", flag: "🇬🇷", defaultCities: ["Athens", "Santorini", "Mykonos", "Crete", "Rhodes", "Corfu"] },
  { slug: "tunisia", nameEn: "Tunisia", nameAr: "تونس", flag: "🇹🇳", defaultCities: ["Tunis", "Hammamet", "Sousse", "Djerba", "Tozeur", "Monastir"] },
  { slug: "multi-country", nameEn: "Multi-Country", nameAr: "برامج متعددة الوجهات", flag: "🌍", defaultCities: ["Cairo & Dubai", "Egypt & Jordan", "Turkey & Greece", "Middle East Grand Tour"] },
  { slug: "religious", nameEn: "Religious & Cultural", nameAr: "رحلات دينية وثقافية", flag: "✨", defaultCities: ["Holy Land", "Jerusalem & Amman", "Islamic Cairo", "Saint Catherine"] },
] as const;

export const AMENITY_CATEGORIES = [
  {
    categoryEn: "Wellness, Spa & Pools",
    categoryAr: "الاستجمام، السبا والمسابح",
    items: [
      { id: "pool", labelEn: "Swimming Pool", labelAr: "مسبح فاخر", icon: Waves },
      { id: "heatedPool", labelEn: "Heated Pool", labelAr: "مسبح دافئ", icon: Flame },
      { id: "infinityPool", labelEn: "Infinity Pool", labelAr: "مسبح إنفينيتي", icon: Waves },
      { id: "spa", labelEn: "Luxury Spa & Sauna", labelAr: "سبا ونادي صحي", icon: Sparkles },
      { id: "jacuzzi", labelEn: "Private Jacuzzi", labelAr: "جاكوزي خاص", icon: Flame },
      { id: "beach", labelEn: "Private Beach Front", labelAr: "شاطئ رملي خاص", icon: Palmtree },
    ],
  },
  {
    categoryEn: "Dining & Culinary",
    categoryAr: "المطاعم والضيافة",
    items: [
      { id: "restaurant", labelEn: "Fine Dining Restaurant", labelAr: "مطعم فاخر", icon: Utensils },
      { id: "breakfast", labelEn: "Breakfast Buffet Included", labelAr: "شامل الإفطار الفاخر", icon: Coffee },
      { id: "rooftop", labelEn: "Rooftop Lounge & Bar", labelAr: "لاونج مع إطلالة بانورامية", icon: Wine },
      { id: "roomService", labelEn: "24h Room Service", labelAr: "خدمة غرف 24 ساعة", icon: Clock },
      { id: "halalDining", labelEn: "Halal Certified Cuisine", labelAr: "مأكولات حلال معتمدة", icon: UtensilsCrossed },
    ],
  },
  {
    categoryEn: "VIP Services & Comfort",
    categoryAr: "الخدمات الحصرية والراحة",
    items: [
      { id: "wifi", labelEn: "High-Speed Wi-Fi", labelAr: "واي فاي فائق السرعة", icon: Wifi },
      { id: "concierge", labelEn: "24/7 VIP Concierge", labelAr: "خدمة كونسيرج 24/7", icon: ShieldCheck },
      { id: "airportShuttle", labelEn: "Private Airport Chauffeur", labelAr: "توصيل خاص للمطار", icon: Car },
      { id: "valetParking", labelEn: "Free Valet Parking", labelAr: "خدمة صف السيارات", icon: Car },
      { id: "butler", labelEn: "Personal Butler Service", labelAr: "خدمة خادم شخصي", icon: Shield },
    ],
  },
  {
    categoryEn: "Fitness & Leisure",
    categoryAr: "اللياقة والأنشطة",
    items: [
      { id: "gym", labelEn: "State-of-the-Art Gym", labelAr: "مركز لياقة بدنية متطور", icon: Dumbbell },
      { id: "tennis", labelEn: "Tennis Courts", labelAr: "ملاعب تنس", icon: Sun },
      { id: "diving", labelEn: "Diving & Water Sports Center", labelAr: "مركز غوص وأنشطة بحرية", icon: Compass },
      { id: "businessCenter", labelEn: "Executive Business Center", labelAr: "مركز رجال أعمال وقاعات", icon: Briefcase },
    ],
  },
];

export const MEAL_PLAN_OPTIONS = [
  { id: "bb", nameEn: "Bed & Breakfast (BB)", nameAr: "شامل الإفطار (BB)", nameEs: "Alojamiento y Desayuno (BB)", namePt: "Café da Manhã Incluso (BB)", nameIt: "Pernottamento e Colazione (BB)" },
  { id: "hb", nameEn: "Half Board (HB)", nameAr: "إقامة نصف شاملة (HB)", nameEs: "Media Pensión (HB)", namePt: "Meia Pensão (HB)", nameIt: "Mezza Pensione (HB)" },
  { id: "fb", nameEn: "Full Board (FB)", nameAr: "إقامة كاملة (FB)", nameEs: "Pensión Completa (FB)", namePt: "Pensão Completa (FB)", nameIt: "Pensione Completa (FB)" },
  { id: "ai", nameEn: "All Inclusive (AI)", nameAr: "شامل كلياً (AI)", nameEs: "Todo Incluido (AI)", namePt: "Tudo Incluído (AI)", nameIt: "All Inclusive (AI)" },
  { id: "ro", nameEn: "Room Only (RO)", nameAr: "إقامة بدون وجبات (RO)", nameEs: "Solo Habitación (RO)", namePt: "Apenas Quarto (RO)", nameIt: "Solo Camera (RO)" },
];

export const ROOM_AMENITIES_OPTIONS = [
  { id: "wifi", labelEn: "High-Speed Wi-Fi", labelAr: "واي فاي فائق السرعة", labelEs: "Wi-Fi de Alta Velocidad", labelPt: "Wi-Fi de Alta Velocidade", labelIt: "Wi-Fi ad Alta Velocità", icon: Wifi },
  { id: "ac", labelEn: "Climate AC", labelAr: "تكييف مركزي متطور", labelEs: "Aire Acondicionado", labelPt: "Ar Condicionado", labelIt: "Aria Condizionata", icon: Sun },
  { id: "jacuzzi", labelEn: "Private Jacuzzi", labelAr: "جاكوزي خاص", labelEs: "Jacuzzi Privado", labelPt: "Jacuzzi Privada", labelIt: "Idromassaggio Privato", icon: Flame },
  { id: "balcony", labelEn: "Private Balcony", labelAr: "شرفة / تراس خاص", labelEs: "Balcón Privado", labelPt: "Varanda Privada", labelIt: "Balcone Privato", icon: Palmtree },
  { id: "minibar", labelEn: "Mini Bar", labelAr: "ميني بار ومشروبات", labelEs: "Minibar", labelPt: "Frigobar", labelIt: "Minibar", icon: Wine },
  { id: "coffee", labelEn: "Coffee & Tea Maker", labelAr: "ماكينة قهوة وشاي", labelEs: "Cafetera y Té", labelPt: "Máquina de Café e Chá", labelIt: "Macchina per Caffè e Tè", icon: Coffee },
  { id: "tv", labelEn: "Smart TV Satellite", labelAr: "شاشة ذكية وقنوات فضائية", labelEs: "Smart TV Satelital", labelPt: "Smart TV Satélite", labelIt: "Smart TV Satellitare", icon: Tv },
  { id: "safe", labelEn: "Digital Safe Box", labelAr: "خزنة أمان رقمية", labelEs: "Caja Fuerte Digital", labelPt: "Cofre Digital", labelIt: "Cassaforte Digitale", icon: ShieldCheck },
  { id: "bathroom", labelEn: "Luxury Marble Bath", labelAr: "حمام رخامي فاخر", labelEs: "Baño de Mármol de Lujo", labelPt: "Banheiro de Mármore de Luxo", labelIt: "Bagno in Marmo di Lusso", icon: Waves },
  { id: "roomService", labelEn: "24/7 Room Service", labelAr: "خدمة غرف على مدار الساعة", labelEs: "Servicio de Habitaciones 24/7", labelPt: "Serviço de Quarto 24/7", labelIt: "Servizio in Camera 24/7", icon: Utensils },
  { id: "linen", labelEn: "Egyptian Cotton Linen", labelAr: "مفروشات قطن مصري 100%", labelEs: "Sábanas de Algodón Egipcio", labelPt: "Lençóis de Algodão Egípcio", labelIt: "Lenzuola in Cotone Egiziano", icon: Sparkles },
  { id: "soundproof", labelEn: "Soundproof Windows", labelAr: "نوافذ عازلة للصوت", labelEs: "Ventanas Insonorizadas", labelPt: "Janelas com Isolamento Acústico", labelIt: "Finestre Insonorizzate", icon: Shield },
];

export const ROOM_PRESETS = [
  {
    slug: "single-room",
    nameEn: "Single Boutique Room",
    nameAr: "غرفة مفردة فاخرة (سينجل)",
    nameEs: "Habitación Individual Boutique",
    namePt: "Quarto Individual Boutique",
    nameIt: "Camera Singola Boutique",
    rate: 75,
    maxOccupancy: 1,
    inventory: 10,
    mealPlan: "bb",
    bedEn: "1 Single Bed",
    bedAr: "1 سرير مفرد",
    bedEs: "1 Cama Individual",
    bedPt: "1 Cama de Solteiro",
    bedIt: "1 Letto Singolo",
    viewEn: "City & Garden View",
    viewAr: "إطلالة على الحديقة والمدينة",
    viewEs: "Vista a la Ciudad y Jardín",
    viewPt: "Vista da Cidade e Jardim",
    viewIt: "Vista Città e Giardino",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200",
    amenities: ["wifi", "ac", "bathroom", "minibar", "coffee", "linen", "tv", "safe"],
  },
  {
    slug: "twin-room",
    nameEn: "Deluxe Twin Room",
    nameAr: "غرفة ديلوكس توأم (سريرين منفصلين)",
    nameEs: "Habitación Doble Twin Deluxe",
    namePt: "Quarto Twin Deluxe",
    nameIt: "Camera Twin Deluxe",
    rate: 85,
    maxOccupancy: 2,
    inventory: 15,
    mealPlan: "bb",
    bedEn: "2 Twin Beds",
    bedAr: "سريران منفصلان",
    bedEs: "2 Camas Individuales",
    bedPt: "2 Camas de Solteiro",
    bedIt: "2 Letti Singoli",
    viewEn: "Landmark & Oasis View",
    viewAr: "إطلالة على المعالم والواحة",
    viewEs: "Vista al Oasis",
    viewPt: "Vista do Oásis",
    viewIt: "Vista Oasi",
    image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1200",
    amenities: ["wifi", "ac", "bathroom", "minibar", "coffee", "linen", "tv", "safe", "roomService"],
  },
  {
    slug: "double-room",
    nameEn: "Grand Double Pyramids View",
    nameAr: "غرفة جراند دبل بإطلالة الأهرامات",
    nameEs: "Habitación Doble Grand Vista Pirámides",
    namePt: "Quarto Duplo Grand Vista Pirâmides",
    nameIt: "Camera Matrimoniale Grand Vista Piramidi",
    rate: 95,
    maxOccupancy: 2,
    inventory: 15,
    mealPlan: "bb",
    bedEn: "1 King Bed",
    bedAr: "1 سرير كينج ملكي",
    bedEs: "1 Cama King Size",
    bedPt: "1 Cama King",
    bedIt: "1 Letto King",
    viewEn: "Direct Pyramids Panoramic View",
    viewAr: "إطلالة بانورامية مباشرة على الأهرامات",
    viewEs: "Vista Panorámica Directa a las Pirámides",
    viewPt: "Vista Panorâmica Direta das Pirâmides",
    viewIt: "Vista Panoramica Diretta sulle Piramidi",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200",
    amenities: ["wifi", "ac", "bathroom", "minibar", "coffee", "linen", "tv", "safe", "balcony", "roomService"],
  },
  {
    slug: "triple-room",
    nameEn: "Premium Triple Family Room",
    nameAr: "غرفة عائلية ثلاثية بريميوم (تريبل)",
    nameEs: "Habitación Triple Familiar Premium",
    namePt: "Quarto Triplo Familiar Premium",
    nameIt: "Camera Tripla Familiare Premium",
    rate: 125,
    maxOccupancy: 3,
    inventory: 10,
    mealPlan: "bb",
    bedEn: "1 King Bed + 1 Single Bed",
    bedAr: "1 سرير كينج + 1 سرير مفرد",
    bedEs: "1 Cama King + 1 Cama Individual",
    bedPt: "1 Cama King + 1 Cama de Solteiro",
    bedIt: "1 Letto King + 1 Letto Singolo",
    viewEn: "Resort Pool & Garden View",
    viewAr: "إطلالة على مسبح المنتجع والحديقة",
    viewEs: "Vista a la Piscina y Jardín",
    viewPt: "Vista da Piscina e Jardim",
    viewIt: "Vista Piscina e Giardino",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200",
    amenities: ["wifi", "ac", "bathroom", "minibar", "coffee", "linen", "tv", "safe", "roomService"],
  },
  {
    slug: "executive-suite",
    nameEn: "Executive Luxury Suite",
    nameAr: "جناح تنفيذي فاخر (إكزكتيف سويت)",
    nameEs: "Suite Ejecutiva de Lujo",
    namePt: "Suíte Executiva de Luxo",
    nameIt: "Suite Executive di Lusso",
    rate: 190,
    maxOccupancy: 3,
    inventory: 6,
    mealPlan: "bb",
    bedEn: "1 King Bed + Private Salon Lounge",
    bedAr: "1 سرير كينج + صالون استراحة خاص",
    bedEs: "1 Cama King + Sala de Estar Privada",
    bedPt: "1 Cama King + Sala de Estar Privada",
    bedIt: "1 Letto King + Salotto Privato",
    viewEn: "Panoramic Nile / Landmark View",
    viewAr: "إطلالة بانورامية ساحرة على النيل / المعالم",
    viewEs: "Vista Panorámica al Nilo",
    viewPt: "Vista Panorâmica do Nilo",
    viewIt: "Vista Panoramica sul Nilo",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200",
    amenities: ["wifi", "ac", "bathroom", "minibar", "coffee", "linen", "tv", "safe", "jacuzzi", "balcony", "roomService", "soundproof"],
  },
  {
    slug: "royal-pyramid-view-suite",
    nameEn: "Royal Presidential Suite",
    nameAr: "الجناح الملكي الرئاسي بإطلالة الأهرامات",
    nameEs: "Suite Presidencial Real Vista Pirámides",
    namePt: "Suíte Presidencial Real Vista Pirâmides",
    nameIt: "Suite Presidenziale Reale Vista Piramidi",
    rate: 280,
    maxOccupancy: 4,
    inventory: 4,
    mealPlan: "hb",
    bedEn: "Master King Bed + Royal Majlis + Jacuzzi",
    bedAr: "ماستر كينج + مجلس ملكي + جاكوزي خاص",
    bedEs: "Cama King Master + Sala Real + Jacuzzi",
    bedPt: "Cama King Master + Sala Real + Jacuzzi",
    bedIt: "Letto King Master + Salone Reale + Jacuzzi",
    viewEn: "Front-Row Direct Pyramids View",
    viewAr: "إطلالة صف أول مباشرة على الأهرامات",
    viewEs: "Vista Frontal Directa a las Pirámides",
    viewPt: "Vista Frontal Direta das Pirâmides",
    viewIt: "Vista Frontale Diretta sulle Piramidi",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200",
    amenities: ["wifi", "ac", "bathroom", "minibar", "coffee", "linen", "tv", "safe", "jacuzzi", "balcony", "roomService", "soundproof"],
  },
];

export interface FormRoomItem {
  id?: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  nameEs: string;
  namePt: string;
  nameIt: string;
  descEn?: string;
  descAr?: string;
  descEs?: string;
  descPt?: string;
  descIt?: string;
  ratePerNight: number;
  maxOccupancy: number;
  inventory: number;
  mealPlan: string;
  isActive: boolean;
  bedTypeEn?: string;
  bedTypeAr?: string;
  bedTypeEs?: string;
  bedTypePt?: string;
  bedTypeIt?: string;
  viewTypeEn?: string;
  viewTypeAr?: string;
  viewTypeEs?: string;
  viewTypePt?: string;
  viewTypeIt?: string;
  image?: string;
  gallery?: string[];
  amenities?: string[];
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
  seasonPricings?: RoomSeasonPricingItem[];
}

interface HotelFormData {
  slug: string;
  nameEn: string;
  nameAr: string;
  nameEs: string;
  namePt: string;
  nameIt: string;
  descEn: string;
  descAr: string;
  descEs: string;
  descPt: string;
  descIt: string;
  destinationSlug: string;
  city: string;
  stars: number;
  rating: string;
  currency: string;
  phone: string;
  email: string;
  website: string;
  heroMediaId: string;
  heroImageUrl: string;
  amenities: Record<string, boolean>;
  checkIn: string;
  checkOut: string;
  cancellationPolicy: string;
  status: HotelStatus;
  isActive: boolean;
  rooms: FormRoomItem[];
}

const defaultFormData = (): HotelFormData => ({
  slug: "",
  nameEn: "",
  nameAr: "",
  nameEs: "",
  namePt: "",
  nameIt: "",
  descEn: "",
  descAr: "",
  descEs: "",
  descPt: "",
  descIt: "",
  destinationSlug: "egypt",
  city: "Cairo",
  stars: 5,
  rating: "4.9",
  currency: "USD",
  phone: "",
  email: "",
  website: "",
  heroMediaId: "",
  heroImageUrl: "",
  amenities: {
    pool: true,
    spa: true,
    wifi: true,
    restaurant: true,
    gym: true,
    breakfast: true,
    concierge: true,
    roomService: true,
  },
  checkIn: "14:00",
  checkOut: "12:00",
  cancellationPolicy: "Free cancellation up to 48 hours before check-in.",
  status: "PUBLISHED",
  isActive: true,
  rooms: [
    {
      slug: "grand-double-pyramids",
      nameEn: "Grand Double Pyramids View",
      nameAr: "غرفة جراند دبل بإطلالة الأهرامات",
      nameEs: "Habitación Doble Grand Vista Pirámides",
      namePt: "Quarto Duplo Grand Vista Pirâmides",
      nameIt: "Camera Matrimoniale Grand Vista Piramidi",
      descEn: "Spacious luxury room with panoramic direct views of the Pyramids and plush King bed.",
      descAr: "غرفة فندقية فاخرة وواسعة بإطلالة بانورامية مباشرة على الأهرامات وسرير كينج ملكي.",
      descEs: "Espaciosa habitación de lujo con vista panorámica directa a las Pirámides y lujosa cama King.",
      descPt: "Quarto espaçoso de luxo com vista panorâmica direta para as Pirâmides e cama King aconchegante.",
      descIt: "Spaziosa camera di lusso con vista panoramica diretta sulle Piramidi e sontuoso letto King.",
      ratePerNight: 195,
      maxOccupancy: 2,
      inventory: 15,
      mealPlan: "bb",
      isActive: true,
      bedTypeEn: "1 King Bed",
      bedTypeAr: "1 سرير كينج ملكي",
      bedTypeEs: "1 Cama King Size",
      bedTypePt: "1 Cama King",
      bedTypeIt: "1 Letto King",
      viewTypeEn: "Direct Pyramids Panoramic View",
      viewTypeAr: "إطلالة بانورامية مباشرة على الأهرامات",
      viewTypeEs: "Vista Panorámica Directa a las Pirámides",
      viewTypePt: "Vista Panorâmica Direta das Pirâmides",
      viewTypeIt: "Vista Panoramica Diretta sulle Piramidi",
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200",
      amenities: ["wifi", "ac", "bathroom", "minibar", "coffee", "linen", "tv", "safe", "balcony", "roomService"],
    },
    {
      slug: "royal-presidential-suite",
      nameEn: "Royal Presidential Suite",
      nameAr: "الجناح الملكي الرئاسي",
      nameEs: "Suite Presidencial Real",
      namePt: "Suíte Presidencial Real",
      nameIt: "Suite Presidenziale Reale",
      descEn: "Ultimate presidential suite featuring a private Jacuzzi, master bedroom, and royal lounge.",
      descAr: "الجناح الرئاسي الأرقى متضمناً جاكوزي خاص، غرفة نوم رئيسية ماستر، وصالة استقبال ملكية.",
      descEs: "La suite presidencial definitiva con jacuzzi privado, dormitorio principal y salón real.",
      descPt: "A suíte presidencial definitiva com banheira de hidromassagem privativa, quarto principal e sala real.",
      descIt: "La suite presidenziale per eccellenza dotata di idromassaggio privato, camera da letto padronale e salone reale.",
      ratePerNight: 480,
      maxOccupancy: 4,
      inventory: 5,
      mealPlan: "hb",
      isActive: true,
      bedTypeEn: "Master King Bed + Royal Majlis + Jacuzzi",
      bedTypeAr: "ماستر كينج + مجلس ملكي + جاكوزي خاص",
      bedTypeEs: "Cama King Master + Sala Real + Jacuzzi",
      bedTypePt: "Cama King Master + Sala Real + Jacuzzi",
      bedTypeIt: "Letto King Master + Salone Reale + Jacuzzi",
      viewTypeEn: "Front-Row Direct Pyramids View",
      viewTypeAr: "إطلالة صف أول مباشرة على الأهرامات",
      viewTypeEs: "Vista Frontal Directa a las Pirámides",
      viewTypePt: "Vista Frontal Direta das Pirâmides",
      viewTypeIt: "Vista Frontale Diretta sulle Piramidi",
      image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200",
      amenities: ["wifi", "ac", "bathroom", "minibar", "coffee", "linen", "tv", "safe", "jacuzzi", "balcony", "roomService", "soundproof"],
    },
  ],
});

export function HotelsManager() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  const [search, setSearch] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [selectedStars, setSelectedStars] = useState<number | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "ACTIVE" | "ARCHIVED">("ALL");

  const [selectedHotel, setSelectedHotel] = useState<AdminHotel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<AdminHotel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useHotels({
    page: 1,
    limit: 100,
    search: search || undefined,
  });

  const lifecycleMutation = useHotelLifecycle();
  const deleteMutation = useDeleteHotel();

  // Standalone Hotel Bookings & Seasons Workspace State
  const [activeMainTab, setActiveMainTab] = useState<"catalog" | "seasons" | "bookings">("catalog");
  const { data: seasonsData, isLoading: isSeasonsLoading } = useSeasons();
  const createSeasonMutation = useCreateSeason();
  const updateSeasonMutation = useUpdateSeason();
  const deleteSeasonMutation = useDeleteSeason();

  const seasons: SeasonRecord[] = useMemo(() => {
    return Array.isArray(seasonsData) ? seasonsData : [];
  }, [seasonsData]);

  const [editingSeason, setEditingSeason] = useState<SeasonRecord | null>(null);
  const [seasonForm, setSeasonForm] = useState({
    code: "",
    nameEn: "",
    nameAr: "",
    nameEs: "",
    namePt: "",
    nameIt: "",
    startDate: "2026-10-01",
    endDate: "2027-04-30",
    multiplier: 1.2,
    isActive: true,
    sortOrder: 0,
  });

  const handleResetSeasonForm = () => {
    setEditingSeason(null);
    setSeasonForm({
      code: "",
      nameEn: "",
      nameAr: "",
      nameEs: "",
      namePt: "",
      nameIt: "",
      startDate: "2026-10-01",
      endDate: "2027-04-30",
      multiplier: 1.2,
      isActive: true,
      sortOrder: seasons.length,
    });
  };

  const handleSelectEditSeason = (season: SeasonRecord) => {
    setEditingSeason(season);
    setSeasonForm({
      code: season.code,
      nameEn: season.nameJsonb?.en || "",
      nameAr: season.nameJsonb?.ar || "",
      nameEs: season.nameJsonb?.es || "",
      namePt: season.nameJsonb?.pt || "",
      nameIt: season.nameJsonb?.it || "",
      startDate: (season.startDate || "").slice(0, 10),
      endDate: (season.endDate || "").slice(0, 10),
      multiplier: Number(season.multiplier) || 1.0,
      isActive: season.isActive ?? true,
      sortOrder: season.sortOrder ?? 0,
    });
  };

  const handleSaveSeason = async () => {
    const cleanCode = (seasonForm.code || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "_");
    const cleanNameEn = (seasonForm.nameEn || "").trim();
    if (!cleanCode || !cleanNameEn) {
      toast.error(isAr ? "يرجى إدخال كود الموسم والاسم بالإنجليزية." : "Season code and English name are required.");
      return;
    }
    const payload: SeasonPayload = {
      code: cleanCode,
      nameJsonb: {
        en: cleanNameEn,
        ar: (seasonForm.nameAr || "").trim() || cleanNameEn,
        es: (seasonForm.nameEs || "").trim() || cleanNameEn,
        pt: (seasonForm.namePt || "").trim() || cleanNameEn,
        it: (seasonForm.nameIt || "").trim() || cleanNameEn,
      },
      startDate: seasonForm.startDate,
      endDate: seasonForm.endDate,
      multiplier: Number(seasonForm.multiplier) || 1.0,
      isActive: seasonForm.isActive,
      sortOrder: Number(seasonForm.sortOrder) || 0,
    };
    if (editingSeason) {
      await updateSeasonMutation.mutateAsync({ id: editingSeason.id, payload });
    } else {
      await createSeasonMutation.mutateAsync(payload);
    }
    handleResetSeasonForm();
  };

  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("ALL");
  const [bookingSearch, setBookingSearch] = useState("");
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<HotelBooking | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState("");

  const { data: bookingsData, isLoading: isBookingsLoading } = useHotelBookings({
    page: 1,
    limit: 100,
    status: bookingStatusFilter !== "ALL" ? bookingStatusFilter : undefined,
    search: (bookingSearch || "").trim() || undefined,
  });

  const updateBookingStatusMutation = useUpdateHotelBookingStatus();

  const allBookings: HotelBooking[] = useMemo(() => {
    return bookingsData?.items || [];
  }, [bookingsData]);

  const bookingStats = useMemo(() => {
    const total = allBookings.length;
    const pending = allBookings.filter((b) => b.status === "PENDING").length;
    const confirmed = allBookings.filter((b) => b.status === "CONFIRMED").length;
    const completed = allBookings.filter((b) => b.status === "COMPLETED").length;
    const cancelled = allBookings.filter((b) => b.status === "CANCELLED").length;
    const totalRevenue = allBookings.reduce(
      (sum, b) => (b.status !== "CANCELLED" ? sum + (Number(b.totalAmountUsd) || 0) : sum),
      0
    );
    return { total, pending, confirmed, completed, cancelled, totalRevenue };
  }, [allBookings]);

  const hotels = Array.isArray(data) ? data : (data?.data ?? []);

  // Filter hotels
  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      if (selectedDestination !== "all" && (h.destinationSlug || "").toLowerCase() !== selectedDestination.toLowerCase()) {
        return false;
      }
      if (selectedStars !== "ALL" && h.stars !== selectedStars) {
        return false;
      }
      if (selectedStatus === "ACTIVE") {
        if (h.status === "ARCHIVED" || !h.isActive) return false;
      } else if (selectedStatus === "ARCHIVED") {
        if (h.status !== "ARCHIVED" && h.isActive) return false;
      }
      const cleanSearch = (search || "").trim();
      if (cleanSearch) {
        const q = cleanSearch.toLowerCase();
        const en = (h.nameJsonb?.en || "").toLowerCase();
        const ar = (h.nameJsonb?.ar || "").toLowerCase();
        const city = (h.city || "").toLowerCase();
        const slug = (h.slug || "").toLowerCase();
        return en.includes(q) || ar.includes(q) || city.includes(q) || slug.includes(q);
      }
      return true;
    });
  }, [hotels, selectedDestination, selectedStars, selectedStatus, search]);

  const handleOpenAdd = () => {
    setSelectedHotel(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (hotel: AdminHotel) => {
    setSelectedHotel(hotel);
    setIsDialogOpen(true);
  };

  const handleArchive = (hotel: AdminHotel) => {
    const name = hotel.nameJsonb?.[locale] || hotel.nameJsonb?.en || hotel.slug;
    lifecycleMutation.mutate(
      { id: hotel.id, action: "archive" },
      {
        onSuccess: () => {
          toast.success(
            isAr
              ? `تم نقل فندق "${name}" إلى الأرشيف وإخفاؤه من القائمة 📦`
              : `Hotel "${name}" moved to archive`
          );
          refetch();
        },
      }
    );
  };

  const handleUnarchive = (hotel: AdminHotel) => {
    const name = hotel.nameJsonb?.[locale] || hotel.nameJsonb?.en || hotel.slug;
    lifecycleMutation.mutate(
      { id: hotel.id, action: "unarchive" },
      {
        onSuccess: () => {
          toast.success(
            isAr
              ? `تمت استعادة فندق "${name}" بنجاح وأصبح متاحاً في القائمة النشطة 🔄`
              : `Hotel "${name}" restored successfully and is now active 🔄`,
            {
              action: {
                label: isAr ? "عرض النشطة ✨" : "View Active ✨",
                onClick: () => setSelectedStatus("ACTIVE"),
              },
            }
          );
          refetch();
        },
      }
    );
  };

  const handlePublish = (hotel: AdminHotel) => {
    const isPub = hotel.status === "PUBLISHED";
    lifecycleMutation.mutate(
      { id: hotel.id, action: isPub ? "unpublish" : "publish" },
      {
        onSuccess: () => {
          toast.success(
            isPub
              ? (isAr ? "تم تحويل الفندق إلى مسودة (غير متاح للجمهور)" : "Hotel converted to draft")
              : (isAr ? "تم نشر الفندق بنجاح وأصبح متاحاً للحجز" : "Hotel published successfully")
          );
          refetch();
        },
      }
    );
  };

  // Metrics
  const totalHotels = hotels.length;
  const fiveStarCount = hotels.filter((h) => h.stars === 5).length;
  const publishedCount = hotels.filter((h) => h.status !== "ARCHIVED" && h.isActive).length;
  const totalRoomsCount = hotels.reduce((acc: number, h) => acc + (h.rooms?.reduce((rAcc: number, r: any) => rAcc + (r.inventory || 0), 0) || 0), 0);

  // Live Counts for destination pills
  const destinationCounts = useMemo(() => {
    const counts: Record<string, number> = { all: hotels.length };
    for (const h of hotels) {
      const d = (h.destinationSlug || "egypt").toLowerCase();
      counts[d] = (counts[d] || 0) + 1;
    }
    return counts;
  }, [hotels]);

  // Live Counts for stars
  const starCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: hotels.length, "5": 0, "4": 0, "3": 0 };
    for (const h of hotels) {
      if (h.stars === 5) counts["5"] = (counts["5"] || 0) + 1;
      else if (h.stars === 4) counts["4"] = (counts["4"] || 0) + 1;
      else if (h.stars === 3) counts["3"] = (counts["3"] || 0) + 1;
    }
    return counts;
  }, [hotels]);

  // Live Counts for statuses
  const statusCounts = useMemo(() => {
    const activeCount = hotels.filter((h) => h.status !== "ARCHIVED" && h.isActive).length;
    const archivedCount = hotels.length - activeCount;
    return {
      ALL: hotels.length,
      ACTIVE: activeCount,
      ARCHIVED: archivedCount,
    };
  }, [hotels]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Main Mode Switcher: Catalog vs Bookings */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2.5 bg-muted/60 border border-border/80 rounded-3xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMainTab("catalog")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeMainTab === "catalog"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.01]"
                : "text-muted-foreground hover:text-foreground hover:bg-card/70"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{isAr ? "دليل الفنادق والغرف (Catalog)" : "Hotels & Rooms Catalog"}</span>
            <span className="bg-slate-950/20 text-slate-950 text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
              {totalHotels}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab("seasons")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeMainTab === "seasons"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.01]"
                : "text-muted-foreground hover:text-foreground hover:bg-card/70"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{isAr ? "المواسم والتسعير الموسمي (Seasons & Pricing)" : "Seasons & Pricing Matrix"}</span>
            <span className="bg-amber-600 text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
              {seasons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab("bookings")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeMainTab === "bookings"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.01]"
                : "text-muted-foreground hover:text-foreground hover:bg-card/70"
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>{isAr ? "حجوزات الفنادق والغرف المباشرة (Hotel Bookings)" : "Hotel & Room Reservations"}</span>
            <span className="bg-emerald-600 text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
              {bookingStats.total}
            </span>
          </button>
        </div>
      </div>

      {activeMainTab === "catalog" && (
        <div className="space-y-6">
      {/* 1. Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "إجمالي الفنادق المسجلة" : "Total Hotels in Catalog"}</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {totalHotels} <span className="text-xs font-bold text-amber-500">{isAr ? "فندق 🏨" : "Hotels 🏨"}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Hotel className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>

        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "فنادق ومنتجعات 5 نجوم" : "5-Star Luxury Resorts"}</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {fiveStarCount} <span className="text-xs font-bold text-amber-400">⭐⭐⭐⭐⭐</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Sparkles className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>

        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "فنادق نشطة ومتاحة للحجز ✨" : "Active & Bookable ✨"}</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {publishedCount} <span className="text-xs font-bold text-emerald-500">({totalHotels ? Math.round((publishedCount / totalHotels) * 100) : 0}%) 🌐</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>

        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "إجمالي الغرف المتاحة" : "Total Room Inventory"}</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {totalRoomsCount} <span className="text-xs font-bold text-sky-500">{isAr ? "غرفة متاحة 🛏️" : "Rooms 🛏️"}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500">
            <BedDouble className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>
      </div>

      {/* 2. Actions & Filters Bar */}
      <Card className="p-5 bg-card border border-border/80 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              <span>{isAr ? "إدارة الفنادق والإقامة الفاخرة والغرف" : "Luxury Hotels & Accommodations Suite"}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
              {isAr
                ? "التحكم الكامل بالفنادق الشريكة، فئات الغرف، الأسعار وعدد الغرف المتاحة، والترجمات الـ 5."
                : "Full control over luxury partner hotels, room tiers, available inventories, and 5-language content."}
            </p>
          </div>

          <Button
            onClick={handleOpenAdd}
            className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs gap-2 px-6 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-3" />
            <span>{isAr ? "إضافة فندق جديد +" : "Add New Hotel +"}</span>
          </Button>
        </div>

        {/* Destination Filter Pills with Counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedDestination("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-1.5 shadow-xs ${
              selectedDestination === "all"
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-[1.02]"
                : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted/70"
            }`}
          >
            <span>🌐</span>
            <span>{isAr ? "جميع الوجهات" : "All Destinations"}</span>
            <span
            className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black ${
                selectedDestination === "all"
                  ? "bg-slate-950/20 text-slate-950"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {destinationCounts.all || 0}
            </span>
          </button>

          {DESTINATION_OPTIONS.map((dest) => {
            const isActive = selectedDestination === dest.slug;
            const label = isAr ? dest.nameAr : dest.nameEn;
            const count = destinationCounts[dest.slug.toLowerCase()] || 0;
            return (
              <button
                key={dest.slug}
                onClick={() => setSelectedDestination(dest.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-1.5 shadow-xs ${
                  isActive
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-[1.02]"
                    : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <span>{dest.flag}</span>
                <span>{label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black ${
                    isActive
                      ? "bg-slate-950/20 text-slate-950"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Star Rating Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t">
          <div className="relative w-full sm:w-80">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground rtl:right-3 ltr:left-3 rtl:left-auto" />
            <input
              type="text"
              placeholder={isAr ? "البحث باسم الفندق، المدينة، أو الـ slug..." : "Search by hotel name, city, slug..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground shrink-0">{isAr ? "النجوم:" : "Stars:"}</span>
              <div className="flex items-center gap-1">
                {(["ALL", 5, 4, 3] as const).map((s) => {
                  const count = s === "ALL" ? starCounts.ALL : (starCounts[String(s)] || 0);
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedStars(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1 ${
                        selectedStars === s
                          ? "bg-amber-500 text-slate-950 border-amber-500"
                          : "bg-muted/30 text-muted-foreground border-border"
                      }`}
                    >
                      <span>{s === "ALL" ? (isAr ? "الكل" : "All") : `${s} ⭐`}</span>
                      <span className={`text-[10px] font-mono font-bold ${
                        selectedStars === s ? "text-slate-950" : "text-muted-foreground"
                      }`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground shrink-0">{isAr ? "الحالة:" : "Status:"}</span>
              <div className="flex items-center gap-1 flex-wrap">
                {(["ALL", "ACTIVE", "ARCHIVED"] as const).map((st) => {
                  const count = statusCounts[st] || 0;
                  return (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedStatus === st
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black"
                          : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      <span>
                        {st === "ALL"
                          ? (isAr ? "الكل" : "All")
                          : st === "ACTIVE"
                          ? (isAr ? "النشطة ✨" : "Active ✨")
                          : (isAr ? "الأرشيف 📦" : "Archived 📦")}
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${
                        selectedStatus === st ? "text-slate-950" : "text-muted-foreground"
                      }`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Hotels Grid */}
      {isError ? (
        <Card className="p-12 text-center border-destructive/30 bg-destructive/5 space-y-3">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h3 className="text-base font-bold text-destructive">
            {isAr ? "تعذر تحميل قائمة الفنادق من الخادم." : "Hotel inventory could not be loaded from backend."}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isAr ? "يرجى التحقق من الاتصال وإعادة المحاولة." : "Please check connection and retry."}
          </p>
          <Button variant="outline" className="mt-2" onClick={() => void refetch()}>
            {isAr ? "إعادة المحاولة" : "Retry"}
          </Button>
        </Card>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-muted-foreground font-semibold">
            {isAr ? "جاري تحميل قائمة الفنادق الفاخرة..." : "Loading luxury hotel catalog..."}
          </p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground border-dashed rounded-3xl">
          <Hotel className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm font-bold">
            {isAr ? "لا توجد فنادق مطابقة لهذا البحث أو التصنيف." : "No hotels match the selected filters."}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-xs text-amber-500 font-bold"
            onClick={() => {
              setSelectedDestination("all");
              setSelectedStars("ALL");
              setSelectedStatus("ALL");
              setSearch("");
            }}
          >
            {isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => {
            const name = hotel.nameJsonb?.[locale] || hotel.nameJsonb?.en || hotel.slug;
            const desc = hotel.descriptionJsonb?.[locale] || hotel.descriptionJsonb?.en || (isAr ? "إقامة فاخرة متكاملة الخدمات مع إطلالة مميزة ومرافق راقية." : "Luxury 5-star accommodation with bespoke guest amenities.");
            const roomsCount = hotel.rooms?.length || 0;
            const hotelInventory = hotel.rooms?.reduce((sum: number, r: any) => sum + (r.inventory || 0), 0) || 0;
            const lowestRate = hotel.rooms && hotel.rooms.length > 0
              ? Math.min(...hotel.rooms.map((r: any) => r.ratePerNight))
              : null;
            const heroImg = hotel.heroImageUrl;
            const destinationFallbackImg =
              hotel.destinationSlug?.toLowerCase().includes("dubai") || hotel.city?.toLowerCase().includes("dubai")
                ? "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200"
                : hotel.destinationSlug?.toLowerCase().includes("turkey") || hotel.city?.toLowerCase().includes("istanbul")
                ? "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200"
                : hotel.destinationSlug?.toLowerCase().includes("jordan") || hotel.city?.toLowerCase().includes("petra")
                ? "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200"
                : "https://images.unsplash.com/photo-1572252821143-035a0f6700c2?q=80&w=1200";

            const displayImg = heroImg || destinationFallbackImg;
            const ratingVal = hotel.rating !== null ? Number(hotel.rating).toFixed(1) : "4.9";
            const isPub = hotel.status === "PUBLISHED" && hotel.isActive;

            return (
              <Card
                key={hotel.id || hotel.slug}
                className="group rounded-3xl border border-border/80 bg-card hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Hero Image & Top Badges */}
                  <div className="h-48 relative overflow-hidden bg-slate-950">
                    <img
                      src={displayImg}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200";
                      }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-black/40" />

                    {/* Stars Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/85 text-amber-400 backdrop-blur-md border border-amber-400/30 text-xs font-black shadow-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{hotel.stars} ⭐ ({ratingVal})</span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <Badge
                        className={`font-bold text-[10px] shadow-xs ${
                          hotel.status !== "ARCHIVED" && hotel.isActive
                            ? "bg-emerald-500/90 text-slate-950 font-black border border-emerald-400/40"
                            : "bg-slate-900/90 text-amber-400 border border-amber-400/30 font-bold"
                        }`}
                      >
                        {hotel.status !== "ARCHIVED" && hotel.isActive
                          ? (isAr ? "نشط ✨" : "ACTIVE")
                          : (isAr ? "مؤرشف 📦" : "ARCHIVED")}
                      </Badge>
                    </div>

                    {/* Bottom Location Tag & Rate */}
                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-slate-200">
                      <span className="flex items-center gap-1 font-bold truncate max-w-[60%]">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{hotel.city} · {hotel.destinationSlug}</span>
                      </span>
                      {lowestRate !== null && (
                        <span className="font-mono font-extrabold text-amber-400 text-xs bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          {isAr ? `تبدأ من $${lowestRate}` : `From $${lowestRate}`} / {isAr ? "ليلة" : "nt"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-black text-base text-foreground line-clamp-1 group-hover:text-amber-500 transition-colors">
                      {name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                      {desc}
                    </p>

                    {/* Rooms & Inventory Quick Summary */}
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-extrabold text-foreground">
                        <BedDouble className="w-4 h-4 text-amber-500" />
                        <span>{isAr ? `${roomsCount} فئات غرف` : `${roomsCount} Room Tiers`}</span>
                      </span>
                      <span className="font-bold text-muted-foreground text-[11px]">
                        {isAr ? `إجمالي السعة: ${hotelInventory} غرفة` : `Capacity: ${hotelInventory} rooms`}
                      </span>
                    </div>

                    {/* 5-Language Badge */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground pt-1 border-t border-border/60">
                      <span>{isAr ? "الترجمات المتاحة:" : "Translations:"}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">5/5 {isAr ? "لغات متوفرة ✓" : "5 Locales Active ✓"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-5 py-3 flex items-center justify-between border-t border-border/60 bg-muted/20">
                  <span className="text-[11px] font-mono text-muted-foreground truncate max-w-35">/{hotel.slug}</span>

                  <div className="flex items-center gap-1.5">
                    {hotel.status === "ARCHIVED" || !hotel.isActive ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnarchive(hotel)}
                          className="h-8 text-xs font-bold text-emerald-500 border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 rounded-xl cursor-pointer gap-1 px-3"
                          title={isAr ? "استعادة الفندق للقائمة النشطة" : "Restore hotel to active list"}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{isAr ? "استعادة 🔄" : "Restore"}</span>
                        </Button>

                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(hotel)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
                          title={isAr ? "معاينة وتعديل" : "Edit"}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => {
                            setHotelToDelete(hotel);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8 hover:bg-destructive/10 text-destructive rounded-xl cursor-pointer"
                          title={isAr ? "حذف نهائي للفندق من النظام" : "Delete Hotel Permanently"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(hotel)}
                          className="h-8 text-xs font-bold hover:bg-amber-500 hover:text-slate-950 rounded-xl cursor-pointer gap-1 px-3 border-amber-500/30 text-amber-500"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isAr ? "تعديل الفندق والغرف" : "Edit & Rooms"}</span>
                        </Button>

                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleArchive(hotel)}
                          className="h-8 w-8 hover:bg-amber-500/10 text-amber-500 rounded-xl cursor-pointer"
                          title={isAr ? "أرشفة الفندق وإخفاؤه من القائمة النشطة" : "Archive Hotel (Move to Archive)"}
                        >
                          <Archive className="w-4 h-4" />
                        </Button>

                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => {
                            setHotelToDelete(hotel);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8 hover:bg-destructive/10 text-destructive rounded-xl cursor-pointer"
                          title={isAr ? "حذف الفندق نهائياً" : "Delete Hotel"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

              </div>
      )}

      {/* Seasons & Pricing Matrix Workspace */}
      {activeMainTab === "seasons" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Season Editor Card */}
            <Card className="lg:col-span-5 p-6 bg-card border border-border/80 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">
                      {editingSeason
                        ? (isAr ? "تعديل بيانات الموسم" : "Edit Pricing Season")
                        : (isAr ? "إضافة موسم تسعير جديد" : "Create Pricing Season")}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-semibold">
                      {isAr
                        ? "تحديد فترات المواسم ومعامل التسعير الافتراضي باللغات الـ 5."
                        : "Define global seasonal windows, multipliers, and 5-locale titles."}
                    </p>
                  </div>
                </div>
                {editingSeason && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetSeasonForm}
                    className="h-8 text-xs font-bold text-muted-foreground"
                  >
                    {isAr ? "إلغاء" : "Reset"}
                  </Button>
                )}
              </div>

              {/* Quick Season Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground block">
                  {isAr ? "قوالب مواسم جاهزة:" : "Quick Season Templates:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { code: "HIGH_WINTER", nameEn: "Peak Winter Season", nameAr: "موسم الذروة الشتوي", nameEs: "Temporada Alta de Invierno", namePt: "Alta Temporada de Inverno", nameIt: "Alta Stagione Invernale", startDate: "2026-10-01", endDate: "2027-04-30", multiplier: 1.25 },
                    { code: "LOW_SUMMER", nameEn: "Summer Value Season", nameAr: "الموسم الصيفي الاقتصادي", nameEs: "Temporada Baja de Verano", namePt: "Baixa Temporada de Verão", nameIt: "Bassa Stagione Estiva", startDate: "2026-05-01", endDate: "2026-09-30", multiplier: 0.9 },
                    { code: "FESTIVE_PEAK", nameEn: "New Year & Festive Peak", nameAr: "موسم الأعياد ورأس السنة", nameEs: "Temporada Festiva y Fin de Año", namePt: "Temporada Festiva e Ano Novo", nameIt: "Stagione Festiva e Capodanno", startDate: "2026-12-20", endDate: "2027-01-07", multiplier: 1.5 },
                  ].map((preset) => (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() =>
                        setSeasonForm({
                          ...seasonForm,
                          code: preset.code,
                          nameEn: preset.nameEn,
                          nameAr: preset.nameAr,
                          nameEs: preset.nameEs,
                          namePt: preset.namePt,
                          nameIt: preset.nameIt,
                          startDate: preset.startDate,
                          endDate: preset.endDate,
                          multiplier: preset.multiplier,
                        })
                      }
                      className="px-2.5 py-1 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-[11px] font-bold text-amber-500 transition-colors cursor-pointer"
                    >
                      + {isAr ? preset.nameAr : preset.nameEn} ({preset.multiplier}x)
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-foreground">
                    {isAr ? "كود الموسم (Code) *" : "Season Code *"}
                  </label>
                  <Input
                    value={seasonForm.code}
                    onChange={(e) => setSeasonForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="HIGH_WINTER"
                    className="h-9 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-foreground">
                    {isAr ? "معامل السعر (Multiplier) *" : "Price Multiplier *"}
                  </label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="10"
                    value={seasonForm.multiplier}
                    onChange={(e) => setSeasonForm((prev) => ({ ...prev, multiplier: Number(e.target.value) }))}
                    className="h-9 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-foreground">
                    {isAr ? "تاريخ البداية *" : "Start Date *"}
                  </label>
                  <Input
                    type="date"
                    value={seasonForm.startDate}
                    onChange={(e) => setSeasonForm((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-foreground">
                    {isAr ? "تاريخ النهاية *" : "End Date *"}
                  </label>
                  <Input
                    type="date"
                    value={seasonForm.endDate}
                    onChange={(e) => setSeasonForm((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-foreground">🇬🇧 Season Name (EN) *</label>
                  <Input
                    value={seasonForm.nameEn}
                    onChange={(e) => setSeasonForm((prev) => ({ ...prev, nameEn: e.target.value }))}
                    placeholder="Peak Winter Season"
                    className="h-9 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-foreground">🇸🇦 اسم الموسم (AR)</label>
                  <Input
                    value={seasonForm.nameAr}
                    onChange={(e) => setSeasonForm((prev) => ({ ...prev, nameAr: e.target.value }))}
                    placeholder="موسم الذروة الشتوي"
                    className="h-9 text-xs font-bold"
                    dir="rtl"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={seasonForm.nameEs}
                    onChange={(e) => setSeasonForm((prev) => ({ ...prev, nameEs: e.target.value }))}
                    placeholder="🇪🇸 Español"
                    className="h-8 text-[11px]"
                  />
                  <Input
                    value={seasonForm.namePt}
                    onChange={(e) => setSeasonForm((prev) => ({ ...prev, namePt: e.target.value }))}
                    placeholder="🇵🇹 Português"
                    className="h-8 text-[11px]"
                  />
                  <Input
                    value={seasonForm.nameIt}
                    onChange={(e) => setSeasonForm((prev) => ({ ...prev, nameIt: e.target.value }))}
                    placeholder="🇮🇹 Italiano"
                    className="h-8 text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={seasonForm.isActive}
                    onChange={(e) => setSeasonForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>{isAr ? "موسم نشط ومفعل" : "Active Season"}</span>
                </label>

                <Button
                  type="button"
                  onClick={handleSaveSeason}
                  disabled={createSeasonMutation.isPending || updateSeasonMutation.isPending}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 cursor-pointer"
                >
                  {(createSeasonMutation.isPending || updateSeasonMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  )}
                  <span>
                    {editingSeason
                      ? (isAr ? "حفظ تعديلات الموسم" : "Update Season")
                      : (isAr ? "إضافة الموسم +" : "Create Season +")}
                  </span>
                </Button>
              </div>
            </Card>

            {/* Right: Configured Seasons List */}
            <Card className="lg:col-span-7 p-6 bg-card border border-border/80 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-sm font-black text-foreground">
                    {isAr ? "جدول المواسم المعتمدة للتسعير" : "Configured Global Pricing Seasons"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    {isAr
                      ? "تُستخدم هذه المواسم لتحديد أسعار الغرف الموسمية (RoomSeasonPricing) ومعاملات تسعير الرحلات."
                      : "Used across Room Seasonal Pricing matrices and automated tour date pricing."}
                  </p>
                </div>
                <Badge className="bg-amber-500/15 text-amber-500 border border-amber-500/30 font-mono text-xs">
                  {seasons.length} {isAr ? "مواسم" : "Seasons"}
                </Badge>
              </div>

              {isSeasonsLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                  <span className="text-xs font-bold">{isAr ? "جاري تحميل المواسم..." : "Loading seasons..."}</span>
                </div>
              ) : seasons.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed rounded-2xl space-y-2">
                  <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs font-bold text-muted-foreground">
                    {isAr
                      ? "لا توجد مواسم مسجلة بعد. استخدم النموذج الجانبي لإضافة موسم جديد."
                      : "No pricing seasons configured yet. Use the form on the left to add one."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {seasons.map((s) => {
                    const title = s.nameJsonb?.[locale] || s.nameJsonb?.en || s.code;
                    return (
                      <div
                        key={s.id}
                        className="p-4 rounded-2xl border border-border/80 bg-muted/20 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              {s.code}
                            </span>
                            <span className="text-sm font-black text-foreground">{title}</span>
                            <Badge
                              variant="outline"
                              className={
                                s.isActive
                                  ? "border-emerald-500/40 text-emerald-500 text-[10px]"
                                  : "border-border text-muted-foreground text-[10px]"
                              }
                            >
                              {s.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "غير نشط" : "Inactive")}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono flex items-center gap-3">
                            <span>📅 {(s.startDate || "").slice(0, 10)} ➔ {(s.endDate || "").slice(0, 10)}</span>
                            <span className="text-amber-500 font-bold">
                              ×{Number(s.multiplier).toFixed(2)} {isAr ? "معامل السعر" : "Multiplier"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleSelectEditSeason(s)}
                            className="h-8 text-xs font-bold rounded-xl gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                            <span>{isAr ? "تعديل" : "Edit"}</span>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSeasonMutation.mutate(s.id)}
                            disabled={deleteSeasonMutation.isPending}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Standalone Hotel Bookings Workspace */}
      {activeMainTab === "bookings" && (
        <div className="space-y-6">
          {/* Booking KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground">
                  {isAr ? "إجمالي حجوزات الفنادق" : "Total Hotel Bookings"}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
                  {bookingStats.total} <span className="text-xs font-bold text-amber-500">{isAr ? "حجز 🏨" : "Stays"}</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <BedDouble className="w-6 h-6 stroke-[2.2]" />
              </div>
            </Card>

            <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground">
                  {isAr ? "بانتظار التأكيد والمراجعة" : "Pending Confirmation"}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-500">
                  {bookingStats.pending} <span className="text-xs font-bold text-amber-500">⏳</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Clock className="w-6 h-6 stroke-[2.2]" />
              </div>
            </Card>

            <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground">
                  {isAr ? "حجوزات وإقامات مؤكدة" : "Confirmed Stays"}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-500">
                  {bookingStats.confirmed} <span className="text-xs font-bold text-emerald-500">✅</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
              </div>
            </Card>

            <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground">
                  {isAr ? "إجمالي إيرادات الفنادق" : "Total Hotel Revenue"}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-500">
                  ${bookingStats.totalRevenue.toLocaleString()} <span className="text-xs font-bold text-amber-500">USD 💰</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <DollarSign className="w-6 h-6 stroke-[2.2]" />
              </div>
            </Card>
          </div>

          {/* Bookings Filters & Search */}
          <Card className="p-5 bg-card border border-border/80 rounded-3xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/60">
                {[
                  { id: "ALL", label: isAr ? "جميع الحجوزات" : "All Bookings", count: bookingStats.total },
                  { id: "PENDING", label: isAr ? "قيد المراجعة" : "Pending", count: bookingStats.pending, badgeColor: "bg-amber-500/20 text-amber-600 dark:text-amber-400" },
                  { id: "CONFIRMED", label: isAr ? "مؤكدة" : "Confirmed", count: bookingStats.confirmed, badgeColor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" },
                  { id: "COMPLETED", label: isAr ? "مكتملة" : "Completed", count: bookingStats.completed, badgeColor: "bg-sky-500/20 text-sky-600 dark:text-sky-400" },
                  { id: "CANCELLED", label: isAr ? "ملغاة" : "Cancelled", count: bookingStats.cancelled, badgeColor: "bg-rose-500/20 text-rose-600 dark:text-rose-400" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setBookingStatusFilter(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bookingStatusFilter === tab.id
                        ? "bg-card text-foreground shadow-xs border border-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        tab.badgeColor || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground rtl:right-3 ltr:left-3 rtl:left-auto" />
                <input
                  type="text"
                  placeholder={isAr ? "البحث بالكود، النزيل، الهاتف..." : "Search by ref, guest, phone..."}
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </Card>

          {/* Bookings Table */}
          {isBookingsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs font-medium">{isAr ? "جاري تحميل حجوزات الفنادق..." : "Loading hotel bookings..."}</p>
            </div>
          ) : allBookings.length === 0 ? (
            <Card className="p-12 text-center rounded-3xl bg-card border-border/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <BedDouble className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                {isAr ? "لا توجد حجوزات فنادق مطابقة" : "No hotel bookings found"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {isAr
                  ? "عندما يقوم النزلاء بطلب حجز غرف فندقية من الموقع ستظهر جميع تفاصيل الحجز هنا مباشرة."
                  : "When guests submit hotel room reservations from the public site, they will appear here."}
              </p>
            </Card>
          ) : (
            <Card className="rounded-3xl border-border/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start dir-ltr">
                  <thead className="bg-muted/60 border-b border-border/80 text-muted-foreground font-bold">
                    <tr>
                      <th className="p-3.5 text-start">{isAr ? "كود الحجز" : "Reference"}</th>
                      <th className="p-3.5 text-start">{isAr ? "الفندق والغرفة" : "Hotel & Room"}</th>
                      <th className="p-3.5 text-start">{isAr ? "النزيل والتواصل" : "Guest Contact"}</th>
                      <th className="p-3.5 text-center">{isAr ? "تواريخ الإقامة" : "Dates & Nights"}</th>
                      <th className="p-3.5 text-center">{isAr ? "الإجمالي" : "Total USD"}</th>
                      <th className="p-3.5 text-center">{isAr ? "الحالة" : "Status"}</th>
                      <th className="p-3.5 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {allBookings.map((b) => {
                      const hotelName = b.hotel?.nameJsonb?.[locale] || b.hotel?.nameJsonb?.en || b.hotel?.slug || "Hotel";
                      const roomName = b.room?.nameJsonb?.[locale] || b.room?.nameJsonb?.en || b.room?.slug || "Standard Room";
                      const isPending = b.status === "PENDING";
                      const isConfirmed = b.status === "CONFIRMED";
                      const isCompleted = b.status === "COMPLETED";

                      return (
                        <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                          {/* Reference */}
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-mono font-black text-foreground">
                              <span>{b.referenceCode}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(b.referenceCode);
                                  toast.success("تم نسخ كود الحجز 📋");
                                }}
                                className="text-muted-foreground hover:text-amber-500 cursor-pointer"
                                title="نسخ الكود"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {b.createdAt ? format(new Date(b.createdAt), "MMM d, yyyy") : ""}
                            </span>
                          </td>

                          {/* Hotel & Room */}
                          <td className="p-3.5 max-w-[220px]">
                            <div className="font-bold text-foreground line-clamp-1">{hotelName}</div>
                            <div className="text-[11px] text-amber-500 font-semibold line-clamp-1">🛏️ {roomName}</div>
                            {b.hotel?.city && (
                              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{b.hotel.city}</span>
                              </div>
                            )}
                          </td>

                          {/* Guest Contact */}
                          <td className="p-3.5">
                            <div className="font-bold text-foreground">{b.guestName}</div>
                            <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <a href={`mailto:${b.guestEmail}`} className="hover:underline text-foreground/80">{b.guestEmail}</a>
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${b.guestPhone}`} className="hover:underline text-foreground/80">{b.guestPhone}</a>
                            </div>
                          </td>

                          {/* Stay Dates */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <div className="text-xs font-mono font-bold text-foreground">
                              {b.checkInDate ? format(new Date(b.checkInDate), "dd/MM/yyyy") : "—"} ➔ {b.checkOutDate ? format(new Date(b.checkOutDate), "dd/MM/yyyy") : "—"}
                            </div>
                            <div className="flex items-center justify-center gap-1.5 mt-0.5">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold bg-amber-500/10 text-amber-600 border-amber-500/30">
                                {b.nights} {isAr ? "ليالٍ" : "nights"}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-bold">
                                {b.roomsCount} {isAr ? "غرفة" : "rm"} • {b.guestsCount} {isAr ? "نزيل" : "guests"}
                              </span>
                            </div>
                          </td>

                          {/* Total Amount */}
                          <td className="p-3.5 text-center whitespace-nowrap font-mono font-black text-sm text-foreground">
                            ${Number(b.totalAmountUsd).toLocaleString()}
                            <span className="text-[10px] text-muted-foreground font-normal block font-sans">
                              (${Number(b.ratePerNightUsd)}/nt)
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            {isConfirmed ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                {isAr ? "مؤكد ✅" : "Confirmed"}
                              </Badge>
                            ) : isPending ? (
                              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold animate-pulse">
                                {isAr ? "قيد المراجعة ⏳" : "Pending"}
                              </Badge>
                            ) : isCompleted ? (
                              <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-[10px] font-bold">
                                {isAr ? "مكتمل 🏨" : "Completed"}
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                                {isAr ? "ملغى 🚫" : "Cancelled"}
                              </Badge>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-end whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      updateBookingStatusMutation.mutate({
                                        id: b.id,
                                        status: "CONFIRMED",
                                      })
                                    }
                                    disabled={updateBookingStatusMutation.isPending}
                                    className="h-8 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{isAr ? "تأكيد" : "Confirm"}</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateBookingStatusMutation.mutate({
                                        id: b.id,
                                        status: "CANCELLED",
                                      })
                                    }
                                    disabled={updateBookingStatusMutation.isPending}
                                    className="h-8 px-2 rounded-xl border-rose-500/40 text-rose-600 hover:bg-rose-500/10 text-xs font-bold gap-1 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>{isAr ? "إلغاء" : "Cancel"}</span>
                                  </Button>
                                </>
                              )}

                              {isConfirmed && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateBookingStatusMutation.mutate({
                                        id: b.id,
                                        status: "COMPLETED",
                                      })
                                    }
                                    disabled={updateBookingStatusMutation.isPending}
                                    className="h-8 px-2.5 rounded-xl border-sky-500/40 text-sky-600 hover:bg-sky-500/10 text-xs font-bold gap-1 cursor-pointer"
                                  >
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span>{isAr ? "إتمام" : "Complete"}</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateBookingStatusMutation.mutate({
                                        id: b.id,
                                        status: "CANCELLED",
                                      })
                                    }
                                    disabled={updateBookingStatusMutation.isPending}
                                    className="h-8 px-2 rounded-xl border-rose-500/40 text-rose-600 hover:bg-rose-500/10 text-xs font-bold gap-1 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>{isAr ? "إلغاء" : "Cancel"}</span>
                                  </Button>
                                </>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedBookingForDetails(b);
                                  setAdminNotesInput(b.adminNotes || "");
                                }}
                                className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-amber-500 cursor-pointer"
                                title="عرض التفاصيل والملاحظات"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Booking Details & Notes Dialog */}
      <Dialog
        open={Boolean(selectedBookingForDetails)}
        onOpenChange={(open) => {
          if (!open) setSelectedBookingForDetails(null);
        }}
      >
        <DialogContent className="max-w-lg p-6 rounded-3xl bg-card border-border">
          {selectedBookingForDetails && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-amber-500 text-slate-950 font-black">
                    {selectedBookingForDetails.referenceCode}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedBookingForDetails.createdAt ? format(new Date(selectedBookingForDetails.createdAt), "dd/MM/yyyy HH:mm") : ""}
                  </span>
                </div>
                <DialogTitle className="text-base font-black text-foreground pt-2">
                  🏨 {selectedBookingForDetails.hotel?.nameJsonb?.[locale] || selectedBookingForDetails.hotel?.nameJsonb?.en || selectedBookingForDetails.hotel?.slug}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  🛏️ {selectedBookingForDetails.room?.nameJsonb?.[locale] || selectedBookingForDetails.room?.nameJsonb?.en || "Standard Room"} • {selectedBookingForDetails.hotel?.city}
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "اسم النزيل:" : "Guest Name:"}</span>
                  <span className="font-bold text-foreground">{selectedBookingForDetails.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "البريد الإلكتروني:" : "Email:"}</span>
                  <span className="font-bold font-mono text-foreground">{selectedBookingForDetails.guestEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "رقم الهاتف:" : "Phone:"}</span>
                  <span className="font-bold font-mono text-foreground">{selectedBookingForDetails.guestPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "فترة الإقامة:" : "Stay Dates:"}</span>
                  <span className="font-bold font-mono text-foreground">
                    {selectedBookingForDetails.checkInDate ? format(new Date(selectedBookingForDetails.checkInDate), "dd/MM/yyyy") : ""} ➔ {selectedBookingForDetails.checkOutDate ? format(new Date(selectedBookingForDetails.checkOutDate), "dd/MM/yyyy") : ""} ({selectedBookingForDetails.nights} {isAr ? "ليالٍ" : "nights"})
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2">
                  <span className="font-bold text-muted-foreground">{isAr ? "المبلغ الإجمالي:" : "Total Amount:"}</span>
                  <span className="font-black text-sm text-amber-500 font-mono">
                    ${Number(selectedBookingForDetails.totalAmountUsd).toLocaleString()} USD
                  </span>
                </div>
              </div>

              {selectedBookingForDetails.specialRequests && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                  <span className="font-bold text-amber-600 dark:text-amber-400 block">
                    {isAr ? "طلبات النزيل الخاصة:" : "Special Requests:"}
                  </span>
                  <p className="text-foreground/90 leading-relaxed italic">
                    "{selectedBookingForDetails.specialRequests}"
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {isAr ? "ملاحظات الإدارة الداخلية:" : "Internal Admin Notes:"}
                </label>
                <Textarea
                  rows={3}
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder={isAr ? "أضف أي ملاحظات حول الغرفة، الدفع، أو التأكيد..." : "Add internal notes about payment, room assignment..."}
                  className="rounded-xl text-xs bg-muted/40"
                />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    updateBookingStatusMutation.mutate({
                      id: selectedBookingForDetails.id,
                      status: selectedBookingForDetails.status,
                      adminNotes: adminNotesInput,
                    });
                    setSelectedBookingForDetails(null);
                  }}
                  disabled={updateBookingStatusMutation.isPending}
                  className="rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold text-xs cursor-pointer"
                >
                  {isAr ? "حفظ الملاحظات" : "Save Notes"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedBookingForDetails(null)}
                  className="rounded-xl text-xs cursor-pointer"
                >
                  {isAr ? "إغلاق" : "Close"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 4. Add / Edit Hotel Dialog Modal */}
      <HotelEditorDialog
        hotel={selectedHotel}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {/* 5. Delete Hotel Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md p-6 border-2 border-destructive/30 rounded-3xl bg-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-foreground">
                {isAr ? "تأكيد حذف الفندق" : "Confirm Hotel Deletion"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "هل أنت متأكد من حذف هذا الفندق نهائياً؟ سيتم إلغاء تفعيل الفندق والغرف التابعة له."
                  : "Are you sure you want to delete this hotel? All associated rooms will be deactivated."}
              </DialogDescription>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border my-2 space-y-1.5 text-xs">
            <div className="font-extrabold text-foreground text-sm">
              🏨 {hotelToDelete?.nameJsonb?.[locale] || hotelToDelete?.nameJsonb?.en || hotelToDelete?.slug}
            </div>
            <div className="text-muted-foreground text-[11px] font-medium flex items-center gap-2">
              <span>📍 {hotelToDelete?.city} · {hotelToDelete?.destinationSlug}</span>
              <span>⭐ {hotelToDelete?.stars} {isAr ? "نجوم" : "stars"}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-xs rounded-xl cursor-pointer"
            >
              {isAr ? "إلغاء التراجع" : "Cancel"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (hotelToDelete) {
                  deleteMutation.mutate(hotelToDelete.id, {
                    onSuccess: () => {
                      setIsDeleteDialogOpen(false);
                      setHotelToDelete(null);
                      toast.success(
                        isAr ? "تم مسح وحذف الفندق بنجاح 🗑️" : "Hotel deleted successfully 🗑️"
                      );
                      refetch();
                    },
                  });
                }
              }}
              className="text-xs font-bold gap-1 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{isAr ? "نعم، احذف الفندق الآن 🗑️" : "Yes, Delete Hotel 🗑️"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ----------------------------------------------------
// Media Library Picker Modal for Hotels
// ----------------------------------------------------
function MediaLibraryPickerModal({
  open,
  onClose,
  onSelect,
  selectedAssetId,
  selectedAssetUrl,
  entityId,
  locale = "ar",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: { id: string; url: string; altText?: string }) => void;
  selectedAssetId?: string;
  selectedAssetUrl?: string;
  /** Existing hotel id. Omitted for a hotel that has not been created yet. */
  entityId?: string;
  locale?: string;
}) {
  const isAr = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [selectedAsset, setSelectedAsset] = useState<{ id: string; url: string; altText?: string } | null>(
    selectedAssetId || selectedAssetUrl ? { id: selectedAssetId || "", url: selectedAssetUrl || "" } : null
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: mediaData, isLoading } = useMediaAssets({
    page: 1,
    limit: 60,
    category: categoryFilter,
    search: (searchQuery || "").trim() || undefined,
  });

  const uploadMutation = useUploadMedia();
  const assets: MediaAsset[] = mediaData?.data || [];

  const filteredAssets = useMemo(() => {
    const cleanQuery = (searchQuery || "").trim().toLowerCase();
    if (!cleanQuery) return assets;
    const q = cleanQuery;
    return assets.filter(
      (a) =>
        a.publicId?.toLowerCase().includes(q) ||
        a.altText?.toLowerCase().includes(q) ||
        a.url?.toLowerCase().includes(q) ||
        a.entityType?.toLowerCase().includes(q)
    );
  }, [assets, searchQuery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isAr ? "حجم الصورة يجب ألا يتجاوز 10 ميغابايت." : "Image size must not exceed 10MB.");
      return;
    }

    try {
      // entityType HOTEL requires a valid entityId server-side; fall back to a
      // GENERAL asset filed under the "hotels" category when there is no id yet.
      const linkedHotelId = entityId?.trim();
      const res = await uploadMutation.mutateAsync({
        file,
        ...(linkedHotelId
          ? { entityType: "HOTEL" as MediaEntityType, entityId: linkedHotelId }
          : { entityType: "GENERAL" as MediaEntityType, categorySlug: "hotels" }),
      });
      const chosen = {
        id: res.id,
        url: res.secureUrl || res.url,
        altText: res.altText || file.name,
      };
      setSelectedAsset(chosen);
      onSelect(chosen);
      toast.success(isAr ? "تم رفع الصورة واختيارها بنجاح! ⭐" : "Image uploaded and selected successfully! ⭐");
      onClose();
    } catch {
      // Handled by mutation hook
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmSelection = () => {
    if (selectedAsset) {
      onSelect(selectedAsset);
      toast.success(isAr ? "تم تعيين الصورة للفندق بنجاح!" : "Image selected for hotel!");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border border-amber-500/30 rounded-3xl bg-background shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/80 bg-muted/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
                <FolderOpen className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                  <span>{isAr ? "مكتبة الوسائط — اختيار صورة الفندق" : "Media Library — Pick Hotel Photo"}</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-semibold">
                  {isAr
                    ? "اختر صورة عالية الجودة من المكتبة أو قم برفع صورة جديدة مباشرة."
                    : "Choose a high-resolution photo from the library or upload a new one directly."}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                <span>{uploadMutation.isPending ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "رفع صورة جديدة 📸" : "Upload New 📸")}</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder={isAr ? "البحث في مكتبة الصور (بالاسم أو المعرف)..." : "Search photos by name or tag..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 text-xs pr-9 rtl:pr-9 ltr:pl-9 rounded-xl font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {[
                { id: undefined, labelEn: "All Media", labelAr: "جميع الصور" },
                { id: "hotels", labelEn: "Hotels", labelAr: "فنادق 🏨" },
                { id: "tours", labelEn: "رحلات ✈️", labelAr: "رحلات ✈️" },
                { id: "general", labelEn: "General", labelAr: "عام 🌐" },
              ].map((tab) => {
                const isActive = categoryFilter === tab.id;
                return (
                  <button
                    key={tab.labelEn}
                    type="button"
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                      isActive
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                        : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {isAr ? tab.labelAr : tab.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 max-h-[55vh] overflow-y-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <span className="text-xs font-bold">{isAr ? "جاري تحميل الصور من مكتبة الوسائط..." : "Loading media assets..."}</span>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center border-2 border-dashed rounded-3xl p-8">
              <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-foreground">
                  {isAr ? "لم يتم العثور على صور مطابقة" : "No photos found"}
                </h4>
                <p className="text-xs text-muted-foreground font-medium">
                  {isAr
                    ? "يمكنك رفع صورة جديدة من جهازك مباشرة بالضغط على الزر بالأعلى."
                    : "You can upload a new photo directly from your device using the upload button above."}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs font-bold border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-slate-950 rounded-xl"
              >
                <UploadCloud className="w-3.5 h-3.5 mr-1" />
                <span>{isAr ? "رفع صورة الآن" : "Upload Photo Now"}</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredAssets.map((asset) => {
                const imgUrl = asset.secureUrl || asset.url;
                const isSelected =
                  selectedAsset?.id === asset.id ||
                  selectedAsset?.url === imgUrl ||
                  selectedAssetId === asset.id ||
                  selectedAssetUrl === imgUrl;

                return (
                  <div
                    key={asset.id}
                    onClick={() =>
                      setSelectedAsset({
                        id: asset.id,
                        url: imgUrl,
                        altText: asset.altText || "",
                      })
                    }
                    onDoubleClick={() => {
                      const chosen = {
                        id: asset.id,
                        url: imgUrl,
                        altText: asset.altText || "",
                      };
                      setSelectedAsset(chosen);
                      onSelect(chosen);
                      onClose();
                    }}
                    className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 aspect-4/3 bg-slate-950 flex flex-col justify-end shadow-xs hover:shadow-md ${
                      isSelected
                        ? "border-amber-500 ring-2 ring-amber-500/40 scale-[1.02]"
                        : "border-border/80 hover:border-amber-500/50"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={asset.altText || "Media Asset"}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                    {isSelected && (
                      <div className="absolute top-2 right-2 rtl:right-2 ltr:left-2 p-1.5 rounded-full bg-amber-500 text-slate-950 shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-3" />
                      </div>
                    )}

                    <div className="absolute top-2 left-2 rtl:left-2 ltr:right-2">
                      <Badge
                        variant="secondary"
                        className="text-[9px] font-bold px-1.5 py-0 bg-slate-950/80 text-amber-400 border border-amber-400/20 backdrop-blur-xs"
                      >
                        {asset.entityType || "MEDIA"}
                      </Badge>
                    </div>

                    <div className="relative p-2 text-slate-200 text-[10px] space-y-0.5">
                      <div className="font-bold truncate" title={asset.altText || asset.publicId}>
                        {asset.altText || asset.publicId.split("/").pop()}
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground text-[9px] font-mono">
                        <span>{asset.format?.toUpperCase() || "JPG"}</span>
                        {asset.bytes > 0 && <span>{(asset.bytes / 1024).toFixed(0)} KB</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/80 bg-muted/30 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 truncate">
            {selectedAsset ? (
              <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                <Check className="w-4 h-4" />
                <span>{isAr ? "تم تحديد صورة" : "Photo Selected"}</span>
                <span className="text-muted-foreground text-[10px] font-mono truncate max-w-[200px]">({selectedAsset.id ? `ID: ${selectedAsset.id.slice(0, 8)}...` : selectedAsset.url.slice(0, 30)})</span>
              </span>
            ) : (
              <span>{isAr ? "انقر على صورة لتحديدها، أو انقر نقراً مزدوجاً للتأكيد الفوري." : "Click a photo to select, or double-click to confirm."}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-xl"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={!selectedAsset}
              onClick={handleConfirmSelection}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 rounded-xl shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4 mr-1 stroke-3" />
              <span>{isAr ? "تأكيد واستخدام الصورة" : "Confirm Selection"}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------
// Dedicated Room Editor Modal Component (5 Languages & Media)
// ----------------------------------------------------
interface RoomEditorModalProps {
  open: boolean;
  onClose: () => void;
  room: FormRoomItem | null;
  roomIndex: number | null;
  onSave: (room: FormRoomItem, index: number | null) => void;
  /** Existing hotel id. Omitted for a hotel that has not been created yet. */
  entityId?: string;
  locale?: string;
}

function RoomEditorModal({
  open,
  onClose,
  room,
  roomIndex,
  onSave,
  entityId,
  locale = "ar",
}: RoomEditorModalProps) {
  const isAr = locale === "ar";
  const [langTab, setLangTab] = useState<"en" | "ar" | "es" | "pt" | "it">("en");
  const [isTranslating, setIsTranslating] = useState(false);

  // Media picker & upload state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadMutation = useUploadMedia();
  const { data: seasonsListData } = useSeasons();
  const availableSeasons: SeasonRecord[] = useMemo(
    () => (Array.isArray(seasonsListData) ? seasonsListData : []),
    [seasonsListData]
  );

  const [roomData, setRoomData] = useState<FormRoomItem>({
    slug: "",
    nameEn: "",
    nameAr: "",
    nameEs: "",
    namePt: "",
    nameIt: "",
    descEn: "",
    descAr: "",
    descEs: "",
    descPt: "",
    descIt: "",
    ratePerNight: 120,
    maxOccupancy: 2,
    inventory: 10,
    mealPlan: "bb",
    isActive: true,
    bedTypeEn: "1 King Bed",
    bedTypeAr: "1 سرير كينج ملكي",
    bedTypeEs: "1 Cama King Size",
    bedTypePt: "1 Cama King",
    bedTypeIt: "1 Letto King",
    viewTypeEn: "Panoramic View",
    viewTypeAr: "إطلالة بانورامية",
    viewTypeEs: "Vista Panorámica",
    viewTypePt: "Vista Panorâmica",
    viewTypeIt: "Vista Panoramica",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200",
    gallery: [],
    amenities: ["wifi", "ac", "bathroom", "minibar", "coffee", "linen", "tv", "safe"],
    smokingAllowed: false,
    petsAllowed: false,
    seasonPricings: [],
  });

  useEffect(() => {
    if (open) {
      if (room) {
        setRoomData({
          id: room.id,
          slug: room.slug || "",
          nameEn: room.nameEn || "",
          nameAr: room.nameAr || "",
          nameEs: room.nameEs || "",
          namePt: room.namePt || "",
          nameIt: room.nameIt || "",
          descEn: room.descEn || "",
          descAr: room.descAr || "",
          descEs: room.descEs || "",
          descPt: room.descPt || "",
          descIt: room.descIt || "",
          ratePerNight:
            room.ratePerNight !== undefined && room.ratePerNight !== null && !isNaN(Number(room.ratePerNight))
              ? Number(room.ratePerNight)
              : 120,
          maxOccupancy: Number(room.maxOccupancy) || 2,
          inventory: Number(room.inventory) >= 0 ? Number(room.inventory) : 10,
          mealPlan: room.mealPlan || "bb",
          isActive: room.isActive ?? true,
          bedTypeEn: room.bedTypeEn || "Double / Twin Beds",
          bedTypeAr: room.bedTypeAr || "مزدوجة / توأم",
          bedTypeEs: room.bedTypeEs || "Doble / Twin",
          bedTypePt: room.bedTypePt || "Duplo / Twin",
          bedTypeIt: room.bedTypeIt || "Matrimoniale / Twin",
          viewTypeEn: room.viewTypeEn || "Standard View",
          viewTypeAr: room.viewTypeAr || "إطلالة قياسية",
          viewTypeEs: room.viewTypeEs || "Vista Estándar",
          viewTypePt: room.viewTypePt || "Vista Padrão",
          viewTypeIt: room.viewTypeIt || "Vista Standard",
          image: room.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200",
          gallery: room.gallery || [],
          amenities: room.amenities || ["wifi", "ac", "bathroom", "minibar", "coffee", "linen", "tv", "safe"],
          smokingAllowed: room.smokingAllowed ?? false,
          petsAllowed: room.petsAllowed ?? false,
          seasonPricings: Array.isArray(room.seasonPricings) ? room.seasonPricings : [],
        });
      } else {
        setRoomData({
          slug: "",
          nameEn: "",
          nameAr: "",
          nameEs: "",
          namePt: "",
          nameIt: "",
          descEn: "",
          descAr: "",
          descEs: "",
          descPt: "",
          descIt: "",
          ratePerNight: 120,
          maxOccupancy: 2,
          inventory: 10,
          mealPlan: "bb",
          isActive: true,
          bedTypeEn: "1 King Bed",
          bedTypeAr: "1 سرير كينج ملكي",
          bedTypeEs: "1 Cama King Size",
          bedTypePt: "1 Cama King",
          bedTypeIt: "1 Letto King",
          viewTypeEn: "Panoramic View",
          viewTypeAr: "إطلالة بانورامية",
          viewTypeEs: "Vista Panorámica",
          viewTypePt: "Vista Panorâmica",
          viewTypeIt: "Vista Panoramica",
          image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200",
          gallery: [],
          amenities: ["wifi", "ac", "bathroom", "minibar", "coffee", "linen", "tv", "safe"],
          smokingAllowed: false,
          petsAllowed: false,
          seasonPricings: [],
        });
      }
      setLangTab("en");
      setShowUrlInput(false);
    }
  }, [open, room]);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isAr ? "حجم الصورة يجب ألا يتجاوز 10 ميغابايت." : "Image size must not exceed 10MB.");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // entityType HOTEL requires a valid entityId server-side; fall back to a
      // GENERAL asset filed under the "hotels" category when there is no id yet.
      const linkedHotelId = entityId?.trim();
      const res = await uploadMutation.mutateAsync({
        file,
        ...(linkedHotelId
          ? { entityType: "HOTEL" as MediaEntityType, entityId: linkedHotelId }
          : { entityType: "GENERAL" as MediaEntityType, categorySlug: "hotels" }),
      });
      const url = res.secureUrl || res.url;
      setRoomData((prev) => ({
        ...prev,
        image: url,
        gallery: [url, ...(prev.gallery || []).filter((g) => g !== url)],
      }));
      toast.success(isAr ? "تم رفع وتعيين صورة الغرفة بنجاح! 📸" : "Room photo uploaded and set! 📸");
    } catch {
      toast.error(isAr ? "تعذر رفع صورة الغرفة." : "Failed to upload room photo.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectMediaAsset = (asset: { id: string; url: string; altText?: string }) => {
    setRoomData((prev) => ({
      ...prev,
      image: asset.url,
      gallery: [asset.url, ...(prev.gallery || []).filter((g) => g !== asset.url)],
    }));
    setIsMediaPickerOpen(false);
    toast.success(isAr ? "تم اختيار صورة الغرفة بنجاح!" : "Room photo selected!");
  };

  const handleAutoTranslateRoom = async () => {
    setIsTranslating(true);
    try {
      const fallbackName = roomData.nameEn || roomData.nameAr || "Deluxe Luxury Suite";
      const fallbackDesc = roomData.descAr || roomData.descEn || "غرفة فندقية فاخرة ومجهزة بأعلى معايير الراحة والضيافة.";

      const translated = await autoTranslateMissingEntityFields(roomData, {
        nameKeys: { ar: "nameAr", en: "nameEn", es: "nameEs", pt: "namePt", it: "nameIt" },
        descKeys: { ar: "descAr", en: "descEn", es: "descEs", pt: "descPt", it: "descIt" },
        fallbackName,
        fallbackDesc,
      });

      const bedEn = translated.bedTypeEn || translated.bedTypeAr || "1 King Bed";
      const bedAr = translated.bedTypeAr || translated.bedTypeEn || "1 سرير كينج ملكي";
      const viewEn = translated.viewTypeEn || translated.viewTypeAr || "Panoramic View";
      const viewAr = translated.viewTypeAr || translated.viewTypeEn || "إطلالة بانورامية";

      setRoomData({
        ...translated,
        bedTypeEn: bedEn,
        bedTypeAr: bedAr,
        bedTypeEs: translated.bedTypeEs || bedEn,
        bedTypePt: translated.bedTypePt || bedEn,
        bedTypeIt: translated.bedTypeIt || bedEn,
        viewTypeEn: viewEn,
        viewTypeAr: viewAr,
        viewTypeEs: translated.viewTypeEs || viewEn,
        viewTypePt: translated.viewTypePt || viewEn,
        viewTypeIt: translated.viewTypeIt || viewEn,
      });

      toast.success(isAr ? "✨ تمت ترجمة بيانات الغرفة للغات الخمس بنجاح!" : "✨ Room data translated across 5 languages!");
    } catch {
      toast.error(isAr ? "تعذر إكمال الترجمة التلقائية للغرفة." : "Room auto-translation failed.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleToggleAmenity = (amenityId: string) => {
    setRoomData((prev) => {
      const current = prev.amenities || [];
      const exists = current.includes(amenityId);
      return {
        ...prev,
        amenities: exists ? current.filter((id) => id !== amenityId) : [...current, amenityId],
      };
    });
  };

  const handleSaveModal = () => {
    const cleanNameEn = (roomData.nameEn || "").trim();
    if (!cleanNameEn) {
      toast.error(isAr ? "يرجى كتابة اسم الغرفة بالإنجليزية على الأقل." : "Room English name is required.");
      setLangTab("en");
      return;
    }
    const cleanSlug = (roomData.slug || "").trim() ? slugify(roomData.slug) : slugify(cleanNameEn);
    const finalRoom: FormRoomItem = {
      ...roomData,
      slug: cleanSlug,
      nameEn: cleanNameEn,
      nameAr: (roomData.nameAr || "").trim() || cleanNameEn,
      nameEs: (roomData.nameEs || "").trim() || cleanNameEn,
      namePt: (roomData.namePt || "").trim() || cleanNameEn,
      nameIt: (roomData.nameIt || "").trim() || cleanNameEn,
      ratePerNight:
        roomData.ratePerNight !== undefined && roomData.ratePerNight !== null && !isNaN(Number(roomData.ratePerNight))
          ? Number(roomData.ratePerNight)
          : 100,
      inventory: Number(roomData.inventory) >= 0 ? Number(roomData.inventory) : 10,
      maxOccupancy: Number(roomData.maxOccupancy) || 2,
    };

    onSave(finalRoom, roomIndex);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border border-amber-500/30 rounded-3xl bg-card shadow-2xl">
        {/* Modal Header */}
        <DialogHeader className="p-6 pb-4 bg-linear-to-r from-amber-500/15 via-primary/10 to-amber-500/5 border-b border-border/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl shrink-0 shadow-xs">
                <BedDouble className="w-6 h-6 stroke-[2.4]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                  <span>
                    {roomIndex !== null
                      ? (isAr ? "تعديل بيانات فئة الغرفة" : "Edit Room Tier & Inventory")
                      : (isAr ? "إضافة فئة غرفة جديدة" : "Add New Room Tier")}
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-semibold">
                  {isAr
                    ? "التحكم في مواصفات الغرفة، الترجمات باللغات الـ 5، السعر، عدد الغرف المتاحة، والمرافق."
                    : "Configure room specifications, 5-language localization, rates, available quota, and amenities."}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-500/40 text-amber-500 font-mono font-black text-xs px-2.5 py-1">
                ${roomData.ratePerNight} / nt • {roomData.inventory} rm
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-5">
          {/* Top Multi-language Bar & AI Auto-Translate */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black text-foreground">
                  {isAr ? "بيانات الغرفة باللغات الـ 5 (العربية، الإنجليزية، الإسبانية، البرتغالية، الإيطالية):" : "Room Content across 5 Locales:"}
                </span>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAutoTranslateRoom}
                disabled={isTranslating}
                className="h-8 text-xs font-bold gap-1.5 rounded-xl border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-slate-950 cursor-pointer shadow-xs shrink-0"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isAr ? "جاري الترجمة..." : "Translating..."}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{isAr ? "✨ ترجمة بالذكاء الاصطناعي" : "✨ AI Auto-Translate"}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Language Switcher Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(
                [
                  { id: "en", label: "🇬🇧 English", nameKey: "nameEn" },
                  { id: "ar", label: "🇸🇦 العربية", nameKey: "nameAr" },
                  { id: "es", label: "🇪🇸 Español", nameKey: "nameEs" },
                  { id: "pt", label: "🇵🇹 Português", nameKey: "namePt" },
                  { id: "it", label: "🇮🇹 Italiano", nameKey: "nameIt" },
                ] as const
              ).map((tab) => {
                const isActive = langTab === tab.id;
                const hasValue = Boolean(roomData[tab.nameKey]);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLangTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                      isActive
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs scale-[1.02]"
                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {hasValue && <Check className={`w-3 h-3 ${isActive ? "text-slate-950" : "text-emerald-500"}`} />}
                  </button>
                );
              })}
            </div>

            {/* Active Language Specific Fields */}
            <div className="space-y-3 pt-2 bg-background/60 p-4 rounded-2xl border border-border/60">
              {langTab === "en" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">🇬🇧 Room Name (English) *</label>
                    <Input
                      value={roomData.nameEn}
                      onChange={(e) => setRoomData((prev) => ({ ...prev, nameEn: e.target.value, slug: slugify(e.target.value) }))}
                      placeholder="e.g. Deluxe Nile View Room"
                      className="h-10 text-xs font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇬🇧 Bed Type (English)</label>
                      <Input
                        value={roomData.bedTypeEn || ""}
                        onChange={(e) => setRoomData((prev) => ({ ...prev, bedTypeEn: e.target.value }))}
                        placeholder="e.g. 1 King Bed or 2 Twin Beds"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇬🇧 View Type (English)</label>
                      <Input
                        value={roomData.viewTypeEn || ""}
                        onChange={(e) => setRoomData((prev) => ({ ...prev, viewTypeEn: e.target.value }))}
                        placeholder="e.g. Pyramids View or Sea View"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">🇬🇧 Room Description & Features (English)</label>
                    <Textarea
                      rows={2}
                      value={roomData.descEn || ""}
                      onChange={(e) => setRoomData((prev) => ({ ...prev, descEn: e.target.value }))}
                      placeholder="Spacious luxury room with marble bathroom, high ceiling and private balcony..."
                      className="text-xs"
                    />
                  </div>
                </div>
              )}

              {langTab === "ar" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">🇸🇦 اسم فئة الغرفة (العربية) *</label>
                    <Input
                      value={roomData.nameAr}
                      onChange={(e) => setRoomData((prev) => ({ ...prev, nameAr: e.target.value }))}
                      placeholder="مثال: غرفة ديلوكس بإطلالة على النيل"
                      className="h-10 text-xs font-bold"
                      dir="rtl"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇸🇦 نوع السرير (العربية)</label>
                      <Input
                        value={roomData.bedTypeAr || ""}
                        onChange={(e) => setRoomData((prev) => ({ ...prev, bedTypeAr: e.target.value }))}
                        placeholder="مثال: سرير كينج ملكي مزدوج"
                        className="h-9 text-xs"
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇸🇦 نوع الإطلالة (العربية)</label>
                      <Input
                        value={roomData.viewTypeAr || ""}
                        onChange={(e) => setRoomData((prev) => ({ ...prev, viewTypeAr: e.target.value }))}
                        placeholder="مثال: إطلالة بانورامية على الأهرامات"
                        className="h-9 text-xs"
                        dir="rtl"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">🇸🇦 وصف وتجهيزات الغرفة (العربية)</label>
                    <Textarea
                      rows={2}
                      value={roomData.descAr || ""}
                      onChange={(e) => setRoomData((prev) => ({ ...prev, descAr: e.target.value }))}
                      placeholder="غرفة فندقية فاخرة ومجهزة بأحدث وسائل الراحة وحمام رخامي وشرفة خاصة..."
                      className="text-xs"
                      dir="rtl"
                    />
                  </div>
                </div>
              )}

              {langTab === "es" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">🇪🇸 Nombre de la Habitación (Español)</label>
                    <Input
                      value={roomData.nameEs}
                      onChange={(e) => setRoomData((prev) => ({ ...prev, nameEs: e.target.value }))}
                      placeholder="ej. Habitación Deluxe con Vista al Nilo"
                      className="h-10 text-xs font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇪🇸 Tipo de Cama (Español)</label>
                      <Input
                        value={roomData.bedTypeEs || ""}
                        onChange={(e) => setRoomData((prev) => ({ ...prev, bedTypeEs: e.target.value }))}
                        placeholder="ej. 1 Cama King Size"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇪🇸 Tipo de Vista (Español)</label>
                      <Input
                        value={roomData.viewTypeEs || ""}
                        onChange={(e) => setRoomData((prev) => ({ ...prev, viewTypeEs: e.target.value }))}
                        placeholder="ej. Vista Panorámica a las Pirámides"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">🇪🇸 Descripción (Español)</label>
                    <Textarea
                      rows={2}
                      value={roomData.descEs || ""}
                      onChange={(e) => setRoomData((prev) => ({ ...prev, descEs: e.target.value }))}
                      placeholder="Habitación espaciosa con acabados de primera clase y balcón privado..."
                      className="text-xs"
                    />
                  </div>
                </div>
              )}

              {langTab === "pt" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">🇵🇹 Nome do Quarto (Português)</label>
                    <Input
                      value={roomData.namePt}
                      onChange={(e) => setRoomData((prev) => ({ ...prev, namePt: e.target.value }))}
                      placeholder="ex. Quarto Deluxe com Vista para o Nilo"
                      className="h-10 text-xs font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇵🇹 Tipo de Cama (Português)</label>
                      <Input
                        value={roomData.bedTypePt || ""}
                        onChange={(e) => setRoomData((prev) => ({ ...prev, bedTypePt: e.target.value }))}
                        placeholder="ex. 1 Cama King"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇵🇹 Tipo de Vista (Português)</label>
                      <Input
                        value={roomData.viewTypePt || ""}
                        onChange={(e) => setRoomData((prev) => ({ ...prev, viewTypePt: e.target.value }))}
                        placeholder="ex. Vista Panorâmica das Pirâmides"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">🇵🇹 Descrição (Português)</label>
                    <Textarea
                      rows={2}
                      value={roomData.descPt || ""}
                      onChange={(e) => setRoomData((prev) => ({ ...prev, descPt: e.target.value }))}
                      placeholder="Quarto luxuoso com comodidades modernas e varanda privativa..."
                      className="text-xs"
                    />
                  </div>
                </div>
              )}

              {langTab === "it" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">🇮🇹 Nome della Camera (Italiano)</label>
                    <Input
                      value={roomData.nameIt}
                      onChange={(e) => setRoomData((prev) => ({ ...prev, nameIt: e.target.value }))}
                      placeholder="es. Camera Deluxe con Vista sul Nilo"
                      className="h-10 text-xs font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇮🇹 Tipo di Letto (Italiano)</label>
                      <Input
                        value={roomData.bedTypeIt || ""}
                        onChange={(e) => setRoomData((prev) => ({ ...prev, bedTypeIt: e.target.value }))}
                        placeholder="es. 1 Letto King"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇮🇹 Tipo di Vista (Italiano)</label>
                      <Input
                        value={roomData.viewTypeIt || ""}
                        onChange={(e) => setRoomData((prev) => ({ ...prev, viewTypeIt: e.target.value }))}
                        placeholder="es. Vista Panoramica sulle Piramidi"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">🇮🇹 Descrizione (Italiano)</label>
                    <Textarea
                      rows={2}
                      value={roomData.descIt || ""}
                      onChange={(e) => setRoomData((prev) => ({ ...prev, descIt: e.target.value }))}
                      placeholder="Camera di lusso elegante con comfort di prima classe e balcone privato..."
                      className="text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing, Inventory & Capacity Section */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-3">
            <h5 className="text-xs font-black text-foreground flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-500" />
              <span>{isAr ? "التسعير، التوافر والسعة للأفراد:" : "Pricing, Inventory & Capacity:"}</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-foreground">{isAr ? "سعر الليلة ($ USD) *" : "Rate/Night ($ USD) *"}</label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    value={roomData.ratePerNight}
                    onChange={(e) => setRoomData((prev) => ({ ...prev, ratePerNight: Number(e.target.value) }))}
                    className="h-10 text-xs font-mono font-black pl-7"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">$</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-foreground">{isAr ? "عدد الغرف المتاحة (Inventory) *" : "Available Rooms (Stock) *"}</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setRoomData((prev) => ({ ...prev, inventory: Math.max(0, prev.inventory - 1) }))}
                    className="w-9 h-10 rounded-xl bg-card border font-bold hover:bg-muted text-xs flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <Input
                    type="number"
                    min="0"
                    value={roomData.inventory}
                    onChange={(e) => setRoomData((prev) => ({ ...prev, inventory: Number(e.target.value) }))}
                    className="h-10 text-xs font-mono font-black text-center text-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setRoomData((prev) => ({ ...prev, inventory: prev.inventory + 1 }))}
                    className="w-9 h-10 rounded-xl bg-card border font-bold hover:bg-muted text-xs flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-foreground">{isAr ? "أقصى سعة للأفراد *" : "Max Occupancy *"}</label>
                <select
                  value={roomData.maxOccupancy}
                  onChange={(e) => setRoomData((prev) => ({ ...prev, maxOccupancy: Number(e.target.value) }))}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold cursor-pointer"
                >
                  <option value={1}>👤 1 Guest</option>
                  <option value={2}>👥 2 Guests (Double/Twin)</option>
                  <option value={3}>👥👤 3 Guests (Triple)</option>
                  <option value={4}>👨‍👩‍👧‍👦 4 Guests (Family Suite)</option>
                  <option value={5}>👨‍👩‍👧‍👦👤 5 Guests (Large Family)</option>
                  <option value={6}>👨‍👩‍👧‍👦👥 6 Guests (Luxury Villa)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-foreground">{isAr ? "خطة الوجبات (Meal Plan) *" : "Meal Plan *"}</label>
                <select
                  value={roomData.mealPlan}
                  onChange={(e) => setRoomData((prev) => ({ ...prev, mealPlan: e.target.value }))}
                  className="w-full h-10 px-2.5 rounded-xl border bg-background text-xs font-bold cursor-pointer"
                >
                  {MEAL_PLAN_OPTIONS.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {isAr ? plan.nameAr : plan.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Seasonal Pricing Matrix (RoomSeasonPricing) */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h5 className="text-xs font-black text-foreground flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>
                    {isAr
                      ? "مصفوفة الأسعار الموسمية (Room Seasonal Pricing):"
                      : "Seasonal Room Pricing Matrix:"}
                  </span>
                </h5>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {isAr
                    ? "تخصيص سعر الليلة وإضافة الغرفة المفردة والطفل والسرير الإضافي لكل موسم."
                    : "Configure per-season nightly rate, single supplement, child rate, and extra bed rate."}
                </p>
              </div>

              {availableSeasons.length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const existingIds = new Set((roomData.seasonPricings || []).map((sp) => sp.seasonId));
                    const nextSeason = availableSeasons.find((s) => !existingIds.has(s.id)) || availableSeasons[0];
                    if (!nextSeason) return;
                    const defaultRate = Math.round(
                      (Number(roomData.ratePerNight) || 120) * (Number(nextSeason.multiplier) || 1)
                    );
                    setRoomData((prev) => ({
                      ...prev,
                      seasonPricings: [
                        ...(prev.seasonPricings || []),
                        {
                          seasonId: nextSeason.id,
                          seasonCode: nextSeason.code,
                          seasonName: nextSeason.nameJsonb,
                          ratePerNight: defaultRate,
                          singleSupplement: Math.round(defaultRate * 0.4),
                          childRate: Math.round(defaultRate * 0.5),
                          extraBedRate: Math.round(defaultRate * 0.35),
                          boardBasis: (prev.mealPlan || "BB").toUpperCase(),
                          currency: "USD",
                          isActive: true,
                        },
                      ],
                    }));
                  }}
                  className="h-8 rounded-xl border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? "إضافة تسعير موسمي +" : "Add Season Rate +"}</span>
                </Button>
              )}
            </div>

            {availableSeasons.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-muted-foreground">
                {isAr
                  ? "لا توجد مواسم مضافة بعد. يمكنك إنشاء المواسم من تبويب (المواسم والتسعير الموسمي) في الصفحة الرئيسية."
                  : "No global seasons configured yet. Create seasons from the 'Seasons & Pricing Matrix' tab first."}
              </div>
            ) : (roomData.seasonPricings || []).length === 0 ? (
              <div className="p-3 rounded-xl border border-dashed text-[11px] text-muted-foreground text-center">
                {isAr
                  ? "يتم تطبيق السعر الأساسي ($" + roomData.ratePerNight + ") افتراضياً. اضغط (إضافة تسعير موسمي +) لتخصيص أسعار المواسم."
                  : `Base rate ($${roomData.ratePerNight}/night) applies by default. Click 'Add Season Rate +' to override by season.`}
              </div>
            ) : (
              <div className="space-y-2">
                {(roomData.seasonPricings || []).map((sp, spIdx) => (
                  <div
                    key={`${sp.seasonId}-${spIdx}`}
                    className="p-3 rounded-xl bg-background border border-border/80 grid grid-cols-1 sm:grid-cols-6 gap-2 items-end"
                  >
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">
                        {isAr ? "الموسم" : "Season"}
                      </label>
                      <select
                        value={sp.seasonId}
                        onChange={(e) => {
                          const chosen = availableSeasons.find((s) => s.id === e.target.value);
                          setRoomData((prev) => ({
                            ...prev,
                            seasonPricings: (prev.seasonPricings || []).map((item, idx) =>
                              idx === spIdx
                                ? {
                                    ...item,
                                    seasonId: e.target.value,
                                    seasonCode: chosen?.code,
                                    seasonName: chosen?.nameJsonb,
                                  }
                                : item
                            ),
                          }));
                        }}
                        className="w-full h-8 px-2 rounded-lg border bg-card text-xs font-bold"
                      >
                        {availableSeasons.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.code} — {s.nameJsonb?.[locale] || s.nameJsonb?.en || s.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">
                        {isAr ? "الليلة ($)" : "Night ($)"}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={sp.ratePerNight}
                        onChange={(e) =>
                          setRoomData((prev) => ({
                            ...prev,
                            seasonPricings: (prev.seasonPricings || []).map((item, idx) =>
                              idx === spIdx ? { ...item, ratePerNight: Number(e.target.value) } : item
                            ),
                          }))
                        }
                        className="h-8 text-xs font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">
                        {isAr ? "إضافة مفرد ($)" : "Single Supp ($)"}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={sp.singleSupplement ?? 0}
                        onChange={(e) =>
                          setRoomData((prev) => ({
                            ...prev,
                            seasonPricings: (prev.seasonPricings || []).map((item, idx) =>
                              idx === spIdx ? { ...item, singleSupplement: Number(e.target.value) } : item
                            ),
                          }))
                        }
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">
                        {isAr ? "سعر الطفل ($)" : "Child ($)"}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={sp.childRate ?? 0}
                        onChange={(e) =>
                          setRoomData((prev) => ({
                            ...prev,
                            seasonPricings: (prev.seasonPricings || []).map((item, idx) =>
                              idx === spIdx ? { ...item, childRate: Number(e.target.value) } : item
                            ),
                          }))
                        }
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">
                          {isAr ? "الوجبات" : "Board"}
                        </label>
                        <select
                          value={(sp.boardBasis || "BB").toUpperCase()}
                          onChange={(e) =>
                            setRoomData((prev) => ({
                              ...prev,
                              seasonPricings: (prev.seasonPricings || []).map((item, idx) =>
                                idx === spIdx ? { ...item, boardBasis: e.target.value } : item
                              ),
                            }))
                          }
                          className="w-full h-8 px-1.5 rounded-lg border bg-card text-[11px] font-mono font-bold"
                        >
                          <option value="BB">BB</option>
                          <option value="HB">HB</option>
                          <option value="FB">FB</option>
                          <option value="AI">AI</option>
                          <option value="RO">RO</option>
                        </select>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setRoomData((prev) => ({
                            ...prev,
                            seasonPricings: (prev.seasonPricings || []).filter((_, idx) => idx !== spIdx),
                          }))
                        }
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Room Photo & Media Section */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-black text-foreground flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <span>{isAr ? "صورة الغرفة الفاخرة (Room Featured Photo):" : "Room Featured Photo & Media:"}</span>
              </h5>

              {roomData.image ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                  {isAr ? "الصورة محددة ✓" : "Photo Selected ✓"}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-500 text-[10px] font-bold">
                  {isAr ? "صورة افتراضية" : "Default Image"}
                </Badge>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Photo Preview */}
              <div className="relative w-full sm:w-48 h-32 rounded-2xl overflow-hidden border border-border bg-slate-950 shrink-0 shadow-xs group">
                <img
                  src={roomData.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200"}
                  alt="Room Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200";
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 right-2 rtl:right-2 ltr:left-2 text-[10px] text-amber-400 font-mono font-bold bg-slate-950/80 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {roomData.image ? (isAr ? "صورة مخصصة" : "Custom Photo") : (isAr ? "معاينة افتراضية" : "Preview")}
                </div>
              </div>

              {/* Photo Actions */}
              <div className="flex-1 space-y-2">
                <p className="text-[11px] text-muted-foreground font-medium">
                  {isAr
                    ? "اختر صورة عالية الجودة تعكس فخامة هذه الغرفة بدقة وتظهر في بطاقات الحجز والموقع العام."
                    : "Upload a high-resolution photo of this room to display on booking cards and website."}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingPhoto ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "رفع صورة 📸" : "Upload Photo 📸")}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs gap-1.5 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{isAr ? "مكتبة الوسائط 🖼️" : "Media Library 🖼️"}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="rounded-xl text-xs font-bold gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>{isAr ? "رابط مباشر 🔗" : "Direct URL 🔗"}</span>
                  </Button>

                  {roomData.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setRoomData((prev) => ({ ...prev, image: "" }))}
                      className="rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isAr ? "مسح" : "Clear"}</span>
                    </Button>
                  )}
                </div>

                {showUrlInput && (
                  <div className="pt-2">
                    <Input
                      placeholder="https://images.unsplash.com/..."
                      value={roomData.image || ""}
                      onChange={(e) => setRoomData((prev) => ({ ...prev, image: e.target.value }))}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Room Amenities Multi-select */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-black text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{isAr ? "مرافق وتجهيزات الغرفة الحصرية:" : "Room Amenities & In-Room Comforts:"}</span>
              </h5>
              <Badge variant="outline" className="text-amber-500 font-bold text-[10px] border-amber-500/30">
                {(roomData.amenities || []).length} {isAr ? "مرافق مختارة" : "Selected"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ROOM_AMENITIES_OPTIONS.map((am) => {
                const Icon = am.icon;
                const isSelected = (roomData.amenities || []).includes(am.id);
                return (
                  <button
                    key={am.id}
                    type="button"
                    onClick={() => handleToggleAmenity(am.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/60 text-foreground shadow-xs"
                        : "bg-background border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isSelected ? "bg-amber-500 text-slate-950" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold truncate">{isAr ? am.labelAr : am.labelEn}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Policies & Status */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={roomData.smokingAllowed || false}
                onChange={(e) => setRoomData((prev) => ({ ...prev, smokingAllowed: e.target.checked }))}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <span>{isAr ? "يسمح بالتدخين في الغرفة 🚬" : "Smoking Allowed in Room 🚬"}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={roomData.petsAllowed || false}
                onChange={(e) => setRoomData((prev) => ({ ...prev, petsAllowed: e.target.checked }))}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <span>{isAr ? "يسمح باصطحاب الحيوانات الأليفة 🐾" : "Pets Allowed 🐾"}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={roomData.isActive}
                onChange={(e) => setRoomData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
              <span className={roomData.isActive ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-muted-foreground"}>
                {roomData.isActive ? (isAr ? "فئة الغرفة نشطة ومتاحة للحجز ✨" : "Active & Bookable ✨") : (isAr ? "فئة الغرفة معطلة مؤقتاً" : "Inactive")}
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 bg-muted/40 border-t flex flex-row items-center justify-between">
          <div className="text-xs text-muted-foreground font-semibold">
            {roomData.nameEn ? `Slug: ${roomData.slug || slugify(roomData.nameEn)}` : ""}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSaveModal}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 rounded-xl shadow-xs cursor-pointer gap-1.5"
            >
              <Check className="w-4 h-4 stroke-3" />
              <span>{roomIndex !== null ? (isAr ? "حفظ تعديلات الغرفة" : "Save Room Changes") : (isAr ? "إضافة فئة الغرفة" : "Add Room Tier")}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Media Library Picker for Room */}
      <MediaLibraryPickerModal
        open={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectMediaAsset}
        selectedAssetUrl={roomData.image}
        entityId={entityId}
        locale={locale}
      />
    </Dialog>
  );
}

// ----------------------------------------------------
// Hotel Editor Modal Component
// ----------------------------------------------------
function HotelEditorDialog({
  hotel,
  open,
  onOpenChange,
}: {
  hotel: AdminHotel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  const [form, setForm] = useState<HotelFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState("basic");
  const [langSubTab, setLangSubTab] = useState<"en" | "ar" | "es" | "pt" | "it">("en");
  const [isSlugManual, setIsSlugManual] = useState(false);

  // Hero Image Management State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement | null>(null);

  // Dedicated Room Editor Modal State
  const [isRoomEditorOpen, setIsRoomEditorOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<FormRoomItem | null>(null);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);

  const createMutation = useCreateHotel();
  const updateMutation = useUpdateHotel();
  const uploadHeroMutation = useUploadMedia();
  const linkHeroMediaMutation = useUpdateMedia();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Hero image uploaded while the hotel did not exist yet is stored as a GENERAL
  // library asset. Once the hotel is created we re-link it to the real hotel so it
  // also shows up under the "Hotels" category filter in the media library.
  const [pendingHeroMediaId, setPendingHeroMediaId] = useState<string | null>(null);

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isAr ? "حجم الصورة يجب ألا يتجاوز 10 ميغابايت." : "Image size must not exceed 10MB.");
      return;
    }

    setIsUploadingHero(true);
    try {
      // The backend REQUIRES a valid entityId when entityType is HOTEL, so a brand-new
      // hotel (no id yet) must be uploaded as a GENERAL library asset in the "hotels"
      // category instead. For an existing hotel we can link the asset directly.
      const linkedHotelId = hotel?.id?.trim();
      const res = await uploadHeroMutation.mutateAsync({
        file,
        ...(linkedHotelId
          ? { entityType: "HOTEL" as MediaEntityType, entityId: linkedHotelId }
          : { entityType: "GENERAL" as MediaEntityType, categorySlug: "hotels" }),
      });
      const secureUrl = res.secureUrl || res.url;
      setForm((prev) => ({
        ...prev,
        heroMediaId: res.id,
        heroImageUrl: secureUrl,
      }));
      setPendingHeroMediaId(linkedHotelId ? null : res.id);
      toast.success(isAr ? "تم رفع الصورة وربطها بالفندق بنجاح! 📸" : "Photo uploaded and attached to hotel! 📸");
    } catch {
      toast.error(isAr ? "تعذر رفع الصورة، يرجى المحاولة مرة أخرى." : "Failed to upload image.");
    } finally {
      setIsUploadingHero(false);
      if (heroFileInputRef.current) heroFileInputRef.current.value = "";
    }
  };

  const handleSelectMediaFromPicker = (asset: { id: string; url: string; altText?: string }) => {
    setForm((prev) => ({
      ...prev,
      heroMediaId: asset.id,
      heroImageUrl: asset.url,
    }));
    // The picked asset already lives in the library, so nothing needs re-linking.
    setPendingHeroMediaId(null);
    setIsMediaPickerOpen(false);
  };

  const handleRemoveHeroImage = () => {
    setForm((prev) => ({
      ...prev,
      heroMediaId: "",
      heroImageUrl: "",
    }));
    setPendingHeroMediaId(null);
    toast.info(isAr ? "تمت إزالة صورة الفندق." : "Hotel image removed.");
  };

  useEffect(() => {
    if (open) {
      if (hotel) {
        setForm({
          slug: hotel.slug,
          nameEn: hotel.nameJsonb?.en || "",
          nameAr: hotel.nameJsonb?.ar || "",
          nameEs: hotel.nameJsonb?.es || "",
          namePt: hotel.nameJsonb?.pt || "",
          nameIt: hotel.nameJsonb?.it || "",
          descEn: hotel.descriptionJsonb?.en || "",
          descAr: hotel.descriptionJsonb?.ar || "",
          descEs: hotel.descriptionJsonb?.es || "",
          descPt: hotel.descriptionJsonb?.pt || "",
          descIt: hotel.descriptionJsonb?.it || "",
          destinationSlug: hotel.destinationSlug || "egypt",
          city: hotel.city || "Cairo",
          stars: hotel.stars || 5,
          rating: hotel.rating !== null ? String(hotel.rating) : "4.90",
          currency: hotel.currency || "USD",
          phone: hotel.phone || "",
          email: hotel.email || "",
          website: hotel.website || "",
          heroMediaId: hotel.heroMediaId || "",
          heroImageUrl: hotel.heroImageUrl || "",
          amenities: (() => {
            if (hotel.amenitiesJsonb && typeof hotel.amenitiesJsonb === "object" && !Array.isArray(hotel.amenitiesJsonb)) {
              const { heroImageUrl: _h, images: _i, ...rest } = hotel.amenitiesJsonb as Record<string, any>;
              return rest as Record<string, boolean>;
            }
            return {
              pool: true,
              spa: true,
              wifi: true,
              restaurant: true,
              gym: true,
              breakfast: true,
              concierge: true,
              roomService: true,
            };
          })(),
          checkIn: (hotel.policiesJsonb?.checkIn as string) || "14:00",
          checkOut: (hotel.policiesJsonb?.checkOut as string) || "12:00",
          cancellationPolicy: (hotel.policiesJsonb?.cancellation as string) || "Free cancellation up to 48 hours before check-in.",
          status: hotel.status || "PUBLISHED",
          isActive: hotel.isActive ?? true,
          rooms: hotel.rooms && hotel.rooms.length > 0
            ? hotel.rooms.map((r: any) => ({
                id: r.id,
                slug: r.slug,
                nameEn: (r.name as any)?.en || (typeof r.name === 'string' ? r.name : r.slug),
                nameAr: (r.name as any)?.ar || (r.name as any)?.en || r.slug,
                nameEs: (r.name as any)?.es || (r.name as any)?.en || r.slug,
                namePt: (r.name as any)?.pt || (r.name as any)?.en || r.slug,
                nameIt: (r.name as any)?.it || (r.name as any)?.en || r.slug,
                ratePerNight:
                  r.ratePerNight !== undefined && r.ratePerNight !== null && !isNaN(Number(r.ratePerNight))
                    ? Number(r.ratePerNight)
                    : 100,
                maxOccupancy: Number(r.maxOccupancy) || 2,
                inventory: Number(r.inventory) >= 0 ? Number(r.inventory) : 10,
                mealPlan: typeof (r.mealPlan) === 'string' ? r.mealPlan : (r.mealPlan?.en || "bb"),
                isActive: r.isActive ?? true,
                bedTypeEn: r.bedType?.en || (typeof r.bedType === 'string' ? r.bedType : "Double / Twin Beds"),
                bedTypeAr: r.bedType?.ar || (typeof r.bedType === 'string' ? r.bedType : "مزدوجة / توأم"),
                bedTypeEs: r.bedType?.es || (typeof r.bedType === 'string' ? r.bedType : "Doble / Twin"),
                bedTypePt: r.bedType?.pt || (typeof r.bedType === 'string' ? r.bedType : "Duplo / Twin"),
                bedTypeIt: r.bedType?.it || (typeof r.bedType === 'string' ? r.bedType : "Matrimoniale / Twin"),
                viewTypeEn: r.viewType?.en || (typeof r.viewType === 'string' ? r.viewType : "Standard View"),
                viewTypeAr: r.viewType?.ar || (typeof r.viewType === 'string' ? r.viewType : "إطلالة قياسية"),
                viewTypeEs: r.viewType?.es || (typeof r.viewType === 'string' ? r.viewType : "Vista Estándar"),
                viewTypePt: r.viewType?.pt || (typeof r.viewType === 'string' ? r.viewType : "Vista Padrão"),
                viewTypeIt: r.viewType?.it || (typeof r.viewType === 'string' ? r.viewType : "Vista Standard"),
                descEn: r.description?.en || (typeof r.description === 'string' ? r.description : ""),
                descAr: r.description?.ar || (typeof r.description === 'string' ? r.description : ""),
                descEs: r.description?.es || (typeof r.description === 'string' ? r.description : ""),
                descPt: r.description?.pt || (typeof r.description === 'string' ? r.description : ""),
                descIt: r.description?.it || (typeof r.description === 'string' ? r.description : ""),
                image: r.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200",
                gallery: r.gallery || [],
                amenities: r.amenities || ["wifi", "ac", "bathroom", "minibar", "coffee", "linen", "tv", "safe"],
                smokingAllowed: r.smokingAllowed ?? false,
                petsAllowed: r.petsAllowed ?? false,
                seasonPricings: Array.isArray(r.seasonPricings) ? r.seasonPricings : [],
              }))
            : defaultFormData().rooms,
        });
        setIsSlugManual(true);
      } else {
        setForm(defaultFormData());
        setIsSlugManual(false);
      }
      setActiveTab("basic");
      setIsRoomEditorOpen(false);
      setPendingHeroMediaId(null);
    }
  }, [hotel, open]);

  // Auto-slugify generator
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleNameEnChange = (val: string) => {
    setForm((prev) => {
      const newSlug = !isSlugManual ? slugify(val) : prev.slug;
      return {
        ...prev,
        nameEn: val,
        slug: newSlug,
      };
    });
  };

  const [isTranslating, setIsTranslating] = useState(false);

  // Smart translation fill helper (Hotel + All Rooms in 5 Languages)
  const handleSmartFillTranslations = async () => {
    setIsTranslating(true);
    try {
      const fallbackName = form.nameEn || form.nameAr || "Luxury Hotel & Resort";
      const fallbackDesc = form.descAr || form.descEn || "إقامة فندقية فاخرة من فئة 5 نجوم مع مرافق متكاملة وخدمة استثنائية.";

      const updatedHotel = await autoTranslateMissingEntityFields(form, {
        nameKeys: { ar: "nameAr", en: "nameEn", es: "nameEs", pt: "namePt", it: "nameIt" },
        descKeys: { ar: "descAr", en: "descEn", es: "descEs", pt: "descPt", it: "descIt" },
        fallbackName,
        fallbackDesc,
      });

      // Also translate all configured rooms across 5 languages
      const updatedRooms = await Promise.all(
        form.rooms.map(async (r) => {
          const roomFallbackName = r.nameEn || r.nameAr || "Deluxe Hotel Room";
          const roomFallbackDesc = r.descAr || r.descEn || "غرفة فندقية فاخرة ومريحة.";
          const translatedRoom = await autoTranslateMissingEntityFields(r, {
            nameKeys: { ar: "nameAr", en: "nameEn", es: "nameEs", pt: "namePt", it: "nameIt" },
            descKeys: { ar: "descAr", en: "descEn", es: "descEs", pt: "descPt", it: "descIt" },
            fallbackName: roomFallbackName,
            fallbackDesc: roomFallbackDesc,
          });

          const bedEn = translatedRoom.bedTypeEn || translatedRoom.bedTypeAr || "Double / Twin Beds";
          const bedAr = translatedRoom.bedTypeAr || translatedRoom.bedTypeEn || "مزدوجة / توأم";
          const viewEn = translatedRoom.viewTypeEn || translatedRoom.viewTypeAr || "Panoramic View";
          const viewAr = translatedRoom.viewTypeAr || translatedRoom.viewTypeEn || "إطلالة بانورامية";

          return {
            ...translatedRoom,
            bedTypeEn: bedEn,
            bedTypeAr: bedAr,
            bedTypeEs: translatedRoom.bedTypeEs || bedEn,
            bedTypePt: translatedRoom.bedTypePt || bedEn,
            bedTypeIt: translatedRoom.bedTypeIt || bedEn,
            viewTypeEn: viewEn,
            viewTypeAr: viewAr,
            viewTypeEs: translatedRoom.viewTypeEs || viewEn,
            viewTypePt: translatedRoom.viewTypePt || viewEn,
            viewTypeIt: translatedRoom.viewTypeIt || viewEn,
          };
        })
      );

      setForm({
        ...updatedHotel,
        rooms: updatedRooms,
      });
      toast.success(isAr ? "✨ تمت ترجمة بيانات الفندق وكافة الغرف للغات الخمس بنجاح!" : "✨ Hotel & all rooms translated across 5 languages successfully!");
    } catch (err: any) {
      toast.error(isAr ? "تعذر إكمال الترجمة التلقائية." : "Auto-translation failed.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Destination change & Auto-city select
  const handleDestinationChange = (destSlug: string) => {
    const dest = DESTINATION_OPTIONS.find((d) => d.slug === destSlug);
    setForm((prev) => ({
      ...prev,
      destinationSlug: destSlug,
      city: dest?.defaultCities[0] || prev.city || "Cairo",
    }));
  };

  // Room Management Actions
  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setEditingRoomIndex(null);
    setIsRoomEditorOpen(true);
  };

  const handleOpenEditRoom = (room: FormRoomItem, index: number) => {
    setEditingRoom(room);
    setEditingRoomIndex(index);
    setIsRoomEditorOpen(true);
  };

  const handleApplyRoomPreset = (preset: typeof ROOM_PRESETS[0]) => {
    const newPresetRoom: FormRoomItem = {
      slug: `${preset.slug}-${form.rooms.length + 1}`,
      nameEn: preset.nameEn,
      nameAr: preset.nameAr,
      nameEs: preset.nameEs,
      namePt: preset.namePt,
      nameIt: preset.nameIt,
      ratePerNight: preset.rate,
      maxOccupancy: preset.maxOccupancy,
      inventory: preset.inventory,
      mealPlan: preset.mealPlan,
      isActive: true,
      bedTypeEn: preset.bedEn,
      bedTypeAr: preset.bedAr,
      bedTypeEs: preset.bedEs,
      bedTypePt: preset.bedPt,
      bedTypeIt: preset.bedIt,
      viewTypeEn: preset.viewEn,
      viewTypeAr: preset.viewAr,
      viewTypeEs: preset.viewEs,
      viewTypePt: preset.viewPt,
      viewTypeIt: preset.viewIt,
      image: preset.image,
      gallery: [preset.image],
      amenities: preset.amenities,
    };

    setForm((prev) => ({
      ...prev,
      rooms: [...prev.rooms, newPresetRoom],
    }));
    toast.success(isAr ? `تمت إضافة فئة "${preset.nameAr}" بنجاح!` : `Preset "${preset.nameEn}" added!`);
  };

  const handleDuplicateRoom = (index: number) => {
    const source = form.rooms[index];
    if (!source) return;
    const duplicated: FormRoomItem = {
      ...source,
      id: undefined,
      slug: `${source.slug}-copy-${Date.now().toString().slice(-4)}`,
      nameEn: `${source.nameEn} (Copy)`,
      nameAr: `${source.nameAr} (نسخة)`,
      nameEs: `${source.nameEs} (Copia)`,
      namePt: `${source.namePt} (Cópia)`,
      nameIt: `${source.nameIt} (Copia)`,
    };
    setForm((prev) => ({
      ...prev,
      rooms: [...prev.rooms.slice(0, index + 1), duplicated, ...prev.rooms.slice(index + 1)],
    }));
    toast.success(isAr ? "تم تكرار فئة الغرفة بنجاح 📋" : "Room tier cloned successfully 📋");
  };

  const handleSaveRoomFromModal = (savedRoom: FormRoomItem, index: number | null) => {
    if (index !== null) {
      setForm((prev) => ({
        ...prev,
        rooms: prev.rooms.map((r, i) => (i === index ? savedRoom : r)),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        rooms: [...prev.rooms, savedRoom],
      }));
    }
  };

  const handleDeleteRoom = (index: number) => {
    setForm((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index),
    }));
    toast.info(isAr ? "تم حذف فئة الغرفة." : "Room removed.");
  };

  const handleQuickInventoryChange = (index: number, delta: number) => {
    setForm((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r, i) => (i === index ? { ...r, inventory: Math.max(0, r.inventory + delta) } : r)),
    }));
  };

  const handleToggleRoomActive = (index: number) => {
    setForm((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r, i) => (i === index ? { ...r, isActive: !r.isActive } : r)),
    }));
    toast.success(isAr ? "تم تحديث حالة تفعيل الغرفة" : "Room status toggled");
  };

  const handleSave = async () => {
    // Form Validations
    const cleanNameEn = (form.nameEn || "").trim();
    if (!cleanNameEn) {
      toast.error(isAr ? "يرجى كتابة اسم الفندق بالإنجليزية." : "English Hotel Name is required.");
      setActiveTab("basic");
      return;
    }

    const cleanSlug = slugify(form.slug || cleanNameEn);
    if (!cleanSlug) {
      toast.error(isAr ? "يرجى إدخال رمز الرابط (Slug)." : "A valid URL slug is required.");
      setActiveTab("basic");
      return;
    }

    const cleanDestination = (form.destinationSlug || "").trim().toLowerCase() || "egypt";
    const stars = Number(form.stars) || 5;
    const cleanRating = (form.rating || "").trim();
    const rating = cleanRating ? Number(cleanRating) : 4.9;

    // Build Rooms payload with full 5-language support
    const roomsPayload: HotelRoomPayload[] = form.rooms.map((r, idx) => {
      const roomNameEn = (r.nameEn || "").trim();
      return {
        ...(r.id ? { id: r.id } : {}),
        slug: slugify(r.slug || roomNameEn || `room-${idx + 1}`),
        nameJsonb: {
          en: roomNameEn,
          ar: (r.nameAr || "").trim() || roomNameEn,
          es: (r.nameEs || "").trim() || roomNameEn,
          pt: (r.namePt || "").trim() || roomNameEn,
          it: (r.nameIt || "").trim() || roomNameEn,
        },
      descriptionJsonb: {
        overview: {
          en: r.descEn || "",
          ar: r.descAr || "",
          es: r.descEs || "",
          pt: r.descPt || "",
          it: r.descIt || "",
        },
        bedType: {
          en: r.bedTypeEn || "Double / Twin Beds",
          ar: r.bedTypeAr || "مزدوجة / توأم",
          es: r.bedTypeEs || r.bedTypeEn || "Doble / Twin",
          pt: r.bedTypePt || r.bedTypeEn || "Duplo / Twin",
          it: r.bedTypeIt || r.bedTypeEn || "Matrimoniale / Twin",
        },
        viewType: {
          en: r.viewTypeEn || "Standard View",
          ar: r.viewTypeAr || "إطلالة قياسية",
          es: r.viewTypeEs || r.viewTypeEn || "Vista Estándar",
          pt: r.viewTypePt || r.viewTypeEn || "Vista Padrão",
          it: r.viewTypeIt || r.viewTypeEn || "Vista Standard",
        },
        smokingAllowed: r.smokingAllowed ?? false,
        petsAllowed: r.petsAllowed ?? false,
        image: r.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200",
        gallery: r.gallery && r.gallery.length > 0 ? r.gallery : [
          r.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200"
        ],
        amenities: r.amenities && r.amenities.length > 0 ? r.amenities : ["wifi", "ac", "bathroom", "minibar", "coffee", "linen", "tv", "safe", "iron", "phone"],
      },
      ratePerNight:
        r.ratePerNight !== undefined && r.ratePerNight !== null && !isNaN(Number(r.ratePerNight))
          ? Number(r.ratePerNight)
          : 100,
      currency: form.currency.toUpperCase() || "USD",
      maxOccupancy: Number(r.maxOccupancy) || 2,
      inventory: Number(r.inventory) >= 0 ? Number(r.inventory) : 10,
      mealPlanJsonb: {
        en: r.mealPlan || "bb",
        ar: r.mealPlan || "bb",
        es: r.mealPlan || "bb",
        pt: r.mealPlan || "bb",
        it: r.mealPlan || "bb",
      },
      isActive: r.isActive ?? true,
      sortOrder: idx,
      seasonPricings: (Array.isArray(r.seasonPricings) ? r.seasonPricings : [])
        .filter((sp) => Boolean(sp?.seasonId))
        .map((sp) => ({
          seasonId: sp.seasonId,
          ratePerNight: Number(sp.ratePerNight) || 0,
          singleSupplement: sp.singleSupplement ?? null,
          childRate: sp.childRate ?? null,
          extraBedRate: sp.extraBedRate ?? null,
          currency: sp.currency || form.currency.toUpperCase() || "USD",
          boardBasis: sp.boardBasis || (r.mealPlan || "BB").toUpperCase(),
          isActive: sp.isActive ?? true,
        })),
    };
  });

    if (roomsPayload.length === 0) {
      toast.error(isAr ? "يجب إضافة غرفة واحدة على الأقل في الفندق." : "At least one room tier must be configured.");
      setActiveTab("rooms");
      return;
    }

    const { heroImageUrl: _staleHero, images: _staleImages, ...cleanAmenityFlags } = (form.amenities || {}) as Record<string, any>;
    const trimmedHeroUrl = (form.heroImageUrl || "").trim();

    const payload: HotelPayload = {
      slug: cleanSlug,
      nameJsonb: {
        en: cleanNameEn,
        ar: (form.nameAr || "").trim() || cleanNameEn,
        es: (form.nameEs || "").trim() || cleanNameEn,
        pt: (form.namePt || "").trim() || cleanNameEn,
        it: (form.nameIt || "").trim() || cleanNameEn,
      },
      descriptionJsonb: {
        en: (form.descEn || "").trim() || "Luxury accommodation with world-class hospitality.",
        ar: (form.descAr || "").trim() || "إقامة فاخرة متكاملة الخدمات مع ضيافة عالمية المستوى.",
        es: (form.descEs || "").trim() || (form.descEn || "").trim() || "Alojamiento de lujo con hospitalidad de primer nivel.",
        pt: (form.descPt || "").trim() || (form.descEn || "").trim() || "Acomodação de luxo com hospitalidade de classe mundial.",
        it: (form.descIt || "").trim() || (form.descEn || "").trim() || "Sistemazione di lusso con ospitalità di livello mondiale.",
      },
      destinationSlug: cleanDestination,
      city: (form.city || "").trim() || "Cairo",
      stars,
      rating,
      currency: (form.currency || "USD").toUpperCase(),
      ...((form.phone || "").trim() ? { phone: form.phone.trim() } : {}),
      ...((form.email || "").trim() ? { email: form.email.trim() } : {}),
      ...((form.website || "").trim() ? { website: form.website.trim() } : {}),
      ...((form.heroMediaId || "").trim() ? { heroMediaId: form.heroMediaId.trim() } : {}),
      ...(trimmedHeroUrl ? { heroImageUrl: trimmedHeroUrl } : {}),
      amenitiesJsonb: {
        ...cleanAmenityFlags,
        ...(trimmedHeroUrl ? { heroImageUrl: trimmedHeroUrl } : {}),
      },
      policiesJsonb: {
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        cancellation: form.cancellationPolicy,
      },
      status: form.status,
      isActive: form.isActive,
      rooms: roomsPayload,
    };

    try {
      if (hotel) {
        await updateMutation.mutateAsync({ id: hotel.id, payload });
        toast.success(isAr ? `تم تحديث بيانات الفندق "${form.nameEn}" والغرف بنجاح!` : `Hotel "${form.nameEn}" and rooms updated successfully!`);
      } else {
        const created = await createMutation.mutateAsync(payload);
        // Now that the hotel has an id, attach the hero image asset to it so the
        // asset is grouped under Hotels in the media library. Best-effort: the
        // hotel itself is already saved, so a failure here must not block saving.
        const assetIdToLink = pendingHeroMediaId || form.heroMediaId?.trim();
        const createdId = created?.id?.trim();
        if (assetIdToLink && createdId) {
          try {
            await linkHeroMediaMutation.mutateAsync({
              id: assetIdToLink,
              payload: { entityType: "HOTEL" as MediaEntityType, entityId: createdId },
            });
          } catch {
            // Image stays usable via the GENERAL "hotels" category; ignore.
          }
        }
        toast.success(isAr ? `تمت إضافة فندق "${form.nameEn}" والغرف بنجاح!` : `Hotel "${form.nameEn}" and rooms created successfully!`);
      }
      onOpenChange(false);
    } catch (err: any) {
      // Handled by mutation toast
    }
  };

  const currentDestinationConfig = DESTINATION_OPTIONS.find((d) => d.slug === form.destinationSlug) || DESTINATION_OPTIONS[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border border-border/80 shadow-2xl rounded-3xl bg-card">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-linear-to-r from-amber-500/10 via-primary/10 to-amber-500/5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl shrink-0 shadow-sm">
                <Hotel className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
                  <span>{hotel ? (isAr ? "تعديل بيانات الفندق والغرف" : "Edit Luxury Hotel & Suites") : (isAr ? "إضافة فندق فاخر جديد" : "Add New Luxury Hotel")}</span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-semibold">
                  {isAr ? "التحكم في الوجهة، الترجمات الـ 5، الغرف وعددها، المرافق والسياسات." : "Configure hotel profile, 5-language content, rooms inventory, amenities & policies."}
                </DialogDescription>
              </div>
            </div>

            <Badge variant="outline" className="hidden sm:flex border-amber-500/40 text-amber-500 font-black text-xs py-1 px-3">
              {form.stars} ⭐ {form.status}
            </Badge>
          </div>
        </DialogHeader>

        {/* Modal Form Tabs */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 bg-muted/60 p-1 rounded-2xl mb-6">
              <TabsTrigger value="basic" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? "البيانات الأساسية" : "Basic Info"}
              </TabsTrigger>
              <TabsTrigger value="rooms" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? `الغرف والعدد (${form.rooms.length}) 🛏️` : `Rooms (${form.rooms.length}) 🛏️`}
              </TabsTrigger>
              <TabsTrigger value="translations" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? "الترجمات الـ 5 🌐" : "5 Languages 🌐"}
              </TabsTrigger>
              <TabsTrigger value="amenities" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? "المرافق والخدمات" : "Amenities"}
              </TabsTrigger>
              <TabsTrigger value="policies" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? "الاتصال والسياسات" : "Policies"}
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: BASIC INFORMATION */}
            <TabsContent value="basic" className="space-y-5">
              {/* HOTEL HERO IMAGE & MEDIA INTEGRATION */}
              <div className="p-4 sm:p-5 rounded-3xl bg-muted/30 border border-border/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black text-foreground flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      <span>{isAr ? "صورة الفندق الرئيسية ومعرض الوسائط" : "Hotel Hero Image & Media"}</span>
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                      {isAr
                        ? "الصورة الأساسية التي تظهر في بطاقة الفندق وصفحة التفاصيل بالموقع العام ومعرض الصور."
                        : "Main featured image displayed on catalog cards, header banners, and details."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {form.heroImageUrl ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold gap-1">
                        <Check className="w-3 h-3 stroke-3" />
                        <span>{isAr ? "الصورة محددة ✓" : "Image Configured ✓"}</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px] font-bold">
                        {isAr ? "لم تحدد صورة رئيسية" : "No image selected"}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={heroFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleHeroFileUpload}
                />

                {/* Image Preview & Actions */}
                {form.heroImageUrl ? (
                  <div className="space-y-3">
                    <div className="relative aspect-21/9 sm:aspect-24/9 rounded-2xl overflow-hidden border border-border/80 bg-slate-950 shadow-md group">
                      <img
                        src={form.heroImageUrl}
                        alt="Hotel Preview"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200";
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-black/30" />

                      <div className="absolute top-2 right-2 rtl:right-2 ltr:left-2 flex items-center gap-1 bg-slate-950/80 text-amber-400 backdrop-blur-md px-2.5 py-1 rounded-xl border border-amber-400/20 text-[10px] font-black">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{isAr ? "الصورة المعتمدة للفندق ⭐" : "Hotel Hero Media ⭐"}</span>
                      </div>

                      {form.heroMediaId && (
                        <div className="absolute bottom-2 right-2 rtl:right-2 ltr:left-2 text-[9px] font-mono text-slate-300 bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          Media ID: {form.heroMediaId.slice(0, 16)}...
                        </div>
                      )}
                    </div>

                    {/* Quick Actions Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => heroFileInputRef.current?.click()}
                        disabled={isUploadingHero}
                        className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                      >
                        {isUploadingHero ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingHero ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "رفع صورة بديلة 📸" : "Upload New 📸")}</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs gap-1.5 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>{isAr ? "اختيار من مكتبة الوسائط 🖼️" : "Choose from Library 🖼️"}</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                        className="rounded-xl text-xs font-bold gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>{isAr ? "تعديل الرابط 🔗" : "Edit URL 🔗"}</span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveHeroImage}
                        className="rounded-xl text-xs font-bold gap-1 text-destructive hover:bg-destructive/10 cursor-pointer ml-auto rtl:ml-0 rtl:mr-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isAr ? "إزالة الصورة" : "Remove"}</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Empty Image State */
                  <div className="p-6 border-2 border-dashed border-border rounded-2xl bg-card flex flex-col items-center justify-center text-center gap-3">
                    <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <ImageIcon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div className="space-y-1 max-w-md">
                      <h5 className="text-xs font-black text-foreground">
                        {isAr ? "لم يتم تعيين صورة رئيسية لهذا الفندق" : "No Hero Image Configured"}
                      </h5>
                      <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                        {isAr
                          ? "يمكنك رفع صورة مباشرة من جهازك أو استرداد صورة من مكتبة الوسائط المتوفرة أو إدخال رابط مباشر."
                          : "Upload directly from device, pick an asset from your Media Library, or paste an image URL."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => heroFileInputRef.current?.click()}
                        disabled={isUploadingHero}
                        className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                      >
                        {isUploadingHero ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingHero ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "رفع صورة من الجهاز 📸" : "Upload Photo 📸")}</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs gap-1.5 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>{isAr ? "اختيار من مكتبة الوسائط 🖼️" : "Pick from Library 🖼️"}</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                        className="rounded-xl text-xs font-bold gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>{isAr ? "إدخال رابط مباشر 🔗" : "Direct URL 🔗"}</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Direct URL Expander Input */}
                {showCustomUrlInput && (
                  <div className="p-3.5 rounded-2xl bg-card border border-amber-500/30 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isAr ? "رابط الصورة الخارجي المباشر (URL)" : "Direct Image URL (External / Cloudinary)"}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCustomUrlInput(false)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                        value={form.heroImageUrl}
                        onChange={(e) => setForm((prev) => ({ ...prev, heroImageUrl: e.target.value }))}
                        className="h-9 text-xs font-mono"
                      />
                      {form.heroImageUrl && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setShowCustomUrlInput(false);
                            toast.success(isAr ? "تم تحديث الرابط بنجاح!" : "URL updated!");
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-9 px-3 rounded-xl cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hotel Name EN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center justify-between">
                    <span>{isAr ? "اسم الفندق بالإنجليزية *" : "English Hotel Name *"}</span>
                    <span className="text-[10px] text-muted-foreground">🇬🇧 Primary Name</span>
                  </label>
                  <Input
                    placeholder="e.g. Four Seasons Nile Plaza"
                    value={form.nameEn}
                    onChange={(e) => handleNameEnChange(e.target.value)}
                    className="h-10 text-xs font-bold"
                  />
                </div>

                {/* Hotel Name AR */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center justify-between">
                    <span>{isAr ? "اسم الفندق بالعربية *" : "Arabic Hotel Name *"}</span>
                    <span className="text-[10px] text-muted-foreground">🇸🇦 الاسم الرسمي</span>
                  </label>
                  <Input
                    placeholder="مثال: فندق فور سيزونز نايل بلازا"
                    value={form.nameAr}
                    onChange={(e) => setForm((prev) => ({ ...prev, nameAr: e.target.value }))}
                    className="h-10 text-xs font-bold"
                    dir="rtl"
                  />
                </div>

                {/* URL Slug */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-extrabold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>{isAr ? "رمز الرابط (Slug) *" : "URL Slug *"}</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        ({isAr ? "يتم إنشاؤه تلقائياً ويمكنك تخصيصه" : "Auto-generated, fully customizable"})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSlugManual(!isSlugManual)}
                      className="text-[11px] font-bold text-amber-500 hover:underline cursor-pointer"
                    >
                      {isSlugManual ? (isAr ? "إعادة التوليد التلقائي 🔄" : "Re-sync Auto 🔄") : (isAr ? "تعديل يدوي ✏️" : "Manual Edit ✏️")}
                    </button>
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="four-seasons-nile-plaza"
                      value={form.slug}
                      onChange={(e) => {
                        setIsSlugManual(true);
                        setForm((prev) => ({ ...prev, slug: e.target.value }));
                      }}
                      className="h-10 text-xs font-mono font-bold pl-3"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    dunas-travel.com/hotels/<span className="text-amber-500 font-bold">{form.slug || "hotel-slug"}</span>
                  </p>
                </div>

                {/* Destination Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? "الوجهة السياحية (Destination) *" : "Destination Region *"}</span>
                  </label>
                  <select
                    value={form.destinationSlug}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold cursor-pointer"
                  >
                    {DESTINATION_OPTIONS.map((dest) => (
                      <option key={dest.slug} value={dest.slug}>
                        {dest.flag} {isAr ? dest.nameAr : dest.nameEn} ({dest.slug})
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Selection with Quick Presets */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center justify-between">
                    <span>{isAr ? "المدينة (City) *" : "City Location *"}</span>
                    <span className="text-[10px] text-muted-foreground">{currentDestinationConfig.nameEn}</span>
                  </label>
                  <div className="space-y-2">
                    <Input
                      placeholder="e.g. Cairo, Luxor, Istanbul..."
                      value={form.city}
                      onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                      className="h-10 text-xs font-bold"
                    />
                    {/* City suggestion pills */}
                    <div className="flex flex-wrap gap-1">
                      {currentDestinationConfig.defaultCities.slice(0, 5).map((cityPreset) => (
                        <button
                          key={cityPreset}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, city: cityPreset }))}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold transition-colors cursor-pointer ${
                            form.city === cityPreset
                              ? "bg-amber-500 text-slate-950 border-amber-500 font-bold"
                              : "bg-muted/40 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {cityPreset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? "تصنيف النجوم *" : "Star Rating *"}</span>
                  </label>
                  <select
                    value={form.stars}
                    onChange={(e) => setForm((prev) => ({ ...prev, stars: Number(e.target.value) }))}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold cursor-pointer"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Ultra Luxury Resort)</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars (Premium Luxury)</option>
                    <option value={3}>⭐⭐⭐ 3 Stars (Comfort Boutique)</option>
                  </select>
                </div>

                {/* Guest Rating & Currency */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground">{isAr ? "تقييم الضيوف" : "Guest Score"}</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={form.rating}
                      onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                      className="h-10 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground">{isAr ? "العملة" : "Currency"}</label>
                    <Input
                      value={form.currency}
                      maxLength={3}
                      onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                      className="h-10 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="p-4 rounded-2xl bg-muted/30 border">
                <div className="space-y-1.5 max-w-sm">
                  <label className="text-xs font-extrabold text-foreground">{isAr ? "حالة الفندق في النظام" : "Hotel System Status"}</label>
                  <select
                    value={form.status === "ARCHIVED" || !form.isActive ? "ARCHIVED" : "PUBLISHED"}
                    onChange={(e) => {
                      const isArchived = e.target.value === "ARCHIVED";
                      setForm((prev) => ({
                        ...prev,
                        status: (isArchived ? "ARCHIVED" : "PUBLISHED") as HotelStatus,
                        isActive: !isArchived,
                      }));
                    }}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold cursor-pointer"
                  >
                    <option value="PUBLISHED">{isAr ? "نشط ومتاح للحجز ✨ (Active)" : "Active & Bookable ✨"}</option>
                    <option value="ARCHIVED">{isAr ? "مؤرشف ومخفي 📦 (Archived)" : "Archived & Hidden 📦"}</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: ROOMS & INVENTORY MANAGEMENT (LUXURY EDITORIAL REDESIGN) */}
            <TabsContent value="rooms" className="space-y-4">
              {/* Header & Stats Banner */}
              <div className="p-4 rounded-2xl bg-linear-to-r from-amber-500/15 via-primary/10 to-amber-500/5 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-foreground flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-amber-500" />
                    <span>{isAr ? "التحكم في فئات الغرف وعدد الغرف المتاحة (Inventory)" : "Room Categories & Available Inventory"}</span>
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium">
                    {isAr
                      ? "يمكنك إضافة وتعديل فئات الغرف، تحديد الأسعار، الصور، المواصفات وتوافر الغرف باللغات الخمس بالكامل."
                      : "Configure room tiers, rates, photos, specifications, and 5-language localization."}
                  </p>
                  {/* Live Room Statistics */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
                    <Badge variant="outline" className="bg-background/80 border-amber-500/30 text-amber-500 font-bold px-2 py-0.5">
                      {form.rooms.length} {isAr ? "فئات غرف" : "Room Tiers"}
                    </Badge>
                    <Badge variant="outline" className="bg-background/80 border-emerald-500/30 text-emerald-500 font-bold px-2 py-0.5">
                      {form.rooms.reduce((acc, r) => acc + (Number(r.inventory) || 0), 0)} {isAr ? "غرفة متاحة للحجز" : "Total Units in Stock"}
                    </Badge>
                    <Badge variant="outline" className="bg-background/80 border-primary/30 text-primary font-bold px-2 py-0.5">
                      {form.rooms.filter((r) => r.isActive).length} {isAr ? "فئات مفعلة" : "Active"}
                    </Badge>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleOpenAddRoom}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs gap-1.5 px-4 py-2 rounded-xl cursor-pointer shadow-md shadow-amber-500/20 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>{isAr ? "إضافة فئة غرفة جديدة +" : "Add Room Tier +"}</span>
                </Button>
              </div>

              {/* Quick Room Presets Bar */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-muted/20 border border-border/80">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? "نماذج جاهزة للغرف السريعة (تعبئة باللغات الخمس والصور):" : "Quick Luxury Room Presets (5-Language Ready):"}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ROOM_PRESETS.map((preset) => (
                    <button
                      key={preset.slug}
                      type="button"
                      onClick={() => handleApplyRoomPreset(preset)}
                      className="text-xs px-3 py-1.5 rounded-xl border bg-card hover:border-amber-500 hover:text-amber-500 font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs group"
                    >
                      <Plus className="w-3 h-3 text-amber-500 group-hover:scale-120 transition-transform" />
                      <span>{isAr ? preset.nameAr : preset.nameEn}</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md">(${preset.rate})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Configured Rooms List (Luxury Cards) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>{isAr ? "قائمة فئات الغرف المعدة لهذا الفندق:" : "Configured Room Tiers in this Hotel:"}</span>
                  <span className="text-amber-500 font-extrabold">{form.rooms.length} {isAr ? "فئات" : "Tiers"}</span>
                </div>

                {form.rooms.length === 0 ? (
                  <div className="p-12 text-center border-dashed border-2 rounded-3xl bg-muted/10 space-y-3">
                    <BedDouble className="w-12 h-12 text-amber-500/40 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-foreground">{isAr ? "لم يتم تكوين أي غرف بعد" : "No Room Tiers Configured Yet"}</h4>
                      <p className="text-xs text-muted-foreground">
                        {isAr
                          ? "اضغط على زر (إضافة فئة غرفة جديدة) أو اختر أحد النماذج الجاهزة بالأعلى لبدء تحديد الأسعار والغرف."
                          : "Click 'Add Room Tier' or select a preset above to configure rates, images, and inventory."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleOpenAddRoom}
                      className="mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      <span>{isAr ? "إضافة الغرفة الأولى الآن" : "Add First Room Now"}</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {form.rooms.map((room, idx) => {
                      const primaryName = isAr ? (room.nameAr || room.nameEn) : (room.nameEn || room.nameAr);
                      const secondaryName = isAr ? (room.nameEn && room.nameEn !== room.nameAr ? room.nameEn : "") : (room.nameAr && room.nameAr !== room.nameEn ? room.nameAr : "");
                      const mealPlanObj = MEAL_PLAN_OPTIONS.find((m) => m.id === room.mealPlan);
                      const bedText = isAr ? (room.bedTypeAr || room.bedTypeEn || "مزدوجة / توأم") : (room.bedTypeEn || room.bedTypeAr || "Double / Twin Beds");
                      const viewText = isAr ? (room.viewTypeAr || room.viewTypeEn || "إطلالة قياسية") : (room.viewTypeEn || room.viewTypeAr || "Standard View");

                      const has5Languages = Boolean(room.nameEn && room.nameAr && room.nameEs && room.namePt && room.nameIt);

                      return (
                        <div
                          key={idx}
                          className={`p-4 bg-card border rounded-3xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-200 group ${
                            room.isActive
                              ? "border-border hover:border-amber-500/50"
                              : "border-border/60 bg-muted/20 opacity-75"
                          }`}
                        >
                          {/* Room Thumbnail Image with Overlay */}
                          <div className="relative w-full md:w-52 h-36 rounded-2xl overflow-hidden shrink-0 border border-border/80 bg-slate-950 shadow-inner">
                            <img
                              src={room.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200"}
                              alt={primaryName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200";
                              }}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-transparent to-transparent" />

                            {/* Top Badge: Active Status */}
                            <div className="absolute top-2 right-2 rtl:right-2 ltr:left-2">
                              {room.isActive ? (
                                <Badge className="bg-emerald-500/90 text-slate-950 font-black text-[9px] px-2 py-0.5 shadow-xs">
                                  {isAr ? "مفعلة ✓" : "Active ✓"}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-slate-900/90 text-slate-400 font-bold text-[9px] px-2 py-0.5">
                                  {isAr ? "معطلة" : "Inactive"}
                                </Badge>
                              )}
                            </div>

                            {/* Bottom Badge: Meal Plan */}
                            <div className="absolute bottom-2 left-2 rtl:left-2 ltr:right-2 right-2 flex items-center justify-between">
                              <Badge
                                variant="secondary"
                                className="bg-slate-950/90 text-amber-400 border border-amber-400/20 text-[10px] font-bold px-2 py-0.5 backdrop-blur-xs truncate max-w-[140px]"
                              >
                                {isAr ? (mealPlanObj?.nameAr || "شامل الإفطار") : (mealPlanObj?.nameEn || "Bed & Breakfast")}
                              </Badge>
                            </div>
                          </div>

                          {/* Room Content & Metadata */}
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div>
                                <h5 className="font-black text-base text-foreground flex items-center gap-2">
                                  <span>{primaryName}</span>
                                  {has5Languages && (
                                    <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1.5 py-0.2 rounded-md font-mono font-bold">
                                      5 Locales
                                    </span>
                                  )}
                                </h5>
                                {secondaryName && (
                                  <p className="text-xs text-muted-foreground font-semibold">
                                    {secondaryName}
                                  </p>
                                )}
                              </div>

                              {/* Price Highlight */}
                              <div className="text-right rtl:text-right ltr:text-left">
                                <div className="text-base sm:text-lg font-black font-mono text-amber-500">
                                  ${room.ratePerNight}
                                  <span className="text-xs text-muted-foreground font-medium font-sans"> / {isAr ? "ليلة" : "night"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Specs Chips Row */}
                            <div className="flex items-center gap-2 text-xs flex-wrap">
                              <span className="px-2.5 py-1 rounded-xl bg-muted/60 text-muted-foreground border flex items-center gap-1 font-bold">
                                <Users className="w-3.5 h-3.5 text-sky-500" />
                                <span>{room.maxOccupancy} {isAr ? "أفراد" : "Guests"}</span>
                              </span>

                              <span className="px-2.5 py-1 rounded-xl bg-muted/60 text-muted-foreground border flex items-center gap-1 font-bold">
                                <span>🛏️</span>
                                <span>{bedText}</span>
                              </span>

                              <span className="px-2.5 py-1 rounded-xl bg-muted/60 text-muted-foreground border flex items-center gap-1 font-bold">
                                <span>🌄</span>
                                <span className="text-amber-500">{viewText}</span>
                              </span>

                              {/* Stock Level Badge */}
                              {room.inventory > 5 ? (
                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold text-xs px-2.5 py-1">
                                  <Layers className="w-3.5 h-3.5 mr-1" />
                                  <span>{room.inventory} {isAr ? "غرفة متاحة" : "In Stock"}</span>
                                </Badge>
                              ) : room.inventory > 0 ? (
                                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold text-xs px-2.5 py-1">
                                  <Layers className="w-3.5 h-3.5 mr-1" />
                                  <span>{isAr ? `متبقي ${room.inventory} فقط` : `Low Stock: ${room.inventory}`}</span>
                                </Badge>
                              ) : (
                                <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold text-xs px-2.5 py-1">
                                  <span>{isAr ? "نفذت الغرف (0)" : "Sold Out (0)"}</span>
                                </Badge>
                              )}
                            </div>

                            {/* 5-Language Completeness Indicator */}
                            <div className="flex items-center gap-1 pt-1 text-[10px] text-muted-foreground font-mono">
                              <span className="text-muted-foreground font-semibold font-sans">{isAr ? "اللغات:" : "Locales:"}</span>
                              {[
                                { key: "nameEn", label: "EN" },
                                { key: "nameAr", label: "AR" },
                                { key: "nameEs", label: "ES" },
                                { key: "namePt", label: "PT" },
                                { key: "nameIt", label: "IT" },
                              ].map((loc) => {
                                const filled = Boolean((room as any)[loc.key]);
                                return (
                                  <span
                                    key={loc.label}
                                    className={`px-1.5 py-0.2 rounded font-bold ${
                                      filled ? "bg-amber-500/15 text-amber-500" : "bg-muted text-muted-foreground/40"
                                    }`}
                                  >
                                    {loc.label} {filled ? "✓" : "—"}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Action Toolbar */}
                          <div className="flex items-center gap-2 self-stretch md:self-center justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0">
                            {/* Inventory Stepper */}
                            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/80 shadow-xs">
                              <button
                                type="button"
                                onClick={() => handleQuickInventoryChange(idx, -1)}
                                className="w-7 h-7 rounded-xl bg-background text-foreground font-black hover:bg-muted text-xs flex items-center justify-center cursor-pointer transition-colors"
                                title={isAr ? "إنقاص العدد" : "Decrease Stock"}
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-mono font-black text-xs text-amber-500">
                                {room.inventory}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuickInventoryChange(idx, 1)}
                                className="w-7 h-7 rounded-xl bg-background text-foreground font-black hover:bg-muted text-xs flex items-center justify-center cursor-pointer transition-colors"
                                title={isAr ? "زيادة العدد" : "Increase Stock"}
                              >
                                +
                              </button>
                            </div>

                            {/* Edit Room Button (Main Request) */}
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleOpenEditRoom(room, idx)}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>{isAr ? "تعديل الغرفة" : "Edit Room"}</span>
                            </Button>

                            {/* Clone Room Button */}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleDuplicateRoom(idx)}
                              className="h-8 rounded-xl border-border hover:border-amber-500 text-muted-foreground hover:text-foreground text-xs font-bold gap-1 cursor-pointer"
                              title={isAr ? "تكرار فئة الغرفة" : "Clone Room Tier"}
                            >
                              <Copy className="w-3.5 h-3.5 text-amber-500" />
                              <span className="hidden xl:inline">{isAr ? "تكرار" : "Clone"}</span>
                            </Button>

                            {/* Active Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleRoomActive(idx)}
                              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                room.isActive
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                              }`}
                              title={room.isActive ? (isAr ? "تعطيل الغرفة" : "Deactivate Room") : (isAr ? "تفعيل الغرفة" : "Activate Room")}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>

                            {/* Delete Room Button */}
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => handleDeleteRoom(idx)}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
                              title={isAr ? "حذف الغرفة" : "Delete Room Tier"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: 5-LANGUAGE TRANSLATIONS */}
            <TabsContent value="translations" className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Globe2 className="w-4 h-4 shrink-0" />
                  <span>{isAr ? "دعم كامل للغات الخمس العالمية (الإنجليزية، العربية، الإسبانية، البرتغالية، الإيطالية)." : "Full 5-language editorial localization suite."}</span>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSmartFillTranslations}
                  disabled={isTranslating}
                  className="h-8 text-xs font-bold gap-1.5 rounded-xl border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-slate-950 cursor-pointer shrink-0 shadow-xs"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isAr ? "جاري الترجمة الذكية..." : "Translating..."}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>{isAr ? "✨ ترجمة الحقول الشاغرة بالذكاء الاصطناعي" : "✨ AI Auto-Translate Missing"}</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1.5 border-b pb-2 overflow-x-auto">
                {(
                  [
                    { id: "en", label: "🇬🇧 English", nameKey: "nameEn", descKey: "descEn" },
                    { id: "ar", label: "🇸🇦 العربية", nameKey: "nameAr", descKey: "descAr" },
                    { id: "es", label: "🇪🇸 Español", nameKey: "nameEs", descKey: "descEs" },
                    { id: "pt", label: "🇵🇹 Português", nameKey: "namePt", descKey: "descPt" },
                    { id: "it", label: "🇮🇹 Italiano", nameKey: "nameIt", descKey: "descIt" },
                  ] as const
                ).map((lang) => {
                  const isActive = langSubTab === lang.id;
                  const hasName = Boolean(form[lang.nameKey]);
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLangSubTab(lang.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                          : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      <span>{lang.label}</span>
                      {hasName && <Check className={`w-3 h-3 ${isActive ? "text-slate-950" : "text-emerald-500"}`} />}
                    </button>
                  );
                })}
              </div>

              {/* Subtab Content for Selected Language */}
              <div className="space-y-4 pt-2">
                {langSubTab === "en" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇬🇧 Hotel Name (English)</label>
                      <Input
                        value={form.nameEn}
                        onChange={(e) => handleNameEnChange(e.target.value)}
                        placeholder="Nile Palace Luxury Resort"
                        className="h-10 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇬🇧 Full Overview & Description (English)</label>
                      <Textarea
                        rows={4}
                        value={form.descEn}
                        onChange={(e) => setForm((prev) => ({ ...prev, descEn: e.target.value }))}
                        placeholder="A timeless 5-star haven on the banks of the Nile, offering opulent suites and world-class spa facilities..."
                        className="text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {langSubTab === "ar" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇸🇦 اسم الفندق (العربية)</label>
                      <Input
                        value={form.nameAr}
                        onChange={(e) => setForm((prev) => ({ ...prev, nameAr: e.target.value }))}
                        placeholder="منتجع قصر النيل الفاخر"
                        className="h-10 text-xs font-bold"
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇸🇦 الوصف الكامل للفندق (العربية)</label>
                      <Textarea
                        rows={4}
                        value={form.descAr}
                        onChange={(e) => setForm((prev) => ({ ...prev, descAr: e.target.value }))}
                        placeholder="واحة فاخرة من فئة 5 نجوم على ضفاف نهر النيل الخالد، تقدم أجنحة فندقية ملكية وخدمات سبا عالمية المستوى..."
                        className="text-xs leading-relaxed"
                        dir="rtl"
                      />
                    </div>
                  </div>
                )}

                {langSubTab === "es" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇪🇸 Nombre del Hotel (Español)</label>
                      <Input
                        value={form.nameEs}
                        onChange={(e) => setForm((prev) => ({ ...prev, nameEs: e.target.value }))}
                        placeholder="Hotel Palacio del Nilo"
                        className="h-10 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇪🇸 Descripción del Hotel (Español)</label>
                      <Textarea
                        rows={4}
                        value={form.descEs}
                        onChange={(e) => setForm((prev) => ({ ...prev, descEs: e.target.value }))}
                        placeholder="Un refugio de lujo de 5 estrellas a orillas del Nilo con suites de primera categoría..."
                        className="text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {langSubTab === "pt" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇵🇹 Nome do Hotel (Português)</label>
                      <Input
                        value={form.namePt}
                        onChange={(e) => setForm((prev) => ({ ...prev, namePt: e.target.value }))}
                        placeholder="Hotel Palácio do Nilo"
                        className="h-10 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇵🇹 Descrição do Hotel (Português)</label>
                      <Textarea
                        rows={4}
                        value={form.descPt}
                        onChange={(e) => setForm((prev) => ({ ...prev, descPt: e.target.value }))}
                        placeholder="Um refúgio atemporal de 5 estrelas às margens do Nilo com hospitalidade incomparável..."
                        className="text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {langSubTab === "it" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇮🇹 Nome dell'Hotel (Italiano)</label>
                      <Input
                        value={form.nameIt}
                        onChange={(e) => setForm((prev) => ({ ...prev, nameIt: e.target.value }))}
                        placeholder="Hotel Palazzo del Nilo"
                        className="h-10 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇮🇹 Descrizione dell'Hotel (Italiano)</label>
                      <Textarea
                        rows={4}
                        value={form.descIt}
                        onChange={(e) => setForm((prev) => ({ ...prev, descIt: e.target.value }))}
                        placeholder="Un'oasi di lusso a 5 stelle sulle rive del Nilo con servizi benessere esclusivi..."
                        className="text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 4: CATEGORIZED AMENITIES & FACILITIES */}
            <TabsContent value="amenities" className="space-y-6">
              <div className="p-3 rounded-xl bg-muted/40 border text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>{isAr ? "حدد المرافق والخدمات الحصرية المتوفرة في الفندق بالنقر عليها:" : "Select luxury amenities available at this property:"}</span>
                <Badge variant="outline" className="text-amber-500 font-bold border-amber-500/30">
                  {Object.values(form.amenities).filter(Boolean).length} {isAr ? "مرافق مختارة" : "Selected"}
                </Badge>
              </div>

              {AMENITY_CATEGORIES.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-2.5">
                  <h4 className="text-xs font-black text-foreground flex items-center gap-1.5 border-b pb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? cat.categoryAr : cat.categoryEn}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {cat.items.map((am) => {
                      const Icon = am.icon;
                      const isChecked = Boolean(form.amenities[am.id]);
                      return (
                        <button
                          key={am.id}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              amenities: { ...prev.amenities, [am.id]: !isChecked },
                            }))
                          }
                          className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                            isChecked
                              ? "bg-amber-500/10 border-amber-500/60 text-foreground shadow-xs scale-[1.01]"
                              : "bg-background border-border text-muted-foreground hover:bg-muted/30"
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${isChecked ? "bg-amber-500 text-slate-950" : "bg-muted text-muted-foreground"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="text-xs font-extrabold truncate">{isAr ? am.labelAr : am.labelEn}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{am.labelEn}</div>
                          </div>
                          {isChecked && <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* TAB 5: POLICIES, CONTACT & HERO IMAGE */}
            <TabsContent value="policies" className="space-y-4">
              {/* Hero Image URL & Preview */}
              <div className="p-4 rounded-2xl bg-muted/30 border space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? "رابط الصورة الرئيسية للفندق (Hero Image URL)" : "Hotel Hero Image URL"}</span>
                  </label>
                  <Input
                    placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                    value={form.heroImageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, heroImageUrl: e.target.value }))}
                    className="h-10 text-xs font-mono"
                  />
                </div>

                {form.heroImageUrl && (
                  <div className="h-36 rounded-xl overflow-hidden relative border bg-slate-950">
                    <img
                      src={form.heroImageUrl}
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute bottom-2 right-2 bg-slate-950/80 px-2.5 py-1 rounded-md text-[10px] text-amber-400 font-mono">
                      Image Preview
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>{isAr ? "رقم الهاتف" : "Phone Number"}</span>
                  </label>
                  <Input
                    placeholder="+20 100 123 4567"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="h-10 text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>{isAr ? "البريد الإلكتروني" : "Email Address"}</span>
                  </label>
                  <Input
                    placeholder="reservations@hotel.com"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="h-10 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5 text-primary" />
                    <span>{isAr ? "الموقع الرسمي (https)" : "Official Website"}</span>
                  </label>
                  <Input
                    placeholder="https://luxuryhotel.com"
                    value={form.website}
                    onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                    className="h-10 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Check-in & Check-out Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? "موعد تسجيل الوصول (Check-in)" : "Check-in Time"}</span>
                  </label>
                  <Input
                    value={form.checkIn}
                    onChange={(e) => setForm((prev) => ({ ...prev, checkIn: e.target.value }))}
                    placeholder="14:00"
                    className="h-10 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? "موعد تسجيل المغادرة (Check-out)" : "Check-out Time"}</span>
                  </label>
                  <Input
                    value={form.checkOut}
                    onChange={(e) => setForm((prev) => ({ ...prev, checkOut: e.target.value }))}
                    placeholder="12:00"
                    className="h-10 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-extrabold text-foreground">{isAr ? "سياسة الإلغاء والاسترداد" : "Cancellation Policy"}</label>
                <Input
                  value={form.cancellationPolicy}
                  onChange={(e) => setForm((prev) => ({ ...prev, cancellationPolicy: e.target.value }))}
                  placeholder="Free cancellation up to 48 hours before check-in."
                  className="h-10 text-xs font-medium"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-muted/40 border-t flex flex-row items-center justify-between">
          <div className="text-xs text-muted-foreground font-semibold">
            {form.rooms.length} {isAr ? "غرف معدة" : "room tiers"} · {form.status}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="h-10 text-xs font-semibold px-4 cursor-pointer"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-10 text-xs font-bold px-6 gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isAr ? "جاري الحفظ..." : "Saving Hotel & Rooms..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{hotel ? (isAr ? "حفظ التعديلات والغرف" : "Save Changes") : (isAr ? "إضافة الفندق والغرف الآن" : "Create Hotel & Rooms")}</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Media Library Picker Modal for Hotel Hero */}
      <MediaLibraryPickerModal
        open={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectMediaFromPicker}
        selectedAssetId={form.heroMediaId}
        selectedAssetUrl={form.heroImageUrl}
        entityId={hotel?.id}
        locale={locale}
      />

      {/* Dedicated Room Editor Modal for Individual Rooms */}
      <RoomEditorModal
        open={isRoomEditorOpen}
        onClose={() => setIsRoomEditorOpen(false)}
        room={editingRoom}
        roomIndex={editingRoomIndex}
        onSave={handleSaveRoomFromModal}
        entityId={hotel?.id}
        locale={locale}
      />
    </Dialog>
  );
}
