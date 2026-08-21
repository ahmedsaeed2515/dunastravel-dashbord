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
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved trips', e);
        }
      }
    }
    return INITIAL_TRIPS;
  });

  const [hotels, setHotels] = useState<HotelModel[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_HOTELS_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved hotels', e);
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
