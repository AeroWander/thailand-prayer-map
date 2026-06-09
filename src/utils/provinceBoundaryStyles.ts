import type { PathOptions } from 'leaflet';
import type { Region } from '../types/campus';
import { provinceToRegion } from './regions';
import { geoJsonProvinceToApp } from './provinceGeoNames';

const DEFAULT_STYLE: PathOptions = {
  color: '#1B5EA6',
  opacity: 0.15,
  weight: 1,
  fillOpacity: 0,
  fill: false,
};

const HIGHLIGHT_STYLE: PathOptions = {
  color: '#1B5EA6',
  opacity: 0.5,
  weight: 2,
  fillColor: '#1B5EA6',
  fillOpacity: 0.04,
  fill: true,
};

export function isProvinceBoundaryHighlighted(
  geoJsonProvinceName: string,
  selectedProvince: string,
  selectedRegion: string,
): boolean {
  const appProvince = geoJsonProvinceToApp(geoJsonProvinceName);

  if (selectedProvince !== 'All') {
    return appProvince === selectedProvince;
  }

  if (selectedRegion !== 'All') {
    return provinceToRegion(appProvince) === (selectedRegion as Region);
  }

  return false;
}

export function getProvinceBoundaryStyle(
  geoJsonProvinceName: string,
  selectedProvince: string,
  selectedRegion: string,
): PathOptions {
  return isProvinceBoundaryHighlighted(geoJsonProvinceName, selectedProvince, selectedRegion)
    ? HIGHLIGHT_STYLE
    : DEFAULT_STYLE;
}
