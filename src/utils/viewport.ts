let cachedLayoutHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

/** Layout height — stays stable while the on-screen keyboard is open. */
export function getLayoutViewportHeight(): number {
  if (typeof window === 'undefined') {
    return cachedLayoutHeight;
  }

  if (shouldStabilizeViewportForKeyboard()) {
    return cachedLayoutHeight;
  }

  cachedLayoutHeight = window.innerHeight;
  return cachedLayoutHeight;
}

export function isFormFieldFocused(): boolean {
  const element = document.activeElement;

  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  );
}

export function isLikelyKeyboardResize(): boolean {
  const visualViewport = window.visualViewport;

  if (!visualViewport) {
    return false;
  }

  return window.innerHeight - visualViewport.height > 120;
}

export function shouldStabilizeViewportForKeyboard(): boolean {
  return isFormFieldFocused() || isLikelyKeyboardResize();
}

export function shouldIgnoreViewportResize(): boolean {
  return shouldStabilizeViewportForKeyboard();
}
