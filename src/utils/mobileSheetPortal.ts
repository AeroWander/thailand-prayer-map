const MOBILE_SHEET_PORTAL_ID = 'mobile-sheet-portal';

export function getMobileSheetPortalElement(): HTMLElement {
  if (typeof document === 'undefined') {
    throw new Error('Mobile sheet portal is only available in the browser');
  }

  let portal = document.getElementById(MOBILE_SHEET_PORTAL_ID);
  if (!portal) {
    portal = document.createElement('div');
    portal.id = MOBILE_SHEET_PORTAL_ID;
    document.body.appendChild(portal);
  }

  return portal;
}
