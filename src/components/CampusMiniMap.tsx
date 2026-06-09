import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import type { Campus } from '../types/campus';
import { MINI_MAP_ZOOM } from '../utils/mapBounds';
import { createCampusMiniMapDotIcon } from '../utils/campusPinIcon';

const ESRI_WORLD_IMAGERY_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const ESRI_ATTRIBUTION =
  'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

type CampusMiniMapProps = {
  campus: Campus;
  isPanelOpen: boolean;
  variant?: 'default' | 'explore' | 'detail';
};

function CampusMiniMapCenterController({ campus }: { campus: Campus }) {
  const map = useMap();

  useEffect(() => {
    map.setView([campus.lat, campus.lng], MINI_MAP_ZOOM, { animate: false, duration: 0 });
  }, [campus.id, campus.lat, campus.lng, map]);

  return null;
}

function CampusMiniMapResizeController({ isPanelOpen }: { isPanelOpen: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!isPanelOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      map.invalidateSize();
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [isPanelOpen, map]);

  return null;
}

export function CampusMiniMap({
  campus,
  isPanelOpen,
  variant = 'default',
}: CampusMiniMapProps) {
  const icon = useMemo(
    () => createCampusMiniMapDotIcon(campus.prayedFor),
    [campus.prayedFor],
  );

  const className =
    variant === 'detail'
      ? 'mini-map campus-panel__mini-map campus-panel__mini-map--detail'
      : variant === 'explore'
        ? 'campus-panel__mini-map campus-panel__mini-map--explore'
        : 'campus-panel__mini-map';

  return (
    <div className={className} aria-hidden="true">
      <MapContainer
        center={[campus.lat, campus.lng]}
        zoom={MINI_MAP_ZOOM}
        className="campus-panel__mini-map-leaflet"
        zoomControl={false}
        attributionControl
        dragging={false}
        touchZoom={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomSnap={0}
        zoomDelta={0.25}
        inertia={false}
      >
        <CampusMiniMapCenterController campus={campus} />
        <CampusMiniMapResizeController isPanelOpen={isPanelOpen} />
        <TileLayer url={ESRI_WORLD_IMAGERY_URL} attribution={ESRI_ATTRIBUTION} />
        <Marker
          position={[campus.lat, campus.lng]}
          icon={icon}
          interactive={false}
        />
      </MapContainer>
    </div>
  );
}
