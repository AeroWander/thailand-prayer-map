import L from 'leaflet';
import { getDotSize } from './campusDotSize';

export function getDotOuterSize(dotSize: number): number {
  return dotSize;
}

function buildDotHtml(dotSize: number, prayedFor: boolean): string {
  const stateClass = prayedFor ? 'campus-dot--prayed' : 'campus-dot--pending';

  return `
<div class="campus-dot ${stateClass}" style="--dot-size: ${dotSize}px" role="img">
  <div class="campus-dot__anchor">
    <span class="campus-dot__core" aria-hidden="true"></span>
  </div>
</div>
`.trim();
}

export function createCampusDotIcon(dotSize: number, prayedFor = false): L.DivIcon {
  const outer = getDotOuterSize(dotSize);
  const anchor = outer / 2;

  return L.divIcon({
    className: 'campus-marker',
    html: buildDotHtml(dotSize, prayedFor),
    iconSize: [outer, outer],
    iconAnchor: [anchor, anchor],
  });
}

export function createCampusMiniMapDotIcon(prayedFor: boolean): L.DivIcon {
  const dotSize = getDotSize(13, prayedFor);
  const outer = getDotOuterSize(dotSize);
  const anchor = outer / 2;

  return L.divIcon({
    className: 'campus-marker',
    html: buildDotHtml(dotSize, prayedFor),
    iconSize: [outer, outer],
    iconAnchor: [anchor, anchor],
  });
}
