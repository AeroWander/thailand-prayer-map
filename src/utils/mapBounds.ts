import L from 'leaflet';
import type { Campus } from '../types/campus';

export const THAILAND_CENTER: [number, number] = [13.0, 101.0];
export const THAILAND_ZOOM = 6;
export const CAMPUS_NAV_ZOOM = 12;
export const MAP_FLY_DURATION = 1.2;
export const MINI_MAP_ZOOM = 16;

const MOBILE_BREAKPOINT = 768;
const FILTER_PADDING: [number, number] = [60, 60];
const NAVIGATION_RELEASE_MS = 100;

export type CampusCoordinates = Pick<Campus, 'lat' | 'lng'>;

let isMapNavigating = false;

const pendingCampusPanHandlers = new WeakMap<L.Map, () => void>();
const navigationReleaseTimers = new WeakMap<L.Map, number>();

export function getIsMapNavigating(): boolean {
  return isMapNavigating;
}

function setMapNavigating(active: boolean): void {
  isMapNavigating = active;
}

function clearNavigationReleaseTimer(map: L.Map): void {
  const timer = navigationReleaseTimers.get(map);
  if (timer !== undefined) {
    window.clearTimeout(timer);
    navigationReleaseTimers.delete(map);
  }
}

function releaseMapNavigation(map: L.Map): void {
  clearNavigationReleaseTimer(map);
  navigationReleaseTimers.set(
    map,
    window.setTimeout(() => {
      setMapNavigating(false);
      navigationReleaseTimers.delete(map);
    }, NAVIGATION_RELEASE_MS),
  );
}

function clearPendingCampusPan(map: L.Map): void {
  const handler = pendingCampusPanHandlers.get(map);
  if (!handler) {
    return;
  }

  map.off('moveend', handler);
  pendingCampusPanHandlers.delete(map);
}

export function isMobileMapViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
}

/** Horizontal pan needed when the explore panel overlaps the map (not side-by-side flex). */
export function getCampusCenterPanOffsetX(map: L.Map): number {
  if (isMobileMapViewport()) {
    return 0;
  }

  const mapContainer = map.getContainer();
  const layout = mapContainer.closest('.map-layout');
  const panel = layout?.querySelector('.explore-panel');

  if (!panel) {
    return 0;
  }

  const mapRect = mapContainer.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const overlap = mapRect.right - panelRect.left;

  if (overlap <= 0) {
    return 0;
  }

  return overlap / 2;
}

export function getFilterFitBoundsPadding(): {
  paddingTopLeft: [number, number];
  paddingBottomRight: [number, number];
} {
  return {
    paddingTopLeft: FILTER_PADDING,
    paddingBottomRight: FILTER_PADDING,
  };
}

/** Fly to a single campus — list, pin, search, and landing arrivals all use this. */
export function navigateToCampus(map: L.Map, campus: CampusCoordinates): void {
  clearPendingCampusPan(map);
  clearNavigationReleaseTimer(map);
  setMapNavigating(true);

  map.flyTo([campus.lat, campus.lng], CAMPUS_NAV_ZOOM, {
    duration: MAP_FLY_DURATION,
    easeLinearity: 0.25,
  });

  const offsetX = getCampusCenterPanOffsetX(map);

  const finishNavigation = () => {
    releaseMapNavigation(map);
  };

  if (offsetX === 0) {
    map.once('moveend', finishNavigation);
    return;
  }

  const panToVisibleCenter = () => {
    clearPendingCampusPan(map);
    map.panBy([offsetX, 0], { animate: false });
    finishNavigation();
  };

  pendingCampusPanHandlers.set(map, panToVisibleCenter);
  map.once('moveend', panToVisibleCenter);
}

export function isCountryView(region: string, province: string): boolean {
  return region === 'All' && province === 'All';
}

/** Fit province or region filter results into the visible map area. */
export function fitMapToCampuses(map: L.Map, campuses: Campus[]): void {
  if (getIsMapNavigating() || campuses.length === 0) {
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
  const targetCenterX = (size.x - getCampusCenterPanOffsetX(map)) / 2;
  const targetCenterY = size.y / 2;

  return (
    Math.abs(point.x - targetCenterX) <= 8 &&
    Math.abs(point.y - targetCenterY) <= 8
  );
}

/** Return to the national home view. */
export function resetMapToThailand(map: L.Map, animate = true): void {
  if (getIsMapNavigating()) {
    return;
  }

  if (animate) {
    map.flyTo(THAILAND_CENTER, THAILAND_ZOOM, { duration: MAP_FLY_DURATION });
    return;
  }

  map.setView(THAILAND_CENTER, THAILAND_ZOOM, { animate: false, duration: 0 });
}
