import { useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useMapNavigationGuard } from '../context/MapNavigationGuard';
import type { Campus } from '../types/campus';
import type { MapNavigationState } from '../types/mapTravel';
import { CampusMapMarker } from './CampusMapMarker';
import { ProvinceBoundariesLayer } from './ProvinceBoundariesLayer';
import { MapBoundsController } from './MapBoundsController';
import { MapFlyToBridge } from '../context/MapFlyToContext';
import { MapResizeController } from './MapResizeController';
import { MapSheetTouchLockBridge } from './MapSheetTouchLockBridge';
import { MapTravelController } from './MapTravelController';
import { MapZoomWatcher } from './MapZoomWatcher';
import { THAILAND_CENTER, THAILAND_ZOOM } from '../utils/mapBounds';

type MapViewProps = {
  campuses: Campus[];
  selectedRegion: string;
  selectedProvince: string;
  /** Province to outline from a search-box arrival. Does not filter pins. */
  highlightedProvince?: string | null;
  selectedCampusId: string | null;
  onSelectCampus: (campus: Campus) => void;
  travelTarget?: MapNavigationState | null;
  onTravelComplete?: () => void;
  suppressMapAnimations?: boolean;
};

export function MapView({
  campuses,
  selectedRegion,
  selectedProvince,
  highlightedProvince = null,
  selectedCampusId,
  onSelectCampus,
  travelTarget = null,
  onTravelComplete,
  suppressMapAnimations = false,
}: MapViewProps) {
  const { markUserInteracting } = useMapNavigationGuard();
  const [mapZoom, setMapZoom] = useState(THAILAND_ZOOM);

  const handleMarkerClick = (campus: Campus, event: L.LeafletMouseEvent) => {
    L.DomEvent.stopPropagation(event.originalEvent);
    markUserInteracting();
    onSelectCampus(campus);
  };

  const suppressBoundsUpdate = Boolean(
    travelTarget || suppressMapAnimations || selectedCampusId,
  );

  return (
    <div className="map-view">
      <MapContainer
        center={THAILAND_CENTER}
        zoom={THAILAND_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        className="map-view__map"
      >
        <ZoomControl position="bottomright" />
        <MapBoundsController
          campuses={campuses}
          selectedRegion={selectedRegion}
          selectedProvince={selectedProvince}
          selectedCampusId={selectedCampusId}
          suppressBoundsUpdate={suppressBoundsUpdate}
        />
        {travelTarget && onTravelComplete && (
          <MapTravelController
            travel={travelTarget}
            campuses={campuses}
            onComplete={onTravelComplete}
          />
        )}
        <MapFlyToBridge />
        <MapResizeController />
        <MapSheetTouchLockBridge />
        <MapZoomWatcher onZoomChange={setMapZoom} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ProvinceBoundariesLayer
          selectedProvince={highlightedProvince ?? selectedProvince}
          selectedRegion={selectedRegion}
        />
        {campuses.map((campus) => (
          <CampusMapMarker
            key={campus.id}
            campus={campus}
            mapZoom={mapZoom}
            isSelected={selectedCampusId === campus.id}
            onMarkerClick={handleMarkerClick}
          />
        ))}
      </MapContainer>
    </div>
  );
}
