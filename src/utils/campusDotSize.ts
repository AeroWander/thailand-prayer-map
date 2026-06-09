const PRAYED_SIZE_MULTIPLIER = 1.2;

function getBaseDotSize(zoom: number): number {
  if (zoom <= 7) {
    return 8;
  }

  if (zoom <= 10) {
    return 11;
  }

  if (zoom <= 13) {
    return 14;
  }

  return 17;
}

/** Unprayed dots use the base size; prayed dots are 20% larger. */
export function getDotSize(zoom: number, prayedFor = false): number {
  const base = getBaseDotSize(zoom);
  return prayedFor ? base * PRAYED_SIZE_MULTIPLIER : base;
}
