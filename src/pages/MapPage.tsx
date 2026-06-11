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
import { useLanguage } from '../i18n/LanguageContext';
import { MapFlyToProvider, useMapFlyTo } from '../context/MapFlyToContext';
import { MapSheetTouchLockProvider } from '../context/MapSheetTouchLockContext';
import {
  MapNavigationGuardProvider,
  useMapNavigationGuard,
} from '../context/MapNavigationGuard';
import type { Campus } from '../types/campus';
import { isMapNavigationState, type MapNavigationState } from '../types/mapTravel';
import { buildMapNavigationState } from '../utils/mapNavigation';
import type { LocationSearchResult } from '../utils/searchLocations';

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
    setHighlightedProvince: (province: string | null) => void;
  },
  isMobile: boolean,
) {
  setters.setIsPanelArrival(true);
  // On mobile never open the explore panel — campus goes to the bottom sheet,
  // province/city arrivals just zoom the map with the boundary highlighted.
  const openExplore = !isMobile;
  setters.setIsExploreOpen(openExplore);

  if (target.type === 'campus') {
    const campus = findCampusFromTravel(campuses, target);
    setters.setPanelView('detail');
    setters.setSelectedCampusId(campus?.id ?? null);
    setters.setListScrollCampusId(campus?.id ?? null);
    return;
  }

  // target.type === 'province' | 'city'
  // Province or city arrival: highlight the province boundary as a visual landmark
  // but do NOT filter campus pins — all campuses across Thailand remain visible.
  // For cities we fall back to their parent province boundary since no district
  // GeoJSON is available yet.
  setters.setSelectedProvince('All');
  setters.setSelectedRegion('All');
  setters.setHighlightedProvince(target.province);
  setters.setPanelView('list');
  setters.setSelectedCampusId(null);
  setters.setListScrollCampusId(null);
}

function MapPageContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearUserInteracting, markPrayerUpdate } = useMapNavigationGuard();
  const flyToCampus = useMapFlyTo();
  const { getCampusPrimaryName, getProvinceLabel } = useLanguage();
  const { campuses, logPrayerWalk } = useCampuses();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const searchOverlayRef = useRef<HTMLDivElement>(null);
  const [searchOpacity, setSearchOpacity] = useState(1);
  const initialTravel = isMapNavigationState(location.state) ? location.state : null;

  const [selectedProvince, setSelectedProvince] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  // Tracks the province to outline on the map after a search-box navigation.
  // Unlike selectedProvince this does NOT filter campus pins — all pins stay visible.
  const [highlightedProvince, setHighlightedProvince] = useState<string | null>(() =>
    initialTravel?.type === 'province' ? initialTravel.province : null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [travelTarget, setTravelTarget] = useState<MapNavigationState | null>(initialTravel);
  const [isPanelArrival, setIsPanelArrival] = useState(Boolean(initialTravel));
  const [isExploreOpen, setIsExploreOpen] = useState(() => {
    if (initialTravel) {
      const onMobile =
        typeof window !== 'undefined' && window.matchMedia(MOBILE_MEDIA_QUERY).matches;
      // On mobile never open the explore panel on arrival — campus uses the bottom
      // sheet, province/city arrivals just zoom the map with the boundary shown.
      if (onMobile) {
        return false;
      }
      return true;
    }

    if (typeof window !== 'undefined' && window.matchMedia(MOBILE_MEDIA_QUERY).matches) {
      return false;
    }

    return true;
  });
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

    applyArrivalUi(
      location.state,
      campuses,
      {
        setIsExploreOpen,
        setPanelView,
        setSelectedCampusId,
        setListScrollCampusId,
        setSelectedProvince,
        setSelectedRegion,
        setIsPanelArrival,
        setHighlightedProvince,
      },
      isMobile,
    );
    setTravelTarget(location.state);
    navigate('/map', { replace: true, state: null });
  }, [location.state, navigate, campuses, isMobile]);

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

  const selectedCampus = useMemo(() => {
    if (!selectedCampusId) {
      return null;
    }

    return (
      regionProvinceFiltered.find((campus) => campus.id === selectedCampusId) ??
      campuses.find((campus) => campus.id === selectedCampusId) ??
      null
    );
  }, [selectedCampusId, regionProvinceFiltered, campuses]);

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

  const openCampusDetail = useCallback(
    (campus: Campus) => {
      setIsExploreOpen(!isMobile);
      setSelectedCampusId(campus.id);
      setListScrollCampusId(campus.id);
      setPanelView('detail');
    },
    [isMobile],
  );

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

  // Panel filter callbacks — clear the search-arrival boundary highlight so the
  // panel filter's own province/region takes visual control.
  const handleProvinceChange = useCallback((province: string) => {
    setSelectedProvince(province);
    setHighlightedProvince(null);
  }, []);

  const handleRegionChange = useCallback((region: string) => {
    setSelectedRegion(region);
    setHighlightedProvince(null);
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

  const handleSearchSelectResult = useCallback(
    (result: LocationSearchResult) => {
      setSearchQuery('');
      if (result.kind === 'campus') {
        selectCampus(result.campus);
        return;
      }
      // Province or city result from the floating map search.
      // Set the boundary highlight and trigger the map travel animation.
      const state = buildMapNavigationState(result, campuses, getCampusPrimaryName, getProvinceLabel);
      setHighlightedProvince(state.province);
      setSelectedProvince('All');
      setSelectedRegion('All');
      setTravelTarget(state);
      setIsPanelArrival(true);
      if (isMobile) {
        setIsExploreOpen(false);
      } else {
        setIsExploreOpen(true);
        setPanelView('list');
      }
    },
    [selectCampus, campuses, getCampusPrimaryName, getProvinceLabel, isMobile],
  );

  return (
    <div className="app__content app__content--explore">
      <div
        className={
          isMobile
            ? `map-layout map-layout--mobile${
                panelView === 'detail' && selectedCampus ? ' map-layout--sheet-open' : ''
              }`
            : isExploreOpen
              ? 'map-layout'
              : 'map-layout map-layout--panel-closed'
        }
      >
        <div className="map-layout__map">
          <MapView
            campuses={regionProvinceFiltered}
            selectedRegion={selectedRegion}
            selectedProvince={selectedProvince}
            highlightedProvince={highlightedProvince}
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
              onSelectResult={handleSearchSelectResult}
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
            visibleCampuses={regionProvinceFiltered}
            view={panelView}
            selectedCampus={selectedCampus}
            listScrollCampusId={listScrollCampusId}
            selectedRegion={selectedRegion}
            selectedProvince={selectedProvince}
            animateEntry={isPanelArrival}
            onRegionChange={handleRegionChange}
            onProvinceChange={handleProvinceChange}
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
        <MapSheetTouchLockProvider>
          <MapPageContent />
        </MapSheetTouchLockProvider>
      </MapFlyToProvider>
    </MapNavigationGuardProvider>
  );
}
