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
  isSheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  sheetOcclusionTop: number;
  setSheetOcclusionTop: (top: number) => void;
};

const MapSheetTouchLockContext = createContext<MapSheetTouchLockContextValue | null>(null);

export function MapSheetTouchLockProvider({ children }: { children: ReactNode }) {
  const [isSheetDragging, setIsSheetDragging] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetOcclusionTop, setSheetOcclusionTop] = useState(Number.POSITIVE_INFINITY);

  const setSheetDragging = useCallback((dragging: boolean) => {
    setIsSheetDragging(dragging);
  }, []);

  const setSheetOpen = useCallback((open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setSheetOcclusionTop(Number.POSITIVE_INFINITY);
    }
  }, []);

  const value = useMemo(
    () => ({
      isSheetDragging,
      setSheetDragging,
      isSheetOpen,
      setSheetOpen,
      sheetOcclusionTop,
      setSheetOcclusionTop,
    }),
    [
      isSheetDragging,
      setSheetDragging,
      isSheetOpen,
      setSheetOpen,
      sheetOcclusionTop,
      setSheetOcclusionTop,
    ],
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
