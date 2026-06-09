import { useLanguage } from '../i18n/LanguageContext';
import { getProvinces } from '../utils/stats';
import type { Campus } from '../types/campus';

type ProvinceFilterProps = {
  campuses: Campus[];
  value: string;
  onChange: (province: string) => void;
};

export function ProvinceFilter({ campuses, value, onChange }: ProvinceFilterProps) {
  const { t, getProvinceLabel } = useLanguage();
  const provinces = getProvinces(campuses);

  return (
    <label className="filter">
      <span className="filter__label">{t.toolbar.province}</span>
      <select
        className="filter__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="All">{t.toolbar.allProvinces}</option>
        {provinces.map((province) => (
          <option key={province} value={province}>
            {getProvinceLabel(province)}
          </option>
        ))}
      </select>
    </label>
  );
}
