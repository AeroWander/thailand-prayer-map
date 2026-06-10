import L from 'leaflet';
import type { Campus } from '../types/campus';

export const THAILAND_CENTER: [number, number] = [13.0, 101.0];
export const THAILAND_ZOOM = 6;
export const CAMPUS_NAV_ZOOM = 12;
export const MAP_FLY_DURATION = 1.2;
export const MINI_MAP_ZOOM = 16;

const MOBILE_BREAKPOINT = 768;
const DESKTOP_PANEL_PADDING_X = 420;
const FILTER_PADDING_TOP_LEFT: [number, number] = [60, 60];
const FILTER_PADDING_BOTTOM_RIGHT_DESKTOP: [number, number] = [480, 60];
const FILTER_PADDING_BOTTOM_RIGHT_MOBILE: [number, number] = [60, 60];

export type CampusCoordinates = Pick<Campus, 'lat' | 'lng'>;

export function isMobileMapViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
}

export function getCampusFlyPadding(): {
  paddingTopLeft: [number, number];
  paddingBottomRight: [number, number];
} {
  const isMobile = isMobileMapViewport();

  return {
    paddingTopLeft: [0, 0],
    paddingBottomRight: isMobile ? [0, 0] : [DESKTOP_PANEL_PADDING_X, 0],
  };
}

export function getFilterFitBoundsPadding(): {
  paddingTopLeft: [number, number];
  paddingBottomRight: [number, number];
} {
  const isMobile = isMobileMapViewport();

  return {
    paddingTopLeft: FILTER_PADDING_TOP_LEFT,
    paddingBottomRight: isMobile
      ? FILTER_PADDING_BOTTOM_RIGHT_MOBILE
      : FILTER_PADDING_BOTTOM_RIGHT_DESKTOP,
  };
}

/** Fly to a single campus — list, pin, search, and landing arrivals all use this. */
export function navigateToCampus(map: L.Map, campus: CampusCoordinates): void {
  const { paddingTopLeft, paddingBottomRight } = getCampusFlyPadding();
  const point = L.latLng(campus.lat, campus.lng);
  const bounds = L.latLngBounds(point, point);

  // flyToBounds with maxZoom is used because Leaflet only applies panel padding on bounds fitting.
  map.flyToBounds(bounds, {
    maxZoom: CAMPUS_NAV_ZOOM,
    duration: MAP_FLY_DURATION,
    easeLinearity: 0.25,
    paddingTopLeft,
    paddingBottomRight,
  });
}

export function isCountryView(region: string, province: string): boolean {
  return region === 'All' && province === 'All';
}

/** Fit province or region filter results into the visible map area. */
export function fitMapToCampuses(map: L.Map, campuses: Campus[]): void {
  if (campuses.length === 0) {
    return;
  }

  if (campuses.length === 1) {
    navigateToCampus(map, campuses[0]);
    return;
  }

  const bounds = L.latLngBounds(campuses.map((campus) => [campus.lat, campus.lng]));
  const { paddingTopLeft, paddingBottomRight } = getFilterFitBoundsPadding();

  map.fitBounds(bounds, {
    paddingTopLeft,
    paddingBottomRight,
    animate: true,
    duration: MAP_FLY_DURATION,
  });
}

export function hasReachedCampusNavigation(map: L.Map, targetLatLng: L.LatLng): boolean {
  if (Math.abs(map.getZoom() - CAMPUS_NAV_ZOOM) >= 0.5) {
    return false;
  }

  if (!map.getBounds().contains(targetLatLng)) {
    return false;
  }

  const point = map.latLngToContainerPoint(targetLatLng);
  const size = map.getSize();
  const panelWidth = isMobileMapViewport() ? 0 : DESKTOP_PANEL_PADDING_X;

  return (
    point.x >= 16 &&
    point.x <= size.x - panelWidth - 16 &&
    point.y >= 16 &&
    point.y <= size.y - 16
  );
}

/** Return to the national home view. */
export function resetMapToThailand(map: L.Map, animate = true): void {
  if (animate) {
    map.flyTo(THAILAND_CENTER, THAILAND_ZOOM, { duration: MAP_FLY_DURATION });
    return;
  }

  map.setView(THAILAND_CENTER, THAILAND_ZOOM, { animate: false, duration: 0 });
}
