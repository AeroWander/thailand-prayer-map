import { useLanguage } from '../i18n/LanguageContext';
import type { Campus } from '../types/campus';
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
  selectedCampusId: string | null;
  selectedRegion: string;
  selectedProvince: string;
  animateEntry?: boolean;
  onRegionChange: (region: string) => void;
  onProvinceChange: (province: string) => void;
  onSelectCampus: (campus: Campus) => void;
  onBackToList: () => void;
  onClose: () => void;
  onLogPrayerWalk: (campusId: string) => void;
};

export function CampusExplorePanel({
  allCampuses,
  visibleCampuses,
  view,
  selectedCampus,
  selectedCampusId,
  selectedRegion,
  selectedProvince,
  animateEntry = false,
  onRegionChange,
  onProvinceChange,
  onSelectCampus,
  onBackToList,
  onClose,
  onLogPrayerWalk,
}: CampusExplorePanelProps) {
  const { t } = useLanguage();
  const isDetail = view === 'detail' && selectedCampus;

  return (
    <aside
      className={
        animateEntry
          ? `explore-panel explore-panel--arrival${isDetail ? ' explore-panel--detail' : ' explore-panel--list'}`
          : `explore-panel${isDetail ? ' explore-panel--detail' : ' explore-panel--list'}`
      }
      aria-label={t.explore.panelAria}
    >
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
            <div className="explore-panel__scroll">
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
                selectedCampusId={selectedCampusId}
                onSelectCampus={onSelectCampus}
              />
            </div>
            <div className="explore-panel__scroll-fade" aria-hidden="true" />
          </div>
        </>
      )}
    </aside>
  );
}
