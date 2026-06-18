import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { pruneOrphanCampusTooltips } from '../utils/campusTooltipCleanup';

type MapTooltipCleanupControllerProps = {
  selectedCampusId: string | null;
};

/** Drop stale campus tooltip DOM after zoom, pan, or selection changes. */
export function MapTooltipCleanupController({ selectedCampusId }: MapTooltipCleanupControllerProps) {
  const map = useMap();

  useEffect(() => {
    const cleanup = () => {
      const pane = map.getPane('tooltipPane');
      if (pane) {
        pruneOrphanCampusTooltips(pane);
      }
    };

    map.on('zoomend', cleanup);
    map.on('moveend', cleanup);
    cleanup();

    return () => {
      map.off('zoomend', cleanup);
      map.off('moveend', cleanup);
    };
  }, [map]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const pane = map.getPane('tooltipPane');
      if (pane) {
        pruneOrphanCampusTooltips(pane);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [map, selectedCampusId]);

  return null;
}
