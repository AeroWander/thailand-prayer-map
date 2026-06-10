import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CampusExplorePanel,
  type ExplorePanelView,
} from '../components/CampusExplorePanel';
import { CampusMobileBottomSheet } from '../components/CampusMobileBottomSheet';
import { MapView } from '../components/MapView';
import { UniversitySearch } from '../components/UniversitySearch';
import { MOBILE_MEDIA_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { useCampuses } from '../context/CampusContext';
import { MapFlyToProvider, useMapFlyTo } from '../context/MapFlyToContext';
import {
  MapNavigationGuardProvider,
  useMapNavigationGuard,
} from '../context/MapNavigationGuard';
import type { Campus } from '../types/campus';
import { isMapNavigationState, type MapNavigationState } from '../types/mapTravel';

function findCampusFromTravel(
  campuses: Campus[],
  target: MapNavigationState,
): Campus | undefined {
  if (target.campusId) {
    const byId = campuses.find((item) => item.id === target.campusId);
    if (byId) {
      return byId;
    }
  }

  return (
    campuses.find((item) => item.name.toLowerCase() === target.name.toLowerCase()) ??
    campuses.find((item) => item.name.toLowerCase().includes(target.name.toLowerCase()))
  );
}

function applyArrivalUi(
  target: MapNavigationState,
  campuses: Campus[],
  setters: {
    setIsExploreOpen: (open: boolean) => void;
    setPanelView: (view: ExplorePanelView) => void;
    setSelectedCampusId: (id: string | null) => void;
    setListScrollCampusId: (id: string | null) => void;
    setSelectedProvince: (province: string) => void;
    setSelectedRegion: (region: string) => void;
    setIsPanelArrival: (arrival: boolean) => void;
  },
) {
  setters.setIsPanelArrival(true);
  setters.setIsExploreOpen(true);

  if (target.type === 'campus') {
    const campus = findCampusFromTravel(campuses, target);
    setters.setPanelView('detail');
    setters.setSelectedCampusId(campus?.id ?? null);
    setters.setListScrollCampusId(campus?.id ?? null);
    return;
  }

  setters.setSelectedProvince(target.province);
  setters.setSelectedRegion('All');
  setters.setPanelView('list');
  setters.setSelectedCampusId(null);
  setters.setListScrollCampusId(null);
}

function MapPageContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearUserInteracting, markPrayerUpdate } = useMapNavigationGuard();
  const flyToCampus = useMapFlyTo();
  const { campuses, logPrayerWalk } = useCampuses();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const searchOverlayRef = useRef<HTMLDivElement>(null);
  const [searchOpacity, setSearchOpacity] = useState(1);
  const initialTravel = isMapNavigationState(location.state) ? location.state : null;

  const [selectedProvince, setSelectedProvince] = useState(() =>
    initialTravel?.type === 'province' ? initialTravel.province : 'All',
  );
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [travelTarget, setTravelTarget] = useState<MapNavigationState | null>(initialTravel);
  const [isPanelArrival, setIsPanelArrival] = useState(Boolean(initialTravel));
  const [isExploreOpen, setIsExploreOpen] = useState(true);
  const [panelView, setPanelView] = useState<ExplorePanelView>(() => {
    if (initialTravel?.type === 'campus') {
      return 'detail';
    }
    return 'list';
  });
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(() => {
    if (initialTravel?.type === 'campus') {
      return findCampusFromTravel(campuses, initialTravel)?.id ?? initialTravel.campusId ?? null;
    }
    return null;
  });
  const [listScrollCampusId, setListScrollCampusId] = useState<string | null>(() => {
    if (initialTravel?.type === 'campus') {
      return findCampusFromTravel(campuses, initialTravel)?.id ?? initialTravel.campusId ?? null;
    }
    return null;
  });

  useEffect(() => {
    if (!isMapNavigationState(location.state)) {
      return;
    }

    applyArrivalUi(location.state, campuses, {
      setIsExploreOpen,
      setPanelView,
      setSelectedCampusId,
      setListScrollCampusId,
      setSelectedProvince,
      setSelectedRegion,
      setIsPanelArrival,
    });
    setTravelTarget(location.state);
    navigate('/map', { replace: true, state: null });
  }, [location.state, navigate, campuses]);

  const handleLogPrayerWalk = useCallback(
    (campusId: string) => {
      markPrayerUpdate();
      logPrayerWalk(campusId);
    },
    [logPrayerWalk, markPrayerUpdate],
  );

  const regionProvinceFiltered = useMemo(() => {
    return campuses.filter((campus) => {
      const matchesProvince =
        selectedProvince === 'All' || campus.province === selectedProvince;
      const matchesRegion =
        selectedRegion === 'All' || campus.region === selectedRegion;

      return matchesProvince && matchesRegion;
    });
  }, [campuses, selectedProvince, selectedRegion]);

  const visibleCampuses = regionProvinceFiltered;

  const selectedCampus = useMemo(() => {
    if (!selectedCampusId) {
      return null;
    }

    return (
      visibleCampuses.find((campus) => campus.id === selectedCampusId) ??
      campuses.find((campus) => campus.id === selectedCampusId) ??
      null
    );
  }, [selectedCampusId, visibleCampuses, campuses]);

  useEffect(() => {
    if (
      selectedCampusId &&
      !campuses.some((campus) => campus.id === selectedCampusId) &&
      !travelTarget
    ) {
      setSelectedCampusId(null);
      setPanelView('list');
    }
  }, [campuses, selectedCampusId, travelTarget]);

  const openCampusDetail = useCallback((campus: Campus) => {
    setIsExploreOpen(true);
    setSelectedCampusId(campus.id);
    setListScrollCampusId(campus.id);
    setPanelView('detail');
  }, []);

  const selectCampus = useCallback(
    (campus: Campus) => {
      flyToCampus(campus);
      openCampusDetail(campus);
    },
    [flyToCampus, openCampusDetail],
  );

  const showAllCampuses = useCallback(() => {
    setPanelView('list');
    setSelectedCampusId(null);
  }, []);

  const closeExplore = useCallback(() => {
    clearUserInteracting();
    setIsExploreOpen(false);
    setSelectedCampusId(null);
    setPanelView('list');
    setIsPanelArrival(false);
    setSearchOpacity(1);
  }, [clearUserInteracting]);

  const handleMobileSheetDismiss = useCallback(() => {
    setSelectedCampusId(null);
    setPanelView('list');
    setIsExploreOpen(false);
    setSearchOpacity(1);
  }, []);

  const handleSheetTopChange = useCallback((sheetTop: number) => {
    const searchBottom = searchOverlayRef.current?.getBoundingClientRect().bottom;

    if (searchBottom === undefined) {
      setSearchOpacity(1);
      return;
    }

    const fadeStart = searchBottom + 120;

    if (sheetTop >= fadeStart) {
      setSearchOpacity(1);
      return;
    }

    if (sheetTop <= searchBottom) {
      setSearchOpacity(0);
      return;
    }

    setSearchOpacity((sheetTop - searchBottom) / 120);
  }, []);

  const handleTravelComplete = useCallback(() => {
    setTravelTarget(null);
    window.setTimeout(() => setIsPanelArrival(false), 500);
  }, []);

  const handleSearchSelect = useCallback(
    (campus: Campus) => {
      setSearchQuery('');
      selectCampus(campus);
    },
    [selectCampus],
  );

  return (
    <div className="app__content app__content--explore page-enter">
      <div
        className={
          isMobile
            ? 'map-layout map-layout--mobile'
            : isExploreOpen
              ? 'map-layout'
              : 'map-layout map-layout--panel-closed'
        }
      >
        <div className="map-layout__map">
          <MapView
            campuses={visibleCampuses}
            selectedRegion={selectedRegion}
            selectedProvince={selectedProvince}
            selectedCampusId={selectedCampusId}
            onSelectCampus={selectCampus}
            travelTarget={travelTarget}
            onTravelComplete={handleTravelComplete}
            suppressMapAnimations={isPanelArrival}
          />
          <div
            ref={searchOverlayRef}
            className="map-search-overlay"
            style={{
              opacity: isMobile ? searchOpacity : 1,
              transition: isMobile ? 'opacity 0.2s ease' : undefined,
              pointerEvents: isMobile && searchOpacity === 0 ? 'none' : undefined,
            }}
          >
            <UniversitySearch
              variant="floating"
              campuses={campuses}
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={handleSearchSelect}
              clearOnSelect
            />
          </div>

          {isMobile && panelView === 'detail' && selectedCampus && (
            <CampusMobileBottomSheet
              campus={selectedCampus}
              onDismiss={handleMobileSheetDismiss}
              onLogPrayerWalk={handleLogPrayerWalk}
              onSheetTopChange={handleSheetTopChange}
            />
          )}
        </div>

        {isExploreOpen && (!isMobile || panelView === 'list') && (
          <CampusExplorePanel
            isMobile={isMobile}
            allCampuses={campuses}
            visibleCampuses={visibleCampuses}
            view={panelView}
            selectedCampus={selectedCampus}
            listScrollCampusId={listScrollCampusId}
            selectedRegion={selectedRegion}
            selectedProvince={selectedProvince}
            animateEntry={isPanelArrival}
            onRegionChange={setSelectedRegion}
            onProvinceChange={setSelectedProvince}
            onSelectCampus={selectCampus}
            onBackToList={showAllCampuses}
            onClose={closeExplore}
            onLogPrayerWalk={handleLogPrayerWalk}
          />
        )}
      </div>
    </div>
  );
}

export function MapPage() {
  return (
    <MapNavigationGuardProvider>
      <MapFlyToProvider>
        <MapPageContent />
      </MapFlyToProvider>
    </MapNavigationGuardProvider>
  );
}
