import { useLanguage } from '../i18n/LanguageContext';
import type { CampusStats } from '../utils/stats';

type PanelStatsHeadlineProps = {
  stats: CampusStats;
};

export function PanelStatsHeadline({ stats }: PanelStatsHeadlineProps) {
  const { t, formatNumber } = useLanguage();

  return (
    <div className="panel-stats" aria-label={t.stats.ariaLabel}>
      <p className="panel-stats__hero" aria-live="polite">
        {formatNumber(stats.unprayed)}
      </p>
      <p className="panel-stats__headline">{t.explore.campusesLeftToPrayerWalk}</p>
      <p className="panel-stats__tagline">{t.explore.togetherTagline}</p>

      <hr className="panel-stats__divider" />

      <div className="panel-stats__row">
        <div className="panel-stats__mini">
          <span className="panel-stats__mini-value">{formatNumber(stats.total)}</span>
          <span className="panel-stats__mini-label">{t.explore.totalCampuses}</span>
        </div>
        <div className="panel-stats__mini">
          <span className="panel-stats__mini-value panel-stats__mini-value--prayed">
            {formatNumber(stats.prayedFor)}
          </span>
          <span className="panel-stats__mini-label">{t.explore.prayedFor}</span>
        </div>
      </div>

      <div
        className="panel-stats__progress"
        role="progressbar"
        aria-label={t.explore.progressAria}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={stats.goalProgressPercent}
      >
        <div
          className="panel-stats__progress-fill"
          style={{ width: `${stats.goalProgressPercent}%` }}
        />
      </div>
    </div>
  );
}
