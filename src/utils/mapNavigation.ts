import type { Campus } from '../types/campus';
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
  const [lat, lng] = getProvinceCoordinates(province, campuses);
  const name = result.kind === 'city' ? result.city : getProvinceLabel(province);

  return {
    type: 'province',
    name,
    lat,
    lng,
    province,
  };
}
