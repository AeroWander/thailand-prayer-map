import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Campus } from '../types/campus';
import { searchLocationsGrouped, type LocationSearchResult } from '../utils/searchLocations';

type UniversitySearchProps = {
  campuses: Campus[];
  value: string;
  onChange: (query: string) => void;
  onSelectResult: (result: LocationSearchResult) => void;
  variant?: 'inline' | 'floating';
  clearOnSelect?: boolean;
};

function LocationPinIcon() {
  return (
    <svg
      className="university-search__pin"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 1.5C5.65 1.5 3.75 3.45 3.75 5.85c0 3.15 4.25 8.65 4.25 8.65s4.25-5.5 4.25-8.65C12.25 3.45 10.35 1.5 8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle cx="8" cy="5.75" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function UniversitySearch({
  campuses,
  value,
  onChange,
  onSelectResult,
  variant = 'inline',
  clearOnSelect = false,
}: UniversitySearchProps) {
  const { t, getCampusPrimaryName, getProvinceLabel, getRegionLabel } = useLanguage();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const grouped = useMemo(
    () => searchLocationsGrouped(campuses, value),
    [campuses, value],
  );

  const allResults = grouped.selectable;
  const showDropdown = isOpen && value.trim().length > 0;

  const closeDropdown = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleSelect = (result: LocationSearchResult) => {
    if (result.kind === 'campus') {
      onChange(clearOnSelect ? '' : getCampusPrimaryName(result.campus));
    } else {
      onChange(clearOnSelect ? '' : result.kind === 'city' ? result.city : getProvinceLabel(result.province));
    }
    closeDropdown();
    onSelectResult(result);
    inputRef.current?.blur();
  };

  useEffect(() => {
    if (!showDropdown) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [showDropdown]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      closeDropdown();
      return;
    }

    if (event.key === 'ArrowDown' && showDropdown && allResults.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % allResults.length);
      return;
    }

    if (event.key === 'ArrowUp' && showDropdown && allResults.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? allResults.length - 1 : index - 1));
      return;
    }

    if (event.key === 'Enter') {
      if (!showDropdown || allResults.length === 0) {
        return;
      }

      event.preventDefault();
      const index = activeIndex >= 0 ? activeIndex : 0;
      handleSelect(allResults[index]);
    }
  };

  const isFloating = variant === 'floating';

  const handleInputFocus = () => {
    if (value.trim()) {
      setIsOpen(true);
    }
  };

  const renderResult = (result: LocationSearchResult, index: number) => {
    const isActive = index === activeIndex;
    const optionClass = isActive
      ? 'university-search__option university-search__option--active'
      : 'university-search__option';

    if (result.kind === 'campus') {
      return (
        <li
          key={`campus-${result.campus.id}`}
          id={`${listboxId}-option-${index}`}
          role="option"
          aria-selected={isActive}
          className={optionClass}
        >
          <button
            type="button"
            className="university-search__option-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSelect(result)}
          >
            <span className="university-search__option-name">
              {getCampusPrimaryName(result.campus)}
            </span>
            <span className="university-search__option-province">
              {getProvinceLabel(result.campus.province)} · {getRegionLabel(result.campus.region)}
            </span>
          </button>
        </li>
      );
    }

    const label = result.kind === 'city' ? result.city : getProvinceLabel(result.province);
    const meta = result.kind === 'city'
      ? getProvinceLabel(result.province)
      : t.landing.searchProvinceType;

    return (
      <li
        key={`${result.kind}-${result.kind === 'city' ? result.city : result.province}`}
        id={`${listboxId}-option-${index}`}
        role="option"
        aria-selected={isActive}
        className={optionClass}
      >
        <button
          type="button"
          className="university-search__option-btn university-search__option-btn--location"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleSelect(result)}
        >
          <LocationPinIcon />
          <span className="university-search__option-name">{label}</span>
          <span className="university-search__option-province">{meta}</span>
        </button>
      </li>
    );
  };

  const hasLocationResults = grouped.provinces.length > 0 || grouped.cities.length > 0;
  const hasCampusResults = grouped.campuses.length > 0;

  const input = (
    <input
      ref={inputRef}
      id="university-search-input"
      type="search"
      enterKeyHint="search"
      className={
        isFloating
          ? 'university-search__input university-search__input--floating'
          : 'university-search__input'
      }
      placeholder={t.toolbar.searchPlaceholder}
      value={value}
      role="combobox"
      aria-expanded={showDropdown}
      aria-controls={listboxId}
      aria-autocomplete="list"
      aria-activedescendant={
        activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
      }
      onChange={(event) => {
        onChange(event.target.value);
        setIsOpen(true);
        setActiveIndex(-1);
      }}
      onFocus={handleInputFocus}
      onKeyDown={handleKeyDown}
    />
  );

  let optionIndex = 0;

  return (
    <div
      className={
        isFloating
          ? 'university-search university-search--floating'
          : 'university-search'
      }
      ref={rootRef}
    >
      <label
        className={
          isFloating
            ? 'university-search__label university-search__label--floating'
            : 'filter university-search__label'
        }
        htmlFor="university-search-input"
      >
        {!isFloating && <span className="filter__label">{t.toolbar.search}</span>}
        {isFloating ? (
          <span className="university-search__pill">
            <svg
              className="university-search__icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M10.5 10.5 13.5 13.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            {input}
          </span>
        ) : (
          input
        )}
      </label>

      {showDropdown && (
        <ul
          id={listboxId}
          className={
            isFloating
              ? 'university-search__dropdown university-search__dropdown--floating'
              : 'university-search__dropdown'
          }
          role="listbox"
          aria-label={t.search.resultsAria}
        >
          {allResults.length === 0 ? (
            <li className="university-search__empty" role="option" aria-selected={false}>
              {t.search.noResults}
            </li>
          ) : (
            <>
              {hasLocationResults && (
                <>
                  <li className="university-search__section" role="presentation">
                    {t.landing.searchProvincesLabel}
                  </li>
                  {[...grouped.provinces, ...grouped.cities].map((result) => {
                    const el = renderResult(result, optionIndex);
                    optionIndex += 1;
                    return el;
                  })}
                </>
              )}
              {hasCampusResults && (
                <>
                  {hasLocationResults && (
                    <li className="university-search__divider" role="separator" />
                  )}
                  <li className="university-search__section" role="presentation">
                    {t.landing.searchCampusesLabel}
                  </li>
                  {grouped.campuses.map((result) => {
                    const el = renderResult(result, optionIndex);
                    optionIndex += 1;
                    return el;
                  })}
                </>
              )}
            </>
          )}
        </ul>
      )}
    </div>
  );
}
