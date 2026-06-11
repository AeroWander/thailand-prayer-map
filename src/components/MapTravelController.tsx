import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapNavigationGuard } from '../context/MapNavigationGuard';
import type { Campus } from '../types/campus';
import type { MapNavigationState } from '../types/mapTravel';
import {
  fitMapToCampuses,
  hasReachedCampusNavigation,
  MAP_FLY_DURATION,
  navigateToCampus,
  THAILAND_CENTER,
  THAILAND_ZOOM,
} from '../utils/mapBounds';

const ARRIVAL_DISTANCE_METERS = 2500;

type MapTravelControllerProps = {
  travel: MapNavigationState;
  campuses: Campus[];
  onComplete: () => void;
};

function hasReachedProvinceNavigation(
  map: L.Map,
  targetLatLng: L.LatLng,
): boolean {
  const center = map.getCenter();
  const distance = center.distanceTo(targetLatLng);

  return distance <= ARRIVAL_DISTANCE_METERS && map.getBounds().contains(targetLatLng);
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

      map.setView(THAILAND_CENTER, THAILAND_ZOOM, { animate: false, duration: 0 });
      map.invalidateSize({ animate: false });

      handleMoveEnd = () => {
        if (!flyStarted || cancelled) {
          return;
        }

        const reached =
          travel.type === 'campus' || travel.type === 'city'
            ? hasReachedCampusNavigation(map, targetLatLng)
            : hasReachedProvinceNavigation(map, targetLatLng);

        if (!reached) {
          return;
        }

        finishTravel();
      };

      map.on('moveend', handleMoveEnd);

      layoutTimer = window.setTimeout(() => {
        if (cancelled) {
          return;
        }

        flyStarted = true;

        if (travel.type === 'campus') {
          navigateToCampus(map, { lat: travel.lat, lng: travel.lng });
          return;
        }

        // City arrivals zoom to the city's own coordinates for precision.
        if (travel.type === 'city') {
          navigateToCampus(map, { lat: travel.lat, lng: travel.lng });
          return;
        }

        // Province arrivals fit the map to all campuses in the province.
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
