import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Campus } from '../types/campus';
import { searchCampuses } from '../utils/searchCampuses';

type UniversitySearchProps = {
  campuses: Campus[];
  value: string;
  onChange: (query: string) => void;
  onSelect: (campus: Campus) => void;
  variant?: 'inline' | 'floating';
  clearOnSelect?: boolean;
};

export function UniversitySearch({
  campuses,
  value,
  onChange,
  onSelect,
  variant = 'inline',
  clearOnSelect = false,
}: UniversitySearchProps) {
  const { t, getCampusPrimaryName, getProvinceLabel, getRegionLabel } = useLanguage();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = useMemo(
    () => searchCampuses(campuses, value),
    [campuses, value],
  );

  const showDropdown = isOpen && value.trim().length > 0;

  const closeDropdown = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const selectCampus = (campus: Campus) => {
    onChange(clearOnSelect ? '' : getCampusPrimaryName(campus));
    closeDropdown();
    onSelect(campus);
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

    if (event.key === 'ArrowDown' && showDropdown && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
      return;
    }

    if (event.key === 'ArrowUp' && showDropdown && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
      return;
    }

    if (event.key === 'Enter') {
      if (!showDropdown || results.length === 0) {
        return;
      }

      event.preventDefault();
      const index = activeIndex >= 0 ? activeIndex : 0;
      selectCampus(results[index]);
    }
  };

  const isFloating = variant === 'floating';

  const input = (
    <input
      ref={inputRef}
      id="university-search-input"
      type="search"
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
      onFocus={() => {
        if (value.trim()) {
          setIsOpen(true);
        }
      }}
      onKeyDown={handleKeyDown}
    />
  );

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
          {results.length === 0 ? (
            <li className="university-search__empty" role="option" aria-selected={false}>
              {t.search.noResults}
            </li>
          ) : (
            results.map((campus, index) => (
              <li
                key={campus.id}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={
                  index === activeIndex
                    ? 'university-search__option university-search__option--active'
                    : 'university-search__option'
                }
              >
                <button
                  type="button"
                  className="university-search__option-btn"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectCampus(campus)}
                >
                  <span className="university-search__option-name">
                    {getCampusPrimaryName(campus)}
                  </span>
                  <span className="university-search__option-province">
                    {getProvinceLabel(campus.province)} · {getRegionLabel(campus.region)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
