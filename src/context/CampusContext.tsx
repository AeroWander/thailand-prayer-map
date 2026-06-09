import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { campuses as initialCampuses } from '../data/campuses';
import type { Campus } from '../types/campus';

type CampusContextValue = {
  campuses: Campus[];
  logPrayerWalk: (campusId: string) => void;
  totalCampuses: number;
  prayedCount: number;
  remainingCount: number;
};

const CampusContext = createContext<CampusContextValue | null>(null);

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [campuses, setCampuses] = useState(initialCampuses);

  const logPrayerWalk = useCallback((campusId: string) => {
    setCampuses((current) =>
      current.map((campus) =>
        campus.id === campusId ? { ...campus, prayedFor: true } : campus,
      ),
    );
  }, []);

  const value = useMemo(() => {
    const prayedCount = campuses.filter((campus) => campus.prayedFor).length;

    return {
      campuses,
      logPrayerWalk,
      totalCampuses: campuses.length,
      prayedCount,
      remainingCount: campuses.length - prayedCount,
    };
  }, [campuses, logPrayerWalk]);

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
}

export function useCampuses() {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampuses must be used within CampusProvider');
  }
  return context;
}
