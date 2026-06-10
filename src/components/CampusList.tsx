import { useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { interpolate } from '../i18n/translations';
import type { Campus } from '../types/campus';

type CampusListProps = {
  campuses: Campus[];
  scrollToCampusId: string | null;
  onSelectCampus: (campus: Campus) => void;
};

export function CampusList({ campuses, scrollToCampusId, onSelectCampus }: CampusListProps) {
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
    if (!scrollToCampusId) {
      return;
    }

    const item = itemRefs.current.get(scrollToCampusId);
    requestAnimationFrame(() => {
      item?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }, [scrollToCampusId, sortedCampuses]);

  return (
    <ul className="campus-list" aria-label={t.explore.campusListAria}>
      {sortedCampuses.map((campus) => {
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
              className="campus-list__item"
              onClick={() => onSelectCampus(campus)}
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
