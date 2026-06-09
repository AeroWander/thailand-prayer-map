import { interpolate, type TranslationSchema } from '../i18n/translations';
import type { Campus, Region } from '../types/campus';

export type StatsFilterContext = {
  searchQuery: string;
  selectedProvince: string;
  selectedRegion: string;
};

export type StatsTranslationContext = StatsFilterContext & {
  t: TranslationSchema;
  getRegionLabel: (region: Region) => string;
  getProvinceLabel: (province: string) => string;
};

export type CampusStats = {
  total: number;
  prayedFor: number;
  unprayed: number;
  goalProgressPercent: number;
  campusesLabel: string;
  goalDetailLabel: string;
};

function buildCampusesLabel(filter: StatsTranslationContext): string {
  const search = filter.searchQuery.trim();
  const { t } = filter;

  if (search) {
    return t.stats.campusesMatchingSearch;
  }

  if (filter.selectedProvince !== 'All') {
    return interpolate(t.stats.campusesInProvince, {
      province: filter.getProvinceLabel(filter.selectedProvince),
    });
  }

  if (filter.selectedRegion !== 'All') {
    return interpolate(t.stats.campusesInRegion, {
      region: filter.getRegionLabel(filter.selectedRegion as Region),
    });
  }

  return t.stats.totalCampuses;
}

function buildGoalDetailLabel(
  filter: StatsTranslationContext,
  prayedFor: number,
  total: number,
): string {
  const search = filter.searchQuery.trim();
  const { t } = filter;
  const values = { prayedFor, total };

  if (search) {
    return interpolate(t.stats.goalDetailSearch, values);
  }

  if (filter.selectedProvince !== 'All') {
    return interpolate(t.stats.goalDetailInProvince, {
      ...values,
      province: filter.getProvinceLabel(filter.selectedProvince),
    });
  }

  if (filter.selectedRegion !== 'All') {
    return interpolate(t.stats.goalDetailInRegion, {
      ...values,
      region: filter.getRegionLabel(filter.selectedRegion as Region),
    });
  }

  return interpolate(t.stats.goalDetailNational, values);
}

export function computeStats(
  filteredCampuses: Campus[],
  filter: StatsTranslationContext,
): CampusStats {
  const total = filteredCampuses.length;
  const prayedFor = filteredCampuses.filter((campus) => campus.prayedFor).length;
  const goalProgressPercent =
    total === 0 ? 0 : Math.round((prayedFor / total) * 100);

  return {
    total,
    prayedFor,
    unprayed: total - prayedFor,
    goalProgressPercent,
    campusesLabel: buildCampusesLabel(filter),
    goalDetailLabel: buildGoalDetailLabel(filter, prayedFor, total),
  };
}

export function getProvinces(campusList: Campus[]): string[] {
  return [...new Set(campusList.map((campus) => campus.province))].sort();
}

export function getRegions(campusList: Campus[]): string[] {
  return [...new Set(campusList.map((campus) => campus.region))].sort();
}
