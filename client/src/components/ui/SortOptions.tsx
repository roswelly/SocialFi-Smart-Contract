import React from 'react';

export type SortOption = 'trending' | 'new' | 'finalized' | 'marketcap';

interface SortOptionsProps {
  onSort: (option: SortOption) => void;
  currentSort: SortOption;
}

const SortOptions: React.FC<SortOptionsProps> = ({ onSort, currentSort }) => {
  // Function to handle the trending/marketcap toggle
  const handleTrendingClick = () => {
    if (currentSort === 'trending') {
      onSort('marketcap');
    } else {
      onSort('trending');
    }
  };

  return (
    <div className="mb-5 flex flex-wrap gap-2 justify-center">
      {/* Trending Section with  Market Cap */}
      <div className="flex gap-1">
        <button
          onClick={() => onSort('trending')}
          className={`px-4 py-2 text-sm rounded-l-md transition-colors duration-200 ${
            (currentSort === 'trending' || currentSort === 'marketcap')
              ? 'bg-[var(--card)] text-white'
              : 'text-gray-300 hover:bg-[var(--card)]'
          }`}
        >
          Trending
        </button>
        
        {/* Market Cap option only shows when Trending is selected */}
        {(currentSort === 'trending' || currentSort === 'marketcap') && (
          <button
            onClick={handleTrendingClick}
            className={`px-3 py-2 text-xs rounded-r-md transition-colors duration-200 border-l border-gray-700 ${
              currentSort === 'marketcap'
                ? 'bg-[var(--card)] text-white'
                : 'bg-[var(--card2)] text-gray-400 hover:bg-[var(--card)]'
            }`}
          >
            Market Cap
          </button>
        )}
      </div>

      {/* New tokens */}
      <button
        onClick={() => onSort('new')}
        className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
          currentSort === 'new'
            ? 'bg-[var(--card)] text-white'
            : 'text-gray-300 hover:bg-[var(--card)]'
        }`}
      >
        New
      </button>

      {/* Finalized = listed */}
      <button
        onClick={() => onSort('finalized')}
        className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
          currentSort === 'finalized'
            ? 'bg-[var(--card)] text-white'
            : 'text-gray-300 hover:bg-[var(--card)]'
        }`}
      >
        Finalized
      </button>
    </div>
  );
};

export default SortOptions;