import type { Campus } from '../types/campus';
import { useLanguage } from '../i18n/LanguageContext';
import type { PinTooltipTier } from '../utils/pinTooltipTier';

type CampusPinTooltipProps = {
  campus: Campus;
  tier: Exclude<PinTooltipTier, 'none'>;
};

export function CampusPinTooltip({ campus, tier }: CampusPinTooltipProps) {
  const { t, formatNumber, getCampusPrimaryName } = useLanguage();
  const name = getCampusPrimaryName(campus);

  if (tier === 'pill') {
    return <span className="campus-tooltip-pill">{name}</span>;
  }

  const prayerStatus = campus.prayedFor ? t.explore.campusKeyPrayed : t.explore.campusKeyNotPrayed;
  const studentsLine = t.explore.studentsCount.replace('{count}', formatNumber(campus.studentPopulation));
  const showHint = tier === 'full';
  const hintText = campus.prayedFor ? t.explore.pinHintThankYou : t.explore.pinHintBeFirst;

  return (
    <div className="campus-tooltip-card">
      <div className="campus-tooltip-card__body">
        <p className="campus-tooltip-card__title">{name}</p>
        <p className="campus-tooltip-card__stat">{prayerStatus}</p>
        <p className="campus-tooltip-card__stat">{studentsLine}</p>
      </div>
      {showHint && (
        <div
          className={
            campus.prayedFor
              ? 'campus-tooltip-card__hint campus-tooltip-card__hint--prayed'
              : 'campus-tooltip-card__hint campus-tooltip-card__hint--pending'
          }
        >
          {hintText}
        </div>
      )}
    </div>
  );
}
