export type PinTooltipTier = 'none' | 'pill' | 'full';

/** Tooltip detail level by map zoom. Selected pins always get the full card. */
export function getPinTooltipTier(mapZoom: number, isSelected: boolean): PinTooltipTier {
  if (isSelected) {
    return 'full';
  }

  if (mapZoom <= 8) {
    return 'none';
  }

  if (mapZoom <= 11) {
    return 'pill';
  }

  return 'full';
}
