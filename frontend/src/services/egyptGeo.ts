// Hatly Egypt - Alexandria Primary Launch Region & Geo Service
// Optimized for Alexandria, El King, King Mariout, and Borg El Arab
// Architected for scalable nationwide expansion

export interface EgyptLocation {
  id: string;
  nameAr: string;
  nameEn: string;
  governorateAr: string;
  governorateEn: string;
  zone?: 'ALEXANDRIA' | 'EL_KING' | 'BORG_EL_ARAB' | 'OTHER';
  lat: number;
  lng: number;
  isPopular?: boolean;
}

export interface EgyptGovernorate {
  id: string;
  nameAr: string;
  nameEn: string;
  lat: number;
  lng: number;
  status: 'ACTIVE' | 'COMING_SOON';
}

export const EGYPT_GOVERNORATES: EgyptGovernorate[] = [
  { id: 'alexandria', nameAr: 'الإسكندرية (نشطة بالكامل)', nameEn: 'Alexandria (Active Hub)', lat: 31.2001, lng: 29.9187, status: 'ACTIVE' },
  { id: 'cairo', nameAr: 'القاهرة (قريباً)', nameEn: 'Cairo (Coming Soon)', lat: 30.0444, lng: 31.2357, status: 'COMING_SOON' },
  { id: 'giza', nameAr: 'الجيزة (قريباً)', nameEn: 'Giza (Coming Soon)', lat: 30.0131, lng: 31.2089, status: 'COMING_SOON' },
  { id: 'dakahlia', nameAr: 'الدقهلية - المنصورة (قريباً)', nameEn: 'Dakahlia - Mansoura (Coming Soon)', lat: 31.0409, lng: 31.3785, status: 'COMING_SOON' },
  { id: 'gharbia', nameAr: 'الغربية - طنطا (قريباً)', nameEn: 'Gharbia - Tanta (Coming Soon)', lat: 30.7865, lng: 31.0004, status: 'COMING_SOON' },
  { id: 'beheira', nameAr: 'البحيرة - دمنهور (قريباً)', nameEn: 'Beheira - Damanhur (Coming Soon)', lat: 31.0364, lng: 30.4699, status: 'COMING_SOON' },
  { id: 'sharqia', nameAr: 'الشرقية - الزقازيق (قريباً)', nameEn: 'Sharqia - Zagazig (Coming Soon)', lat: 30.5877, lng: 31.5020, status: 'COMING_SOON' },
  { id: 'assiut', nameAr: 'أسيوط (قريباً)', nameEn: 'Assiut (Coming Soon)', lat: 27.1809, lng: 31.1837, status: 'COMING_SOON' },
];

export interface ServiceZone {
  id: string;
  nameAr: string;
  nameEn: string;
  status: 'ACTIVE' | 'COMING_SOON';
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  zoom: number;
  baseDeliveryFee: number;
  descriptionAr: string;
  descriptionEn: string;
}

// Operational Launch Service Zones (Alexandria Hub)
export const HATLY_SERVICE_ZONES: ServiceZone[] = [
  {
    id: 'alexandria_central',
    nameAr: 'الإسكندرية الكبرى (وسط وشرق وسموحة والعجمي)',
    nameEn: 'Greater Alexandria (Central, East, Smouha & Agami)',
    status: 'ACTIVE',
    centerLat: 31.2001,
    centerLng: 29.9187,
    radiusKm: 25.0,
    zoom: 13,
    baseDeliveryFee: 20.0,
    descriptionAr: 'تغطية فورية لجميع أحياء ومناطق الإسكندرية من أبو قير حتى العجمي',
    descriptionEn: 'Full instant delivery from Abu Qir to Agami',
  },
  {
    id: 'el_king_mariout',
    nameAr: 'منطقة كينج مريوط والكينج',
    nameEn: 'King Mariout & El King Area',
    status: 'ACTIVE',
    centerLat: 31.0125,
    centerLng: 29.7610,
    radiusKm: 16.0,
    zoom: 13,
    baseDeliveryFee: 25.0,
    descriptionAr: 'خدمة سريعة للكمبوندات، الفلل، شارع الهيلتون كينج، وواحات الكينج',
    descriptionEn: 'Dedicated coverage for compounds, villas, Hilton King Ranch & oases',
  },
  {
    id: 'borg_el_arab',
    nameAr: 'مدينة برج العرب وبرج العرب الجديدة والمطار',
    nameEn: 'Borg El Arab & New City & Airport',
    status: 'ACTIVE',
    centerLat: 30.9167,
    centerLng: 29.6167,
    radiusKm: 22.0,
    zoom: 12,
    baseDeliveryFee: 30.0,
    descriptionAr: 'تغطية شاملة للأحياء السكنية، النوادي، المناطق الصناعية، ومطار برج العرب',
    descriptionEn: 'Complete coverage for residential districts, clubs, industrial zones & airport',
  },
  // Future Expansion Architecture (Coming Soon)
  {
    id: 'cairo_metro',
    nameAr: 'القاهرة والجيزة (قريباً في المرحلة القادمة)',
    nameEn: 'Cairo & Giza (Coming Soon in Next Phase)',
    status: 'COMING_SOON',
    centerLat: 30.0444,
    centerLng: 31.2357,
    radiusKm: 40.0,
    zoom: 11,
    baseDeliveryFee: 25.0,
    descriptionAr: 'التوسع القادم لمنصة هاتلي',
    descriptionEn: 'Upcoming expansion for Hatly platform',
  },
  {
    id: 'delta_hub',
    nameAr: 'محافظات الدلتا (المنصورة وطنطا - قريباً)',
    nameEn: 'Delta Hub (Mansoura & Tanta - Coming Soon)',
    status: 'COMING_SOON',
    centerLat: 30.7865,
    centerLng: 31.0004,
    radiusKm: 30.0,
    zoom: 11,
    baseDeliveryFee: 25.0,
    descriptionAr: 'التوسع القادم لمنصة هاتلي',
    descriptionEn: 'Upcoming expansion for Hatly platform',
  },
];

// Primary Launch Locations in Alexandria, El King & Borg El Arab
export const POPULAR_EGYPT_LOCATIONS: EgyptLocation[] = [
  // 1. Alexandria City & East & Central
  {
    id: 'smouha_victor',
    nameAr: 'سموحة، ميدان فيكتور عمانويل / جرين بلازا',
    nameEn: 'Smouha, Victor Emmanuel Sq / Green Plaza',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'ALEXANDRIA',
    lat: 31.2156,
    lng: 29.9553,
    isPopular: true,
  },
  {
    id: 'sidi_gaber_stn',
    nameAr: 'سيدي جابر، محطة القطار ومجمع الكليات',
    nameEn: 'Sidi Gaber Railway Station',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'ALEXANDRIA',
    lat: 31.2185,
    lng: 29.9405,
    isPopular: true,
  },
  {
    id: 'ibrahimeya_tayba',
    nameAr: 'الإبراهيمية، شارع طيبة ولاجيتيه',
    nameEn: 'El Ibrahimeya, Tayba & Lagiteh St',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'ALEXANDRIA',
    lat: 31.2090,
    lng: 29.9270,
    isPopular: true,
  },
  {
    id: 'stanley_bridge',
    nameAr: 'كوبري ستانلي وكورنيش رشدي',
    nameEn: 'Stanley Bridge & Roushdy Corniche',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'ALEXANDRIA',
    lat: 31.2355,
    lng: 29.9525,
    isPopular: true,
  },
  {
    id: 'gleem_bay',
    nameAr: 'جليم، جليم باي ومحطة الترام',
    nameEn: 'Gleem Bay & Tram Station',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'ALEXANDRIA',
    lat: 31.2422,
    lng: 29.9678,
    isPopular: true,
  },
  {
    id: 'kafr_abdo',
    nameAr: 'كفر عبده، حديقة اللورد ألينبي',
    nameEn: 'Kafr Abdo, Allenby Garden',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'ALEXANDRIA',
    lat: 31.2268,
    lng: 29.9535,
    isPopular: true,
  },
  {
    id: 'miami_khaled',
    nameAr: 'ميامي، شارع خالد بن الوليد والكورنيش',
    nameEn: 'Miami, Khaled Ibn Walid St',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'ALEXANDRIA',
    lat: 31.2612,
    lng: 29.9985,
    isPopular: true,
  },
  {
    id: 'sidi_bishr',
    nameAr: 'سيدي بشر بحري وقبلي، شارع جمال عبد الناصر',
    nameEn: 'Sidi Bishr, Gamal Abdel Nasser St',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'ALEXANDRIA',
    lat: 31.2530,
    lng: 29.9880,
    isPopular: true,
  },
  {
    id: 'mandara_corniche',
    nameAr: 'المندرة، محطة المندرة وبحر المنتزه',
    nameEn: 'Mandara & Montazah Beach',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'ALEXANDRIA',
    lat: 31.2740,
    lng: 30.0150,
    isPopular: true,
  },
  {
    id: 'downtown_raml',
    nameAr: 'وسط البلد، محطة الرمل والمنشية وبحري',
    nameEn: 'Downtown, Raml Station & Mansheya',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'ALEXANDRIA',
    lat: 31.1990,
    lng: 29.9015,
    isPopular: true,
  },
  {
    id: 'san_stefano',
    nameAr: 'سان ستيفانو، جراند بلازا ومول سان ستيفانو',
    nameEn: 'San Stefano Grand Plaza',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'ALEXANDRIA',
    lat: 31.2440,
    lng: 29.9690,
    isPopular: true,
  },

  // 2. West Alexandria & Agami
  {
    id: 'agami_bitash',
    nameAr: 'العجمي، البيطاش، شارع الإسكندرية مطروح',
    nameEn: 'Agami, El Bitash',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'ALEXANDRIA',
    lat: 31.1150,
    lng: 29.7820,
    isPopular: true,
  },
  {
    id: 'agami_hanoville',
    nameAr: 'العجمي، الهانوفيل والمدخل الرئيسي',
    nameEn: 'Agami, El Hanoville',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'ALEXANDRIA',
    lat: 31.0990,
    lng: 29.7540,
    isPopular: true,
  },

  // 3. El King / King Mariout Area
  {
    id: 'king_ranch_hilton',
    nameAr: 'الكينج، فندق هيلتون كينج رانش واستاد برج العرب',
    nameEn: 'El King, Hilton King Ranch & Stadium',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'EL_KING',
    lat: 31.0125,
    lng: 29.7610,
    isPopular: true,
  },
  {
    id: 'king_mariout_bahary',
    nameAr: 'كينج مريوط بحري، شارع الواحات والفلل',
    nameEn: 'King Mariout Bahary, Oases St',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'EL_KING',
    lat: 31.0250,
    lng: 29.7750,
    isPopular: true,
  },
  {
    id: 'king_mariout_qebly',
    nameAr: 'كينج مريوط قبلي، واحة خطاب وبحيرة مريوط',
    nameEn: 'King Mariout Qebly, Khattab Oasis',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'EL_KING',
    lat: 30.9980,
    lng: 29.7480,
    isPopular: true,
  },

  // 4. Borg El Arab & New Borg El Arab City
  {
    id: 'borg_el_arab_city',
    nameAr: 'مدينة برج العرب الجديدة، الحي الأول والثاني ومجمع البنوك',
    nameEn: 'New Borg El Arab City, 1st & 2nd Districts',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'BORG_EL_ARAB',
    lat: 30.9167,
    lng: 29.6167,
    isPopular: true,
  },
  {
    id: 'borg_el_arab_airport',
    nameAr: 'مطار برج العرب الدولي (HBE)',
    nameEn: 'Borg El Arab International Airport',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'BORG_EL_ARAB',
    lat: 30.9177,
    lng: 29.6964,
    isPopular: true,
  },
  {
    id: 'borg_el_arab_industrial',
    nameAr: 'برج العرب، المنطقة الصناعية والنوادي',
    nameEn: 'Borg El Arab Industrial Area',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'BORG_EL_ARAB',
    lat: 30.8950,
    lng: 29.6300,
    isPopular: true,
  },
  {
    id: 'borg_el_arab_old',
    nameAr: 'مدينة برج العرب القديمة ومحطة القطار',
    nameEn: 'Old Borg El Arab City',
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    zone: 'BORG_EL_ARAB',
    lat: 30.9320,
    lng: 29.5480,
    isPopular: false,
  },
];

// Helper: Search Alexandria and surrounding areas
export function searchEgyptLocations(query: string): EgyptLocation[] {
  if (!query || query.trim().length === 0) {
    return POPULAR_EGYPT_LOCATIONS.filter((l) => l.isPopular);
  }
  const q = query.toLowerCase().trim();
  return POPULAR_EGYPT_LOCATIONS.filter(
    (loc) =>
      loc.nameAr.toLowerCase().includes(q) ||
      loc.nameEn.toLowerCase().includes(q) ||
      loc.governorateAr.toLowerCase().includes(q) ||
      loc.governorateEn.toLowerCase().includes(q)
  );
}

// Calculate Haversine distance in Kilometers between two coordinates
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return parseFloat(d.toFixed(1));
}

// Estimate delivery time in minutes based on real Alexandria traffic factors
export function calculateEstimatedDeliveryMinutes(distanceKm: number, serviceType: string = 'FOOD'): number {
  const baseMinutes = serviceType === 'FOOD' ? 25 : 15;
  const transitMinutes = Math.round(distanceKm * 2.2); // ~2.2 minutes per km
  return Math.max(15, Math.min(baseMinutes + transitMinutes, 75));
}

// Check if a point is within operational zones
export function isLocationInOperationalZone(lat: number, lng: number): {
  isOperational: boolean;
  zone?: ServiceZone;
  messageAr: string;
  messageEn: string;
} {
  const activeZones = HATLY_SERVICE_ZONES.filter((z) => z.status === 'ACTIVE');
  for (const zone of activeZones) {
    const dist = calculateHaversineDistanceKm(lat, lng, zone.centerLat, zone.centerLng);
    if (dist <= zone.radiusKm) {
      return {
        isOperational: true,
        zone,
        messageAr: `ضمن نطاق الخدمة الفورية (${zone.nameAr})`,
        messageEn: `Within active service zone (${zone.nameEn})`,
      };
    }
  }

  return {
    isOperational: false,
    messageAr: 'نعتذر، هذه المنطقة خارج نطاق التوصيل الفعلي حالياً. نحن نعمل حالياً في الإسكندرية، كينج مريوط، وبرج العرب.',
    messageEn: 'This location is outside our current operational zone. Hatly currently operates in Alexandria, El King, and Borg El Arab.',
  };
}

// Get user current GPS coordinates via HTML5 Geolocation API
export function getCurrentBrowserLocation(): Promise<{ lat: number; lng: number; addressText: string }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        resolve({
          lat,
          lng,
          addressText: `موقعي المباشر (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });
}
