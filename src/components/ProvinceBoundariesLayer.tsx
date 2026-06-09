import { useCallback, useEffect, useRef, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { Layer, Path } from 'leaflet';
import L from 'leaflet';
import { loadProvinceBoundaries, type ProvinceFeatureCollection } from '../data/provinceBoundaries';
import { getProvinceBoundaryStyle } from '../utils/provinceBoundaryStyles';

type ProvinceBoundariesLayerProps = {
  selectedProvince: string;
  selectedRegion: string;
};

type GeoJsonLayer = L.GeoJSON & {
  eachLayer(fn: (layer: Layer) => void): void;
};

export function ProvinceBoundariesLayer({
  selectedProvince,
  selectedRegion,
}: ProvinceBoundariesLayerProps) {
  const [boundaries, setBoundaries] = useState<ProvinceFeatureCollection | null>(null);
  const layerRef = useRef<GeoJsonLayer | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadProvinceBoundaries()
      .then((data) => {
        if (!cancelled) {
          setBoundaries(data);
        }
      })
      .catch(() => {
        // Boundaries are decorative — fail silently so the map still works.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const styleForFeature = useCallback(
    (feature?: GeoJSON.Feature) => {
      const name = feature?.properties?.name;
      if (!name || typeof name !== 'string') {
        return getProvinceBoundaryStyle('', selectedProvince, selectedRegion);
      }
      return getProvinceBoundaryStyle(name, selectedProvince, selectedRegion);
    },
    [selectedProvince, selectedRegion],
  );

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) {
      return;
    }

    layer.eachLayer((featureLayer) => {
      const path = featureLayer as Path & { feature?: GeoJSON.Feature };
      const feature = path.feature;
      if (!feature) {
        return;
      }
      path.setStyle(styleForFeature(feature));
    });
  }, [styleForFeature]);

  const onEachFeature = useCallback((feature: GeoJSON.Feature, layer: Layer) => {
    if (layer instanceof L.Path) {
      layer.options.className = 'province-boundary__path';
    }

    const path = layer as Path & { feature?: GeoJSON.Feature };
    path.feature = feature;
  }, []);

  if (!boundaries) {
    return null;
  }

  return (
    <GeoJSON
      ref={layerRef}
      data={boundaries}
      style={styleForFeature}
      interactive={false}
      onEachFeature={onEachFeature}
    />
  );
}
