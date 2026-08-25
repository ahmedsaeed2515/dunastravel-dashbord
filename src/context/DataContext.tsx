"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TripModel, 
  HotelModel, 
  DestinationModel, 
  EgyptPackageModel 
} from '@/types/dunas-suite';

export const DESTINATIONS_LIST: DestinationModel[] = [
  {
    id: 'egypt',
    nameAr: 'مصر',
    nameEn: 'Egypt',
    flag: '🇪🇬',
    gradient: 'from-amber-500/20 to-amber-600/10',
    description: 'أرض الفراعنة، الأهرامات العظيمة ونهر النيل الخالد',
    image: 'https://images.unsplash.com/photo-1572252821143-035a0f6700c2?q=80&w=1200',
  },
  {
    id: 'turkey',
    nameAr: 'تركيا',
    nameEn: 'Turkey',
    flag: '🇹🇷',
    gradient: 'from-red-500/20 to-red-600/10',
    description: 'سحر اسطنبول وكابادوكيا والمناظر الطبيعية الخلابة',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200',
  },
  {
    id: 'jordan',
    nameAr: 'الأردن',
    nameEn: 'Jordan',
    flag: '🇯🇴',
    gradient: 'from-emerald-500/20 to-emerald-600/10',
    description: 'البتراء الوردية ووديان وادي رم الساحرة',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1200',
  },
  {
    id: 'morocco',
    nameAr: 'المغرب',
    nameEn: 'Morocco',
    flag: '🇲🇦',
    gradient: 'from-rose-500/20 to-rose-600/10',
    description: 'ألوان مراكش، زقاق فاس والجمال العتيق',
    image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1200',
  },
  {
    id: 'greece',
    nameAr: 'اليونان',
    nameEn: 'Greece',
    flag: '🇬🇷',
    gradient: 'from-blue-500/20 to-blue-600/10',
    description: 'جزر سانتوريني والمباني البيضاء والزرقة البحرية',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200',
  },
  {
    id: 'dubai',
    nameAr: 'دبي',
    nameEn: 'Dubai',
    flag: '🇦🇪',
    gradient: 'from-yellow-500/20 to-yellow-600/10',
    description: 'ناطحات السحاب، الفخامة والتسوق العالمي',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200',
  },
  {
    id: 'tunisia',
    nameAr: 'تونس',
    nameEn: 'Tunisia',
    flag: '🇹🇳',
    gradient: 'from-orange-500/20 to-orange-600/10',
    description: 'شواطئ سيدي بوسعيد، قرطاج والصحراء الذهبية',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=1200',
  },
  {
    id: 'holyland',
    nameAr: 'الأرض المقدسة',
    nameEn: 'Holy Land',
    flag: '🕊️',
    gradient: 'from-purple-500/20 to-purple-600/10',
    description: 'المعالم الروحية والتاريخية العريقة',
    image: 'https://images.unsplash.com/photo-1544971587-b842c27f8c14?q=80&w=1200',
  },
];

export const EGYPT_PACKAGES_LIST: EgyptPackageModel[] = [
  {
    id: 'egypt-classic',
    titleAr: 'البرنامج الكلاسيكي (Classic Program)',
    titleEn: 'Classic Program',
    type: 'Classic',
    icon: '🏛️',
    description: 'زيارة القاهرة، الأهرامات، والمتحف المصري الكبير',
    badge: 'الأكثر طلباً',
  },
  {
    id: 'egypt-honeymoon',
    titleAr: 'برنامج شهر العسل (Honeymoon)',
    titleEn: 'Honeymoon Package',
    type: 'Honeymoon',
    icon: '💍',
    description: 'إقامة رومانسية في الجونة، شرم الشيخ، وإطلالات النيل',
    badge: 'رومانسي VIP',
  },
  {
    id: 'egypt-nile-cruise',
    titleAr: 'نايل كروز والأهرامات (Nile Cruise & Pyramids)',
    titleEn: 'Nile Cruise & Pyramids',
    type: 'Nile Cruise',
    icon: '🚢',
    description: 'إبحار بين الأقصر وأسوان مع جولة الأهرامات',
    badge: 'إبحار فاخر',
  },
  {
    id: 'egypt-luxury-vip',
    titleAr: 'برنامج الفخامة VIP (Luxury VIP)',
    titleEn: 'Luxury VIP Program',
    type: 'VIP',
    icon: '⭐',
    description: 'طيران خاص، فنادق 5 نجوم ديلاكس، وخدمة حراسة وإرشاد خاص',
    badge: 'VIP 5 Stars',
  },
  {
    id: 'egypt-desert-adventure',
    titleAr: 'المغامرات والتخييم الصحراوي (Desert & Adventure)',
    titleEn: 'Desert & Adventure',
    type: 'Adventure',
    icon: '🐪',
    description: 'رحلات الواحات البحرية، الصحراء البيضاء، والسفاري',
    badge: 'مغامرة',
  },
];

// Verified Egypt Tours Catalog (Synced with Backend & Frontend)
const INITIAL_TRIPS: TripModel[] = [
  {
    id: 'eg-br-001',
    slug: 'cairo-express-4d',
    title: 'القاهرة اكسبرس (Cairo Express)',
    subtitle: 'Roteiro intenso de quatro dias explorando o coração do Egito Antigo',
    destination: 'egypt',
    market: 'Brasil / Global',
    language: 'pt',
    type: 'Classic',
    duration: '4 Dias / 3 Noites',
    departures: 'Diário / Daily',
    price: 450,
    hotelCategory: 'Category Chosen',
    rating: 4.9,
    reviewCount: 24,
    popular: true,
    views: 1500,
    inquiries: 120,
    familyFriendly: true,
    honeymoon: false,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: 'Roteiro intenso de quatro dias explorando o coração do Egito Antigo. Visite as Pirâmides de Giza, a Esfinge, Memphis, Sakkara, o Grand Egyptian Museum, a Mesquita de Alabastro e o vibrante Mercado Khan El Khalili. Pacote completo com traslados, hospedagem e visto inclusos.',
    highlights: ['Pirâmides de Giza e Esfinge', 'Memphis e Sakkara', 'Grand Egyptian Museum (GEM)', 'Mercado Khan El Khalili'],
    included: ['03 noites de hospedagem no Cairo em hotel de categoria escolhida com café da manhã e taxas', 'Traslados: Aeroporto / Hotel / Aeroporto em serviço regular.'],
    excluded: ['Todas as bebidas durante o almoço e jantar nos passeios não estão inclusas'],
    images: ['https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=1200'],
    accommodation: [{ destination: 'Cairo', nights: 3, regime: 'Bed & Breakfast' }],
    itinerary: [{ day: 1, title: 'Chegada no Aeroporto Internacional do Cairo', description: 'Chegada ao Aeroporto do Cairo e traslado para o Hotel.', meals: 'Sem refeições' }],
    translations: {
      ar: { title: 'القاهرة اكسبرس', overview: 'برنامج مكثف لمدة أربعة أيام لاستكشاف قلب مصر القديمة.', highlights: ['أهرامات الجيزة وأبو الهول', 'سوق خان الخليلي'] },
      en: { title: 'Cairo Express', overview: 'An intense 4-day itinerary exploring the heart of Ancient Egypt.', highlights: ['Pyramids of Giza & Sphinx', 'Khan El Khalili Market'] },
      pt: { title: 'Cairo Express', overview: 'Roteiro intenso de quatro dias explorando o coração do Egito Antigo.', highlights: ['Pirâmides de Giza e Esfinge'] }
    }
  },
  {
    id: 'eg-br-002',
    slug: 'cairo-express-alexandria-5d',
    title: 'القاهرة اكسبرس مع الإسكندرية (Cairo Express with Alexandria)',
    subtitle: 'El Cairo Express con Alejandría 5 días',
    destination: 'egypt',
    market: 'Global',
    language: 'ar',
    type: 'Classic',
    duration: '5 Days / 4 Nights',
    departures: 'Daily',
    price: 550,
    hotelCategory: '5-Star Luxury',
    rating: 4.8,
    reviewCount: 18,
    popular: true,
    views: 1200,
    inquiries: 95,
    familyFriendly: true,
    honeymoon: false,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: 'جولة رائعة لمدة 5 أيام تغطي أهرامات الجيزة والمعالم التاريخية بالقاهرة، بالإضافة إلى جولة خاصة لعروس البحر المتوسط الإسكندرية.',
    highlights: ['أهرامات الجيزة وأبو الهول', 'قلعة قايتباي ومكتبة الإسكندرية', 'المتحف المصري الكبير'],
    included: ['إقامة 4 ليالٍ مع الإفطار والضرائب', 'الانتقالات وجولات القاهرة والإسكندرية'],
    excluded: ['رسوم التأشيرة والمشروبات'],
    images: ['https://images.unsplash.com/photo-1572252821143-035a0f6700c2?q=80&w=1200'],
    accommodation: [{ destination: 'Cairo', nights: 4, regime: 'Bed & Breakfast' }],
    itinerary: [{ day: 1, title: 'الوصول للقاهرة والتسكين بالفندق', description: 'استقبال بالفندق والتسكين.', meals: 'الإفطار' }],
    translations: {
      ar: { title: 'القاهرة اكسبرس مع الإسكندرية', overview: 'جولة رائعة لمدة 5 أيام بالقاهرة والإسكندرية.', highlights: ['أهرامات الجيزة', 'قلعة قايتباي'] },
      en: { title: 'Cairo Express with Alexandria', overview: 'A 5-day tour covering Cairo pyramids and Alexandria.', highlights: ['Giza Pyramids', 'Alexandria Library'] }
    }
  },
  {
    id: 'eg-br-003',
    slug: 'egito-classico-8d',
    title: 'مصر الكلاسيكية (Classic Egypt)',
    subtitle: 'Egito Clássico com Cruzeiro no Nilo 8 dias',
    destination: 'egypt',
    market: 'Global',
    language: 'pt',
    type: 'Nile Cruise',
    duration: '8 Days / 7 Nights',
    departures: 'Weekly',
    price: 1150,
    hotelCategory: '5-Star Luxury',
    rating: 4.9,
    reviewCount: 32,
    popular: true,
    views: 2100,
    inquiries: 180,
    familyFriendly: true,
    honeymoon: true,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: 'برنامج مصر الكلاسيكي الشامل لمدة 8 أيام: 3 ليالٍ في القاهرة مع زيارة الأهرامات، وإبحار كروز فاخر على النيل بين الأقصر وأسوان.',
    highlights: ['أهرامات الجيزة والمتحف', 'إبحار نايل كروز 5 نجوم', 'معابد الكرنك والأقصر وفيلة'],
    included: ['إقامة بالقاهرة وكروز النيل شامل الوجبات والضرائب'],
    excluded: ['رسوم التأشيرة والمشروبات'],
    images: ['https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?q=80&w=1200'],
    accommodation: [{ destination: 'Cairo', nights: 3, regime: 'Bed & Breakfast' }, { destination: 'Nile Cruise', nights: 4, regime: 'Full Board' }],
    itinerary: [{ day: 1, title: 'الوصول إلى مطار القاهرة الدولي', description: 'الاستقبال بالفندق والتسكين.', meals: 'الإفطار' }],
    translations: {
      ar: { title: 'مصر الكلاسيكية', overview: 'برنامج مصر الكلاسيكي الشامل 8 أيام.', highlights: ['الأهرامات', 'نايل كروز'] },
      en: { title: 'Classic Egypt', overview: 'Comprehensive 8-day Classic Egypt program with Nile Cruise.', highlights: ['Giza Pyramids', 'Nile Cruise'] }
    }
  },
  {
    id: 'eg-br-004',
    slug: 'egito-classico-ii-9d',
    title: 'مصر الكلاسيكية 2 مع الإسكندرية (Classic Egypt II)',
    subtitle: 'Egito Clássico II com Cruzeiro e Alexandria',
    destination: 'egypt',
    market: 'Global',
    language: 'pt',
    type: 'Nile Cruise',
    duration: '9 Days / 8 Nights',
    departures: 'Weekly',
    price: 1290,
    hotelCategory: '5-Star Luxury',
    rating: 4.9,
    reviewCount: 29,
    popular: true,
    views: 1850,
    inquiries: 140,
    familyFriendly: true,
    honeymoon: true,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: 'رحلة متكاملة لمدة 9 أيام تجمع بين سحر القاهرة التاريخية، إبحار النيل بين أسوان والأقصر، ورحلة خاصة إلى الإسكندرية.',
    highlights: ['أهرامات الجيزة', 'رحلة كروز النيل', 'معالم الإسكندرية'],
    included: ['إقامة القاهرة والإسكندرية ونايل كروز شامل الوجبات'],
    excluded: ['التأشيرة والمشروبات'],
    images: ['https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1200'],
    accommodation: [{ destination: 'Cairo', nights: 4, regime: 'Bed & Breakfast' }, { destination: 'Nile Cruise', nights: 4, regime: 'Full Board' }],
    itinerary: [{ day: 1, title: 'الوصول للقاهرة والتسكين', description: 'استقبال بالفندق.', meals: 'الإفطار' }],
    translations: {
      ar: { title: 'مصر الكلاسيكية 2 مع الإسكندرية', overview: 'رحلة متكاملة 9 أيام بالقاهرة والنيل والإسكندرية.', highlights: ['الأهرامات', 'نايل كروز', 'الإسكندرية'] },
      en: { title: 'Classic Egypt II with Alexandria', overview: '9-day journey with Cairo, Nile Cruise and Alexandria.', highlights: ['Pyramids', 'Nile Cruise', 'Alexandria'] }
    }
  },
  {
    id: 'eg-br-005',
    slug: 'egito-historico-10d',
    title: 'مصر التاريخية وأبو سمبل (Historic Egypt & Abu Simbel)',
    subtitle: 'Egito Histórico com Templos de Abu Simbel',
    destination: 'egypt',
    market: 'Global',
    language: 'ar',
    type: 'Classic',
    duration: '10 Days / 9 Nights',
    departures: 'Weekly',
    price: 1450,
    hotelCategory: '5-Star Luxury',
    rating: 5.0,
    reviewCount: 41,
    popular: true,
    views: 2400,
    inquiries: 210,
    familyFriendly: true,
    honeymoon: false,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: 'رحلة تاريخية متعمقة لمدة 10 أيام تشمل القاهرة والأهرامات، الإبحار في النيل، بالإضافة إلى جولة معبد أبو سمبل العظيم لرمسيس الثاني.',
    highlights: ['معبد أبو سمبل العظيم', 'أهرامات الجيزة والمتحف الكبير', 'وادي الملوك بالاقصر'],
    included: ['إقامة شاملة الوجبات وكروز النيل ورحلة أبو سمبل الخاصة'],
    excluded: ['التأشيرة والمشروبات الشخصية'],
    images: ['https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=1200'],
    accommodation: [{ destination: 'Cairo', nights: 4, regime: 'Bed & Breakfast' }, { destination: 'Nile Cruise', nights: 4, regime: 'Full Board' }, { destination: 'Aswan', nights: 1, regime: 'Bed & Breakfast' }],
    itinerary: [{ day: 1, title: 'الوصول والاستقبال في مطار القاهرة', description: 'التسكين والفترة حرة.', meals: 'الإفطار' }],
    translations: {
      ar: { title: 'مصر التاريخية وأبو سمبل', overview: 'رحلة تاريخية شاملة 10 أيام مع أبو سمبل.', highlights: ['أبو سمبل', 'الأهرامات'] },
      en: { title: 'Historic Egypt & Abu Simbel', overview: '10-day historical tour with Abu Simbel temples.', highlights: ['Abu Simbel', 'Giza Pyramids'] }
    }
  },
  {
    id: 'eg-br-006',
    slug: 'grande-ramses-10d',
    title: 'برنامج رمسيس الكبير (The Great Ramses Program)',
    subtitle: 'O Grande Ramses Pacote VIP Luxo 10 dias',
    destination: 'egypt',
    market: 'Global',
    language: 'pt',
    type: 'VIP',
    duration: '10 Days / 9 Nights',
    departures: 'Weekly',
    price: 1550,
    hotelCategory: '5-Star Deluxe VIP',
    rating: 5.0,
    reviewCount: 35,
    popular: true,
    views: 2900,
    inquiries: 260,
    familyFriendly: true,
    honeymoon: true,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: 'الباقة الملكية الفاخرة رمسيس الكبير: إقامة 5 نجوم ديلاكس، كروز النيل، زيارة القاهرة والأهرامات والمتحف الجديد والإسكندرية والأقصر وأسوان.',
    highlights: ['خدمة VIP وتوصيلات خاصة', 'كروز النيل الفاخر', 'جولة الإسكندرية والقاهرة الكبرى'],
    included: ['إقامة VIP 5 نجوم ديلاكس وكروز النيل والرحلات الخاصة'],
    excluded: ['التأشيرة والمشروبات الشخصية'],
    images: ['https://images.unsplash.com/photo-1572252821143-035a0f6700c2?q=80&w=1200'],
    accommodation: [{ destination: 'Cairo', nights: 5, regime: 'Bed & Breakfast' }, { destination: 'Nile Cruise', nights: 4, regime: 'Full Board' }],
    itinerary: [{ day: 1, title: 'استقبال VIP بمطار القاهرة والتوصيل للفندق', description: 'تسكين غرف VIP.', meals: 'الإفطار' }],
    translations: {
      ar: { title: 'برنامج رمسيس الكبير', overview: 'الباقة الملكية الفاخرة رمسيس الكبير 10 أيام.', highlights: ['VIP Deluxe', 'كروز النيل'] },
      en: { title: 'The Great Ramses Program', overview: 'Royal VIP Great Ramses program 10 days.', highlights: ['VIP Deluxe', 'Nile Cruise'] }
    }
  },
  {
    id: 'eg-br-007',
    slug: 'tesouros-egipto-9d',
    title: 'كنوز مصر والإسكندرية (Treasures of Egypt)',
    subtitle: 'Tesouros do Egito com Alexandria 9 dias',
    destination: 'egypt',
    market: 'Global',
    language: 'pt',
    type: 'Classic',
    duration: '9 Days / 8 Nights',
    departures: 'Weekly',
    price: 1350,
    hotelCategory: '5-Star Luxury',
    rating: 4.8,
    reviewCount: 22,
    popular: true,
    views: 1600,
    inquiries: 110,
    familyFriendly: true,
    honeymoon: false,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: 'استكشف كنوز الحضارة المصرية في 9 أيام: القاهرة، أهرامات الجيزة، المتحف المصري الكبير، إبحار النيل بين الأقصر وأسوان، وجولة ساحلية بالإسكندرية.',
    highlights: ['كنوز الفرعونية بالأقصر', 'إبحار النيل الرومانسي', 'أهرامات الجيزة والمتحف'],
    included: ['إقامة كاملة بالفنادق والنيل كروز'],
    excluded: ['التأشيرة والمشروبات'],
    images: ['https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?q=80&w=1200'],
    accommodation: [{ destination: 'Cairo', nights: 4, regime: 'Bed & Breakfast' }, { destination: 'Nile Cruise', nights: 4, regime: 'Full Board' }],
    itinerary: [{ day: 1, title: 'الوصول والتسكين بالفندق بالقاهرة', description: 'تسكين بالفندق.', meals: 'الإفطار' }],
    translations: {
      ar: { title: 'كنوز مصر والإسكندرية', overview: 'استكشف كنوز الحضارة المصرية في 9 أيام.', highlights: ['الأهرامات', 'الإسكندرية'] },
      en: { title: 'Treasures of Egypt & Alexandria', overview: 'Discover Egyptian treasures in 9 days.', highlights: ['Pyramids', 'Alexandria'] }
    }
  },
  {
    id: 'eg-br-008',
    slug: 'cairo-cruzeiro-sharm-11d',
    title: 'القاهرة وكروز النيل وشرم الشيخ (Cairo, Nile & Sharm)',
    subtitle: 'Cairo c/ Cruzeiro + Sharm El Sheikh 11 dias',
    destination: 'egypt',
    market: 'Global',
    language: 'pt',
    type: 'Adventure',
    duration: '11 Days / 10 Nights',
    departures: 'Weekly',
    price: 1690,
    hotelCategory: '5-Star Resort & Cruise',
    rating: 5.0,
    reviewCount: 50,
    popular: true,
    views: 3500,
    inquiries: 320,
    familyFriendly: true,
    honeymoon: true,
    luxury: true,
    cultural: true,
    adventure: true,
    overview: 'الباقة المتكاملة الأكثر استرخاءً 11 يوماً: استكشاف القاهرة والأهرامات، إبحار كروز النيل بين الأقصر وأسوان، والاستجمام في منتجعات شرم الشيخ والشعب المرجانية.',
    highlights: ['استجمام وشواطئ شرم الشيخ', 'كروز النيل بين الأقصر وأسوان', 'أهرامات الجيزة والمتحف'],
    included: ['إقامة الفنادق وكروز النيل ومنتجع شرم الشيخ شامل الوجبات'],
    excluded: ['التأشيرة والمشروبات الشخصية'],
    images: ['https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1200'],
    accommodation: [{ destination: 'Cairo', nights: 3, regime: 'Bed & Breakfast' }, { destination: 'Nile Cruise', nights: 4, regime: 'Full Board' }, { destination: 'Sharm El Sheikh', nights: 3, regime: 'All Inclusive' }],
    itinerary: [{ day: 1, title: 'الوصول لمطار القاهرة الدولي والتسكين', description: 'استقبال بالفندق.', meals: 'الإفطار' }],
    translations: {
      ar: { title: 'القاهرة وكروز النيل وشرم الشيخ', overview: 'الباقة المتكاملة 11 يوماً بالقاهرة والنيل وشرم الشيخ.', highlights: ['شرم الشيخ', 'نايل كروز', 'الأهرامات'] },
      en: { title: 'Cairo, Nile Cruise & Sharm El Sheikh', overview: '11-day program with Cairo, Nile Cruise and Sharm El Sheikh.', highlights: ['Sharm El Sheikh', 'Nile Cruise', 'Pyramids'] }
    }
  }
];

const INITIAL_HOTELS: HotelModel[] = [
  {
    id: 'hotel-cairo-1',
    name: 'فندق ماريوت مينا هاوس القاهرة (Marriott Mena House)',
    destination: 'egypt',
    city: 'Cairo',
    stars: 5,
    rating: 4.9,
    pricePerNight: 280,
    status: 'RECOMMENDED',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800',
    ],
    description: 'فندق تاريخي فاخر 5 نجوم يقع مباشرة أمام أهرامات الجيزة العظيمة، يمتد بين حدائق غناء بمساحة 40 فداناً.',
    address: '6 شارع Pyramids Road, الجيزة, القاهرة, مصر',
    mapUrl: 'https://maps.google.com',
    phone: '+20 2 33773222',
    email: 'reservations@menahousemarriott.com',
    website: 'https://www.marriott.com',
    amenities: ['wifi', 'pool', 'spa', 'pyramidsView', 'restaurant', 'gym'],
    roomTypes: [
      { id: 'r1', name: 'Deluxe Pyramids View', price: 280, mealPlan: 'Bed & Breakfast', maxOccupancy: 2 },
      { id: 'r2', name: 'Executive Suite', price: 550, mealPlan: 'Breakfast & Dinner', maxOccupancy: 3 },
    ],
    policies: {
      checkIn: '15:00',
      checkOut: '12:00',
      cancellation: 'إلغاء مجاني حتى 48 ساعة قبل موعد الوصول',
      childPolicy: 'الأطفال أقل من 6 سنوات مجاناً بدون سرير إضافي',
    },
    translations: {
      ar: {
        name: 'فندق ماريوت مينا هاوس القاهرة',
        description: 'فندق تاريخي فاخر 5 نجوم يقع مباشرة أمام أهرامات الجيزة العظيمة.',
      },
      en: {
        name: 'Marriott Mena House Cairo',
        description: 'Historical luxury 5-star hotel located directly in front of the Great Pyramids of Giza.',
      },
      es: {
        name: 'Marriott Mena House El Cairo',
        description: 'Hotel histórico de lujo de 5 estrellas situado frente a las Grandes Pirámides de Giza.',
      },
      pt: {
        name: 'Marriott Mena House Cairo',
        description: 'Hotel histórico de luxo de 5 estrelas localizado em frente às Grandes Pirâmides de Gizé.',
      },
      it: {
        name: 'Marriott Mena House Cairo',
        description: 'Storico hotel di lusso a 5 stelle situato di fronte alle Grandi Piramidi di Giza.',
      },
    },
  },
  {
    id: 'hotel-luxor-1',
    name: 'فندق شتايجنبرجر نايل بالاس الأقصر (Steigenberger Nile Palace)',
    destination: 'egypt',
    city: 'Luxor',
    stars: 5,
    rating: 4.7,
    pricePerNight: 160,
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800',
    ],
    description: 'يقع الفندق على ضفاف نهر النيل مباشرة بقلب مدينة الأقصر، ويوفر إطلالات ساحرة ومطاعم عالمية.',
    address: 'شارع خالد بن الوليد, الأقصر, مصر',
    mapUrl: 'https://maps.google.com',
    phone: '+20 95 2366999',
    email: 'info@nilepalace-luxor.com',
    website: 'https://www.steigenberger.com',
    amenities: ['wifi', 'pool', 'spa', 'nileView', 'restaurant'],
    roomTypes: [
      { id: 'r1', name: 'Nile View Superior Room', price: 160, mealPlan: 'Half Board', maxOccupancy: 2 },
    ],
    policies: {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellation: 'إلغاء مجاني حتى 24 ساعة قبل الوصول',
      childPolicy: 'الأطفال تحت سن 12 سنة مجاناً',
    },
    translations: {
      ar: {
        name: 'فندق شتايجنبرجر نايل بالاس الأقصر',
        description: 'يقع الفندق على ضفاف نهر النيل مباشرة بقلب مدينة الأقصر.',
      },
      en: {
        name: 'Steigenberger Nile Palace Luxor',
        description: 'Located directly on the banks of the River Nile in the heart of Luxor.',
      },
      es: {
        name: 'Steigenberger Nile Palace Luxor',
        description: 'Ubicado a orillas del río Nilo en el corazón de Luxor.',
      },
      pt: {
        name: 'Steigenberger Nile Palace Luxor',
        description: 'Localizado às margens do Rio Nilo, no coração de Luxor.',
      },
      it: {
        name: 'Steigenberger Nile Palace Luxor',
        description: 'Situato sulle rive del fiume Nilo nel cuore di Luxor.',
      },
    },
  },
];

interface DataContextType {
  trips: TripModel[];
  hotels: HotelModel[];
  destinations: DestinationModel[];
  egyptPackages: EgyptPackageModel[];
  addTrip: (trip: TripModel) => void;
  updateTrip: (trip: TripModel) => void;
  deleteTrip: (id: string) => void;
  transferTrip: (tripId: string, targetDestination: string, targetPackageId?: string) => void;
  addHotel: (hotel: HotelModel) => void;
  updateHotel: (hotel: HotelModel) => void;
  deleteHotel: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_TRIPS_KEY = 'dunas_admin_trips_v3';
const LOCAL_STORAGE_HOTELS_KEY = 'dunas_admin_hotels_v1';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<TripModel[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('dunas_admin_trips_v1');
        localStorage.removeItem('dunas_admin_trips_v2');
      } catch {}
      const saved = localStorage.getItem(LOCAL_STORAGE_TRIPS_KEY);
      if (saved && saved !== 'undefined' && saved.trim() !== '') {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const savedSlugs = new Set(parsed.map((t: TripModel) => t.slug ? t.slug.toLowerCase() : ''));
            const missingInitial = INITIAL_TRIPS.filter((it) => !savedSlugs.has(it.slug.toLowerCase()));
            return [...parsed, ...missingInitial];
          }
        } catch (e) {
          console.error('Failed to parse saved trips', e);
          return INITIAL_TRIPS;
        }
      }
    }
    return INITIAL_TRIPS;
  });

  const [hotels, setHotels] = useState<HotelModel[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_HOTELS_KEY);
      if (saved && saved !== 'undefined' && saved.trim() !== '') {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved hotels', e);
          return INITIAL_HOTELS;
        }
      }
    }
    return INITIAL_HOTELS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_TRIPS_KEY, JSON.stringify(trips));
    }
  }, [trips]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_HOTELS_KEY, JSON.stringify(hotels));
    }
  }, [hotels]);

  const addTrip = useCallback((trip: TripModel) => {
    setTrips(prev => [trip, ...prev]);
  }, []);

  const updateTrip = useCallback((updatedTrip: TripModel) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  }, []);

  const transferTrip = useCallback((tripId: string, targetDestination: string, targetPackageId?: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          destination: targetDestination,
          packageId: targetPackageId || t.packageId,
        };
      }
      return t;
    }));
  }, []);

  const addHotel = useCallback((hotel: HotelModel) => {
    setHotels(prev => [hotel, ...prev]);
  }, []);

  const updateHotel = useCallback((updatedHotel: HotelModel) => {
    setHotels(prev => prev.map(h => h.id === updatedHotel.id ? updatedHotel : h));
  }, []);

  const deleteHotel = useCallback((id: string) => {
    setHotels(prev => prev.filter(h => h.id !== id));
  }, []);

  const contextValue = useMemo(() => ({
    trips,
    hotels,
    destinations: DESTINATIONS_LIST,
    egyptPackages: EGYPT_PACKAGES_LIST,
    addTrip,
    updateTrip,
    deleteTrip,
    transferTrip,
    addHotel,
    updateHotel,
    deleteHotel,
  }), [
    trips,
    hotels,
    addTrip,
    updateTrip,
    deleteTrip,
    transferTrip,
    addHotel,
    updateHotel,
    deleteHotel,
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
