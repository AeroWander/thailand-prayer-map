import type { Campus } from './campus';
import { getProvinceCenter } from '../data/thailandProvinces';

/** Navigation state passed from landing search → map page via React Router */
export type MapNavigationState = {
  type: 'campus' | 'province' | 'city';
  name: string;
  lat: number;
  lng: number;
  province: string;
  /** Present for campus arrivals — used to open the detail panel */
  campusId?: string;
  /** Present for city arrivals — the city / district name */
  city?: string;
};

export function getProvinceCoordinates(
  province: string,
  campuses: Campus[],
): [number, number] {
  const provinceCampuses = campuses.filter((campus) => campus.province === province);

  if (provinceCampuses.length > 0) {
    const lat =
      provinceCampuses.reduce((sum, campus) => sum + campus.lat, 0) / provinceCampuses.length;
    const lng =
      provinceCampuses.reduce((sum, campus) => sum + campus.lng, 0) / provinceCampuses.length;
    return [lat, lng];
  }

  const center = getProvinceCenter(province);
  return center ?? [13.756, 100.502];
}

export function isMapNavigationState(value: unknown): value is MapNavigationState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const state = value as MapNavigationState;
  return (
    (state.type === 'campus' || state.type === 'province' || state.type === 'city') &&
    typeof state.name === 'string' &&
    typeof state.lat === 'number' &&
    typeof state.lng === 'number' &&
    typeof state.province === 'string'
  );
}
