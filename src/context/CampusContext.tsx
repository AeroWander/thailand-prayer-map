import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { campuses as initialCampuses } from '../data/campuses';
import { supabase } from '../lib/supabase';
import type { Campus } from '../types/campus';

type CampusContextValue = {
  campuses: Campus[];
  isLoadingPrayerWalks: boolean;
  logPrayerWalk: (campusId: string) => void;
  totalCampuses: number;
  prayedCount: number;
  remainingCount: number;
};

const CampusContext = createContext<CampusContextValue | null>(null);

function applyPrayedCampusIds(campuses: Campus[], prayedIds: Set<string>): Campus[] {
  if (prayedIds.size === 0) {
    return campuses;
  }

  return campuses.map((campus) =>
    prayedIds.has(campus.id) ? { ...campus, prayedFor: true } : campus,
  );
}

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [campuses, setCampuses] = useState(initialCampuses);
  const [isLoadingPrayerWalks, setIsLoadingPrayerWalks] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPrayerWalks() {
      try {
        const { data, error } = await supabase.from('prayer_walks').select('campus_id');

        if (cancelled) {
          return;
        }

        if (error) {
          console.warn('Unable to load prayer walks from Supabase:', error.message);
          return;
        }

        const prayedIds = new Set((data ?? []).map((row) => row.campus_id));
        setCampuses((current) => applyPrayedCampusIds(current, prayedIds));
      } catch (error) {
        if (!cancelled) {
          console.warn('Unable to load prayer walks from Supabase:', error);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPrayerWalks(false);
        }
      }
    }

    void loadPrayerWalks();

    return () => {
      cancelled = true;
    };
  }, []);

  const logPrayerWalk = useCallback((campusId: string) => {
    setCampuses((current) =>
      current.map((campus) =>
        campus.id === campusId ? { ...campus, prayedFor: true } : campus,
      ),
    );

    void (async () => {
      const { error } = await supabase
        .from('prayer_walks')
        .insert({ campus_id: campusId });

      if (error) {
        console.warn('Unable to save prayer walk to Supabase:', error.message);
      }
    })();
  }, []);

  const value = useMemo(() => {
    const prayedCount = campuses.filter((campus) => campus.prayedFor).length;

    return {
      campuses,
      isLoadingPrayerWalks,
      logPrayerWalk,
      totalCampuses: campuses.length,
      prayedCount,
      remainingCount: campuses.length - prayedCount,
    };
  }, [campuses, isLoadingPrayerWalks, logPrayerWalk]);

  return (
    <CampusContext.Provider value={value}>
      {isLoadingPrayerWalks && (
        <div className="prayer-walks-loading" role="status" aria-live="polite" aria-busy="true">
          <div className="prayer-walks-loading__bar" aria-hidden="true" />
        </div>
      )}
      {children}
    </CampusContext.Provider>
  );
}

export function useCampuses() {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampuses must be used within CampusProvider');
  }
  return context;
}
