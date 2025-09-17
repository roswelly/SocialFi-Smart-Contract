import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Token, TokenWithLiquidityEvents } from '@/interface/types';
import { useTokenLiquidity, formatTimestampV1, formatTimestamp, formatAmountV2 } from '@/utils/blockchainUtils';
import { useRouter } from 'next/router';
import { Globe, Twitter, Send as Telegram, Clock, Youtube, MessageCircle as Discord } from 'lucide-react';
import LoadingBar from '@/components/ui/LoadingBar';

interface TokenCardProps {
  token: Token | TokenWithLiquidityEvents;
  isEnded: boolean;
  onTokenClick: (address: string) => void;
  onLiquidityUpdate?: (liquidityAmount: bigint) => void;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, isEnded, onTokenClick, onLiquidityUpdate }) => {
  const [currentLiquidity, setCurrentLiquidity] = useState<string>('0');
  const tokenAddress = token.address as `0x${string}`;
  const shouldFetchLiquidity = !token._count?.liquidityEvents;
  const { data: liquidityData } = useTokenLiquidity(shouldFetchLiquidity ? tokenAddress : null);
  const router = useRouter();

  useEffect(() => {
    if (shouldFetchLiquidity && 
        liquidityData && 
        liquidityData[2] && 
        liquidityData[2].toString() !== currentLiquidity) {
      
      const newLiquidity = liquidityData[2].toString();
      setCurrentLiquidity(newLiquidity);
      
      if (onLiquidityUpdate) {
        onLiquidityUpdate(liquidityData[2]);
      }
    }
  }, [
    liquidityData, 
    shouldFetchLiquidity, 
    onLiquidityUpdate, 
    currentLiquidity, 
    token.address
  ]);

  const calculateProgress = (liquidity: string): number => {
    if (token._count?.liquidityEvents > 0) {
      return 100;
    }
    // Convert from Wei to Ether (divide by 10^18)
    const currentValue = Number(liquidity) / 10**18;
    const target = Number(process.env.NEXT_PUBLIC_DEX_TARGET);
    const percentage = (currentValue / target) * 100;
    return Math.min(percentage, 100);
  };

  const progress = calculateProgress(currentLiquidity);
  const isCompleted = token._count?.liquidityEvents > 0;

  const SocialLinks = () => (
    <div className="flex items-center gap-2 absolute top-3 right-3" onClick={e => e.stopPropagation()}>
      {token.website && (
        <a 
          href={token.website} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-400 hover:text-white"
        >
          <Globe size={16} />
        </a>
      )}
      {token.twitter && (
        <a 
          href={token.twitter} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-400 hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <Twitter size={16} />
        </a>
      )}
      {token.telegram && (
        <a 
          href={token.telegram} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-400 hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <Telegram size={16} />
        </a>
      )}
      {token.discord && (
        <a 
          href={token.discord} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-400 hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <Discord size={16} />
        </a>
      )}
      {token.youtube && (
        <a 
          href={token.youtube} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-400 hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <Youtube size={16} />
        </a>
      )}
    </div>
  );

  const handleClick = () => {
    onTokenClick(token.address);
  };

  if (isEnded && 'liquidityEvents' in token && token.liquidityEvents.length > 0) {
    const liquidityEvent = token.liquidityEvents[0];
    const uniswapLink = `https://app.uniswap.org/swap?outputCurrency=${token.address}&chain=mainnet`;

    return (
      <div onClick={handleClick} className="cursor-pointer">
        <div className="bg-[var(--card)] rounded-lg overflow-hidden hover:bg-[var(--card-hover)] transition-colors duration-200">
          <div className="p-4">
            <div className="flex gap-4 mb-4">
              <div className="w-24 h-24 flex-shrink-0">
                <img 
                  src={token.logo || '/chats/noimg.svg'} 
                  alt={token.name} 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {token.name} <span className="text-gray-400">{token.symbol}</span>
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">{token.description}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Progress to DEX</span>
                <span className="text-[var(--primary)]">Completed</span>
              </div>
              <div className="w-full bg-[var(--card-boarder)] rounded-full h-2">
                <div
                  className="bg-[var(--primary)] h-2 rounded-full transition-all duration-500 w-full"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={uniswapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2 text-sm bg-[var(--primary)] text-black rounded-md hover:bg-[var(--primary-hover)] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Trade
              </a>
              <Link
                href={`/token/${token.address}`}
                className="flex-1 text-center py-2 text-sm bg-[var(--card-boarder)] text-white rounded-md hover:bg-[#444444] transition-colors"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <div className="bg-[var(--card)] rounded-lg overflow-hidden hover:bg-[var(--card-hover)] transition-colors duration-200 relative">
        <SocialLinks />
        <div className="p-4">
          <div className="flex gap-4 mb-4">
            <div className="w-24 h-24 flex-shrink-0">
              <img 
                src={token.logo || '/chats/noimg.svg'} 
                alt={token.name} 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-white mb-1">
                {token.name} <span className="text-gray-400">{token.symbol}</span>
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">{token.description}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-400">
              <Clock size={16} className="mr-2" />
              <span>{formatTimestampV1(token.createdAt)}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Progress to DEX</span>
                <span className={`${isCompleted ? 'text-[var(--primary)]' : 'text-white'}`}>
                  {isCompleted 
                    ? 'Completed' 
                    : liquidityData && liquidityData[2] 
                      ? `${calculateProgress(liquidityData[2].toString()).toFixed(2)}%` 
                      : '0%'}
                </span>
              </div>
              <div className="w-full bg-[var(--card-boarder)] rounded-full h-2">
                <div
                  className="bg-[var(--primary)] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;