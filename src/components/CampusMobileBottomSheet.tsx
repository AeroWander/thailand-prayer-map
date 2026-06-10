import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Campus } from '../types/campus';
import { buildCampusPrayerPrompt } from '../utils/campusPrayerPrompt';
import { CampusMiniMap } from './CampusMiniMap';

type CampusMobileBottomSheetProps = {
  campus: Campus;
  onDismiss: () => void;
  onLogPrayerWalk: (campusId: string) => void;
  onSheetTopChange: (sheetTop: number) => void;
};

type SnapPoint = 'collapsed' | 'half' | 'full';

const SNAP_COLLAPSED = 0.3;
const SNAP_HALF = 0.6;
const SNAP_FULL = 0.9;
const DISMISS_THRESHOLD = 0.18;
const SPRING_TRANSITION = 'height 0.3s cubic-bezier(0.32, 0.72, 0, 1)';

function websiteLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function getViewportHeight(): number {
  return window.visualViewport?.height ?? window.innerHeight;
}

function snapHeightFor(point: SnapPoint): number {
  const vh = getViewportHeight();
  if (point === 'collapsed') {
    return vh * SNAP_COLLAPSED;
  }
  if (point === 'half') {
    return vh * SNAP_HALF;
  }
  return vh * SNAP_FULL;
}

function nearestSnap(height: number): SnapPoint | 'dismiss' {
  const vh = getViewportHeight();

  if (height < vh * DISMISS_THRESHOLD) {
    return 'dismiss';
  }

  const candidates: Array<{ point: SnapPoint; height: number }> = [
    { point: 'collapsed', height: vh * SNAP_COLLAPSED },
    { point: 'half', height: vh * SNAP_HALF },
    { point: 'full', height: vh * SNAP_FULL },
  ];

  let closest = candidates[0];
  let minDistance = Math.abs(height - closest.height);

  for (const candidate of candidates.slice(1)) {
    const distance = Math.abs(height - candidate.height);
    if (distance < minDistance) {
      minDistance = distance;
      closest = candidate;
    }
  }

  return closest.point;
}

function PrayerHandsIcon() {
  return (
    <svg className="campus-detail__btn-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
    <svg className="campus-detail__btn-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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

function ChevronUpIcon() {
  return (
    <svg className="mobile-sheet__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 10.5 8 6.5 12 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="campus-detail__external-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4.5 2.5h5v5M9.5 2.5 2.5 9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CampusMobileBottomSheet({
  campus,
  onDismiss,
  onLogPrayerWalk,
  onSheetTopChange,
}: CampusMobileBottomSheetProps) {
  const {
    t,
    formatNumber,
    getCampusPrimaryName,
    getCampusSecondaryName,
    getRegionLabel,
    getProvinceLabel,
    getInstitutionTypeLabel,
  } = useLanguage();

  const [sheetHeight, setSheetHeight] = useState(() => snapHeightFor('collapsed'));
  const [snapPoint, setSnapPoint] = useState<SnapPoint>('collapsed');
  const [isDragging, setIsDragging] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(0);
  const sheetHeightRef = useRef(sheetHeight);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);

  sheetHeightRef.current = sheetHeight;

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

  const heightRatio = sheetHeight / getViewportHeight();
  const showHalfContent = heightRatio >= 0.45 || snapPoint === 'half' || snapPoint === 'full';
  const showFullContent = heightRatio >= 0.75 || snapPoint === 'full';

  const reportSheetTop = useCallback(
    (height: number) => {
      onSheetTopChange(getViewportHeight() - height);
    },
    [onSheetTopChange],
  );

  useEffect(() => {
    reportSheetTop(sheetHeight);
  }, [sheetHeight, reportSheetTop]);

  useEffect(() => {
    setSheetHeight(snapHeightFor('collapsed'));
    setSnapPoint('collapsed');
  }, [campus.id]);

  useEffect(() => {
    const handleResize = () => {
      setSheetHeight(snapHeightFor(snapPoint));
    };

    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [snapPoint]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || !showFullContent) {
      setShowScrollHint(false);
      return;
    }

    const updateHint = () => {
      const canScroll = scrollEl.scrollHeight > scrollEl.clientHeight + 4;
      const nearBottom =
        scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 12;
      setShowScrollHint(canScroll && !nearBottom);
    };

    updateHint();
    scrollEl.addEventListener('scroll', updateHint, { passive: true });
    const observer = new ResizeObserver(updateHint);
    observer.observe(scrollEl);

    return () => {
      scrollEl.removeEventListener('scroll', updateHint);
      observer.disconnect();
    };
  }, [showFullContent, campus.id, sheetHeight]);

  const snapTo = useCallback(
    (point: SnapPoint) => {
      setSnapPoint(point);
      setSheetHeight(snapHeightFor(point));
      reportSheetTop(snapHeightFor(point));
    },
    [reportSheetTop],
  );

  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    dragStartYRef.current = clientY;
    dragStartHeightRef.current = sheetHeight;
  };

  const handleDragMove = (clientY: number) => {
    const deltaY = dragStartYRef.current - clientY;
    const vh = getViewportHeight();
    const nextHeight = Math.min(vh * SNAP_FULL, Math.max(0, dragStartHeightRef.current + deltaY));
    setSheetHeight(nextHeight);
    reportSheetTop(nextHeight);
  };

  const handleDragEnd = () => {
    if (!isDragging) {
      return;
    }

    setIsDragging(false);
    const result = nearestSnap(sheetHeightRef.current);

    if (result === 'dismiss') {
      onDismiss();
      return;
    }

    snapTo(result);
  };

  const handleTitleTap = () => {
    if (snapPoint === 'collapsed') {
      snapTo('half');
      return;
    }

    if (snapPoint === 'half') {
      snapTo('full');
    }
  };

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
    <aside
      ref={sheetRef}
      className="mobile-sheet"
      style={{
        height: sheetHeight,
        transition: isDragging ? 'none' : SPRING_TRANSITION,
      }}
      aria-label={getCampusPrimaryName(campus)}
    >
      <div
        className="mobile-sheet__drag-zone"
        onTouchStart={(event) => {
          if (event.touches.length !== 1) {
            return;
          }
          handleDragStart(event.touches[0].clientY);
        }}
        onTouchMove={(event) => {
          if (!isDragging || event.touches.length !== 1) {
            return;
          }
          event.preventDefault();
          handleDragMove(event.touches[0].clientY);
        }}
        onTouchEnd={handleDragEnd}
        onTouchCancel={handleDragEnd}
      >
        <div className="mobile-sheet__handle" aria-hidden="true" />
      </div>

      <div ref={scrollRef} className="mobile-sheet__scroll">
        <p className="mobile-sheet__location">{locationLine}</p>

        <button
          type="button"
          className="mobile-sheet__title-btn"
          onClick={handleTitleTap}
        >
          <span className="mobile-sheet__name">{getCampusPrimaryName(campus)}</span>
          {snapPoint !== 'full' && <ChevronUpIcon />}
        </button>

        {secondaryName && <p className="mobile-sheet__name-th">{secondaryName}</p>}

        <button
          type="button"
          className={
            [
              'campus-detail__mark-btn mobile-sheet__mark-btn',
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

        {showHalfContent && (
          <div className="mobile-sheet__section mobile-sheet__section--half">
            <blockquote
              className={
                campus.prayedFor
                  ? 'campus-detail__prayer-prompt campus-detail__prayer-prompt--prayed mobile-sheet__prayer'
                  : 'campus-detail__prayer-prompt mobile-sheet__prayer'
              }
            >
              {prayerPrompt}
            </blockquote>

            <div className="mobile-sheet__mini-map-wrap">
              <CampusMiniMap campus={campus} isPanelOpen variant="detail" />
            </div>
          </div>
        )}

        {showFullContent && (
          <div className="mobile-sheet__section mobile-sheet__section--full">
            <hr className="campus-detail__divider campus-detail__divider--info" />

            <section className="campus-detail__info mobile-sheet__info" aria-labelledby="mobile-campus-info-heading">
              <h3 id="mobile-campus-info-heading" className="campus-detail__info-label">
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
          </div>
        )}
      </div>

      {showScrollHint && (
        <p className="mobile-sheet__scroll-hint" aria-hidden="true">
          {t.explore.scrollForMore}
        </p>
      )}
    </aside>
  );
}
