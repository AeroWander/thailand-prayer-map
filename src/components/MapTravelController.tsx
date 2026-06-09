import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapNavigationGuard } from '../context/MapNavigationGuard';
import type { MapNavigationState } from '../types/mapTravel';
import { THAILAND_CENTER, THAILAND_ZOOM } from '../utils/mapBounds';

const TRAVEL_DURATION = 1.8;
const CAMPUS_TRAVEL_ZOOM = 14;
const PROVINCE_TRAVEL_ZOOM = 9;
const ARRIVAL_DISTANCE_METERS = 2500;

const flyOptions = {
  animate: true,
  duration: TRAVEL_DURATION,
  easeLinearity: 0.15,
};

type MapTravelControllerProps = {
  travel: MapNavigationState;
  onComplete: () => void;
};

function hasReachedTravelTarget(
  map: L.Map,
  targetLatLng: L.LatLng,
  targetZoom: number,
): boolean {
  const center = map.getCenter();
  const distance = center.distanceTo(targetLatLng);
  const zoomDelta = Math.abs(map.getZoom() - targetZoom);

  return distance <= ARRIVAL_DISTANCE_METERS && zoomDelta < 0.5;
}

export function MapTravelController({ travel, onComplete }: MapTravelControllerProps) {
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
    const targetZoom = travel.type === 'campus' ? CAMPUS_TRAVEL_ZOOM : PROVINCE_TRAVEL_ZOOM;

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

        if (!hasReachedTravelTarget(map, targetLatLng, targetZoom)) {
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
        map.flyTo(targetLatLng, targetZoom, flyOptions);
      }, 80);
    };

    map.whenReady(() => {
      if (cancelled || hasAnimated.current) {
        return;
      }

      requestAnimationFrame(runArrival);
    });

    return () => {
      cancelled = true;
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
  }, [travel, map, hasNavigatedRef]);

  return null;
}
