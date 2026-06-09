import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useMapNavigationGuard } from '../context/MapNavigationGuard';
import type { Campus } from '../types/campus';
import {
  fitMapToCampuses,
  isCountryView,
  resetMapToThailand,
} from '../utils/mapBounds';

type MapBoundsControllerProps = {
  campuses: Campus[];
  selectedRegion: string;
  selectedProvince: string;
  selectedCampusId?: string | null;
  suppressBoundsUpdate?: boolean;
};

export function MapBoundsController({
  campuses,
  selectedRegion,
  selectedProvince,
  selectedCampusId = null,
  suppressBoundsUpdate = false,
}: MapBoundsControllerProps) {
  const map = useMap();
  const { hasNavigatedRef, userIsInteractingRef, isPrayerUpdateRef } =
    useMapNavigationGuard();
  const lastBoundsKeyRef = useRef<string | null>(null);
  const campusesRef = useRef(campuses);
  campusesRef.current = campuses;

  const boundsKey = `${selectedRegion}|${selectedProvince}`;

  useEffect(() => {
    if (isPrayerUpdateRef.current) {
      isPrayerUpdateRef.current = false;
      lastBoundsKeyRef.current = boundsKey;
      return;
    }

    if (
      suppressBoundsUpdate ||
      selectedCampusId ||
      hasNavigatedRef.current ||
      userIsInteractingRef.current
    ) {
      lastBoundsKeyRef.current = boundsKey;
      return;
    }

    if (lastBoundsKeyRef.current === boundsKey) {
      return;
    }

    lastBoundsKeyRef.current = boundsKey;

    const visibleCampuses = campusesRef.current;

    if (isCountryView(selectedRegion, selectedProvince)) {
      resetMapToThailand(map, true);
      return;
    }

    if (visibleCampuses.length === 0) {
      return;
    }

    fitMapToCampuses(map, visibleCampuses);
  }, [
    map,
    boundsKey,
    selectedRegion,
    selectedProvince,
    suppressBoundsUpdate,
    selectedCampusId,
    hasNavigatedRef,
    userIsInteractingRef,
    isPrayerUpdateRef,
  ]);

  return null;
}
