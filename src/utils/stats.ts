import type { Campus } from '../types/campus';

export function getProvinces(campusList: Campus[]): string[] {
  return [...new Set(campusList.map((campus) => campus.province))].sort();
}

export function getRegions(campusList: Campus[]): string[] {
  return [...new Set(campusList.map((campus) => campus.region))].sort();
}
