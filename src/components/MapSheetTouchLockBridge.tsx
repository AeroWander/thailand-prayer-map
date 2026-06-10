import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useMapSheetTouchLock } from '../context/MapSheetTouchLockContext';

function isTouchInSheetZone(clientY: number, sheetOcclusionTop: number): boolean {
  return clientY >= sheetOcclusionTop;
}

export function MapSheetTouchLockBridge() {
  const map = useMap();
  const { isSheetDragging, isSheetOpen, sheetOcclusionTop } = useMapSheetTouchLock();

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

  useEffect(() => {
    if (!isSheetOpen || !Number.isFinite(sheetOcclusionTop)) {
      return;
    }

    const container = map.getContainer();
    const portal = document.getElementById('mobile-sheet-portal');

    const blockSheetZoneTouch = (event: TouchEvent) => {
      const touch = event.touches[0] ?? event.changedTouches[0];
      if (!touch || !isTouchInSheetZone(touch.clientY, sheetOcclusionTop)) {
        return;
      }

      const target = event.target;
      if (target instanceof Node && portal?.contains(target)) {
        return;
      }

      event.stopPropagation();
      event.preventDefault();
    };

    container.addEventListener('touchstart', blockSheetZoneTouch, { capture: true, passive: false });
    container.addEventListener('touchmove', blockSheetZoneTouch, { capture: true, passive: false });
    document.addEventListener('touchstart', blockSheetZoneTouch, { capture: true, passive: false });
    document.addEventListener('touchmove', blockSheetZoneTouch, { capture: true, passive: false });

    return () => {
      container.removeEventListener('touchstart', blockSheetZoneTouch, { capture: true });
      container.removeEventListener('touchmove', blockSheetZoneTouch, { capture: true });
      document.removeEventListener('touchstart', blockSheetZoneTouch, { capture: true });
      document.removeEventListener('touchmove', blockSheetZoneTouch, { capture: true });
    };
  }, [isSheetOpen, map, sheetOcclusionTop]);

  return null;
}
