import type { Campus } from '../types/campus';
import { THAILAND_CITY_ALIASES } from '../data/thailandProvinces';
import {
  getProvinceCoordinates,
  type MapNavigationState,
} from '../types/mapTravel';
import type { LocationSearchResult } from './searchLocations';

export function buildMapNavigationState(
  result: LocationSearchResult,
  campuses: Campus[],
  getCampusPrimaryName: (campus: Campus) => string,
  getProvinceLabel: (province: string) => string,
): MapNavigationState {
  if (result.kind === 'campus') {
    return {
      type: 'campus',
      name: getCampusPrimaryName(result.campus),
      lat: result.campus.lat,
      lng: result.campus.lng,
      province: result.campus.province,
      campusId: result.campus.id,
    };
  }

  const province = result.province;

  if (result.kind === 'city') {
    // Use the city's own coordinates when available, otherwise fall back to province centre.
    const alias = THAILAND_CITY_ALIASES.find((a) => a.city === result.city);
    const lat = alias?.lat ?? getProvinceCoordinates(province, campuses)[0];
    const lng = alias?.lng ?? getProvinceCoordinates(province, campuses)[1];
    return {
      type: 'city',
      name: result.city,
      lat,
      lng,
      province,
      city: result.city,
    };
  }

  const [lat, lng] = getProvinceCoordinates(province, campuses);
  return {
    type: 'province',
    name: getProvinceLabel(province),
    lat,
    lng,
    province,
  };
}
