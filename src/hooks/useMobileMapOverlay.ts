import { useCallback, useEffect, useState, type RefObject } from 'react';
import { useMapSheetTouchLock } from '../context/MapSheetTouchLockContext';
import { getMobileSheetPortalElement } from '../utils/mobileSheetPortal';
import { getLayoutViewportHeight, shouldIgnoreViewportResize } from '../utils/viewport';

type UseMobileMapOverlayOptions = {
  enabled: boolean;
  overlayRef: RefObject<HTMLElement | null>;
  /** When provided, overrides element measurement (e.g. animated sheet height). */
  occlusionTop?: number;
};

function getViewportHeight(): number {
  return getLayoutViewportHeight();
}

export function useMobileMapOverlay({
  enabled,
  overlayRef,
  occlusionTop,
}: UseMobileMapOverlayOptions) {
  const { setSheetOpen, setSheetOcclusionTop, setOverlayTouchActive } = useMapSheetTouchLock();
  const [measuredOcclusionTop, setMeasuredOcclusionTop] = useState(() => getViewportHeight());

  const shieldTop = occlusionTop ?? measuredOcclusionTop;

  const measureOverlay = useCallback(() => {
    if (shouldIgnoreViewportResize()) {
      return;
    }

    const element = overlayRef.current;
    if (!element) {
      return;
    }

    const top = element.getBoundingClientRect().top;
    setMeasuredOcclusionTop(top);
    setSheetOcclusionTop(top);
  }, [overlayRef, setSheetOcclusionTop]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    setSheetOpen(true);
    document.body.classList.add('mobile-map-overlay-open');

    return () => {
      setSheetOpen(false);
      setOverlayTouchActive(false);
      document.body.classList.remove('mobile-map-overlay-open');
    };
  }, [enabled, setOverlayTouchActive, setSheetOpen]);

  useEffect(() => {
    if (!enabled || occlusionTop !== undefined) {
      return;
    }

    measureOverlay();

    const element = overlayRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(measureOverlay);
    observer.observe(element);
    window.addEventListener('resize', measureOverlay);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureOverlay);
    };
  }, [enabled, measureOverlay, occlusionTop, overlayRef]);

  useEffect(() => {
    if (!enabled || occlusionTop === undefined) {
      return;
    }

    setSheetOcclusionTop(occlusionTop);
  }, [enabled, occlusionTop, setSheetOcclusionTop]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const portal = getMobileSheetPortalElement();

    const blockShieldTouch = (event: TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.classList.contains('mobile-sheet-portal__shield')) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    };

    const onTouchStart = () => setOverlayTouchActive(true);
    const onTouchEnd = () => setOverlayTouchActive(false);

    portal.addEventListener('touchstart', blockShieldTouch, { capture: true, passive: false });
    portal.addEventListener('touchmove', blockShieldTouch, { capture: true, passive: false });
    portal.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    portal.addEventListener('touchend', onTouchEnd, { capture: true, passive: true });
    portal.addEventListener('touchcancel', onTouchEnd, { capture: true, passive: true });

    return () => {
      portal.removeEventListener('touchstart', blockShieldTouch, { capture: true });
      portal.removeEventListener('touchmove', blockShieldTouch, { capture: true });
      portal.removeEventListener('touchstart', onTouchStart, { capture: true });
      portal.removeEventListener('touchend', onTouchEnd, { capture: true });
      portal.removeEventListener('touchcancel', onTouchEnd, { capture: true });
    };
  }, [enabled, setOverlayTouchActive]);

  return { shieldTop };
}
