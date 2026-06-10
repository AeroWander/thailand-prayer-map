import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMapSheetTouchLock } from '../context/MapSheetTouchLockContext';
import { useMobileMapOverlay } from '../hooks/useMobileMapOverlay';
import { useLanguage } from '../i18n/LanguageContext';
import type { Campus } from '../types/campus';
import {
  createScrollGestureState,
  decideScrollGestureMode,
  isAtFullExpansion,
  isScrollAtTop,
  resolveSnapWithVelocity,
  springTransitionForVelocity,
  updateGestureVelocity,
  type ScrollGestureState,
  type SnapPoint,
} from '../utils/bottomSheetGestures';
import { buildCampusPrayerPrompt } from '../utils/campusPrayerPrompt';
import { getMobileSheetPortalElement } from '../utils/mobileSheetPortal';
import { getLayoutViewportHeight, shouldIgnoreViewportResize } from '../utils/viewport';
import { CampusMiniMap } from './CampusMiniMap';

type CampusMobileBottomSheetProps = {
  campus: Campus;
  onDismiss: () => void;
  onLogPrayerWalk: (campusId: string) => void;
  onSheetTopChange: (sheetTop: number) => void;
};

// How far below dismiss line before we actually dismiss (fraction of viewport)
const DISMISS_THRESHOLD = 0.15;
const DRAG_MOVE_THRESHOLD = 8;

function websiteLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function getViewportHeight(): number {
  return getLayoutViewportHeight();
}

function getSiteHeaderHeight(): number {
  const header = document.querySelector('.site-header');
  if (header) {
    return header.getBoundingClientRect().height;
  }
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const headerHeightValue = getComputedStyle(document.documentElement)
    .getPropertyValue('--header-height')
    .trim();
  const remMatch = headerHeightValue.match(/^([\d.]+)rem$/);
  if (remMatch) {
    return parseFloat(remMatch[1]) * rootFontSize;
  }
  return rootFontSize * 7.5;
}

function getMaxSheetHeight(): number {
  return Math.max(0, getViewportHeight() - getSiteHeaderHeight());
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

  // collapsedHeight is measured from the DOM so it fits whatever content is rendered
  const [collapsedHeight, setCollapsedHeight] = useState(180);
  const [sheetHeight, setSheetHeight] = useState(0); // starts at 0 → animates in
  const [snapPoint, setSnapPoint] = useState<SnapPoint>('collapsed');
  const [isDragging, setIsDragging] = useState(false);
  const [isDragZonePressed, setIsDragZonePressed] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const { setSheetDragging } = useMapSheetTouchLock();

  const collapsedContentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const sheetHeightRef = useRef(sheetHeight);
  const collapsedHeightRef = useRef(collapsedHeight);
  const snapPointRef = useRef<SnapPoint>('collapsed');
  const isDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const dragPointerTargetRef = useRef<EventTarget | null>(null);
  const dragVelocityRef = useRef(0);
  const dragLastMoveRef = useRef({ y: 0, time: 0 });
  const scrollGestureRef = useRef<ScrollGestureState | null>(null);
  const transitionRef = useRef('none');

  sheetHeightRef.current = sheetHeight;
  collapsedHeightRef.current = collapsedHeight;
  snapPointRef.current = snapPoint;

  const isExpanded = snapPoint === 'full';

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

  const sheetTop = getViewportHeight() - sheetHeight;
  const { shieldTop } = useMobileMapOverlay({
    enabled: true,
    overlayRef: sheetRef,
    occlusionTop: sheetTop,
  });

  const reportSheetTop = useCallback(
    (height: number) => {
      onSheetTopChange(getViewportHeight() - height);
      document.body.style.setProperty('--mobile-sheet-height', `${height}px`);
    },
    [onSheetTopChange],
  );

  // Measure collapsed content height from the DOM
  const measureCollapsedHeight = useCallback(() => {
    const el = collapsedContentRef.current;
    if (!el) return;
    const h = el.getBoundingClientRect().height;
    if (h > 0) {
      setCollapsedHeight(h);
    }
  }, []);

  // Measure on first render and whenever campus changes (secondary name may appear/disappear)
  useLayoutEffect(() => {
    measureCollapsedHeight();
  }, [campus.id, measureCollapsedHeight]);

  useEffect(() => {
    const el = collapsedContentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(measureCollapsedHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measureCollapsedHeight]);

  const getSnapHeights = useCallback(
    () => ({
      collapsed: collapsedHeightRef.current,
      full: getMaxSheetHeight(),
    }),
    [],
  );

  const applyTransition = useCallback((transition: string) => {
    transitionRef.current = transition;
    if (sheetRef.current) {
      sheetRef.current.style.transition = transition;
    }
  }, []);

  const snapTo = useCallback(
    (point: SnapPoint, velocity = 0) => {
      const targetHeight = point === 'full' ? getMaxSheetHeight() : collapsedHeightRef.current;
      const distance = Math.abs(targetHeight - sheetHeightRef.current);
      const transition = distance < 4 ? 'none' : springTransitionForVelocity(velocity);
      applyTransition(transition);
      setSnapPoint(point);
      setSheetHeight(targetHeight);
      reportSheetTop(targetHeight);
    },
    [applyTransition, reportSheetTop],
  );

  // Animate in from bottom on mount
  useLayoutEffect(() => {
    const colH = collapsedContentRef.current?.getBoundingClientRect().height ?? 180;
    setCollapsedHeight(colH);
    // Start at 0 then animate to collapsed on next tick so the transition fires
    setSheetHeight(0);
    const raf = requestAnimationFrame(() => {
      applyTransition(springTransitionForVelocity(0));
      setSheetHeight(colH);
    });
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset to collapsed when campus changes
  useEffect(() => {
    const colH = collapsedContentRef.current?.getBoundingClientRect().height ?? collapsedHeightRef.current;
    applyTransition(springTransitionForVelocity(0));
    setSnapPoint('collapsed');
    setSheetHeight(colH);
    reportSheetTop(colH);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  // campus.id is the only dep that should trigger this
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campus.id]);

  useEffect(() => {
    return () => {
      document.body.style.removeProperty('--mobile-sheet-height');
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setSheetDragging(false);
      }
    };
  }, [setSheetDragging]);

  // Keep height correct on screen resize (rotation etc.)
  useEffect(() => {
    const handleResize = () => {
      if (shouldIgnoreViewportResize()) return;
      snapTo(snapPointRef.current);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [snapTo]);

  // Scroll hint logic
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || !isExpanded) {
      setShowScrollHint(false);
      return;
    }
    const updateHint = () => {
      const canScroll = scrollEl.scrollHeight > scrollEl.clientHeight + 4;
      const nearBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 12;
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
  }, [isExpanded, campus.id, sheetHeight]);

  // ── Tap on header → toggle ────────────────────────────────────────────────
  const handleTitleTap = useCallback(() => {
    snapTo(snapPointRef.current === 'collapsed' ? 'full' : 'collapsed');
  }, [snapTo]);

  // ── Drag mechanics ────────────────────────────────────────────────────────
  const finishSheetGesture = useCallback(
    (velocity: number, options?: { allowTitleTap?: boolean }) => {
      if (!isDraggingRef.current) return;

      const wasTap = !dragMovedRef.current;
      const pointerTarget = dragPointerTargetRef.current;

      isDraggingRef.current = false;
      setIsDragging(false);
      setIsDragZonePressed(false);
      setSheetDragging(false);
      scrollGestureRef.current = null;

      if (wasTap) {
        if (options?.allowTitleTap) {
          if (pointerTarget instanceof Element && pointerTarget.closest('.mobile-sheet__drag-zone')) {
            handleTitleTap();
          }
        }
        return;
      }

      const vh = getViewportHeight();
      const result = resolveSnapWithVelocity(
        sheetHeightRef.current,
        velocity,
        snapPointRef.current,
        getSnapHeights(),
        DISMISS_THRESHOLD,
        vh,
      );

      if (result === 'dismiss') {
        onDismiss();
        return;
      }

      snapTo(result, velocity);
    },
    [getSnapHeights, handleTitleTap, onDismiss, setSheetDragging, snapTo],
  );

  const beginSheetDrag = useCallback(
    (clientY: number, target: EventTarget | null, options?: { pressed?: boolean }) => {
      dragMovedRef.current = false;
      dragPointerTargetRef.current = target;
      dragVelocityRef.current = 0;
      dragLastMoveRef.current = { y: clientY, time: Date.now() };
      isDraggingRef.current = true;
      setIsDragging(true);
      setIsDragZonePressed(options?.pressed ?? false);
      setSheetDragging(true);
      applyTransition('none');
      dragStartY.current = clientY;
      dragStartHeight.current = sheetHeightRef.current;
    },
    [applyTransition, setSheetDragging],
  );

  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const applySheetDrag = useCallback(
    (clientY: number) => {
      const deltaY = dragStartY.current - clientY;
      if (Math.abs(deltaY) > DRAG_MOVE_THRESHOLD) {
        dragMovedRef.current = true;
      }
      const now = Date.now();
      const elapsed = now - dragLastMoveRef.current.time;
      if (elapsed > 0) {
        dragVelocityRef.current = (dragLastMoveRef.current.y - clientY) / elapsed;
      }
      dragLastMoveRef.current = { y: clientY, time: now };
      const nextHeight = Math.min(
        getMaxSheetHeight(),
        Math.max(0, dragStartHeight.current + deltaY),
      );
      setSheetHeight(nextHeight);
      reportSheetTop(nextHeight);
    },
    [reportSheetTop],
  );

  // Document-level drag listeners (always mounted, gated by isDraggingRef)
  useEffect(() => {
    const onTouchMove = (event: TouchEvent) => {
      if (!isDraggingRef.current || event.touches.length !== 1) return;
      event.preventDefault();
      applySheetDrag(event.touches[0].clientY);
    };
    const onMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;
      event.preventDefault();
      applySheetDrag(event.clientY);
    };
    const finish = () => {
      if (!isDraggingRef.current) return;
      finishSheetGesture(dragVelocityRef.current, { allowTitleTap: true });
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', finish);
    document.addEventListener('touchcancel', finish);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', finish);
    return () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', finish);
      document.removeEventListener('touchcancel', finish);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', finish);
    };
  }, [applySheetDrag, finishSheetGesture]);

  // Scroll-area gesture arbitration (scroll vs. sheet-drag)
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || isDraggingRef.current) return;
      scrollGestureRef.current = createScrollGestureState(
        event.touches[0].clientY,
        sheetHeightRef.current,
        scrollEl.scrollTop,
      );
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const gesture = scrollGestureRef.current;
      if (!gesture) return;
      const clientY = event.touches[0].clientY;
      const scrollTop = scrollEl.scrollTop;
      const maxHeight = getMaxSheetHeight();
      const atFull = isAtFullExpansion(sheetHeightRef.current, maxHeight);

      if (gesture.mode === 'content') {
        const stepDelta = clientY - gesture.lastY;
        updateGestureVelocity(gesture, clientY);
        if (atFull && isScrollAtTop(scrollTop) && stepDelta > 0) {
          gesture.mode = 'sheet';
          beginSheetDrag(clientY, event.target);
          event.preventDefault();
          applySheetDrag(clientY);
        }
        return;
      }

      if (gesture.mode === 'undecided') {
        const nextMode = decideScrollGestureMode(
          gesture, clientY, scrollTop, atFull, scrollEl, DRAG_MOVE_THRESHOLD,
        );
        if (nextMode === 'undecided') {
          updateGestureVelocity(gesture, clientY);
          return;
        }
        gesture.mode = nextMode;
        if (nextMode === 'content') {
          updateGestureVelocity(gesture, clientY);
          return;
        }
      }

      if (gesture.mode === 'sheet') {
        if (!isDraggingRef.current) {
          beginSheetDrag(clientY, event.target);
        }
        event.preventDefault();
        updateGestureVelocity(gesture, clientY);
        applySheetDrag(clientY);
      }
    };

    const onTouchEnd = () => {
      const gesture = scrollGestureRef.current;
      if (!gesture) return;
      if (gesture.mode === 'sheet' && isDraggingRef.current) {
        finishSheetGesture(gesture.velocity);
        return;
      }
      scrollGestureRef.current = null;
    };

    scrollEl.addEventListener('touchstart', onTouchStart, { passive: true });
    scrollEl.addEventListener('touchmove', onTouchMove, { passive: false });
    scrollEl.addEventListener('touchend', onTouchEnd);
    scrollEl.addEventListener('touchcancel', onTouchEnd);
    return () => {
      scrollEl.removeEventListener('touchstart', onTouchStart);
      scrollEl.removeEventListener('touchmove', onTouchMove);
      scrollEl.removeEventListener('touchend', onTouchEnd);
      scrollEl.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [applySheetDrag, beginSheetDrag, finishSheetGesture]);

  // ── Event handlers ────────────────────────────────────────────────────────

  // Returns true if the event target is inside the visual drag zone (for the pressed highlight).
  const isInDragZone = (target: EventTarget | null) =>
    target instanceof Element && target.closest('.mobile-sheet__drag-zone') !== null;

  // Touch anywhere in the collapsed content area (drag zone, button, hint) starts a drag.
  const handleCollapsedTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length !== 1) return;
    scrollGestureRef.current = null;
    beginSheetDrag(event.touches[0].clientY, event.target, {
      pressed: isInDragZone(event.target),
    });
  };

  // Mouse: only prevent default on non-button areas so button focus still works.
  const handleCollapsedMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0) return;
    const onButton = (event.target as Element).closest('button') !== null;
    if (!onButton) event.preventDefault();
    scrollGestureRef.current = null;
    beginSheetDrag(event.clientY, event.target, {
      pressed: isInDragZone(event.target),
    });
  };

  const handleMarkPrayed = () => {
    if (campus.prayedFor) return;
    setIsPopping(true);
    onLogPrayerWalk(campus.id);
  };

  const handleButtonAnimationEnd = (event: React.AnimationEvent<HTMLButtonElement>) => {
    if (event.animationName === 'campus-mark-pop') setIsPopping(false);
  };

  const dragZoneClassName = [
    'mobile-sheet__drag-zone',
    isDragZonePressed ? 'mobile-sheet__drag-zone--pressed' : '',
    isDragging ? 'mobile-sheet__drag-zone--grabbing' : '',
  ].filter(Boolean).join(' ');

  const reportSheetTopCallback = useCallback(
    (height: number) => {
      onSheetTopChange(getViewportHeight() - height);
      document.body.style.setProperty('--mobile-sheet-height', `${height}px`);
    },
    [onSheetTopChange],
  );
  void reportSheetTopCallback; // reportSheetTop is used directly above

  const sheet = (
    <>
      <div
        className="mobile-sheet-portal__shield"
        style={{ top: shieldTop }}
        aria-hidden="true"
      />
      <aside
        ref={sheetRef}
        className={isDragging ? 'mobile-sheet mobile-sheet--dragging' : 'mobile-sheet'}
        style={{ height: sheetHeight }}
        aria-label={getCampusPrimaryName(campus)}
      >
        {/* ── Always-visible collapsed content (measured for snap height) ── */}
        <div
          ref={collapsedContentRef}
          onTouchStart={handleCollapsedTouchStart}
          onMouseDown={handleCollapsedMouseDown}
        >
          <div className={dragZoneClassName}>
            <div className="mobile-sheet__handle-wrap" aria-hidden="true">
              <div className="mobile-sheet__handle" />
            </div>
            <p className="mobile-sheet__location">{locationLine}</p>
            <button
              type="button"
              className="mobile-sheet__title-btn"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTitleTap();
                }
              }}
            >
              <span className="mobile-sheet__name">{getCampusPrimaryName(campus)}</span>
              {!isExpanded && <ChevronUpIcon />}
            </button>
            {secondaryName && <p className="mobile-sheet__name-th">{secondaryName}</p>}
          </div>

          <button
            type="button"
            className={[
              'campus-detail__mark-btn mobile-sheet__mark-btn',
              campus.prayedFor ? 'campus-detail__mark-btn--prayed' : '',
              isPopping ? 'campus-detail__mark-btn--pop' : '',
            ].filter(Boolean).join(' ')}
            onClick={handleMarkPrayed}
            onAnimationEnd={handleButtonAnimationEnd}
            disabled={campus.prayedFor}
            aria-disabled={campus.prayedFor}
          >
            {campus.prayedFor ? <CheckIcon /> : <PrayerHandsIcon />}
            <span>{campus.prayedFor ? t.panel.prayedForButton : t.panel.markAsPrayed}</span>
          </button>

          <div
            className={
              isExpanded
                ? 'mobile-sheet__peek-hint mobile-sheet__peek-hint--hidden'
                : 'mobile-sheet__peek-hint'
            }
            aria-hidden="true"
          >
            <span className="mobile-sheet__peek-label">{t.explore.moreInfo}</span>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
              <path d="M1 1.5L8 8.5L15 1.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* ── Expanded content (scroll area) ── */}
        <div
          ref={scrollRef}
          className={
            isDragging
              ? 'mobile-sheet__scroll mobile-sheet__scroll--locked'
              : 'mobile-sheet__scroll'
          }
        >
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
            <CampusMiniMap campus={campus} isPanelOpen={isExpanded} variant="detail" />
          </div>

          <hr className="campus-detail__divider campus-detail__divider--info" />

          <section
            className="campus-detail__info mobile-sheet__info"
            aria-labelledby="mobile-campus-info-heading"
          >
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

        {showScrollHint && (
          <p className="mobile-sheet__scroll-hint" aria-hidden="true">
            {t.explore.scrollForMore}
          </p>
        )}
      </aside>
    </>
  );

  return createPortal(sheet, getMobileSheetPortalElement());
}
