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
    id: 'egypt-religious',
    titleAr: 'البرامج الدينية (Religious Programs)',
    titleEn: 'Religious Programs',
    type: 'Religious',
    icon: '⛪',
    description: 'رحلات روحية استكشافية للأديرة والمقاديس القبطية والتاريخية',
    badge: 'برنامج روحي',
  },
  {
    id: 'egypt-multi-country',
    titleAr: 'جولات متعددة الدول (Multi-Country Tours)',
    titleEn: 'Multi-Country Tours',
    type: 'Multi-Country',
    icon: '🌍',
    description: 'رحلات مشتركة تجمع بين مصر والأردن وتركيا ودبي',
    badge: 'جولة شاملة',
  },
  {
    id: 'egypt-extensions',
    titleAr: 'توسعات وتمديدات مصر (Egypt Extensions)',
    titleEn: 'Egypt Extensions',
    type: 'Extension',
    icon: '🏖️',
    description: 'رحلات تمديد الإقامة في الغردقة وشرم الشيخ وواحة سيوة',
    badge: 'تغطية إضافية',
  },
];

// Verified Egypt Tours Catalog (Empty by default - loaded dynamically from Backend)
const INITIAL_TRIPS: TripModel[] = [];

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

const LOCAL_STORAGE_TRIPS_KEY = 'dunas_admin_trips_v6';
const LOCAL_STORAGE_HOTELS_KEY = 'dunas_admin_hotels_v1';

const LEGACY_EGYPT_SLUGS = new Set([
  'cairo-express-4d',
  'cairo-express-alexandria-5d',
  'egito-classico-8d',
  'egito-classico-ii-9d',
  'egito-historico-10d',
  'grande-ramses-10d',
  'tesouros-egipto-9d',
  'cairo-cruzeiro-sharm-11d',
]);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<TripModel[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('dunas_admin_trips_v6');
        localStorage.removeItem('dunas_admin_trips_v6');
        localStorage.removeItem('dunas_admin_trips_v6');
        localStorage.removeItem('dunas_admin_trips_v6');
      } catch {}
      const saved = localStorage.getItem(LOCAL_STORAGE_TRIPS_KEY);
      if (saved && saved !== 'undefined' && saved.trim() !== '') {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter((t: TripModel) => !LEGACY_EGYPT_SLUGS.has((t.slug || '').toLowerCase()));
          }
        } catch (e) {
          console.error('Failed to parse saved trips', e);
          return [];
        }
      }
    }
    return [];
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
