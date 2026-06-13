import { useMapEvents } from 'react-leaflet';

type MapClickControllerProps = {
  onMapClick: () => void;
};

/** Clears campus selection when the user clicks empty map space. */
export function MapClickController({ onMapClick }: MapClickControllerProps) {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });

  return null;
}
