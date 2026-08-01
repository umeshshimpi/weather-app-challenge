import { FormEvent, useState } from "react";

interface WeatherSearchProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

export function WeatherSearch({ onSearch, isLoading }: WeatherSearchProps) {
  const [inputValue, setInputValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="search-row">
        <div className="search-field-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search city (e.g. Tokyo, New York...)"
            disabled={isLoading}
            className="search-input"
          />
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
