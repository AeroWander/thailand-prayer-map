import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Campus } from '../types/campus';
import { buildCampusPrayerPrompt } from '../utils/campusPrayerPrompt';
import { CampusMiniMap } from './CampusMiniMap';

type CampusDetailViewProps = {
  campus: Campus;
  onBack: () => void;
  onClose: () => void;
  onLogPrayerWalk: (campusId: string) => void;
};

function websiteLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function PrayerHandsIcon() {
  return (
    <svg
      className="campus-detail__btn-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.25 7.5V4.75a1 1 0 0 1 2 0V8M8.75 7.5V3.75a1 1 0 0 1 2 0V8M5.25 8.5l-.75 3.25a2 2 0 0 0 1.95 2.45h2.1a2 2 0 0 0 1.95-2.45l-.75-3.25"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="campus-detail__btn-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.25 6.5 11.25 12.5 4.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      className="campus-detail__external-icon"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 2.5h5v5M9.5 2.5 2.5 9.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CampusDetailView({
  campus,
  onBack,
  onClose,
  onLogPrayerWalk,
}: CampusDetailViewProps) {
  const {
    t,
    formatNumber,
    getCampusPrimaryName,
    getCampusSecondaryName,
    getRegionLabel,
    getProvinceLabel,
    getInstitutionTypeLabel,
  } = useLanguage();

  const [isPopping, setIsPopping] = useState(false);

  const secondaryName = getCampusSecondaryName(campus);
  const prayerPrompt = campus.prayedFor
    ? t.explore.prayerPromptPrayed
    : buildCampusPrayerPrompt(campus, {
        labels: t.explore.prayerPrompts,
        formatNumber,
        getCampusPrimaryName,
        getRegionLabel,
      });

  const locationLine = `${getProvinceLabel(campus.province)} · ${getRegionLabel(campus.region)}`;

  const handleMarkPrayed = () => {
    if (campus.prayedFor) {
      return;
    }

    setIsPopping(true);
    onLogPrayerWalk(campus.id);
  };

  const handleButtonAnimationEnd = (event: React.AnimationEvent<HTMLButtonElement>) => {
    if (event.animationName === 'campus-mark-pop') {
      setIsPopping(false);
    }
  };

  return (
    <article className="campus-detail">
      <button
        type="button"
        className="campus-detail__close"
        onClick={onClose}
        aria-label={t.explore.closeAria}
      >
        ×
      </button>

      <button
        type="button"
        className="campus-detail__back"
        onClick={onBack}
        aria-label={t.explore.backAria}
      >
        <span className="campus-detail__back-icon" aria-hidden="true">
          ←
        </span>
        {t.explore.allCampuses}
      </button>

      <p className="campus-detail__location">{locationLine}</p>
      <h2
        className={
          secondaryName ? 'campus-detail__name' : 'campus-detail__name campus-detail__name--solo'
        }
      >
        {getCampusPrimaryName(campus)}
      </h2>
      {secondaryName && <p className="campus-detail__name-th">{secondaryName}</p>}

      <hr className="campus-detail__divider" />

      <button
        type="button"
        className={
          [
            'campus-detail__mark-btn',
            campus.prayedFor ? 'campus-detail__mark-btn--prayed' : '',
            isPopping ? 'campus-detail__mark-btn--pop' : '',
          ]
            .filter(Boolean)
            .join(' ')
        }
        onClick={handleMarkPrayed}
        onAnimationEnd={handleButtonAnimationEnd}
        disabled={campus.prayedFor}
        aria-disabled={campus.prayedFor}
      >
        {campus.prayedFor ? <CheckIcon /> : <PrayerHandsIcon />}
        <span>{campus.prayedFor ? t.panel.prayedForButton : t.panel.markAsPrayed}</span>
      </button>

      <blockquote
        className={
          campus.prayedFor
            ? 'campus-detail__prayer-prompt campus-detail__prayer-prompt--prayed'
            : 'campus-detail__prayer-prompt'
        }
      >
        {prayerPrompt}
      </blockquote>

      <div className="campus-detail__mini-map-wrap">
        <CampusMiniMap campus={campus} isPanelOpen variant="detail" />
      </div>

      <hr className="campus-detail__divider campus-detail__divider--info" />

      <section className="campus-detail__info" aria-labelledby="campus-info-heading">
        <h3 id="campus-info-heading" className="campus-detail__info-label">
          {t.explore.campusInfo}
        </h3>
        <dl className="campus-detail__info-rows">
          <div className="campus-detail__info-row">
            <dt>{t.panel.type}</dt>
            <dd>{getInstitutionTypeLabel(campus.type)}</dd>
          </div>
          <div className="campus-detail__info-row">
            <dt>{t.panel.students}</dt>
            <dd>{formatNumber(campus.studentPopulation)}</dd>
          </div>
          <div className="campus-detail__info-row">
            <dt>{t.panel.founded}</dt>
            <dd>{campus.foundingYear}</dd>
          </div>
          <div className="campus-detail__info-row campus-detail__info-row--last">
            <dt>{t.explore.website}</dt>
            <dd>
              <a
                className="campus-detail__website-link"
                href={campus.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{websiteLabel(campus.website)}</span>
                <ExternalLinkIcon />
              </a>
            </dd>
          </div>
        </dl>
      </section>
    </article>
  );
}
