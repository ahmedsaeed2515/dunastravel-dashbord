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

const INITIAL_TRIPS: TripModel[] = [
  {
    id: 'eg-001',
    slug: 'cairo-express-4d',
    title: 'القاهرة السريعة والأهرامات 4 أيام',
    subtitle: 'اكتشف عجائب الأهرامات والمتحف المصري الفاخر',
    destination: 'egypt',
    market: 'Global',
    language: 'ar',
    type: 'Classic',
    duration: '4 Days / 3 Nights',
    departures: 'Daily / Diário',
    price: 650,
    hotelCategory: '5-Star Luxury',
    rating: 4.9,
    reviewCount: 48,
    popular: true,
    views: 1240,
    inquiries: 86,
    packageId: 'egypt-classic',
    familyFriendly: true,
    honeymoon: false,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: 'رحلة استكشافية متكاملة لمدة 4 أيام تشمل أهرامات الجيزة، أبو الهول، والمتحف المصري الكبير مع إقامة فاخرة ونقل خاص.',
    highlights: [
      'جولة خاصة لأهرامات الجيزة والمتحف المصري الكبير',
      'عشاء رومانسي على النيل في القاهرة',
      'مرشد سياحي خاص متحدث بلغات متعددة',
    ],
    included: [
      'الإقامة 3 ليالي في فندق 5 نجوم بالقاهرة مع الإفطار',
      'جميع الانتقالات بسيارة حديثة مكيفة',
      'رسوم الدخول لكافة المناطق السياحية المذكورة',
    ],
    excluded: [
      'تذاكر الطيران الدولي',
      'المشروبات المصاحبة للوجبات',
      'الإكراميات الشخصية',
    ],
    images: [
      'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=800',
      'https://images.unsplash.com/photo-1572252821143-035a0f6700c2?q=80&w=800',
    ],
    hotels: 'فندق ماريوت مينا هاوس القاهرة / فندق فورسيزونز',
    accommodation: [
      { destination: 'Cairo', nights: 3, regime: 'Bed & Breakfast' },
    ],
    itinerary: [
      { day: 1, title: 'الوصول والاستقبال', description: 'الوصول لمطار القاهرة والتنسيق للتسكين بالفندق.', meals: 'العشاء' },
      { day: 2, title: 'زيارة الأهرامات وأبو الهول', description: 'جولة كاملة بمنطقة الأهرامات وزيارة المتحف الكبير.', meals: 'الإفطار والغداء' },
      { day: 3, title: 'القاهرة المعزية وخان الخليلي', description: 'جولة بقلعة صلاح الدين والسوق القديم بخان الخليلي.', meals: 'الإفطار' },
      { day: 4, title: 'المغادرة النهائية', description: 'الإفطار بالفندق والانتقال إلى مطار القاهرة للعودة.', meals: 'الإفطار' },
    ],
    translations: {
      ar: {
        title: 'القاهرة السريعة والأهرامات 4 أيام',
        subtitle: 'اكتشف عجائب الأهرامات والمتحف المصري الفاخر',
        overview: 'رحلة استكشافية متكاملة لمدة 4 أيام تشمل أهرامات الجيزة، أبو الهول، والمتحف المصري الكبير مع إقامة فاخرة ونقل خاص.',
      },
      en: {
        title: 'Cairo Express & Pyramids 4 Days',
        subtitle: 'Explore the Great Pyramids & Grand Egyptian Museum',
        overview: 'A full 4-day immersive tour covering Giza Pyramids, Sphinx, and the Grand Egyptian Museum with luxury hotel stay.',
      },
      es: {
        title: 'El Cairo Exprés y Pirámides 4 Días',
        subtitle: 'Descubre las maravillas de las Pirámides y el Gran Museo',
        overview: 'Un recorrido completo de 4 días por las Pirámides de Giza, la Esfinge y el Gran Museo Egipcio con estancia de lujo.',
      },
      pt: {
        title: 'Cairo Expresso e Pirâmides 4 Dias',
        subtitle: 'Explore as Grandes Pirâmides e o Grande Museu Egípcio',
        overview: 'Um passeio completo de 4 dias cobrindo as Pirâmides de Gizé, Esfinge e o Grande Museu Egípcio com hotel de luxo.',
      },
      it: {
        title: 'Cairo Express e Piramidi 4 Giorni',
        subtitle: 'Esplora le Grandi Piramidi e il Grande Museo Egizio',
        overview: 'Un tour completo di 4 giorni tra le Piramidi di Giza, la Sfinge e il Grande Museo Egizio con soggiorno di lusso.',
      },
    },
  },
  {
    id: 'eg-002',
    slug: 'nile-cruise-luxor-aswan-7d',
    title: 'نايل كروز الأقصر وأسوان 7 أيام',
    subtitle: 'إبحار رائع عبر ضفاف النيل مع زيارة معابد الفراعنة',
    destination: 'egypt',
    market: 'Global',
    language: 'ar',
    type: 'Nile Cruise',
    duration: '7 Days / 6 Nights',
    departures: 'Mondays & Fridays',
    price: 1250,
    hotelCategory: '5-Star Deluxe Cruise',
    rating: 5.0,
    reviewCount: 92,
    popular: true,
    views: 2150,
    inquiries: 140,
    packageId: 'egypt-nile-cruise',
    familyFriendly: true,
    honeymoon: true,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: 'إبحار فاخر على متن باخرة 5 نجوم بين الأقصر وأسوان وزيارة معبد الكرنك، وادي الملوك، وأبو سمبل.',
    highlights: [
      'إبحار 4 ليالي بين الأقصر وأسوان شامل كافة الوجبات',
      'زيارة معبد الكرنك ووادي الملوك',
      'رحلة اختيارية لمعبد أبو سمبل بالسيارة أو الطيران',
    ],
    included: [
      'الإقامة 4 ليالي بالباخرة النيلية إقامة كاملة',
      'الإقامة 2 ليلة بالقاهرة مع الإفطار',
      'مرشد سياحي مرخص طوال الجولة',
    ],
    excluded: [
      'الطيران الداخلي (القاهرة/الأقصر - أسوان/القاهرة)',
      'المشروبات والأغراض الشخصية',
    ],
    images: [
      'https://images.unsplash.com/photo-1544971587-b842c27f8c14?q=80&w=800',
      'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=800',
    ],
    hotels: 'باخرة سونستا نايل كروز / باخرة أوبروي الزهرة',
    accommodation: [
      { destination: 'Cairo', nights: 2, regime: 'Bed & Breakfast' },
      { destination: 'Nile Cruise', nights: 4, regime: 'Full Board' },
    ],
    itinerary: [
      { day: 1, title: 'الوصول إلى القاهرة', description: 'استقبال بمطار القاهرة والتوصيل للفندق.', meals: 'العشاء' },
      { day: 2, title: 'الأهرامات والسفر إلى الأقصر', description: 'جولة الأهرامات ثم الانتقال للمطار للسفر للأقصر والتسكين بالباخرة.', meals: 'الإفطار والغداء والعشاء' },
      { day: 3, title: 'معابد الأقصر الإغريقية والفرعونية', description: 'زيارة معبد البر الشرقي والبر الغربي ووادي الملوك.', meals: 'كامل الوجبات' },
      { day: 4, title: 'الإبحار إلى إدفو وكوم أمبو', description: 'زيارة معبد حورس بمعبد إدفو ثم الإبحار لكوم أمبو.', meals: 'كامل الوجبات' },
      { day: 5, title: 'وصول أسوان والسد العالي', description: 'زيارة معبد فيلة وسد أسوان العالي.', meals: 'كامل الوجبات' },
      { day: 6, title: 'أبو سمبل والعودة للقاهرة', description: 'زيارة أبو سمبل والعودة للطيران إلى القاهرة.', meals: 'الإفطار والعشاء' },
      { day: 7, title: 'الوداع النهائي', description: 'الانتقال للمطار للعودة للوطن.', meals: 'الإفطار' },
    ],
    translations: {
      ar: {
        title: 'نايل كروز الأقصر وأسوان 7 أيام',
        subtitle: 'إبحار رائع عبر ضفاف النيل مع زيارة معابد الفراعنة',
        overview: 'إبحار فاخر على متن باخرة 5 نجوم بين الأقصر وأسوان وزيارة معبد الكرنك، وادي الملوك، وأبو سمبل.',
      },
      en: {
        title: 'Nile Cruise Luxor & Aswan 7 Days',
        subtitle: 'Sailing along the eternal Nile visiting Pharaonic Temples',
        overview: 'Luxurious 5-star Nile cruise sailing between Luxor and Aswan with visits to Karnak Temple, Valley of the Kings, and Abu Simbel.',
      },
      es: {
        title: 'Crucero por el Nilo Luxor y Asuán 7 Días',
        subtitle: 'Navegación por el Nilo visitando templos faraónicos',
        overview: 'Crucero de lujo de 5 estrellas por el Nilo entre Luxor y Asuán visitando el Templo de Karnak y el Valle de los Reyes.',
      },
      pt: {
        title: 'Cruzeiro no Nilo Luxor e Aswan 7 Dias',
        subtitle: 'Navegando pelo Nilo visitando Templos Faraônicos',
        overview: 'Cruzeiro de luxo de 5 estrelas no Nilo navegando entre Luxor e Aswan com visitas ao Templo de Karnak e Vale dos Reis.',
      },
      it: {
        title: 'Crociera sul Nilo Luxor e Aswan 7 Giorni',
        subtitle: 'Navigazione lungo il Nilo visitando i Templi Faraonici',
        overview: 'Lussuosa crociera a 5 stelle sul Nilo tra Luxor e Aswan con visite al Tempio di Karnak e alla Valle dei Re.',
      },
    },
  },
  {
    id: 'tk-001',
    slug: 'istanbul-cappadocia-6d',
    title: 'اسطنبول وكابادوكيا 6 أيام',
    subtitle: 'جولة بين المساجد العثمانية ومناطيد كابادوكيا',
    destination: 'turkey',
    market: 'Global',
    language: 'ar',
    type: 'Classic',
    duration: '6 Days / 5 Nights',
    departures: 'Daily',
    price: 890,
    hotelCategory: '4-Star Premium',
    rating: 4.8,
    reviewCount: 35,
    popular: true,
    views: 980,
    inquiries: 62,
    familyFriendly: true,
    honeymoon: true,
    luxury: false,
    cultural: true,
    adventure: true,
    overview: 'رحلة خيالية تشمل المعالم التاريخية لمدينة اسطنبول وركوب المناطيد في كابادوكيا.',
    highlights: [
      'جولة البسفور وآيا صوفيا والجامع الأزرق',
      'رحلة ركوب المنطاد في كابادوكيا عند الشروق',
      'زيارة المدينة تحت الأرض في كابادوكيا',
    ],
    included: [
      'الإقامة 3 ليالي في اسطنبول و 2 ليلة في كابادوكيا مع الإفطار',
      'الانتقالات والمزارات السياحية المحددة',
    ],
    excluded: [
      'رسوم المنطاد الهوائي الاختيارية',
      'النفقات الشخصية',
    ],
    images: [
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800',
    ],
    hotels: 'فندق سورا أيا صوفيا / فندق كاف caves كابادوكيا',
    accommodation: [
      { destination: 'Istanbul', nights: 3, regime: 'Bed & Breakfast' },
      { destination: 'Cappadocia', nights: 2, regime: 'Bed & Breakfast' },
    ],
    itinerary: [
      { day: 1, title: 'الوصول لمطار اسطنبول', description: 'الاستقبال بالفندق وأخذ قسط من الراحة.', meals: 'العشاء' },
      { day: 2, title: 'جولة السلطان أحمد', description: 'زيارة آيا صوفيا والجامع الأزرق والبازار الكبير.', meals: 'الإفطار' },
      { day: 3, title: 'رحلة البسفور والطيران لكابادوكيا', description: 'جولة بالبحر ثم الانتقال للمطار لرحلة كابادوكيا.', meals: 'الإفطار' },
      { day: 4, title: 'المناطيد والمدينة الصخرية', description: 'ركوب المنطاد الفجري ثم جولة وادي الجمال والمدينة السفلى.', meals: 'الإفطار' },
      { day: 5, title: 'العودة لاسطنبول', description: 'العودة إلى اسطنبول وجولة تسوق بوسط المدينة.', meals: 'الإفطار' },
      { day: 6, title: 'المغادرة', description: 'التوجه للمطار للعودة للوطن.', meals: 'الإفطار' },
    ],
    translations: {
      ar: {
        title: 'اسطنبول وكابادوكيا 6 أيام',
        subtitle: 'جولة بين المساجد العثمانية ومناطيد كابادوكيا',
        overview: 'رحلة خيالية تشمل المعالم التاريخية لمدينة اسطنبول وركوب المناطيد في كابادوكيا.',
      },
      en: {
        title: 'Istanbul & Cappadocia 6 Days',
        subtitle: 'Ottoman Architecture & Cappadocia Hot Air Balloons',
        overview: 'An unforgettable tour covering Istanbul highlights and the magical landscape of Cappadocia.',
      },
      es: {
        title: 'Estambul y Capadocia 6 Días',
        subtitle: 'Arquitectura otomana y globos en Capadocia',
        overview: 'Un viaje mágico por lo mejor de Estambul y los impresionantes paisajes de Capadocia.',
      },
      pt: {
        title: 'Istambul e Capadócia 6 Dias',
        subtitle: 'Arquitetura otomana e balões na Capadócia',
        overview: 'Uma viagem inesquecível pelos destaques de Istambul e as paisagens mágicas da Capadócia.',
      },
      it: {
        title: 'Istanbul e Cappadocia 6 Giorni',
        subtitle: 'Architettura ottomana e mongolfiere in Cappadocia',
        overview: 'Un tour indimenticabile tra le meraviglie di Istanbul e i paesaggi incantati della Cappadocia.',
      },
    },
  },
  {
    id: 'jo-001',
    slug: 'jordan-petra-5d',
    title: 'الأردن والبتراء الوردية 5 أيام',
    subtitle: 'استكشف البتراء، وادي رم، والبحر الميت',
    destination: 'jordan',
    market: 'Global',
    language: 'ar',
    type: 'Classic',
    duration: '5 Days / 4 Nights',
    departures: 'Daily',
    price: 950,
    hotelCategory: '5-Star Luxury',
    rating: 4.9,
    reviewCount: 42,
    popular: true,
    views: 1120,
    inquiries: 74,
    familyFriendly: true,
    honeymoon: true,
    luxury: true,
    cultural: true,
    adventure: true,
    overview: 'جولة ساحرة في الأردن تشمل زيارة البتراء الوردية، سفاري وادي رم والتخييم، والاستجمام بالبحر الميت.',
    highlights: [
      'جولة شاملة للمدينة الوردية بالبتراء',
      'سفاري سيارات الدفع الرباعي وعشاء بدوي بوادي رم',
      'تجربة الطفو المذهلة على مياه البحر الميت',
    ],
    included: [
      'الإقامة 4 ليالي بالفنادق 5 نجوم شاملة الإفطار والعشاء',
      'جميع التنقلات وسيارة الدفع الرباعي بوادي رم',
    ],
    excluded: [
      'تذاكر الطيران الدولي',
      'النفقات الشخصية والإكراميات',
    ],
    images: [
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800',
    ],
    hotels: 'فندق موفينبيك البتراء / فندق كيمبنسكي البحر الميت',
    accommodation: [
      { destination: 'Amman', nights: 1, regime: 'Bed & Breakfast' },
      { destination: 'Petra', nights: 2, regime: 'Half Board' },
      { destination: 'Dead Sea', nights: 1, regime: 'Half Board' },
    ],
    itinerary: [
      { day: 1, title: 'الوصول لعمان', description: 'الاستقبال بمطار الملكة علياء والتوصيل للفندق.', meals: 'العشاء' },
      { day: 2, title: 'عمان والبتراء', description: 'جولة وسط البلد ثم التوجه لمدينة البتراء.', meals: 'الإفطار والعشاء' },
      { day: 3, title: 'زيارة البتراء الكاملة', description: 'جولة داخل السيق والخزنة والدير.', meals: 'الإفطار والعشاء' },
      { day: 4, title: 'وادي رم والبحر الميت', description: 'سفاري وادي رم والتخييم ثم التوجه للبحر الميت.', meals: 'الإفطار والعشاء' },
      { day: 5, title: 'المغادرة', description: 'الاستجمام بالبحر الميت والتوصيل للمطار.', meals: 'الإفطار' },
    ],
    translations: {
      ar: {
        title: 'الأردن والبتراء الوردية 5 أيام',
        subtitle: 'استكشف البتراء، وادي رم، والبحر الميت',
        overview: 'جولة ساحرة في الأردن تشمل زيارة البتراء الوردية، سفاري وادي رم والتخييم، والاستجمام بالبحر الميت.',
      },
      en: {
        title: 'Rose City Petra & Jordan 5 Days',
        subtitle: 'Explore Petra, Wadi Rum & The Dead Sea',
        overview: 'A magnificent Jordan tour covering the Rose City of Petra, Wadi Rum 4x4 safari, and Dead Sea wellness.',
      },
      es: {
        title: 'Jordania y Ciudad Rosa Petra 5 Días',
        subtitle: 'Explora Petra, Wadi Rum y el Mar Muerto',
        overview: 'Un fascinante recorrido por Jordania descubriendo Petra, safari en Wadi Rum y relax en el Mar Muerto.',
      },
      pt: {
        title: 'Jordânia e Cidade Rosa Petra 5 Dias',
        subtitle: 'Explore Petra, Wadi Rum e o Mar Morto',
        overview: 'Um passeio fascinante pela Jordânia descobrindo Petra, safari em Wadi Rum e relaxamento no Mar Morto.',
      },
      it: {
        title: 'Giordania e la Città Rosa Petra 5 Giorni',
        subtitle: 'Esplora Petra, Wadi Rum e il Mar Morto',
        overview: 'Un affascinante tour della Giordania alla scoperta di Petra, safari a Wadi Rum e relax sul Mar Morto.',
      },
    },
  },
  {
    id: 'ma-001',
    slug: 'morocco-marrakech-6d',
    title: 'سحر المغرب ومراكش 6 أيام',
    subtitle: 'ألوان مراكش، الدار البيضاء، والصحراء العتيقة',
    destination: 'morocco',
    market: 'Global',
    language: 'ar',
    type: 'Classic',
    duration: '6 Days / 5 Nights',
    departures: 'Daily',
    price: 1100,
    hotelCategory: '5-Star Riad Luxury',
    rating: 4.9,
    reviewCount: 51,
    popular: true,
    views: 1450,
    inquiries: 98,
    familyFriendly: true,
    honeymoon: true,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: 'رحلة أسطورية للمغرب تشمل زيارة جامع الحسن الثاني بالدار البيضاء، ساحة جامع الفناء بمراكش، وإقامة بالرياض المغربي الفاخر.',
    highlights: [
      'زيارة مسجد الحسن الثاني بالدار البيضاء',
      'جولة ساحة جامع الفناء والمجموعات العتيقة بمراكش',
      'إقامة فاخرة في رياض مغربي عريق شاملة الإفطار',
    ],
    included: [
      'الإقامة 2 ليلة بالدار البيضاء و 3 ليالي بمراكش في رياض فاخر',
      'جميع الجولات السياحية والانتقالات الخاصة',
    ],
    excluded: [
      'تذاكر الطيران الدولي',
      'الوجبات والمشروبات غير المذكورة',
    ],
    images: [
      'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=800',
    ],
    hotels: 'رياض النواير مراكش / فندق فورسيزونز الدار البيضاء',
    accommodation: [
      { destination: 'Casablanca', nights: 2, regime: 'Bed & Breakfast' },
      { destination: 'Marrakech', nights: 3, regime: 'Bed & Breakfast' },
    ],
    itinerary: [
      { day: 1, title: 'الوصول للدار البيضاء', description: 'الاستقبال بمطار محمد الخامس والتوصيل للفندق.', meals: 'العشاء' },
      { day: 2, title: 'مسجد الحسن الثاني ومراكش', description: 'زيارة المعالم الشهيرة ثم التوجه إلى مراكش الحمراء.', meals: 'الإفطار' },
      { day: 3, title: 'حدائق ماجوريل وجامع الفناء', description: 'جولة بالحدائق الشهيرة والأسواق العتيقة.', meals: 'الإفطار' },
      { day: 4, title: 'جبال الأطلس وأوريكا', description: 'رحلة يوم كامل لجبال الأطلس والقرى البربرية.', meals: 'الإفطار' },
      { day: 5, title: 'يوم حر بمراكش', description: 'وقت حر للتسوق والحمام المغربي الفاخر.', meals: 'الإفطار' },
      { day: 6, title: 'المغادرة', description: 'التوجه للمطار للعودة للوطن.', meals: 'الإفطار' },
    ],
    translations: {
      ar: {
        title: 'سحر المغرب ومراكش 6 أيام',
        subtitle: 'ألوان مراكش، الدار البيضاء، والصحراء العتيقة',
        overview: 'رحلة أسطورية للمغرب تشمل زيارة جامع الحسن الثاني بالدار البيضاء، ساحة جامع الفناء بمراكش، وإقامة بالرياض المغربي الفاخر.',
      },
      en: {
        title: 'Magical Morocco & Marrakech 6 Days',
        subtitle: 'Colors of Marrakech, Casablanca & Atlas Mountains',
        overview: 'An imperial Moroccan tour featuring Hassan II Mosque in Casablanca, Jemaa el-Fnaa in Marrakech, and luxury Riad stay.',
      },
      es: {
        title: 'Magia de Marruecos y Marrakech 6 Días',
        subtitle: 'Colores de Marrakech, Casablanca y Montañas del Atlas',
        overview: 'Un viaje imperial por Marruecos visitando la Mezquita Hassan II, Jemaa el-Fnaa y alojándose en un Riad de lujo.',
      },
      pt: {
        title: 'Magia de Marrocos e Marrakech 6 Dias',
        subtitle: 'Cores de Marrakech, Casablanca e Montanhas do Atlas',
        overview: 'Uma viagem imperial por Marrocos visitando a Mesquita Hassan II, Jemaa el-Fnaa e hospedando-se em um Riad de luxo.',
      },
      it: {
        title: 'Magia del Marocco e Marrakech 6 Giorni',
        subtitle: 'Colori di Marrakech, Casablanca e Montagne dell-Atlante',
        overview: 'Un tour imperiale del Marocco con visita alla Moschea Hassan II, Jemaa el-Fnaa e soggiorno in Riad di lusso.',
      },
    },
  },
  {
    id: 'gr-001',
    slug: 'greece-athens-santorini-7d',
    title: 'أثينا وسانتوريني الساحرة 7 أيام',
    subtitle: 'تاريخ الأكروبوليس وغروب الشمس في سانتوريني',
    destination: 'greece',
    market: 'Global',
    language: 'ar',
    type: 'Classic',
    duration: '7 Days / 6 Nights',
    departures: 'Daily',
    price: 1390,
    hotelCategory: '5-Star Island Luxury',
    rating: 5.0,
    reviewCount: 68,
    popular: true,
    views: 1890,
    inquiries: 115,
    familyFriendly: true,
    honeymoon: true,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: 'رحلة الأحلام بين الآثار الإغريقية القديمة في أثينا والبيوت البيضاء والمناظر الساحرة في جزيرة سانتوريني.',
    highlights: [
      'جولة معبد الأكروبوليس ومتحف الآثار بأثينا',
      'تذاكر الفيري السريع بين أثينا وسانتوريني',
      'مشاهدة أروع غروب شمس في العالم من قرية أويا بانتوريني',
    ],
    included: [
      'الإقامة 3 ليالي بأثينا و 3 ليالي بسانتوريني شاملة الإفطار',
      'تذاكر العبّارة البحرية الفاخرة بين الجزر',
    ],
    excluded: [
      'الطيران الدولي',
      'ضريبة الإقامة الفندقية الشخصية',
    ],
    images: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800',
    ],
    hotels: 'فندق جران بريتاني أثينا / فندق أندرونيس سانتوريني',
    accommodation: [
      { destination: 'Athens', nights: 3, regime: 'Bed & Breakfast' },
      { destination: 'Santorini', nights: 3, regime: 'Bed & Breakfast' },
    ],
    itinerary: [
      { day: 1, title: 'الوصول لأثينا', description: 'الاستقبال بمطار أثينا الدولي والتوصيل للفندق.', meals: 'العشاء' },
      { day: 2, title: 'جولة الأكروبوليس', description: 'زيارة معبد البارثينون والمتحف التاريخي.', meals: 'الإفطار' },
      { day: 3, title: 'الإبحار إلى سانتوريني', description: 'ركوب العبارة إلى جزيرة سانتوريني والتسكين بالفندق.', meals: 'الإفطار' },
      { day: 4, title: 'قرية أويا وغروب الشمس', description: 'جولة بين المنازل البيضاء ومشاهدة الغروب الأسطوري.', meals: 'الإفطار' },
      { day: 5, title: 'الشواطئ الحمراء والبركان', description: 'جولة بحرية اختيارية بالقارب للبركان والشاطئ الأحمر.', meals: 'الإفطار' },
      { day: 6, title: 'العودة لأثينا', description: 'العودة بالعبارة إلى أثينا وجولة تسوق.', meals: 'الإفطار' },
      { day: 7, title: 'المغادرة', description: 'التوجه للمطار للعودة للوطن.', meals: 'الإفطار' },
    ],
    translations: {
      ar: {
        title: 'أثينا وسانتوريني الساحرة 7 أيام',
        subtitle: 'تاريخ الأكروبوليس وغروب الشمس في سانتوريني',
        overview: 'رحلة الأحلام بين الآثار الإغريقية القديمة في أثينا والبيوت البيضاء والمناظر الساحرة في جزيرة سانتوريني.',
      },
      en: {
        title: 'Athens & Magical Santorini 7 Days',
        subtitle: 'Acropolis Heritage & Iconic Santorini Sunsets',
        overview: 'A dream Greek escape blending ancient Parthenon history in Athens with blue-domed white villas in Santorini.',
      },
      es: {
        title: 'Atenas y la Mágica Santorini 7 Días',
        subtitle: 'Historia de la Acrópolis y atardeceres en Santorini',
        overview: 'Un viaje de ensueño por Grecia combinando el Partenón en Atenas con las casas blancas de Santorini.',
      },
      pt: {
        title: 'Atenas e a Mágica Santorini 7 Dias',
        subtitle: 'História da Acrópole e pôr do sol em Santorini',
        overview: 'Uma viagem dos sonhos pela Grécia combinando o Partenon em Atenas com as casas brancas de Santorini.',
      },
      it: {
        title: 'Atene e la Magica Santorini 7 Giorni',
        subtitle: 'Storia dell-Acropoli e tramonti a Santorini',
        overview: 'Un tour da sogno in Grecia che unisce il Partenone ad Atene con le ville bianche di Santorini.',
      },
    },
  },
  {
    id: 'ae-001',
    slug: 'dubai-luxury-safari-5d',
    title: 'دبي الفاخرة وسفاري الصحراء 5 أيام',
    subtitle: 'برج خليفة، دبي مول، وسفاري الصحراء VIP',
    destination: 'dubai',
    market: 'Global',
    language: 'ar',
    type: 'Classic',
    duration: '5 Days / 4 Nights',
    departures: 'Daily',
    price: 850,
    hotelCategory: '5-Star Luxury',
    rating: 4.9,
    reviewCount: 77,
    popular: true,
    views: 1620,
    inquiries: 104,
    familyFriendly: true,
    honeymoon: true,
    luxury: true,
    cultural: false,
    adventure: true,
    overview: 'تجربة الفخامة المطلقة في دبي تشمل صعود قمة برج خليفة، جولة دبي مول والنافورات، وسفاري صحراوي VIP مع العشاء البدوي.',
    highlights: [
      'تذاكر صعود قمة برج خليفة (الطابق 124/125)',
      'سفاري الصحراء بسيارات لاندكروزر مع عشاء مشوي وعروض حية',
      'جولة مارينا دبي ونخلة جميرا باليخت الخاص',
    ],
    included: [
      'الإقامة 4 ليالي بفندق 5 نجوم بدبي مع الإفطار',
      'جميع الانتقالات بسيارات حديثة مكيفة',
    ],
    excluded: [
      'تذاكر الطيران الدولي',
      'ضريبة درهم السياحة بالفندق',
    ],
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800',
    ],
    hotels: 'فندق أتلانتس النخلة دبي / فندق أدرس دبي مول',
    accommodation: [
      { destination: 'Dubai', nights: 4, regime: 'Bed & Breakfast' },
    ],
    itinerary: [
      { day: 1, title: 'الوصول لدبي', description: 'الاستقبال بمطار دبي الدولي والتوصيل للفندق.', meals: 'العشاء' },
      { day: 2, title: 'برج خليفة ودبي مول', description: 'صعود برج خليفة ومشاهدة عروض النافورة الراقصة.', meals: 'الإفطار' },
      { day: 3, title: 'سفاري الصحراء VIP', description: 'رحلة الكثبان الرملية والعشاء البدوي الفاخر.', meals: 'الإفطار والعشاء' },
      { day: 4, title: 'نخلة جميرا ومارينا دبي', description: 'جولة باليخت ومشاهدة برج العرب وعين دبي.', meals: 'الإفطار' },
      { day: 5, title: 'المغادرة', description: 'التوجه للمطار للعودة للوطن.', meals: 'الإفطار' },
    ],
    translations: {
      ar: {
        title: 'دبي الفاخرة وسفاري الصحراء 5 أيام',
        subtitle: 'برج خليفة، دبي مول، وسفاري الصحراء VIP',
        overview: 'تجربة الفخامة المطلقة في دبي تشمل صعود قمة برج خليفة، جولة دبي مول والنافورات، وسفاري صحراوي VIP مع العشاء البدوي.',
      },
      en: {
        title: 'Luxury Dubai & Desert Safari 5 Days',
        subtitle: 'Burj Khalifa, Dubai Mall & VIP Desert Safari',
        overview: 'Ultimate Dubai luxury experience featuring Burj Khalifa At the Top, Dubai Fountain shows, and VIP desert dune bashing.',
      },
      es: {
        title: 'Dubái de Lujo y Safari en el Desierto 5 Días',
        subtitle: 'Burj Khalifa, Dubai Mall y Safari VIP',
        overview: 'Experiencia de lujo en Dubái con ascenso al Burj Khalifa, espectáculo de fuentes y safari en las dunas con cena VIP.',
      },
      pt: {
        title: 'Dubai de Luxo e Safari no Deserto 5 Dias',
        subtitle: 'Burj Khalifa, Dubai Mall e Safari VIP',
        overview: 'Experiência de luxo em Dubai com subida ao Burj Khalifa, show das fontes e safari no deserto com jantar VIP.',
      },
      it: {
        title: 'Dubai di Lusso e Safari nel Deserto 5 Giorni',
        subtitle: 'Burj Khalifa, Dubai Mall e Safari VIP',
        overview: 'Esperienza di lusso a Dubai con salita al Burj Khalifa, spettacoli della fontana e safari nel deserto VIP.',
      },
    },
  },
  {
    id: 'tn-001',
    slug: 'tunisia-sidi-bou-said-5d',
    title: 'تونس وسيدي بوسعيد والقرطاجيين 5 أيام',
    subtitle: 'البيوت الزرقاء، قرطاج التاريخية، والشواطئ الساحرة',
    destination: 'tunisia',
    market: 'Global',
    language: 'ar',
    type: 'Classic',
    duration: '5 Days / 4 Nights',
    departures: 'Daily',
    price: 780,
    hotelCategory: '5-Star Resort',
    rating: 4.8,
    reviewCount: 29,
    popular: false,
    views: 890,
    inquiries: 48,
    familyFriendly: true,
    honeymoon: true,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: 'استكشاف سحر تونس الخضراء بين الزرقة والبيضاء في سيدي بوسعيد والآثار القرطاجية العريقة.',
    highlights: [
      'جولة بلدة سيدي بوسعيد السياحية الأسطورية',
      'زيارة الآثار القرطاجية ومتحف باردو العريق',
      'جولة بالأسواق العتيقة بالمدينة القديمة بتونس',
    ],
    included: [
      'الإقامة 4 ليالي بتونس العاصمة وفنادق الحمامات 5 نجوم',
      'جميع الانتقالات والمزارات السياحية المذكورة',
    ],
    excluded: [
      'تذاكر الطيران الدولي',
      'النفقات الشخصية',
    ],
    images: [
      'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=800',
    ],
    hotels: 'فندق دار سعيد سيدي بوسعيد / فندق الموفنبيك قمرت',
    accommodation: [
      { destination: 'Tunis', nights: 2, regime: 'Bed & Breakfast' },
      { destination: 'Hammamet', nights: 2, regime: 'Bed & Breakfast' },
    ],
    itinerary: [
      { day: 1, title: 'الوصول لتونس', description: 'الاستقبال بمطار تونس قرطاج الدولي والتوصيل للفندق.', meals: 'العشاء' },
      { day: 2, title: 'سيدي بوسعيد وقرطاج', description: 'زيارة بلدة سيدي بوسعيد الجميلة والآثار الرومانية.', meals: 'الإفطار' },
      { day: 3, title: 'متحف باردو والمدينة العتيقة', description: 'زيارة أشهر متحف موزاييك بالشرق الأوسط والأسواق.', meals: 'الإفطار' },
      { day: 4, title: 'منتجعات الحمامات', description: 'التوجه لمدينة الحمامات الساحلية والاستجمام.', meals: 'الإفطار' },
      { day: 5, title: 'المغادرة', description: 'التوجه للمطار للعودة للوطن.', meals: 'الإفطار' },
    ],
    translations: {
      ar: {
        title: 'تونس وسيدي بوسعيد والقرطاجيين 5 أيام',
        subtitle: 'البيوت الزرقاء، قرطاج التاريخية، والشواطئ الساحرة',
        overview: 'استكشاف سحر تونس الخضراء بين الزرقة والبيضاء في سيدي بوسعيد والآثار القرطاجية العريقة.',
      },
      en: {
        title: 'Tunisia & Sidi Bou Said 5 Days',
        subtitle: 'Blue Architecture, Ancient Carthage & Mediterranean Beach',
        overview: 'Discover green Tunisia from white-and-blue Sidi Bou Said to ancient Carthaginian ruins.',
      },
      es: {
        title: 'Túnez y Sidi Bou Said 5 Días',
        subtitle: 'Arquitectura blanca y azul, Cartago y el Mediterráneo',
        overview: 'Descubre el encanto de Túnez pasando por Sidi Bou Said y las ruinas romanas de Cartago.',
      },
      pt: {
        title: 'Tunísia e Sidi Bou Said 5 Dias',
        subtitle: 'Arquitetura azul e branca, Cartago e o Mediterrâneo',
        overview: 'Descubra o encanto da Tunísia passando por Sidi Bou Said e as ruínas romanas de Cartago.',
      },
      it: {
        title: 'Tunisia e Sidi Bou Said 5 Giorni',
        subtitle: 'Architettura blu e bianca, Cartagine e il Mediterraneo',
        overview: 'Scopri la magica Tunisia tra Sidi Bou Said e le antiche rovine di Cartagine.',
      },
    },
  },
  {
    id: 'hl-001',
    slug: 'holyland-spiritual-journey-6d',
    title: 'معالم الأرض المقدسة 6 أيام',
    subtitle: 'جولة المعالم الروحية والتاريخية العريقة',
    destination: 'holyland',
    market: 'Global',
    language: 'ar',
    type: 'Classic',
    duration: '6 Days / 5 Nights',
    departures: 'Weekly',
    price: 1280,
    hotelCategory: '5-Star Spiritual Luxury',
    rating: 5.0,
    reviewCount: 39,
    popular: true,
    views: 1320,
    inquiries: 88,
    familyFriendly: true,
    honeymoon: false,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: 'رحلة روحية وثقافية استثنائية لزيارة أبرز المعالم الكنسية والتاريخية والمقدسات العريقة.',
    highlights: [
      'جولة المعالم الروحية العريقة بالمدينة القديمة',
      'زيارة كنيسة القيامة، جبل الزيتون، وباب الخليل',
      'إقامة فاخرة بجوار المعالم التاريخية',
    ],
    included: [
      'الإقامة 5 ليالي بفنادق 5 نجوم شاملة الإفطار والعشاء',
      'مرشد تاريخي وروحاني مرخص وخاص',
    ],
    excluded: [
      'تذاكر الطيران الدولي',
      'النفقات الشخصية والإكراميات',
    ],
    images: [
      'https://images.unsplash.com/photo-1544971587-b842c27f8c14?q=80&w=800',
    ],
    hotels: 'فندق الملك داوود / فندق نوتردام',
    accommodation: [
      { destination: 'Old City', nights: 5, regime: 'Half Board' },
    ],
    itinerary: [
      { day: 1, title: 'الوصول والاستقبال', description: 'الاستقبال والتنسيق للتسكين بالفندق.', meals: 'العشاء' },
      { day: 2, title: 'جولة جبل الزيتون', description: 'مشاهدة الإطلالة البانورامية للمدينة المقدسة.', meals: 'الإفطار والعشاء' },
      { day: 3, title: 'المدينة القديمة والقيامة', description: 'زيارة طريق الآلام وكنيسة القيامة.', meals: 'الإفطار والعشاء' },
      { day: 4, title: 'بيت لحم وكنيسة المهد', description: 'جولة بمدينة بيت لحم التاريخية.', meals: 'الإفطار والعشاء' },
      { day: 5, title: 'الناصرة وبحيرة طبريا', description: 'زيارة منطقة الجليل والناصرة.', meals: 'الإفطار والعشاء' },
      { day: 6, title: 'المغادرة', description: 'الإفطار بالفندق والتوصيل للمطار.', meals: 'الإفطار' },
    ],
    translations: {
      ar: {
        title: 'معالم الأرض المقدسة 6 أيام',
        subtitle: 'جولة المعالم الروحية والتاريخية العريقة',
        overview: 'رحلة روحية وثقافية استثنائية لزيارة أبرز المعالم الكنسية والتاريخية والمقدسات العريقة.',
      },
      en: {
        title: 'Holy Land Spiritual Journey 6 Days',
        subtitle: 'Historic Heritage & Sacred Monuments',
        overview: 'An extraordinary spiritual and cultural pilgrimage visiting historic sacred monuments and ancient heritage.',
      },
      es: {
        title: 'Viaje Espiritual a Tierra Santa 6 Días',
        subtitle: 'Patrimonio Histórico y Monumentos Sagrados',
        overview: 'Una peregrinación espiritual y cultural extraordinaria visitando monumentos sagrados e historia milenaria.',
      },
      pt: {
        title: 'Jornada Espiritual na Terra Santa 6 Dias',
        subtitle: 'Patrimônio Histórico e Monumentos Sagrados',
        overview: 'Uma peregrinação espiritual e cultural extraordinária visitando monumentos sagrados e história milenar.',
      },
      it: {
        title: 'Viaggio Spirituale in Terra Santa 6 Giorni',
        subtitle: 'Patrimonio Storico e Monumenti Sacri',
        overview: 'Un pellegrinaggio spirituale e culturale straordinario alla scoperta dei monumenti sacri e storici.',
      },
    },
  },
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

const LOCAL_STORAGE_TRIPS_KEY = 'dunas_admin_trips_v1';
const LOCAL_STORAGE_HOTELS_KEY = 'dunas_admin_hotels_v1';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<TripModel[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_TRIPS_KEY);
      if (saved && saved !== 'undefined' && saved.trim() !== '') {
        try {
          return JSON.parse(saved);
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
