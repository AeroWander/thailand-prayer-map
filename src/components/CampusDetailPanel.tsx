import { useLanguage } from '../i18n/LanguageContext';
import type { Campus } from '../types/campus';
import { CampusMiniMap } from './CampusMiniMap';

type CampusDetailPanelProps = {
  campus: Campus;
  isOpen: boolean;
  onClose: () => void;
  onLogPrayerWalk: (campusId: string) => void;
};

export function CampusDetailPanel({
  campus,
  isOpen,
  onClose,
  onLogPrayerWalk,
}: CampusDetailPanelProps) {
  const {
    t,
    formatNumber,
    getCampusPrimaryName,
    getCampusSecondaryName,
    getRegionLabel,
    getProvinceLabel,
    getInstitutionTypeLabel,
  } = useLanguage();

  const secondaryName = getCampusSecondaryName(campus);

  return (
    <aside
      className={`campus-panel${isOpen ? ' campus-panel--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="campus-panel-title"
    >
      <CampusMiniMap campus={campus} isPanelOpen={isOpen} />

      <div className="campus-panel__handle" aria-hidden="true" />

      <button
        type="button"
        className="campus-panel__close"
        onClick={onClose}
        aria-label={t.panel.closeAria}
      >
        ×
      </button>

      <div className="campus-panel__body">
        <div className="campus-panel__scroll-wrap">
          <div className="campus-panel__scroll">
            <header className="campus-panel__intro">
              <h2 id="campus-panel-title" className="campus-panel__name">
                {getCampusPrimaryName(campus)}
              </h2>
              {secondaryName && (
                <p className="campus-panel__name-th">{secondaryName}</p>
              )}
              <span
                className={
                  campus.prayedFor
                    ? 'campus-panel__badge campus-panel__badge--prayed'
                    : 'campus-panel__badge campus-panel__badge--pending'
                }
              >
                {campus.prayedFor ? t.panel.prayedFor : t.panel.notYetPrayedFor}
              </span>
            </header>

            <ul className="campus-panel__facts">
              <li>
                <span>{t.panel.province}</span>
                <span>{getProvinceLabel(campus.province)}</span>
              </li>
              <li>
                <span>{t.panel.region}</span>
                <span>{getRegionLabel(campus.region)}</span>
              </li>
              <li>
                <span>{t.panel.type}</span>
                <span>{getInstitutionTypeLabel(campus.type)}</span>
              </li>
              <li>
                <span>{t.panel.students}</span>
                <span>{formatNumber(campus.studentPopulation)}</span>
              </li>
              <li>
                <span>{t.panel.founded}</span>
                <span>{campus.foundingYear}</span>
              </li>
            </ul>

            <a
              className="campus-panel__website"
              href={campus.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.panel.visitWebsite}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="campus-panel__scroll-fade" aria-hidden="true" />
        </div>

        <footer className="campus-panel__footer">
          {campus.prayedFor ? (
            <p className="campus-panel__prayed-note">{t.panel.prayerWalkLogged}</p>
          ) : (
            <button
              type="button"
              className="btn btn--accent campus-panel__prayer-btn"
              onClick={() => onLogPrayerWalk(campus.id)}
            >
              {t.panel.logPrayerWalk}
            </button>
          )}
        </footer>
      </div>
    </aside>
  );
}
