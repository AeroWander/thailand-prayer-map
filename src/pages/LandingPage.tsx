import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroBackground } from '../components/HeroBackground';
import { HeroSearch } from '../components/HeroSearch';
import { useCampuses } from '../context/CampusContext';
import { useLanguage } from '../i18n/LanguageContext';
import { interpolate } from '../i18n/translations';

const DURATION = 620;
const PHASE1 = 0.82;
const DELAY = 120;

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * Animates an integer from ~80% of its value up to target with a slight
 * one-number overshoot. Waits until isLoading is false so all three stats
 * animate against their correct final values. Plays once per mount.
 */
function useCountUp(target: number, isLoading: boolean): number {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (startedRef.current) return;
    startedRef.current = true;

    const start = Math.floor(target * 0.8);
    setValue(start);

    const launchTime = performance.now() + DELAY;
    let rafId: number;
    let active = true;

    function step(now: number) {
      if (!active) return;

      const elapsed = Math.max(0, now - launchTime);

      if (elapsed >= DURATION) {
        setValue(target);
        return;
      }

      const progress = elapsed / DURATION;
      let current: number;

      if (progress < PHASE1) {
        const t = progress / PHASE1;
        current = start + (target + 1 - start) * easeOutQuart(t);
      } else {
        const t = (progress - PHASE1) / (1 - PHASE1);
        current = (target + 1) - t * t;
      }

      setValue(Math.round(current));
      rafId = requestAnimationFrame(step);
    }

    rafId = requestAnimationFrame(step);

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      setValue(target);
    };
  }, [isLoading, target]);

  return value;
}

function StatCard({
  value,
  label,
  tone = 'default',
}: {
  value: string;
  label: string;
  tone?: 'default' | 'prayed' | 'blue';
}) {
  return (
    <div className="landing-stat">
      <p
        className={
          tone === 'prayed'
            ? 'landing-stat__value landing-stat__value--prayed'
            : tone === 'blue'
              ? 'landing-stat__value landing-stat__value--blue'
              : 'landing-stat__value'
        }
      >
        {value}
      </p>
      <p className="landing-stat__label">{label}</p>
    </div>
  );
}

function VisionIcon({ children }: { children: React.ReactNode }) {
  return <div className="landing-vision__icon" aria-hidden="true">{children}</div>;
}

export function LandingPage() {
  const { t, formatNumber } = useLanguage();
  const { totalCampuses, prayedCount, remainingCount, isLoadingPrayerWalks } = useCampuses();

  const animatedTotal = useCountUp(totalCampuses, isLoadingPrayerWalks);
  const animatedPrayed = useCountUp(prayedCount, isLoadingPrayerWalks);
  const animatedRemaining = useCountUp(remainingCount, isLoadingPrayerWalks);
  const pageRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) {
      return;
    }

    const handleScroll = () => {
      if (page.scrollTop > 48) {
        setShowScrollHint(false);
      }
    };

    page.addEventListener('scroll', handleScroll, { passive: true });
    return () => page.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page" ref={pageRef}>
      <section className="landing-hero">
        <div className="landing-hero__texture" aria-hidden="true">
          <HeroBackground />
          <div className="landing-hero__fade" />
        </div>

        <div className="landing-hero__content">
          <h1 className="landing-hero__title hero-headline">{t.landing.headline}</h1>
          <p className="landing-hero__subtitle">
            {interpolate(t.landing.subheadline, { count: formatNumber(totalCampuses) })}
          </p>

          <div className="landing-stats" aria-label={t.landing.statsAria}>
            <StatCard
              value={formatNumber(animatedTotal)}
              label={t.landing.statTotal}
            />
            <StatCard
              value={formatNumber(animatedPrayed)}
              label={t.landing.statPrayed}
              tone="prayed"
            />
            <StatCard
              value={formatNumber(animatedRemaining)}
              label={t.landing.statRemaining}
              tone="blue"
            />
          </div>

          <HeroSearch />

          <div className="landing-cta">
            <Link className="landing-cta__primary" to="/map">
              {t.landing.exploreMap}
            </Link>
            <Link className="landing-cta__secondary" to="/pray">
              {t.landing.prayerGuide}
            </Link>
          </div>
          <p className="landing-cta__note">{t.landing.ctaNote}</p>
        </div>
      </section>

      {showScrollHint && (
        <div className="landing-scroll-hint" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      <section className="landing-vision" aria-label={t.landing.visionAria}>
        <hr className="landing-vision__divider" />
        <div className="landing-vision__grid">
          <article className="landing-vision__card">
            <VisionIcon>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="12" cy="9" r="2.5" fill="currentColor" />
              </svg>
            </VisionIcon>
            <h2 className="landing-vision__title">{t.landing.visionFindTitle}</h2>
            <p className="landing-vision__text">{t.landing.visionFindText}</p>
          </article>

          <article className="landing-vision__card">
            <VisionIcon>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 20c2.5-3 5-5 8-6.5M9 4.5 11 8l2.5-1L14 10l3-1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 18.5h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </VisionIcon>
            <h2 className="landing-vision__title">{t.landing.visionLogTitle}</h2>
            <p className="landing-vision__text">{t.landing.visionLogText}</p>
          </article>

          <article className="landing-vision__card">
            <VisionIcon>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 18V6M8 18V10M12 18V4M16 18v-8M20 18v-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </VisionIcon>
            <h2 className="landing-vision__title">{t.landing.visionTrackTitle}</h2>
            <p className="landing-vision__text">{t.landing.visionTrackText}</p>
          </article>
        </div>
      </section>

      <footer className="landing-footer">
        <p>{t.landing.footer}</p>
      </footer>
    </div>
  );
}
