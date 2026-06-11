import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapNavigationGuard } from '../context/MapNavigationGuard';
import type { Campus } from '../types/campus';
import type { MapNavigationState } from '../types/mapTravel';
import { loadProvinceBoundaries } from '../data/provinceBoundaries';
import { geoJsonProvinceToApp } from '../utils/provinceGeoNames';
import {
  fitMapToCampuses,
  getFilterFitBoundsPadding,
  hasReachedCampusNavigation,
  MAP_FLY_DURATION,
  navigateToCampus,
  resetMapToThailand,
} from '../utils/mapBounds';

type MapTravelControllerProps = {
  travel: MapNavigationState;
  campuses: Campus[];
  onComplete: () => void;
};

/** After fitBounds the target point should be within the visible area. */
function hasReachedProvinceNavigation(
  map: L.Map,
  targetLatLng: L.LatLng,
): boolean {
  return map.getBounds().contains(targetLatLng);
}

/**
 * Load the GeoJSON boundary for `province` and return its LatLngBounds.
 * Returns null if the boundary is not found or loading fails.
 */
async function getProvinceBounds(province: string): Promise<L.LatLngBounds | null> {
  try {
    const data = await loadProvinceBoundaries();
    const feature = data.features.find(
      (f) => geoJsonProvinceToApp(f.properties.name) === province,
    );
    if (!feature) return null;
    const bounds = L.geoJSON(feature).getBounds();
    return bounds.isValid() ? bounds : null;
  } catch {
    return null;
  }
}

export function MapTravelController({
  travel,
  campuses,
  onComplete,
}: MapTravelControllerProps) {
  const map = useMap();
  const { hasNavigatedRef } = useMapNavigationGuard();
  const hasAnimated = useRef(false);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (hasAnimated.current) {
      return;
    }

    let cancelled = false;
    let flyStarted = false;
    let handleMoveEnd: (() => void) | null = null;
    let layoutTimer: number | null = null;

    const targetLatLng = L.latLng(travel.lat, travel.lng);
    const provinceCampuses = campuses.filter((campus) => campus.province === travel.province);

    const finishTravel = () => {
      if (cancelled || !flyStarted) {
        return;
      }

      flyStarted = false;
      if (handleMoveEnd) {
        map.off('moveend', handleMoveEnd);
        handleMoveEnd = null;
      }

      hasNavigatedRef.current = false;
      onCompleteRef.current();
    };

    const runArrival = () => {
      if (cancelled || hasAnimated.current) {
        return;
      }

      hasAnimated.current = true;
      hasNavigatedRef.current = true;

      resetMapToThailand(map, false);
      map.invalidateSize({ animate: false });

      handleMoveEnd = () => {
        if (!flyStarted || cancelled) {
          return;
        }

        const reached =
          travel.type === 'campus'
            ? hasReachedCampusNavigation(map, targetLatLng)
            : hasReachedProvinceNavigation(map, targetLatLng);

        if (!reached) {
          return;
        }

        finishTravel();
      };

      map.on('moveend', handleMoveEnd);

      layoutTimer = window.setTimeout(async () => {
        if (cancelled) {
          return;
        }

        flyStarted = true;

        if (travel.type === 'campus') {
          navigateToCampus(map, { lat: travel.lat, lng: travel.lng });
          return;
        }

        // Province and city: fit the map to the actual province boundary polygon so
        // the whole region is visible with comfortable padding. Fall back to campus
        // pin fitting (or a point zoom) if the boundary isn't available.
        const bounds = await getProvinceBounds(travel.province);
        if (cancelled) return;

        if (bounds) {
          const { paddingTopLeft, paddingBottomRight } = getFilterFitBoundsPadding();
          map.fitBounds(bounds, {
            paddingTopLeft,
            paddingBottomRight,
            animate: true,
            duration: MAP_FLY_DURATION,
          });
          return;
        }

        // Fallback: fit to campus pins in the province.
        if (provinceCampuses.length > 0) {
          fitMapToCampuses(map, provinceCampuses);
          return;
        }

        navigateToCampus(map, { lat: travel.lat, lng: travel.lng });
      }, 80);
    };

    map.whenReady(() => {
      if (cancelled || hasAnimated.current) {
        return;
      }

      requestAnimationFrame(runArrival);
    });

    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled && flyStarted) {
        finishTravel();
      }
    }, MAP_FLY_DURATION * 1000 + 500);

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      if (layoutTimer !== null) {
        window.clearTimeout(layoutTimer);
      }
      if (handleMoveEnd) {
        map.off('moveend', handleMoveEnd);
      }
      if (!hasAnimated.current) {
        hasNavigatedRef.current = false;
      }
    };
  }, [travel, campuses, map, hasNavigatedRef]);

  return null;
}
