import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampuses } from '../context/CampusContext';
import { useLanguage } from '../i18n/LanguageContext';
import type { MapNavigationState } from '../types/mapTravel';
import { buildMapNavigationState } from '../utils/mapNavigation';
import {
  resolveSearchQuery,
  searchLocationsGrouped,
  type LocationSearchResult,
} from '../utils/searchLocations';

function LocationPinIcon() {
  return (
    <svg
      className="hero-search__pin"
      width="16"
      height="16"
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

function CampusDotIcon() {
  return (
    <span className="hero-search__dot" aria-hidden="true" />
  );
}

const MOBILE_SEARCH_FOCUS_MQ = '(max-width: 768px)';
const SEARCH_SCROLL_DURATION_MS = 1000;

let activeSearchScrollFrame = 0;

function easeInOutCubic(progress: number): number {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function smoothScrollTo(container: HTMLElement, targetTop: number) {
  window.cancelAnimationFrame(activeSearchScrollFrame);

  const startTop = container.scrollTop;
  const distance = targetTop - startTop;

  if (Math.abs(distance) < 2) {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    container.scrollTop = targetTop;
    return;
  }

  const startTime = performance.now();

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / SEARCH_SCROLL_DURATION_MS, 1);
    container.scrollTop = startTop + distance * easeInOutCubic(progress);

    if (progress < 1) {
      activeSearchScrollFrame = window.requestAnimationFrame(step);
    }
  };

  activeSearchScrollFrame = window.requestAnimationFrame(step);
}

function scrollSearchIntoView(searchRoot: HTMLElement) {
  const scrollContainer = searchRoot.closest('.landing-page') as HTMLElement | null;
  if (!scrollContainer) {
    searchRoot.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const isMobile = window.matchMedia(MOBILE_SEARCH_FOCUS_MQ).matches;
  const containerRect = scrollContainer.getBoundingClientRect();
  const searchRect = searchRoot.getBoundingClientRect();
  const searchCenter =
    searchRect.top - containerRect.top + searchRect.height / 2 + scrollContainer.scrollTop;
  const targetCenter = isMobile
    ? scrollContainer.clientHeight * 0.35
    : scrollContainer.clientHeight * 0.5;
  const nextScrollTop = Math.max(0, searchCenter - targetCenter);

  smoothScrollTo(scrollContainer, nextScrollTop);
}

export function HeroSearch() {
  const navigate = useNavigate();
  const { campuses } = useCampuses();
  const { t, getCampusPrimaryName, getProvinceLabel } = useLanguage();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);

  const grouped = useMemo(
    () => searchLocationsGrouped(campuses, query),
    [campuses, query],
  );

  const { provinces, cities, campuses: campusResults, selectable } = grouped;
  const showDropdown = isOpen && query.trim().length > 0;
  const hasResults = selectable.length > 0;

  const closeDropdown = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const navigateToMap = (state: MapNavigationState) => {
    setQuery(state.name);
    setInlineMessage(null);
    closeDropdown();
    inputRef.current?.blur();
    navigate('/map', { state });
  };

  const selectResult = (result: LocationSearchResult) => {
    navigateToMap(
      buildMapNavigationState(
        result,
        campuses,
        getCampusPrimaryName,
        getProvinceLabel,
      ),
    );
  };

  const submitQuery = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    if (showDropdown && hasResults) {
      const index = activeIndex >= 0 ? activeIndex : 0;
      selectResult(selectable[index]);
      return;
    }

    const match = resolveSearchQuery(campuses, trimmed);
    if (match) {
      selectResult(match);
      return;
    }

    setInlineMessage(t.landing.searchNoResults);
    closeDropdown();
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
    if (event.key === 'Escape' || event.key === 'Tab') {
      closeDropdown();
      return;
    }

    if (event.key === 'ArrowDown' && showDropdown && hasResults) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % selectable.length);
      return;
    }

    if (event.key === 'ArrowUp' && showDropdown && hasResults) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? selectable.length - 1 : index - 1));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      submitQuery();
    }
  };

  const renderOption = (result: LocationSearchResult, index: number) => {
    const isActive = index === activeIndex;
    const optionClass = isActive
      ? 'hero-search__option hero-search__option--active'
      : 'hero-search__option';

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
            className="hero-search__option-btn hero-search__option-btn--campus"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => selectResult(result)}
          >
            <CampusDotIcon />
            <span className="hero-search__option-text">
              <span className="hero-search__option-name">
                {getCampusPrimaryName(result.campus)}
              </span>
              <span className="hero-search__option-meta">
                {getProvinceLabel(result.campus.province)}
              </span>
            </span>
          </button>
        </li>
      );
    }

    if (result.kind === 'city') {
      return (
        <li
          key={`city-${result.city}`}
          id={`${listboxId}-option-${index}`}
          role="option"
          aria-selected={isActive}
          className={optionClass}
        >
          <button
            type="button"
            className="hero-search__option-btn hero-search__option-btn--location"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => selectResult(result)}
          >
            <LocationPinIcon />
            <span className="hero-search__option-text">
              <span className="hero-search__option-name">{result.city}</span>
              <span className="hero-search__option-meta">
                {getProvinceLabel(result.province)}
              </span>
            </span>
          </button>
        </li>
      );
    }

    return (
      <li
        key={`province-${result.province}`}
        id={`${listboxId}-option-${index}`}
        role="option"
        aria-selected={isActive}
        className={optionClass}
      >
        <button
          type="button"
          className="hero-search__option-btn hero-search__option-btn--location"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => selectResult(result)}
        >
          <LocationPinIcon />
          <span className="hero-search__option-text">
            <span className="hero-search__option-name">
              {getProvinceLabel(result.province)}
            </span>
            <span className="hero-search__option-meta">{t.landing.searchProvinceType}</span>
          </span>
        </button>
      </li>
    );
  };

  let optionIndex = 0;

  return (
    <div className="hero-search" ref={rootRef}>
      <label className="hero-search__label" htmlFor="hero-search-input">
        <span className="hero-search__pill">
          <svg
            className="hero-search__icon"
            width="18"
            height="18"
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
          <input
            ref={inputRef}
            id="hero-search-input"
            type="search"
            className="hero-search__input"
            placeholder={t.landing.searchPlaceholder}
            value={query}
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
            }
            onChange={(event) => {
              setQuery(event.target.value);
              setInlineMessage(null);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => {
              if (rootRef.current) {
                scrollSearchIntoView(rootRef.current);
              }

              if (query.trim()) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
          />
        </span>
      </label>

      {inlineMessage && (
        <p className="hero-search__inline-message" role="status">
          {inlineMessage}
        </p>
      )}

      {showDropdown && (
        <ul
          id={listboxId}
          className="hero-search__dropdown"
          role="listbox"
          aria-label={t.landing.searchResultsAria}
        >
          {!hasResults ? (
            <li className="hero-search__empty" role="presentation">
              {t.landing.searchNoResults}
            </li>
          ) : (
            <>
              {(provinces.length > 0 || cities.length > 0) && (
                <>
                  <li className="hero-search__section" role="presentation">
                    {t.landing.searchProvincesLabel}
                  </li>
                  {provinces.map((result) => {
                    const element = renderOption(result, optionIndex);
                    optionIndex += 1;
                    return element;
                  })}
                  {cities.map((result) => {
                    const element = renderOption(result, optionIndex);
                    optionIndex += 1;
                    return element;
                  })}
                </>
              )}
              {campusResults.length > 0 && (
                <>
                  {(provinces.length > 0 || cities.length > 0) && (
                    <li className="hero-search__divider" role="separator" />
                  )}
                  <li className="hero-search__section" role="presentation">
                    {t.landing.searchCampusesLabel}
                  </li>
                  {campusResults.map((result) => {
                    const element = renderOption(result, optionIndex);
                    optionIndex += 1;
                    return element;
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
