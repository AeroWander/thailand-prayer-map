import { provinceNamesTh } from '../i18n/provinces';

export type ThailandProvinceEntry = {
  /** Canonical name used in campus data when available */
  name: string;
  /** Alternate English spellings for search */
  aliases: string[];
  lat: number;
  lng: number;
};

/** All 77 Thai provinces with approximate center coordinates */
export const THAILAND_PROVINCES: ThailandProvinceEntry[] = [
  { name: 'Amnat Charoen', aliases: [], lat: 15.858, lng: 104.628 },
  { name: 'Ang Thong', aliases: [], lat: 14.589, lng: 100.455 },
  { name: 'Bangkok', aliases: ['Bangkok Metropolis', 'Krung Thep'], lat: 13.756, lng: 100.502 },
  { name: 'Bueng Kan', aliases: [], lat: 18.360, lng: 103.651 },
  { name: 'Buriram', aliases: ['Buri Ram', 'Buriram'], lat: 14.993, lng: 103.103 },
  { name: 'Chachoengsao', aliases: [], lat: 13.690, lng: 101.077 },
  { name: 'Chainat', aliases: ['Chai Nat'], lat: 15.185, lng: 100.125 },
  { name: 'Chaiyaphum', aliases: [], lat: 15.806, lng: 102.031 },
  { name: 'Chanthaburi', aliases: [], lat: 12.611, lng: 102.103 },
  { name: 'Chiang Mai', aliases: [], lat: 18.788, lng: 98.985 },
  { name: 'Chiang Rai', aliases: [], lat: 19.910, lng: 99.840 },
  { name: 'Chonburi', aliases: ['Chon Buri'], lat: 13.361, lng: 100.985 },
  { name: 'Chumphon', aliases: [], lat: 10.493, lng: 99.180 },
  { name: 'Kalasin', aliases: [], lat: 16.432, lng: 103.506 },
  { name: 'Kamphaeng Phet', aliases: [], lat: 16.482, lng: 99.522 },
  { name: 'Kanchanaburi', aliases: [], lat: 14.022, lng: 99.533 },
  { name: 'Khon Kaen', aliases: [], lat: 16.432, lng: 102.824 },
  { name: 'Krabi', aliases: [], lat: 8.086, lng: 98.906 },
  { name: 'Lampang', aliases: [], lat: 18.288, lng: 99.493 },
  { name: 'Lamphun', aliases: [], lat: 18.574, lng: 99.008 },
  { name: 'Loei', aliases: [], lat: 17.486, lng: 101.722 },
  { name: 'Lopburi', aliases: ['Lop Buri'], lat: 14.799, lng: 100.653 },
  { name: 'Mae Hong Son', aliases: [], lat: 19.301, lng: 97.965 },
  { name: 'Maha Sarakham', aliases: [], lat: 16.184, lng: 103.302 },
  { name: 'Mukdahan', aliases: [], lat: 16.545, lng: 104.723 },
  { name: 'Nakhon Nayok', aliases: [], lat: 14.206, lng: 101.213 },
  { name: 'Nakhon Pathom', aliases: [], lat: 13.820, lng: 100.064 },
  { name: 'Nakhon Phanom', aliases: [], lat: 17.408, lng: 104.779 },
  { name: 'Nakhon Ratchasima', aliases: ['Korat'], lat: 14.979, lng: 102.097 },
  { name: 'Nakhon Sawan', aliases: [], lat: 15.705, lng: 100.137 },
  { name: 'Nakhon Si Thammarat', aliases: [], lat: 8.430, lng: 99.963 },
  { name: 'Nan', aliases: [], lat: 18.775, lng: 100.773 },
  { name: 'Narathiwat', aliases: [], lat: 6.425, lng: 101.825 },
  { name: 'Nong Bua Lam Phu', aliases: [], lat: 17.204, lng: 102.440 },
  { name: 'Nong Khai', aliases: [], lat: 17.878, lng: 102.742 },
  { name: 'Nonthaburi', aliases: [], lat: 13.862, lng: 100.514 },
  { name: 'Pathum Thani', aliases: [], lat: 14.021, lng: 100.525 },
  { name: 'Pattani', aliases: [], lat: 6.869, lng: 101.250 },
  { name: 'Phang Nga', aliases: ['Phangnga'], lat: 8.451, lng: 98.525 },
  { name: 'Phatthalung', aliases: [], lat: 7.617, lng: 100.074 },
  { name: 'Phayao', aliases: [], lat: 19.170, lng: 99.902 },
  { name: 'Phetchabun', aliases: [], lat: 16.419, lng: 101.160 },
  { name: 'Phetchaburi', aliases: [], lat: 13.111, lng: 99.945 },
  { name: 'Phichit', aliases: [], lat: 16.442, lng: 100.349 },
  { name: 'Phitsanulok', aliases: [], lat: 16.821, lng: 100.265 },
  { name: 'Phra Nakhon Si Ayutthaya', aliases: ['Ayutthaya', 'Ayudhya'], lat: 14.353, lng: 100.569 },
  { name: 'Phrae', aliases: [], lat: 18.145, lng: 100.141 },
  { name: 'Phuket', aliases: [], lat: 7.880, lng: 98.392 },
  { name: 'Prachin Buri', aliases: [], lat: 14.051, lng: 101.368 },
  { name: 'Prachuap Khiri Khan', aliases: [], lat: 11.812, lng: 99.795 },
  { name: 'Ranong', aliases: [], lat: 9.965, lng: 98.635 },
  { name: 'Ratchaburi', aliases: [], lat: 13.528, lng: 99.813 },
  { name: 'Rayong', aliases: [], lat: 12.681, lng: 101.281 },
  { name: 'Roi Et', aliases: [], lat: 16.053, lng: 103.653 },
  { name: 'Sa Kaeo', aliases: ['Sa Kaew'], lat: 13.824, lng: 102.064 },
  { name: 'Sakon Nakhon', aliases: [], lat: 17.154, lng: 104.141 },
  { name: 'Samut Prakan', aliases: [], lat: 13.599, lng: 100.597 },
  { name: 'Samut Sakhon', aliases: [], lat: 13.547, lng: 100.274 },
  { name: 'Samut Songkhram', aliases: [], lat: 13.409, lng: 100.002 },
  { name: 'Saraburi', aliases: [], lat: 14.529, lng: 100.910 },
  { name: 'Satun', aliases: [], lat: 6.623, lng: 100.067 },
  { name: 'Sing Buri', aliases: [], lat: 14.894, lng: 100.405 },
  { name: 'Sisaket', aliases: ['Si Sa Ket'], lat: 15.118, lng: 104.322 },
  { name: 'Songkhla', aliases: [], lat: 7.176, lng: 100.614 },
  { name: 'Sukhothai', aliases: [], lat: 17.006, lng: 99.823 },
  { name: 'Suphan Buri', aliases: [], lat: 14.474, lng: 100.122 },
  { name: 'Surat Thani', aliases: [], lat: 9.140, lng: 99.333 },
  { name: 'Surin', aliases: [], lat: 14.882, lng: 103.494 },
  { name: 'Tak', aliases: [], lat: 16.883, lng: 99.126 },
  { name: 'Trang', aliases: [], lat: 7.556, lng: 99.611 },
  { name: 'Trat', aliases: [], lat: 12.243, lng: 102.515 },
  { name: 'Ubon Ratchathani', aliases: [], lat: 15.245, lng: 104.847 },
  { name: 'Udon Thani', aliases: [], lat: 17.414, lng: 102.787 },
  { name: 'Uthai Thani', aliases: [], lat: 15.379, lng: 100.024 },
  { name: 'Uttaradit', aliases: [], lat: 17.620, lng: 100.099 },
  { name: 'Yala', aliases: [], lat: 6.541, lng: 101.280 },
  { name: 'Yasothon', aliases: [], lat: 15.794, lng: 104.145 },
];

/** Well-known city names that map to a province */
export const THAILAND_CITY_ALIASES: { city: string; province: string; aliases?: string[] }[] = [
  { city: 'Pattaya', province: 'Chonburi', aliases: ['Pattaya City'] },
  { city: 'Hat Yai', province: 'Songkhla', aliases: ['Haad Yai', 'Hat Yai City'] },
];

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function entrySearchHaystack(entry: ThailandProvinceEntry): string[] {
  const thai = provinceNamesTh[entry.name];
  return [entry.name, ...entry.aliases, thai ?? ''].map(normalizeSearchText).filter(Boolean);
}

export function provinceEntryMatchesQuery(entry: ThailandProvinceEntry, query: string): boolean {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return false;
  }

  return entrySearchHaystack(entry).some(
    (term) => term.includes(normalized) || normalized.includes(term),
  );
}

export function scoreProvinceMatch(entry: ThailandProvinceEntry, query: string): number {
  const normalized = normalizeSearchText(query);
  let best = 0;

  for (const term of entrySearchHaystack(entry)) {
    if (term === normalized) {
      best = Math.max(best, 100);
    } else if (term.startsWith(normalized)) {
      best = Math.max(best, 80);
    } else if (term.includes(normalized)) {
      best = Math.max(best, 60);
    } else if (normalized.includes(term) && term.length > 3) {
      best = Math.max(best, 40);
    }
  }

  return best;
}

export function getProvinceCenter(province: string): [number, number] | null {
  const entry = THAILAND_PROVINCES.find(
    (item) => item.name.toLowerCase() === province.toLowerCase(),
  );
  return entry ? [entry.lat, entry.lng] : null;
}

export function findCityAlias(query: string): { city: string; province: string } | null {
  const normalized = normalizeSearchText(query);

  for (const alias of THAILAND_CITY_ALIASES) {
    const terms = [alias.city, ...(alias.aliases ?? [])].map(normalizeSearchText);
    if (terms.some((term) => term === normalized || term.startsWith(normalized) || term.includes(normalized))) {
      return { city: alias.city, province: alias.province };
    }
  }

  return null;
}

export function findBestProvinceMatch(query: string): ThailandProvinceEntry | null {
  const scored = THAILAND_PROVINCES.map((entry) => ({
    entry,
    score: scoreProvinceMatch(entry, query),
  }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.entry ?? null;
}
