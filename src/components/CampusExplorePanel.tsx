import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useMobileMapOverlay } from '../hooks/useMobileMapOverlay';
import { useLanguage } from '../i18n/LanguageContext';
import type { Campus } from '../types/campus';
import { getMobileSheetPortalElement } from '../utils/mobileSheetPortal';
import { CampusDetailView } from './CampusDetailView';
import { CampusKey } from './CampusKey';
import { CampusList } from './CampusList';
import { ProvinceFilter } from './ProvinceFilter';
import { RegionFilter } from './RegionFilter';

export type ExplorePanelView = 'list' | 'detail';

type CampusExplorePanelProps = {
  allCampuses: Campus[];
  visibleCampuses: Campus[];
  view: ExplorePanelView;
  selectedCampus: Campus | null;
  listScrollCampusId: string | null;
  selectedRegion: string;
  selectedProvince: string;
  animateEntry?: boolean;
  onRegionChange: (region: string) => void;
  onProvinceChange: (province: string) => void;
  onSelectCampus: (campus: Campus) => void;
  onBackToList: () => void;
  onClose: () => void;
  onLogPrayerWalk: (campusId: string) => void;
  isMobile?: boolean;
};

export function CampusExplorePanel({
  allCampuses,
  visibleCampuses,
  view,
  selectedCampus,
  listScrollCampusId,
  selectedRegion,
  selectedProvince,
  animateEntry = false,
  onRegionChange,
  onProvinceChange,
  onSelectCampus,
  onBackToList,
  onClose,
  onLogPrayerWalk,
  isMobile = false,
}: CampusExplorePanelProps) {
  const { t } = useLanguage();
  const isDetail = view === 'detail' && selectedCampus;
  const isMobileList = isMobile && !isDetail;
  const panelRef = useRef<HTMLElement>(null);
  const { shieldTop } = useMobileMapOverlay({
    enabled: isMobileList,
    overlayRef: panelRef,
  });

  if (isMobile && isDetail) {
    return null;
  }

  const panelClassName = animateEntry
    ? `explore-panel explore-panel--arrival${isDetail ? ' explore-panel--detail' : ' explore-panel--list'}${isMobileList ? ' explore-panel--mobile-list' : ''}`
    : `explore-panel${isDetail ? ' explore-panel--detail' : ' explore-panel--list'}${isMobileList ? ' explore-panel--mobile-list' : ''}`;

  const panel = (
    <>
      {isMobileList && (
        <div
          className="mobile-sheet-portal__shield"
          style={{ top: shieldTop }}
          aria-hidden="true"
        />
      )}
      <aside ref={panelRef} className={panelClassName} aria-label={t.explore.panelAria}>
        {isDetail ? (
          <CampusDetailView
            campus={selectedCampus}
            onBack={onBackToList}
            onClose={onClose}
            onLogPrayerWalk={onLogPrayerWalk}
          />
        ) : (
          <>
            <button
              type="button"
              className="explore-panel__close"
              onClick={onClose}
              aria-label={t.explore.closeAria}
            >
              ×
            </button>

            <div className="explore-panel__body">
              <div
                className="explore-panel__scroll"
                onTouchMove={(event) => event.stopPropagation()}
              >
                <CampusKey />

                <div className="explore-panel__filters">
                  <RegionFilter
                    campuses={allCampuses}
                    value={selectedRegion}
                    onChange={onRegionChange}
                  />
                  <ProvinceFilter
                    campuses={allCampuses}
                    value={selectedProvince}
                    onChange={onProvinceChange}
                  />
                </div>

                <CampusList
                  campuses={visibleCampuses}
                  scrollToCampusId={listScrollCampusId}
                  onSelectCampus={onSelectCampus}
                />
              </div>
              <div className="explore-panel__scroll-fade" aria-hidden="true" />
            </div>
          </>
        )}
      </aside>
    </>
  );

  if (isMobileList) {
    return createPortal(panel, getMobileSheetPortalElement());
  }

  return panel;
}
