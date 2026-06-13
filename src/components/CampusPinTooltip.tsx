import type { Campus } from '../types/campus';
import { useLanguage } from '../i18n/LanguageContext';

type CampusPinTooltipProps = {
  campus: Campus;
};

export function CampusPinTooltip({ campus }: CampusPinTooltipProps) {
  const { t, formatNumber, getCampusPrimaryName } = useLanguage();

  const prayerStatus = campus.prayedFor ? t.explore.campusKeyPrayed : t.explore.campusKeyNotPrayed;
  const studentsLine = t.explore.studentsCount.replace('{count}', formatNumber(campus.studentPopulation));
  const hintText = campus.prayedFor ? t.explore.pinHintThankYou : t.explore.pinHintBeFirst;

  return (
    <div className="campus-tooltip-card">
      <div className="campus-tooltip-card__body">
        <p className="campus-tooltip-card__title">{getCampusPrimaryName(campus)}</p>
        <p className="campus-tooltip-card__stat">{prayerStatus}</p>
        <p className="campus-tooltip-card__stat">{studentsLine}</p>
      </div>
      <div
        className={
          campus.prayedFor
            ? 'campus-tooltip-card__hint campus-tooltip-card__hint--prayed'
            : 'campus-tooltip-card__hint campus-tooltip-card__hint--pending'
        }
      >
        {hintText}
      </div>
    </div>
  );
}
