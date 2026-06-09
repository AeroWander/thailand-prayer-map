import { useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { interpolate } from '../i18n/translations';
import type { Campus } from '../types/campus';

type CampusListProps = {
  campuses: Campus[];
  selectedCampusId: string | null;
  onSelectCampus: (campus: Campus) => void;
};

export function CampusList({ campuses, selectedCampusId, onSelectCampus }: CampusListProps) {
  const {
    t,
    formatNumber,
    getCampusPrimaryName,
    getProvinceLabel,
    getRegionLabel,
  } = useLanguage();
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const sortedCampuses = useMemo(
    () =>
      [...campuses].sort((a, b) =>
        getCampusPrimaryName(a).localeCompare(getCampusPrimaryName(b), undefined, {
          sensitivity: 'base',
        }),
      ),
    [campuses, getCampusPrimaryName],
  );

  useEffect(() => {
    if (!selectedCampusId) {
      return;
    }

    const item = itemRefs.current.get(selectedCampusId);
    item?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedCampusId, sortedCampuses]);

  return (
    <ul className="campus-list" aria-label={t.explore.campusListAria}>
      {sortedCampuses.map((campus) => {
        const isSelected = selectedCampusId === campus.id;

        return (
          <li
            key={campus.id}
            ref={(node) => {
              if (node) {
                itemRefs.current.set(campus.id, node);
              } else {
                itemRefs.current.delete(campus.id);
              }
            }}
          >
            <button
              type="button"
              className={
                isSelected
                  ? 'campus-list__item campus-list__item--selected'
                  : 'campus-list__item'
              }
              onClick={() => onSelectCampus(campus)}
              aria-current={isSelected ? 'true' : undefined}
            >
              <span className="campus-list__main">
                <span className="campus-list__name">{getCampusPrimaryName(campus)}</span>
                <span className="campus-list__meta">
                  {getProvinceLabel(campus.province)} · {getRegionLabel(campus.region)}
                </span>
                <span className="campus-list__students">
                  {interpolate(t.explore.studentsCount, {
                    count: formatNumber(campus.studentPopulation),
                  })}
                </span>
              </span>
              <span
                className={
                  campus.prayedFor
                    ? 'campus-list__badge campus-list__badge--prayed'
                    : 'campus-list__badge campus-list__badge--pending'
                }
              >
                {campus.prayedFor ? t.explore.prayed : t.explore.notPrayed}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
