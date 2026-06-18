/** Remove stale Leaflet tooltip nodes left behind during zoom or selection changes. */
export function pruneOrphanCampusTooltips(root: ParentNode = document): void {
  const pills = root.querySelectorAll('.leaflet-tooltip.campus-tooltip--pill');
  const fullTooltips = root.querySelectorAll('.leaflet-tooltip.campus-tooltip--full');

  // A permanent full card replaces any pill tooltip for the same interaction.
  if (fullTooltips.length > 0) {
    pills.forEach((node) => node.remove());
  }

  // Leaflet occasionally leaves duplicate full-card nodes after rapid zoom updates.
  if (fullTooltips.length > 1) {
    fullTooltips.forEach((node, index) => {
      if (index < fullTooltips.length - 1) {
        node.remove();
      }
    });
  }
}
