import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Search, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  [key: string]: any; // For additional data
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string, item?: Option) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Search...",
  emptyMessage = "Type at least one letter to search",
  className,
  disabled = false,
}: SearchableSelectProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [showResults, setShowResults] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter options when search query changes
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setFilteredOptions([]);
      setShowResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(query),
    );
    setFilteredOptions(filtered);
    setShowResults(true);
  }, [searchQuery, options]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn("pl-8 pr-8", className)}
          disabled={disabled}
          onFocus={() => {
            if (searchQuery.trim().length > 0) {
              setShowResults(true);
            }
          }}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-0"
            onClick={() => {
              setSearchQuery("");
              setShowResults(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {selectedOption && searchQuery.trim().length === 0 && (
        <div className="mt-1.5 flex items-center gap-1.5 text-sm">
          <div className="bg-primary/10 text-primary rounded-md px-2 py-1 flex items-center gap-1">
            {selectedOption.label}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => {
                onChange("");
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">Selected</span>
        </div>
      )}

      {showResults && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
          <Command>
            <CommandList>
              {searchQuery.trim().length === 0 ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : filteredOptions.length === 0 ? (
                <CommandEmpty>No results found</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onChange(option.value, option);
                        setSearchQuery("");
                        setShowResults(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
