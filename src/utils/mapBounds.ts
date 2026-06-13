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
/** Matches `.campus-tooltip-card` width in CSS. */
const CAMPUS_TOOLTIP_WIDTH = 248;
/** Conservative height for the full card (body + hint bar). */
const CAMPUS_TOOLTIP_ESTIMATED_HEIGHT = 172;
const CAMPUS_TOOLTIP_MARKER_GAP = 18;
const CAMPUS_TOOLTIP_EDGE_MARGIN = 12;

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

/** Bottom edge of the floating search bar, relative to the map container top. */
function getMapSearchOverlayBottom(map: L.Map): number {
  const mapContainer = map.getContainer();
  const overlay = mapContainer.parentElement?.querySelector('.map-search-overlay');

  if (!(overlay instanceof HTMLElement)) {
    return 80;
  }

  const mapRect = mapContainer.getBoundingClientRect();
  const overlayRect = overlay.getBoundingClientRect();
  return Math.max(
    CAMPUS_TOOLTIP_EDGE_MARGIN,
    overlayRect.bottom - mapRect.top + 8,
  );
}

/**
 * Pixel pan needed after flyTo so the selected pin and its full card tooltip
 * sit fully inside the visible map area (panel overlap + search bar clearance).
 */
function getCampusSelectionPanOffset(map: L.Map, latLng: L.LatLng): { x: number; y: number } {
  const panelOffsetX = getCampusCenterPanOffsetX(map);
  const point = map.latLngToContainerPoint(latLng);
  const size = map.getSize();

  let panX = panelOffsetX;
  let panY = 0;

  // Center the pin in the map area not covered by the explore panel.
  const visibleCenterX = (size.x - panelOffsetX) / 2;
  panX += point.x - visibleCenterX;

  // Leave room above the pin for the full card tooltip below the search bar.
  const minTooltipTop = getMapSearchOverlayBottom(map);
  const tooltipTop = point.y - CAMPUS_TOOLTIP_MARKER_GAP - CAMPUS_TOOLTIP_ESTIMATED_HEIGHT;
  if (tooltipTop < minTooltipTop) {
    panY = minTooltipTop - tooltipTop;
  }

  // Keep the tooltip card away from the left/right map edges.
  const tooltipHalfWidth = CAMPUS_TOOLTIP_WIDTH / 2;
  const tooltipLeft = point.x - tooltipHalfWidth;
  const tooltipRight = point.x + tooltipHalfWidth;
  const maxRight = size.x - CAMPUS_TOOLTIP_EDGE_MARGIN;

  if (tooltipLeft < CAMPUS_TOOLTIP_EDGE_MARGIN) {
    panX += CAMPUS_TOOLTIP_EDGE_MARGIN - tooltipLeft;
  } else if (tooltipRight > maxRight) {
    panX -= tooltipRight - maxRight;
  }

  return { x: panX, y: panY };
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

  const targetLatLng = L.latLng(campus.lat, campus.lng);

  map.flyTo(targetLatLng, CAMPUS_NAV_ZOOM, {
    duration: MAP_FLY_DURATION,
    easeLinearity: 0.25,
  });

  const panToVisibleSelection = () => {
    clearPendingCampusPan(map);
    // Wait for layout (explore panel open) before measuring tooltip clearance.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const { x, y } = getCampusSelectionPanOffset(map, targetLatLng);
        if (x !== 0 || y !== 0) {
          map.panBy([x, y], { animate: false });
        }
        releaseMapNavigation(map);
      });
    });
  };

  pendingCampusPanHandlers.set(map, panToVisibleSelection);
  map.once('moveend', panToVisibleSelection);
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

  const { x, y } = getCampusSelectionPanOffset(map, targetLatLng);
  return Math.abs(x) <= 8 && Math.abs(y) <= 8;
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
