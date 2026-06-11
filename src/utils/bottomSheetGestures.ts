export type SnapPoint = 'collapsed' | 'full';

const FLICK_VELOCITY = 0.4; // px/ms
const SCROLL_TOP_EPSILON = 2;

export type SnapHeights = {
  collapsed: number;
  full: number;
};

/** Nearest of the two snap points by absolute distance. */
export function nearestSnap(
  height: number,
  heights: SnapHeights,
  dismissThreshold: number,
  viewportHeight: number,
): SnapPoint | 'dismiss' {
  if (height < viewportHeight * dismissThreshold) {
    return 'dismiss';
  }

  const distToCollapsed = Math.abs(height - heights.collapsed);
  const distToFull = Math.abs(height - heights.full);
  return distToCollapsed <= distToFull ? 'collapsed' : 'full';
}

/**
 * Resolve snap destination taking finger velocity into account.
 * Positive velocity = finger moved upward = sheet should expand.
 */
export function resolveSnapWithVelocity(
  height: number,
  velocity: number,
  currentSnap: SnapPoint,
  heights: SnapHeights,
  dismissThreshold: number,
  viewportHeight: number,
): SnapPoint | 'dismiss' {
  if (Math.abs(velocity) >= FLICK_VELOCITY) {
    if (velocity > 0) {
      return 'full';
    }
    // Flicking downward always dismisses — whether from full or collapsed
    return 'dismiss';
  }

  return nearestSnap(height, heights, dismissThreshold, viewportHeight);
}

/**
 * Return a spring-curve CSS transition string scaled to the release velocity.
 * Faster flick → shorter, snappier animation. Slow drag → longer, heavier feel.
 */
export function springTransitionForVelocity(velocity: number): string {
  const absV = Math.abs(velocity); // px/ms
  let duration: number;
  if (absV > 1.5) {
    duration = 0.22;
  } else if (absV > 0.6) {
    duration = 0.3;
  } else {
    duration = 0.42;
  }
  // cubic-bezier(0.32, 0.72, 0, 1) is the standard iOS bottom-sheet spring approximation
  return `height ${duration}s cubic-bezier(0.32, 0.72, 0, 1)`;
}

export function isAtFullExpansion(height: number, maxHeight: number): boolean {
  return height >= maxHeight - SCROLL_TOP_EPSILON;
}

export function isScrollAtTop(scrollTop: number): boolean {
  return scrollTop <= SCROLL_TOP_EPSILON;
}

export function canScrollContent(element: HTMLElement): boolean {
  return element.scrollHeight > element.clientHeight + SCROLL_TOP_EPSILON;
}

export type ScrollGestureMode = 'undecided' | 'sheet' | 'content';

export type ScrollGestureState = {
  mode: ScrollGestureMode;
  startY: number;
  startHeight: number;
  startScrollTop: number;
  lastY: number;
  lastTime: number;
  velocity: number;
};

export function createScrollGestureState(
  clientY: number,
  startHeight: number,
  startScrollTop: number,
): ScrollGestureState {
  return {
    mode: 'undecided',
    startY: clientY,
    startHeight,
    startScrollTop,
    lastY: clientY,
    lastTime: Date.now(),
    velocity: 0,
  };
}

export function updateGestureVelocity(state: ScrollGestureState, clientY: number): void {
  const now = Date.now();
  const elapsed = now - state.lastTime;
  if (elapsed > 0) {
    state.velocity = (state.lastY - clientY) / elapsed;
  }
  state.lastY = clientY;
  state.lastTime = now;
}

export function decideScrollGestureMode(
  state: ScrollGestureState,
  clientY: number,
  scrollTop: number,
  atFullExpansion: boolean,
  scrollElement: HTMLElement,
  moveThreshold: number,
): ScrollGestureMode {
  const totalDelta = clientY - state.startY;
  const stepDelta = clientY - state.lastY;

  // Already scrolled into content → content scroll wins until back at top
  if (atFullExpansion && !isScrollAtTop(scrollTop)) {
    return 'content';
  }

  if (Math.abs(totalDelta) < moveThreshold) {
    return 'undecided';
  }

  if (!atFullExpansion) {
    return 'sheet';
  }

  // At full expansion, at scroll top: downward drag collapses sheet
  if (stepDelta > 0) {
    return 'sheet';
  }

  if (stepDelta < 0 && canScrollContent(scrollElement)) {
    return 'content';
  }

  return 'sheet';
}
