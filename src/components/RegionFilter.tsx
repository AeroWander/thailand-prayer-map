import { useLanguage } from '../i18n/LanguageContext';
import { getRegions } from '../utils/stats';
import type { Campus, Region } from '../types/campus';

type RegionFilterProps = {
  campuses: Campus[];
  value: string;
  onChange: (region: string) => void;
};

export function RegionFilter({ campuses, value, onChange }: RegionFilterProps) {
  const { t, getRegionLabel } = useLanguage();
  const regions = getRegions(campuses);

  return (
    <label className="filter">
      <span className="filter__label">{t.toolbar.region}</span>
      <select
        className="filter__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="All">{t.toolbar.allRegions}</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {getRegionLabel(region as Region)}
          </option>
        ))}
      </select>
    </label>
  );
}
