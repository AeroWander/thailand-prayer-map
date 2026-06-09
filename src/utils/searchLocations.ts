import {
  findBestProvinceMatch,
  findCityAlias,
  provinceEntryMatchesQuery,
  scoreProvinceMatch,
  THAILAND_CITY_ALIASES,
  THAILAND_PROVINCES,
  type ThailandProvinceEntry,
} from '../data/thailandProvinces';
import type { Campus } from '../types/campus';
import { searchCampuses } from './searchCampuses';

export type LocationSearchResult =
  | { kind: 'province'; province: string }
  | { kind: 'city'; province: string; city: string }
  | { kind: 'campus'; campus: Campus };

export type GroupedLocationSearchResults = {
  provinces: LocationSearchResult[];
  cities: LocationSearchResult[];
  campuses: LocationSearchResult[];
  selectable: LocationSearchResult[];
};

const MAX_PROVINCES = 3;
const MAX_CITIES = 3;
const MAX_CAMPUSES = 5;

function sortProvinces(entries: ThailandProvinceEntry[], query: string): ThailandProvinceEntry[] {
  return [...entries].sort((a, b) => scoreProvinceMatch(b, query) - scoreProvinceMatch(a, query));
}

export function searchLocationsGrouped(
  campuses: Campus[],
  query: string,
): GroupedLocationSearchResults {
  const trimmed = query.trim();
  if (!trimmed) {
    return { provinces: [], cities: [], campuses: [], selectable: [] };
  }

  const provinceEntries = sortProvinces(
    THAILAND_PROVINCES.filter((entry) => provinceEntryMatchesQuery(entry, trimmed)),
    trimmed,
  ).slice(0, MAX_PROVINCES);

  const provinceNames = new Set(provinceEntries.map((entry) => entry.name));

  const cityResults: LocationSearchResult[] = [];
  const normalized = trimmed.toLowerCase();

  for (const alias of THAILAND_CITY_ALIASES) {
    const terms = [alias.city, ...(alias.aliases ?? [])].map((t) => t.toLowerCase());
    const matches = terms.some(
      (term) => term.includes(normalized) || normalized.includes(term) || term.startsWith(normalized),
    );

    if (matches && !provinceNames.has(alias.province)) {
      cityResults.push({ kind: 'city', province: alias.province, city: alias.city });
    }
  }

  const campusResults: LocationSearchResult[] = searchCampuses(campuses, trimmed, MAX_CAMPUSES).map(
    (campus) => ({ kind: 'campus', campus }),
  );

  const provinces: LocationSearchResult[] = provinceEntries.map((entry) => ({
    kind: 'province',
    province: entry.name,
  }));

  const cities = cityResults.slice(0, MAX_CITIES);
  const campusList = campusResults.slice(0, MAX_CAMPUSES);

  return {
    provinces,
    cities,
    campuses: campusList,
    selectable: [...provinces, ...cities, ...campusList],
  };
}

export function resolveSearchQuery(
  campuses: Campus[],
  query: string,
): LocationSearchResult | null {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const province = findBestProvinceMatch(trimmed);
  if (province && scoreProvinceMatch(province, trimmed) >= 60) {
    return { kind: 'province', province: province.name };
  }

  const city = findCityAlias(trimmed);
  if (city) {
    return { kind: 'city', province: city.province, city: city.city };
  }

  const campusMatches = searchCampuses(campuses, trimmed, 1);
  if (campusMatches.length > 0) {
    return { kind: 'campus', campus: campusMatches[0] };
  }

  if (province) {
    return { kind: 'province', province: province.name };
  }

  return null;
}

/** @deprecated Use searchLocationsGrouped */
export function searchLocations(
  campuses: Campus[],
  query: string,
): LocationSearchResult[] {
  return searchLocationsGrouped(campuses, query).selectable;
}
