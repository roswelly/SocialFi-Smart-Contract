import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon } from 'lucide-react';
import { TokenHolder } from '@/interface/types';
import { formatAmountV3, shortenAddress } from '@/utils/blockchainUtils';

interface TokenHoldersProps {
  tokenHolders: TokenHolder[];
  currentPage: number;
  totalPages: number;
  tokenSymbol: string;
  creatorAddress: string;
  tokenAddress: string;
  onPageChange: (page: number) => void;
  allHolders: TokenHolder[];
}

const TokenHolders: React.FC<TokenHoldersProps> = ({
  tokenHolders,
  currentPage,
  totalPages,
  tokenSymbol,
  creatorAddress,
  tokenAddress,
  onPageChange,
  allHolders,
}) => {
  const bondingCurveAddress = process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as `0x${string}`;

  // Calculate total supply excluding only the token contract
  const totalSupply = allHolders.reduce((sum, holder) => {
    if (holder.address.toLowerCase() === tokenAddress.toLowerCase()) {
      return sum;
    }
    return sum + BigInt(holder.balance);
  }, BigInt(0));

  // Calculate percentage for a holder
  const calculatePercentage = (balance: string, address: string): string => {
    if (address.toLowerCase() === tokenAddress.toLowerCase()) {
      return '0%';
    }
    
    if (totalSupply === BigInt(0)) return '0%';
    
    const percentage = (BigInt(balance) * BigInt(10000) / totalSupply);
    const percentageNumber = Number(percentage) / 100;
    
    if (percentageNumber < 0.001) {
      return '<0.001%';
    } else if (percentageNumber < 0.01) {
      return percentageNumber.toFixed(3) + '%';
    } else if (percentageNumber < 0.1) {
      return percentageNumber.toFixed(2) + '%';
    } else {
      return percentageNumber.toFixed(2) + '%';
    }
  };

  // Find bonding curve holder
  const bondingCurveHolder = allHolders.find(
    holder => holder.address.toLowerCase() === bondingCurveAddress.toLowerCase()
  );

  // Filter holders (excluding token contract AND bonding curve address) and paginate
  const filteredHolders = allHolders.filter(holder => 
    holder.address.toLowerCase() !== tokenAddress.toLowerCase() && 
    holder.address.toLowerCase() !== bondingCurveAddress.toLowerCase()
  );

  // Calculate pagination
  const holdersPerPage = 10;
  const startIndex = (currentPage - 1) * holdersPerPage;
  const endIndex = startIndex + holdersPerPage;
  const paginatedHolders = filteredHolders.slice(startIndex, endIndex);
  const actualTotalPages = Math.ceil(filteredHolders.length / holdersPerPage);

  return (
    <div className="w-full">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[var(--card2)]">
            <th className="px-4 py-2 text-sm text-gray-400">Holder</th>
            <th className="px-4 py-2 text-sm text-gray-400">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {/* Bonding Curve Manager as the first entry */}
          <tr className="border-b border-[var(--card-hover)]">
            <td className="px-4 py-2">
              <a
                href={`${process.env.NEXT_PUBLIC_BLOCKSCOUT_URL}/address/${bondingCurveAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[var(--primary)] text-sm flex items-center gap-1 transition-colors"
              >
                Bonding Curve <ExternalLinkIcon size={14} />
              </a>
            </td>
            <td className="px-4 py-2 text-gray-400 text-sm">
              {bondingCurveHolder ? calculatePercentage(bondingCurveHolder.balance, bondingCurveHolder.address) : '0%'}
            </td>
          </tr>
          {paginatedHolders.map((holder, index) => (
            <tr key={index} className="border-b border-[var(--card-hover)]">
              <td className="px-4 py-2">
                {holder.address === creatorAddress ? (
                  <a
                    href={`${process.env.NEXT_PUBLIC_BLOCKSCOUT_URL}/address/${holder.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[var(--primary)] text-sm flex items-center gap-1 transition-colors"
                  >
                    Creator <ExternalLinkIcon size={14} />
                  </a>
                ) : (
                  <a
                    href={`${process.env.NEXT_PUBLIC_BLOCKSCOUT_URL}/address/${holder.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[var(--primary)] text-sm flex items-center gap-1 transition-colors"
                  >
                    {shortenAddress(holder.address)} <ExternalLinkIcon size={14} />
                  </a>
                )}
              </td>
              <td className="px-4 py-2 text-gray-400 text-sm">
                {calculatePercentage(holder.balance, holder.address)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredHolders.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No token holder data available
        </div>
      )}

      {actualTotalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded bg-[var(--card2)] text-gray-400 hover:bg-[var(--card-hover)] disabled:opacity-50"
          >
            <ChevronLeftIcon size={20} />
          </button>
          {Array.from({ length: actualTotalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === page
                  ? 'bg-[var(--primary)] text-black'
                  : 'bg-[var(--card2)] text-gray-400 hover:bg-[var(--card-hover)]'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === actualTotalPages}
            className="p-1 rounded bg-[var(--card2)] text-gray-400 hover:bg-[var(--card-hover)] disabled:opacity-50"
          >
            <ChevronRightIcon size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TokenHolders;