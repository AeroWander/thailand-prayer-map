import { useLanguage } from '../i18n/LanguageContext';
import type { CampusStats } from '../utils/stats';

type StatsBarProps = {
  stats: CampusStats;
};

export function StatsBar({ stats }: StatsBarProps) {
  const { t } = useLanguage();

  return (
    <div className="stats-bar" aria-label={t.stats.ariaLabel}>
      <div className="stats-bar__item">
        <span className="stats-bar__value">{stats.total}</span>
        <span className="stats-bar__label">{stats.campusesLabel}</span>
      </div>

      <div className="stats-bar__item">
        <span className="stats-bar__value stats-bar__value--prayed">{stats.prayedFor}</span>
        <span className="stats-bar__label">{t.stats.prayedFor}</span>
      </div>

      <div className="stats-bar__item">
        <span className="stats-bar__value">{stats.goalProgressPercent}%</span>
        <span className="stats-bar__label stats-bar__goal-detail">{stats.goalDetailLabel}</span>
      </div>
    </div>
  );
}
