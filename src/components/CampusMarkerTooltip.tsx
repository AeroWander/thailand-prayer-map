import { memo } from 'react';
import { Tooltip } from 'react-leaflet';
import type { Campus } from '../types/campus';
import { CampusPinTooltip } from './CampusPinTooltip';
import { getPinTooltipTier } from '../utils/pinTooltipTier';

type CampusMarkerTooltipProps = {
  campus: Campus;
  mapZoom: number;
  isSelected: boolean;
};

function CampusMarkerTooltipComponent({ campus, mapZoom, isSelected }: CampusMarkerTooltipProps) {
  const tooltipTier = getPinTooltipTier(mapZoom, isSelected);

  if (isSelected) {
    return (
      <Tooltip
        key="selected-full"
        direction="top"
        offset={[0, -10]}
        className="campus-tooltip campus-tooltip--full"
        permanent
        sticky={false}
      >
        <CampusPinTooltip campus={campus} tier="full" />
      </Tooltip>
    );
  }

  if (tooltipTier === 'none') {
    return null;
  }

  const isPill = tooltipTier === 'pill';

  return (
    <Tooltip
      key={isPill ? 'hover-pill' : 'hover-full'}
      direction="top"
      offset={[0, isPill ? -6 : -10]}
      className={isPill ? 'campus-tooltip campus-tooltip--pill' : 'campus-tooltip campus-tooltip--full'}
      permanent={false}
      sticky={false}
    >
      <CampusPinTooltip campus={campus} tier={tooltipTier} />
    </Tooltip>
  );
}

/** Skip tooltip rebinds during fly-to zoom ticks once a pin is selected. */
export const CampusMarkerTooltip = memo(CampusMarkerTooltipComponent, (prev, next) => {
  if (prev.isSelected || next.isSelected) {
    return (
      prev.isSelected === next.isSelected &&
      prev.campus.id === next.campus.id &&
      prev.campus.prayedFor === next.campus.prayedFor
    );
  }

  return (
    prev.mapZoom === next.mapZoom &&
    prev.campus.id === next.campus.id &&
    prev.campus.prayedFor === next.campus.prayedFor
  );
});
