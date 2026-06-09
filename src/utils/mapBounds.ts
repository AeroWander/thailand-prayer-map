import L from 'leaflet';
import type { Campus } from '../types/campus';

export const THAILAND_CENTER: [number, number] = [13.0, 101.0];
export const THAILAND_ZOOM = 5;
export const CAMPUS_DETAIL_ZOOM = 14;
export const CAMPUS_DETAIL_FLY_DURATION = 1.2;
export const MINI_MAP_ZOOM = 16;

const SINGLE_CAMPUS_ZOOM = 11;
const SEARCH_SINGLE_CAMPUS_ZOOM = 13;
const FIT_BOUNDS_MAX_ZOOM = 11;
const FIT_BOUNDS_PADDING: [number, number] = [48, 48];

export function isCountryView(region: string, province: string): boolean {
  return region === 'All' && province === 'All';
}

type FitMapOptions = {
  singleCampusZoom?: number;
};

export function fitMapToCampuses(
  map: L.Map,
  campuses: Campus[],
  options: FitMapOptions = {},
): void {
  if (campuses.length === 0) {
    return;
  }

  const singleZoom = options.singleCampusZoom ?? SINGLE_CAMPUS_ZOOM;

  if (campuses.length === 1) {
    const campus = campuses[0];
    map.flyTo([campus.lat, campus.lng], singleZoom, { duration: 0.85 });
    return;
  }

  const bounds = L.latLngBounds(campuses.map((campus) => [campus.lat, campus.lng]));
  map.flyToBounds(bounds, {
    padding: FIT_BOUNDS_PADDING,
    maxZoom: FIT_BOUNDS_MAX_ZOOM,
    duration: 0.85,
  });
}

export function flyToCampus(map: L.Map, campus: Campus, zoom = SEARCH_SINGLE_CAMPUS_ZOOM): void {
  map.flyTo([campus.lat, campus.lng], zoom, { duration: 0.85 });
}

/** True when the campus is visible and in the central area of the viewport. */
export function isCampusRoughlyCentered(map: L.Map, campus: Campus): boolean {
  const latlng = L.latLng(campus.lat, campus.lng);

  if (!map.getBounds().contains(latlng)) {
    return false;
  }

  const point = map.latLngToContainerPoint(latlng);
  const size = map.getSize();
  const marginX = size.x * 0.3;
  const marginY = size.y * 0.3;

  return (
    point.x >= marginX &&
    point.x <= size.x - marginX &&
    point.y >= marginY &&
    point.y <= size.y - marginY
  );
}

export function flyToCampusDetail(map: L.Map, campus: Campus): void {
  map.flyTo([campus.lat, campus.lng], CAMPUS_DETAIL_ZOOM, {
    duration: CAMPUS_DETAIL_FLY_DURATION,
  });
}

export function resetMapToThailand(map: L.Map, animate = false): void {
  if (animate) {
    map.flyTo(THAILAND_CENTER, THAILAND_ZOOM, { duration: 0.85 });
    return;
  }

  map.setView(THAILAND_CENTER, THAILAND_ZOOM, { animate: false, duration: 0 });
}

export { SEARCH_SINGLE_CAMPUS_ZOOM };
