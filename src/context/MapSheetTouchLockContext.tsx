import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type MapSheetTouchLockContextValue = {
  isSheetDragging: boolean;
  setSheetDragging: (dragging: boolean) => void;
};

const MapSheetTouchLockContext = createContext<MapSheetTouchLockContextValue | null>(null);

export function MapSheetTouchLockProvider({ children }: { children: ReactNode }) {
  const [isSheetDragging, setIsSheetDragging] = useState(false);

  const setSheetDragging = useCallback((dragging: boolean) => {
    setIsSheetDragging(dragging);
  }, []);

  const value = useMemo(
    () => ({
      isSheetDragging,
      setSheetDragging,
    }),
    [isSheetDragging, setSheetDragging],
  );

  return (
    <MapSheetTouchLockContext.Provider value={value}>
      {children}
    </MapSheetTouchLockContext.Provider>
  );
}

export function useMapSheetTouchLock(): MapSheetTouchLockContextValue {
  const context = useContext(MapSheetTouchLockContext);
  if (!context) {
    throw new Error('useMapSheetTouchLock must be used within a MapSheetTouchLockProvider');
  }
  return context;
}
