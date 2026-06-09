import type { Campus } from '../types/campus';

export function campusMatchesSearch(campus: Campus, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) {
    return true;
  }

  const normalized = trimmed.toLowerCase();
  return (
    campus.name.toLowerCase().includes(normalized) || campus.nameTh.includes(trimmed)
  );
}

export function filterCampusesBySearch(campuses: Campus[], query: string): Campus[] {
  if (!query.trim()) {
    return campuses;
  }

  return campuses.filter((campus) => campusMatchesSearch(campus, query));
}

export function searchCampuses(
  campuses: Campus[],
  query: string,
  limit = 8,
): Campus[] {
  if (!query.trim()) {
    return [];
  }

  return filterCampusesBySearch(campuses, query).slice(0, limit);
}
