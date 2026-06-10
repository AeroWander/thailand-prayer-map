import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { shouldIgnoreViewportResize } from '../utils/viewport';

type LeafletMapWithResize = L.Map & {
  _onResize?: () => void;
};

export function MapResizeController() {
  const map = useMap();
  const lastSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const leafletMap = map as LeafletMapWithResize;

    const detachLeafletResize = () => {
      if (leafletMap._onResize) {
        window.removeEventListener('resize', leafletMap._onResize);
      }
    };

    if (map.whenReady) {
      map.whenReady(detachLeafletResize);
    } else {
      detachLeafletResize();
    }

    const syncSize = () => {
      const container = map.getContainer();
      lastSizeRef.current = {
        width: container.clientWidth,
        height: container.clientHeight,
      };
    };

    syncSize();

    const handleResize = () => {
      if (shouldIgnoreViewportResize()) {
        return;
      }

      const container = map.getContainer();
      const nextSize = {
        width: container.clientWidth,
        height: container.clientHeight,
      };
      const lastSize = lastSizeRef.current;

      if (
        Math.abs(nextSize.width - lastSize.width) < 2 &&
        Math.abs(nextSize.height - lastSize.height) < 2
      ) {
        return;
      }

      lastSizeRef.current = nextSize;
      map.invalidateSize({ animate: false });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return null;
}
