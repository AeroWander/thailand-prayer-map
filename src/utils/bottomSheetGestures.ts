export type SnapPoint = 'collapsed' | 'half' | 'full';

const FLICK_VELOCITY = 0.45;
const SCROLL_TOP_EPSILON = 2;

export type SnapHeights = {
  collapsed: number;
  half: number;
  full: number;
};

export function nearestSnap(
  height: number,
  heights: SnapHeights,
  dismissThreshold: number,
  viewportHeight: number,
): SnapPoint | 'dismiss' {
  if (height < viewportHeight * dismissThreshold) {
    return 'dismiss';
  }

  const candidates: Array<{ point: SnapPoint; height: number }> = [
    { point: 'collapsed', height: heights.collapsed },
    { point: 'half', height: heights.half },
    { point: 'full', height: heights.full },
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

/** Positive velocity = finger moved up = sheet expands. */
export function resolveSnapWithVelocity(
  height: number,
  velocity: number,
  currentSnap: SnapPoint,
  heights: SnapHeights,
  dismissThreshold: number,
  viewportHeight: number,
): SnapPoint | 'dismiss' {
  const order: SnapPoint[] = ['collapsed', 'half', 'full'];
  const currentIndex = order.indexOf(currentSnap);

  if (Math.abs(velocity) >= FLICK_VELOCITY) {
    if (velocity > 0) {
      if (currentIndex < order.length - 1) {
        return order[currentIndex + 1];
      }
      return 'full';
    }

    if (height < viewportHeight * dismissThreshold) {
      return 'dismiss';
    }

    if (currentIndex > 0) {
      return order[currentIndex - 1];
    }

    return 'dismiss';
  }

  return nearestSnap(height, heights, dismissThreshold, viewportHeight);
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

export function createScrollGestureState(clientY: number, startHeight: number, startScrollTop: number): ScrollGestureState {
  const now = Date.now();
  return {
    mode: 'undecided',
    startY: clientY,
    startHeight,
    startScrollTop,
    lastY: clientY,
    lastTime: now,
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

  if (atFullExpansion && !isScrollAtTop(scrollTop)) {
    return 'content';
  }

  if (Math.abs(totalDelta) < moveThreshold) {
    return 'undecided';
  }

  if (!atFullExpansion) {
    return 'sheet';
  }

  if (stepDelta > 0) {
    return 'sheet';
  }

  if (stepDelta < 0 && canScrollContent(scrollElement)) {
    return 'content';
  }

  return 'sheet';
}
