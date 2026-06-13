import { useEffect, useMemo, useRef } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import type { Campus } from '../types/campus';
import { CampusPinTooltip } from './CampusPinTooltip';
import { getDotSize } from '../utils/campusDotSize';
import { createCampusDotIcon } from '../utils/campusPinIcon';

// Tooltips are hover-only — skip on touch devices entirely
const HAS_HOVER =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

type CampusMapMarkerProps = {
  campus: Campus;
  mapZoom: number;
  isSelected: boolean;
  onMarkerClick: (campus: Campus, event: LeafletMouseEvent) => void;
};

function applyDotClasses(
  marker: L.Marker | null,
  options: {
    prayedFor: boolean;
    mapZoom: number;
    isSelected: boolean;
  },
) {
  const dot = marker?.getElement()?.querySelector('.campus-dot') as HTMLElement | null;
  if (!dot) {
    return;
  }

  const dotSize = getDotSize(options.mapZoom, options.prayedFor);

  dot.classList.toggle('campus-dot--prayed', options.prayedFor);
  dot.classList.toggle('campus-dot--pending', !options.prayedFor);
  dot.classList.toggle('campus-dot--selected', options.isSelected);
  dot.style.setProperty('--dot-size', `${dotSize}px`);
}

export function CampusMapMarker({
  campus,
  mapZoom,
  isSelected,
  onMarkerClick,
}: CampusMapMarkerProps) {
  const markerRef = useRef<L.Marker>(null);
  const zoomSizeRef = useRef(getDotSize(mapZoom, false));

  const icon = useMemo(() => {
    const dotSize = getDotSize(mapZoom, false);
    return createCampusDotIcon(dotSize, false);
  }, [mapZoom]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) {
      return;
    }

    const zoomDotSize = getDotSize(mapZoom, false);

    if (zoomDotSize !== zoomSizeRef.current) {
      marker.setIcon(createCampusDotIcon(zoomDotSize, false));
      zoomSizeRef.current = zoomDotSize;
    }

    applyDotClasses(marker, {
      prayedFor: campus.prayedFor,
      mapZoom,
      isSelected,
    });
  }, [campus.prayedFor, mapZoom, isSelected]);

  return (
    <Marker
      ref={markerRef}
      position={[campus.lat, campus.lng]}
      icon={icon}
      eventHandlers={{
        add: () => {
          zoomSizeRef.current = getDotSize(mapZoom, false);
          applyDotClasses(markerRef.current, {
            prayedFor: campus.prayedFor,
            mapZoom,
            isSelected,
          });
        },
        click: (event) => onMarkerClick(campus, event),
      }}
    >
      {HAS_HOVER && (
        <Tooltip
          direction="top"
          offset={[0, -10]}
          className="campus-tooltip"
          permanent={false}
          sticky={false}
        >
          <CampusPinTooltip campus={campus} />
        </Tooltip>
      )}
    </Marker>
  );
}
