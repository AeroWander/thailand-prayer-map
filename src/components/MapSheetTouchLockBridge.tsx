import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useMapSheetTouchLock } from '../context/MapSheetTouchLockContext';

export function MapSheetTouchLockBridge() {
  const map = useMap();
  const { isSheetDragging } = useMapSheetTouchLock();

  useEffect(() => {
    if (!isSheetDragging) {
      return;
    }

    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();

    return () => {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
    };
  }, [isSheetDragging, map]);

  return null;
}
