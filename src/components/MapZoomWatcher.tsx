import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

type MapZoomWatcherProps = {
  onZoomChange: (zoom: number) => void;
};

export function MapZoomWatcher({ onZoomChange }: MapZoomWatcherProps) {
  const map = useMap();

  useEffect(() => {
    const updateZoom = () => onZoomChange(map.getZoom());

    map.on('zoom', updateZoom);
    map.on('zoomend', updateZoom);
    updateZoom();

    return () => {
      map.off('zoom', updateZoom);
      map.off('zoomend', updateZoom);
    };
  }, [map, onZoomChange]);

  return null;
}
