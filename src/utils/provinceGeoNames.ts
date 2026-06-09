/** Maps GeoJSON province names to the canonical names used in campus data. */
const GEOJSON_TO_APP_PROVINCE: Record<string, string> = {
  'Bangkok Metropolis': 'Bangkok',
  'Buri Ram': 'Buriram',
  'Chai Nat': 'Chainat',
  'Chon Buri': 'Chonburi',
  'Lop Buri': 'Lopburi',
  'Phangnga': 'Phang Nga',
  'Si Sa Ket': 'Sisaket',
};

export function geoJsonProvinceToApp(geoJsonName: string): string {
  return GEOJSON_TO_APP_PROVINCE[geoJsonName] ?? geoJsonName;
}
