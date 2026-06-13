export type PinTooltipTier = 'none' | 'pill' | 'full';

/** Tooltip detail level by map zoom. Selected pins always get the full card. */
export function getPinTooltipTier(mapZoom: number, isSelected: boolean): PinTooltipTier {
  if (isSelected) {
    return 'full';
  }

  if (mapZoom <= 7) {
    return 'none';
  }

  if (mapZoom >= 9) {
    return 'full';
  }

  return 'pill';
}
