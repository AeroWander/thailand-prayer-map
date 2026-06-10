import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { useMap } from 'react-leaflet';
import type { Campus } from '../types/campus';
import { navigateToCampus } from '../utils/mapBounds';

type FlyToCampus = (campus: Campus) => void;

const MapFlyToContext = createContext<FlyToCampus | null>(null);
const MapFlyToRegistrarContext = createContext<MutableRefObject<FlyToCampus> | null>(null);

export function MapFlyToProvider({ children }: { children: ReactNode }) {
  const flyToRef = useRef<FlyToCampus>(() => {});

  const flyToCampus = useCallback((campus: Campus) => {
    flyToRef.current(campus);
  }, []);

  return (
    <MapFlyToContext.Provider value={flyToCampus}>
      <MapFlyToRegistrarContext.Provider value={flyToRef}>
        {children}
      </MapFlyToRegistrarContext.Provider>
    </MapFlyToContext.Provider>
  );
}

export function useMapFlyTo(): FlyToCampus {
  const flyToCampus = useContext(MapFlyToContext);
  if (!flyToCampus) {
    throw new Error('useMapFlyTo must be used within a MapFlyToProvider');
  }
  return flyToCampus;
}

export function MapFlyToBridge() {
  const map = useMap();
  const flyToRef = useContext(MapFlyToRegistrarContext);

  if (!flyToRef) {
    throw new Error('MapFlyToBridge must be used within a MapFlyToProvider');
  }

  useEffect(() => {
    flyToRef.current = (campus: Campus) => {
      navigateToCampus(map, campus);
    };

    return () => {
      flyToRef.current = () => {};
    };
  }, [flyToRef, map]);

  return null;
}
