import { FormEvent, useEffect, useRef, useState } from "react";
import type { LocationSuggestion } from "@weather/domain";

interface WeatherSearchProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

export function WeatherSearch({ onSearch, isLoading }: WeatherSearchProps) {
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
          const data: LocationSuggestion[] = await res.json();
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

  return (
    <form onSubmit={handleSubmit}>
      <div className="search-row">
        <div className="search-field-wrap" ref={fieldWrapRef}>
          <span className="search-icon">🔍</span>
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
                  {/* onMouseDown fires before onBlur so the click is not swallowed */}
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
  );
}
