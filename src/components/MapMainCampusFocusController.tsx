import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { Campus } from '../types/campus';
import {
  flyToCampusDetail,
  isCampusRoughlyCentered,
} from '../utils/mapBounds';

type MapMainCampusFocusControllerProps = {
  campus: Campus | null;
  enabled: boolean;
};

export function MapMainCampusFocusController({
  campus,
  enabled,
}: MapMainCampusFocusControllerProps) {
  const map = useMap();
  const lastFocusedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !campus) {
      return;
    }

    if (lastFocusedIdRef.current === campus.id) {
      return;
    }

    lastFocusedIdRef.current = campus.id;

    if (isCampusRoughlyCentered(map, campus)) {
      return;
    }

    flyToCampusDetail(map, campus);
  }, [campus, enabled, map]);

  useEffect(() => {
    if (!campus) {
      lastFocusedIdRef.current = null;
    }
  }, [campus]);

  return null;
}
