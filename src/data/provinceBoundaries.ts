export const PROVINCE_BOUNDARIES_URL =
  'https://raw.githubusercontent.com/apisit/thailand.json/master/thailand.json';

export type ProvinceFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  { name: string }
>;

let cachedBoundaries: ProvinceFeatureCollection | null = null;
let loadPromise: Promise<ProvinceFeatureCollection> | null = null;

export function loadProvinceBoundaries(): Promise<ProvinceFeatureCollection> {
  if (cachedBoundaries) {
    return Promise.resolve(cachedBoundaries);
  }

  if (!loadPromise) {
    loadPromise = fetch(PROVINCE_BOUNDARIES_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load province boundaries (${response.status})`);
        }
        return response.json() as Promise<ProvinceFeatureCollection>;
      })
      .then((data) => {
        cachedBoundaries = data;
        return data;
      })
      .catch((error) => {
        loadPromise = null;
        throw error;
      });
  }

  return loadPromise;
}

export function preloadProvinceBoundaries(): void {
  void loadProvinceBoundaries();
}
