import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from 'react';

type MapNavigationGuardContextValue = {
  hasNavigatedRef: React.MutableRefObject<boolean>;
  userIsInteractingRef: React.MutableRefObject<boolean>;
  isPrayerUpdateRef: React.MutableRefObject<boolean>;
  markUserInteracting: () => void;
  clearUserInteracting: () => void;
  markPrayerUpdate: () => void;
};

const MapNavigationGuardContext = createContext<MapNavigationGuardContextValue | null>(null);

const USER_INTERACTION_MS = 3000;

export function MapNavigationGuardProvider({ children }: { children: ReactNode }) {
  const hasNavigatedRef = useRef(false);
  const userIsInteractingRef = useRef(false);
  const isPrayerUpdateRef = useRef(false);
  const interactTimeoutRef = useRef(0);

  const markPrayerUpdate = useCallback(() => {
    isPrayerUpdateRef.current = true;
  }, []);

  const markUserInteracting = useCallback(() => {
    userIsInteractingRef.current = true;
    window.clearTimeout(interactTimeoutRef.current);
    interactTimeoutRef.current = window.setTimeout(() => {
      userIsInteractingRef.current = false;
    }, USER_INTERACTION_MS);
  }, []);

  const clearUserInteracting = useCallback(() => {
    userIsInteractingRef.current = false;
    window.clearTimeout(interactTimeoutRef.current);
  }, []);

  return (
    <MapNavigationGuardContext.Provider
      value={{
        hasNavigatedRef,
        userIsInteractingRef,
        isPrayerUpdateRef,
        markUserInteracting,
        clearUserInteracting,
        markPrayerUpdate,
      }}
    >
      {children}
    </MapNavigationGuardContext.Provider>
  );
}

export function useMapNavigationGuard(): MapNavigationGuardContextValue {
  const context = useContext(MapNavigationGuardContext);
  if (!context) {
    throw new Error('useMapNavigationGuard must be used within MapNavigationGuardProvider');
  }
  return context;
}
