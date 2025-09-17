import React, { useMemo, useState } from 'react';
import TokenCard from './TokenCard';
import { Token, TokenWithLiquidityEvents } from '@/interface/types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import LoadingBar from '@/components/ui/LoadingBar';
import { SortOption } from '../ui/SortOptions';

interface TokenListProps {
  tokens: (Token | TokenWithLiquidityEvents)[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isEnded: boolean;
  sortType: SortOption;
  itemsPerPage: number;
  isFullList?: boolean;
}

interface TokenLiquidityData {
  [key: string]: bigint;
}

const TokenList: React.FC<TokenListProps> = ({ 
  tokens, 
  currentPage, 
  totalPages, 
  onPageChange, 
  isEnded,
  sortType,
  itemsPerPage,
  isFullList
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [liquidityData, setLiquidityData] = useState<TokenLiquidityData>({});

  const handleTokenClick = async (tokenAddress: string) => {
    setIsLoading(true);
    await router.push(`/token/${tokenAddress}`);
    setIsLoading(false);
  };

  const updateLiquidityData = (tokenAddress: string, amount: bigint) => {
    setLiquidityData(prev => ({
      ...prev,
      [tokenAddress]: amount
    }));
  };

    // Sort and paginate tokens
    const displayTokens = useMemo(() => {
      let sortedTokens = [...tokens];
      
      if (sortType === 'marketcap') {
        sortedTokens.sort((a, b) => {
          const liquidityA = liquidityData[a.address] || BigInt(0);
          const liquidityB = liquidityData[b.address] || BigInt(0);
          return liquidityB > liquidityA ? 1 : -1;
        });
      }
  
      // If we're handling the full list, paginate here
      if (isFullList) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return sortedTokens.slice(startIndex, endIndex);
    }
  
    return sortedTokens;
  }, [tokens, sortType, liquidityData, currentPage, itemsPerPage, isFullList]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
         {displayTokens.map((token) => (
          <TokenCard 
            key={token.id} 
            token={token} 
            isEnded={isEnded} 
            onTokenClick={handleTokenClick}
            onLiquidityUpdate={(amount) => updateLiquidityData(token.address, amount)}
          />
        ))}
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingBar size="large" />
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-[var(--card)] text-gray-400 hover:bg-[var(--card-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
                  currentPage === page
                    ? 'bg-[var(--primary)] text-black'
                    : 'bg-[var(--card)] text-gray-400 hover:bg-[var(--card-hover)]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md bg-[var(--card)] text-gray-400 hover:bg-[var(--card-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
};

export default TokenList;