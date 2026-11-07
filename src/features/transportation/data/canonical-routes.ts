export interface CanonicalRoute {
  displayOrder: number;
  route: {
    es: string;
    en: string;
    ar: string;
    pt: string;
    it: string;
  };
  priceBase0204: number;
  priceBase0507: number;
  priceBase0814: number;
  currency: string;
}

export const CANONICAL_ROUTES: CanonicalRoute[] = [
  {
    displayOrder: 1,
    route: {
      es: 'Aeropuerto Internacional de El Cairo ↔ Hotel en Guiza o El Cairo',
      en: 'Cairo International Airport ↔ Hotel in Giza or Cairo',
      ar: 'مطار القاهرة الدولي ↔ فندق في الجيزة أو القاهرة',
      pt: 'Aeroporto Internacional do Cairo ↔ Hotel em Gizé ou Cairo',
      it: 'Aeroporto Internazionale del Cairo ↔ Hotel a Giza o Il Cairo',
    },
    priceBase0204: 65,
    priceBase0507: 55,
    priceBase0814: 40,
    currency: 'USD',
  },
  {
    displayOrder: 2,
    route: {
      es: 'Aeropuerto Internacional de Hurgada ↔ Hotel en Hurgada',
      en: 'Hurghada International Airport ↔ Hotel in Hurghada',
      ar: 'مطار الغردقة الدولي ↔ فندق في الغردقة',
      pt: 'Aeroporto Internacional de Hurghada ↔ Hotel em Hurghada',
      it: 'Aeroporto Internazionale di Hurghada ↔ Hotel a Hurghada',
    },
    priceBase0204: 65,
    priceBase0507: 55,
    priceBase0814: 40,
    currency: 'USD',
  },
  {
    displayOrder: 3,
    route: {
      es: 'Aeropuerto Internacional de Sharm El Sheikh ↔ Hotel en Sharm El Sheikh',
      en: 'Sharm El Sheikh International Airport ↔ Hotel in Sharm El Sheikh',
      ar: 'مطار شرم الشيخ الدولي ↔ فندق في شرم الشيخ',
      pt: 'Aeroporto Internacional de Sharm El Sheikh ↔ Hotel em Sharm El Sheikh',
      it: 'Aeroporto Internazionale di Sharm El Sheikh ↔ Hotel a Sharm El Sheikh',
    },
    priceBase0204: 65,
    priceBase0507: 45,
    priceBase0814: 40,
    currency: 'USD',
  },
  {
    displayOrder: 4,
    route: {
      es: 'Aeropuerto de Alejandría ↔ Hotel en Alejandría',
      en: 'Alexandria Airport ↔ Hotel in Alexandria',
      ar: 'مطار الإسكندرية ↔ فندق في الإسكندرية',
      pt: 'Aeroporto de Alexandria ↔ Hotel em Alexandria',
      it: 'Aeroporto di Alessandria ↔ Hotel ad Alessandria',
    },
    priceBase0204: 55,
    priceBase0507: 45,
    priceBase0814: 35,
    currency: 'USD',
  },
  {
    displayOrder: 5,
    route: {
      es: 'El Cairo ↔ Alejandría',
      en: 'Cairo ↔ Alexandria',
      ar: 'القاهرة ↔ الإسكندرية',
      pt: 'Cairo ↔ Alexandria',
      it: 'Il Cairo ↔ Alessandria',
    },
    priceBase0204: 75,
    priceBase0507: 65,
    priceBase0814: 45,
    currency: 'USD',
  },
  {
    displayOrder: 6,
    route: {
      es: 'El Cairo ↔ El Ain El Sokhna',
      en: 'Cairo ↔ Ain Sokhna',
      ar: 'القاهرة ↔ العين السخنة',
      pt: 'Cairo ↔ Ain Sokhna',
      it: 'Il Cairo ↔ Ain Sokhna',
    },
    priceBase0204: 75,
    priceBase0507: 65,
    priceBase0814: 45,
    currency: 'USD',
  },
  {
    displayOrder: 7,
    route: {
      es: 'El Cairo ↔ Hurgada',
      en: 'Cairo ↔ Hurghada',
      ar: 'القاهرة ↔ الغردقة',
      pt: 'Cairo ↔ Hurghada',
      it: 'Il Cairo ↔ Hurghada',
    },
    priceBase0204: 110,
    priceBase0507: 100,
    priceBase0814: 85,
    currency: 'USD',
  },
  {
    displayOrder: 8,
    route: {
      es: 'El Cairo ↔ Sharm El Sheikh',
      en: 'Cairo ↔ Sharm El Sheikh',
      ar: 'القاهرة ↔ شرم الشيخ',
      pt: 'Cairo ↔ Sharm El Sheikh',
      it: 'Il Cairo ↔ Sharm El Sheikh',
    },
    priceBase0204: 115,
    priceBase0507: 115,
    priceBase0814: 80,
    currency: 'USD',
  },
  {
    displayOrder: 9,
    route: {
      es: 'El Cairo ↔ Santa Catalina',
      en: 'Cairo ↔ Saint Catherine',
      ar: 'القاهرة ↔ سانت كاترين',
      pt: 'Cairo ↔ Santa Catarina',
      it: 'Il Cairo ↔ Santa Caterina',
    },
    priceBase0204: 115,
    priceBase0507: 115,
    priceBase0814: 80,
    currency: 'USD',
  },
];
