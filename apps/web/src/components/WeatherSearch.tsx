import { FormEvent, useEffect, useRef, useState } from "react";
import { Clock, Search } from "lucide-react";
import type { LocationSuggestion } from "@weather/domain";

interface WeatherSearchProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
  recentSearches?: string[];
  onRecentSearch?: (city: string) => void;
}

export function WeatherSearch({
  onSearch,
  isLoading,
  recentSearches = [],
  onRecentSearch,
}: WeatherSearchProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fieldWrapRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions 300 ms after the user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (inputValue.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/weather/suggestions?q=${encodeURIComponent(inputValue.trim())}`
        );
        if (res.ok) {
          const data = (await res.json()) as LocationSuggestion[];
          setSuggestions(data);
          setShowDropdown(data.length > 0);
        }
      } catch {
        // Suggestion failures are non-critical — the user can still submit manually
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  // Close the dropdown when the user clicks outside the search field
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (fieldWrapRef.current && !fieldWrapRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      onSearch(trimmed);
      setShowDropdown(false);
    }
  }

  function handleSelectSuggestion(suggestion: LocationSuggestion) {
    const label = suggestion.region
      ? `${suggestion.name}, ${suggestion.region}, ${suggestion.country}`
      : `${suggestion.name}, ${suggestion.country}`;
    setInputValue(label);
    onSearch(suggestion.name);
    setSuggestions([]);
    setShowDropdown(false);
  }

  function handleRecentSearch(city: string) {
    setInputValue(city);
    onRecentSearch?.(city);
    setShowDropdown(false);
  }

  const showRecent = inputValue === "" && recentSearches.length > 0;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="search-row">
          <div className="search-field-wrap" ref={fieldWrapRef}>
            <Search size={16} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Search city (e.g. Tokyo, New York...)"
              disabled={isLoading}
              className="search-input"
              autoComplete="off"
            />

            {showDropdown && (
              <ul className="suggestions-dropdown" role="listbox">
                {suggestions.map((s, i) => (
                  <li key={i} role="option">
                    <button
                      type="button"
                      className="suggestion-item"
                      onMouseDown={() => handleSelectSuggestion(s)}
                    >
                      <span className="suggestion-name">
                        {s.name}{s.region ? `, ${s.region}` : ""}
                      </span>
                      <span className="suggestion-country">{s.country}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="search-button"
          >
            {isLoading ? "Loading..." : "Search"}
          </button>
        </div>
      </form>

      {showRecent && (
        <div className="recent-searches" role="navigation" aria-label="Recent searches">
          <span className="recent-searches-label">
            <Clock size={12} aria-hidden="true" />
            Recent
          </span>
          {recentSearches.map((city) => (
            <button
              key={city}
              type="button"
              className="recent-search-chip"
              onClick={() => handleRecentSearch(city)}
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
