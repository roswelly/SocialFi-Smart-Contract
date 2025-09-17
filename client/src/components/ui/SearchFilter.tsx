import React, { useState, useEffect, forwardRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDebounce } from 'use-debounce';

interface SearchFilterProps {
  onSearch: (query: string) => void;
}

const SearchFilter = forwardRef<HTMLInputElement, SearchFilterProps>(({ onSearch }, ref) => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedValue] = useDebounce(searchInput, 500);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  return (
    <div className="relative flex items-center max-w-md mx-auto mb-6">
      <input
        ref={ref}
        type="text"
        placeholder="Search tokens..."
        value={searchInput}
        onChange={handleInputChange}
        className="w-full py-2 pl-10 pr-4 text-sm bg-[var(--card)] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors duration-200"
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    </div>
  );
});

SearchFilter.displayName = 'SearchFilter';

export default SearchFilter;