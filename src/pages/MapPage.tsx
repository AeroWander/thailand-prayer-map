import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CampusExplorePanel,
  type ExplorePanelView,
} from '../components/CampusExplorePanel';
import { MapView } from '../components/MapView';
import { UniversitySearch } from '../components/UniversitySearch';
import { useCampuses } from '../context/CampusContext';
import {
  MapNavigationGuardProvider,
  useMapNavigationGuard,
} from '../context/MapNavigationGuard';
import { useLanguage } from '../i18n/LanguageContext';
import type { Campus } from '../types/campus';
import { isMapNavigationState, type MapNavigationState } from '../types/mapTravel';
import { filterCampusesBySearch } from '../utils/searchCampuses';

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
    return;
  }

  setters.setSelectedProvince(target.province);
  setters.setSelectedRegion('All');
  setters.setPanelView('list');
  setters.setSelectedCampusId(null);
}

function MapPageContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearUserInteracting, markPrayerUpdate } = useMapNavigationGuard();
  const { campuses, logPrayerWalk } = useCampuses();
  const { getCampusPrimaryName } = useLanguage();

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

  useEffect(() => {
    if (!isMapNavigationState(location.state)) {
      return;
    }

    applyArrivalUi(location.state, campuses, {
      setIsExploreOpen,
      setPanelView,
      setSelectedCampusId,
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

  const visibleCampuses = useMemo(
    () => filterCampusesBySearch(regionProvinceFiltered, searchQuery),
    [regionProvinceFiltered, searchQuery],
  );

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
      !visibleCampuses.some((campus) => campus.id === selectedCampusId) &&
      !campuses.some((campus) => campus.id === selectedCampusId) &&
      !travelTarget
    ) {
      setSelectedCampusId(null);
      setPanelView('list');
    }
  }, [visibleCampuses, campuses, selectedCampusId, travelTarget]);

  const openCampusDetail = useCallback((campus: Campus) => {
    setIsExploreOpen(true);
    setSelectedCampusId(campus.id);
    setPanelView('detail');
  }, []);

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
  }, [clearUserInteracting]);

  const handleTravelComplete = useCallback(() => {
    setTravelTarget(null);
    window.setTimeout(() => setIsPanelArrival(false), 500);
  }, []);

  const handleSearchSelect = useCallback(
    (campus: Campus) => {
      setSearchQuery(getCampusPrimaryName(campus));
      openCampusDetail(campus);
    },
    [getCampusPrimaryName, openCampusDetail],
  );

  return (
    <div className="app__content app__content--explore page-enter">
      <div
        className={
          isExploreOpen ? 'map-layout' : 'map-layout map-layout--panel-closed'
        }
      >
        <div className="map-layout__map">
          <MapView
            campuses={visibleCampuses}
            selectedRegion={selectedRegion}
            selectedProvince={selectedProvince}
            selectedCampusId={selectedCampusId}
            onSelectCampus={openCampusDetail}
            travelTarget={travelTarget}
            onTravelComplete={handleTravelComplete}
            suppressMapAnimations={isPanelArrival}
          />
          <div className="map-search-overlay">
            <UniversitySearch
              variant="floating"
              campuses={regionProvinceFiltered}
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={handleSearchSelect}
            />
          </div>
        </div>

        {isExploreOpen && (
          <CampusExplorePanel
            allCampuses={campuses}
            visibleCampuses={visibleCampuses}
            view={panelView}
            selectedCampus={selectedCampus}
            selectedCampusId={selectedCampusId}
            selectedRegion={selectedRegion}
            selectedProvince={selectedProvince}
            animateEntry={isPanelArrival}
            onRegionChange={setSelectedRegion}
            onProvinceChange={setSelectedProvince}
            onSelectCampus={openCampusDetail}
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
      <MapPageContent />
    </MapNavigationGuardProvider>
  );
}
