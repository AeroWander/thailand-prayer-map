import { interpolate } from '../i18n/translations';
import type { Campus, Region } from '../types/campus';

type PrayerPromptLabels = {
  defaultPrompt: string;
  rajabhatPrompt: string;
  rajamangalaPrompt: string;
  internationalPrompt: string;
};

type PrayerPromptContext = {
  labels: PrayerPromptLabels;
  formatNumber: (value: number) => string;
  getCampusPrimaryName: (campus: Campus) => string;
  getRegionLabel: (region: Region) => string;
};

export function buildCampusPrayerPrompt(
  campus: Campus,
  context: PrayerPromptContext,
): string {
  const { labels, formatNumber, getCampusPrimaryName, getRegionLabel } = context;
  const values = {
    students: formatNumber(campus.studentPopulation),
    name: getCampusPrimaryName(campus),
    region: getRegionLabel(campus.region),
  };

  if (campus.type === 'rajabhat') {
    return interpolate(labels.rajabhatPrompt, values);
  }

  if (campus.type === 'rajamangala') {
    return interpolate(labels.rajamangalaPrompt, values);
  }

  if (campus.type === 'international') {
    return interpolate(labels.internationalPrompt, values);
  }

  return interpolate(labels.defaultPrompt, values);
}
