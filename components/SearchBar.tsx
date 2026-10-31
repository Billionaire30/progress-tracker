"use client";

import { useState, useCallback, memo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useClickSound } from "@/lib/hooks/use-click-sound";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = memo(function SearchBar({ onSearch, placeholder = "Search..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const { playClickSound } = useClickSound();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  }, [onSearch]);

  const handleFocus = useCallback(() => {
    playClickSound();
  }, [playClickSound]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        className="pl-10"
      />
    </div>
  );
});
