import React, { useEffect, useState } from 'react';
import { ExternalLinkIcon, Copy } from 'lucide-react';
import { TokenWithTransactions, PriceCache } from '@/interface/types';
import { formatTimestamp, shortenAddress, formatAddressV2, formatAmount } from '@/utils/blockchainUtils';
import { Globe, Twitter, Send as Telegram, Youtube, MessageCircle as Discord } from 'lucide-react';
import { useTokenLiquidity, useCurrentTokenPrice, useMarketCap, formatAmountV2 } from '@/utils/blockchainUtils';
import { formatUnits } from 'viem';
import { toast } from 'react-toastify';
import { getCurrentPrice } from '@/utils/api';
import Image from 'next/image';

interface TokenInfoProps {
  tokenInfo: TokenWithTransactions;
  showHeader?: boolean;
  refreshTrigger?: number;
  liquidityEvents?: any;
}

// cache duration constant (5 minutes)
// price cache outside component to share across instances
const CACHE_DURATION = 5 * 60 * 1000;
let priceCache: PriceCache | null = null;

const TokenInfo: React.FC<TokenInfoProps> = ({ tokenInfo, showHeader = false, refreshTrigger = 0, liquidityEvents }) => {
  const [flrPrice, setFlrPrice] = useState<string>('0');
  const tokenAddress = tokenInfo?.address as `0x${string}`;
  const shouldFetchLiquidity = !liquidityEvents?.liquidityEvents?.length;
  const { data: liquidityData, refetch: refetchLiquidity } = useTokenLiquidity(shouldFetchLiquidity ? tokenAddress : null);
  const { data: currentPrice, refetch: refetchPrice } = useCurrentTokenPrice(tokenAddress);
  const { data: marketCap, refetch: refetchMarketCap } = useMarketCap(tokenAddress);

  useEffect(() => {
    const fetchFlrPrice = async () => {
      try {
        // Check if we have a valid cached price
        if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
          setFlrPrice(priceCache.price);
          return;
        }

        // If no valid cache, fetch new price
        const price = await getCurrentPrice();
        
        // Update cache
        priceCache = {
          price,
          timestamp: Date.now()
        };
        
        setFlrPrice(price);
      } catch (error) {
        console.error('Error fetching FLR price:', error);
      }
    };

    fetchFlrPrice();
    const interval = setInterval(fetchFlrPrice, 60000); // Still check every minute

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (shouldFetchLiquidity) {
      refetchLiquidity();
    }
    refetchPrice();
    refetchMarketCap();
  }, [refreshTrigger, refetchLiquidity, refetchPrice, refetchMarketCap, shouldFetchLiquidity]);

  const isCompleted = liquidityEvents?.liquidityEvents?.length > 0;

  const calculateProgress = (currentLiquidity: bigint): number => {
    if (isCompleted) return 100;
    
    const liquidityInEth = parseFloat(formatUnits(currentLiquidity, 18));
    const target = Number(process.env.NEXT_PUBLIC_DEX_TARGET);
    const progress = (liquidityInEth / target) * 100;
    return Math.min(progress, 100);
  };

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return `${description.slice(0, maxLength)}...`;
  };

  const formatUsdValue = (flrAmount: string): string => {
    const flrValue = Number(flrAmount) / 10**18;
    const usdValue = flrValue * parseFloat(flrPrice);

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(usdValue);
  };

  const TokenDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InfoItem 
          label="Contract" 
          value={tokenInfo?.address ? formatAddressV2(tokenInfo.address) : 'Loading...'}
                          link={`https://etherscan.io/address/${tokenInfo?.address}`}
          isExternal={true}
        />
        <InfoItem 
          label="Deployer" 
          value={tokenInfo?.creatorAddress ? shortenAddress(tokenInfo.creatorAddress) : 'Loading...'}
          link={`/profile/${tokenInfo?.creatorAddress}`}
          isExternal={false}
          copyValue={tokenInfo?.creatorAddress}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoItem 
          label="Created" 
          value={tokenInfo?.createdAt ? formatTimestamp(tokenInfo.createdAt) : 'Loading...'}
        />
        <InfoItem 
          label="Current Price" 
                          value={currentPrice ? `${formatAmount(currentPrice.toString())} ETH` : 'Loading...'}
        />
      </div>

      {/* Updated Market Cap to show only USD value */}
      <div className="bg-[var(--card2)] p-3 rounded-lg text-center">
        <div className="text-xs text-gray-400 mb-1">Market Cap</div>
          <div className="text-sm text-white">
            {marketCap ? (
            //   <>
            //   <div>{formatAmountV2(marketCap.toString())} FLR</div>
            //   <div className="text-gray-400 text-xs mt-1">
            //     {formatUsdValue(marketCap.toString())}
            //   </div>
            // </>
              formatUsdValue(marketCap.toString())
            ) : (
              'Loading...'
            )}
        </div>
      </div>
    </div>
  );

  if (showHeader) {
    return (
      <div className="space-y-6">
        {/* Mobile Header (hidden on desktop) */}
        <div className="lg:hidden flex flex-col">
          {/* Full-width image container for mobile */}
          <div className="w-full h-[200px] mb-4 bg-[var(--card2)] rounded-b-xl overflow-hidden">
            <img 
              src={tokenInfo.logo || '/chats/noimg.svg'} 
              alt={tokenInfo.name} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Mobile Token Info Container */}
          <div className="px-4">
            {/* Name and Symbol - Updated to be inline */}
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-white inline">
                {tokenInfo.name}
                <span className="text-gray-400 ml-2">${tokenInfo.symbol}</span>
              </h1>
            </div>

            {/* Updated Description */}
            <p className="text-sm text-gray-400 text-center mb-4">
              {truncateDescription(tokenInfo.description)}
            </p>

            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-6">
              {tokenInfo.website && (
                <a 
                  href={tokenInfo.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-[var(--primary)] transition-colors"
                >
                  <Globe size={24} />
                </a>
              )}
              {tokenInfo.twitter && (
                <a 
                  href={tokenInfo.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-[var(--primary)] transition-colors"
                >
                  <Twitter size={24} />
                </a>
              )}
              {tokenInfo.telegram && (
                <a 
                  href={tokenInfo.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-[var(--primary)] transition-colors"
                >
                  <Telegram size={24} />
                </a>
              )}
              {tokenInfo.discord && (
                <a 
                  href={tokenInfo.discord} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-[var(--primary)] transition-colors"
                >
                  <Discord size={24} />
                </a>
              )}
              {tokenInfo.youtube && (
                <a 
                  href={tokenInfo.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-[var(--primary)] transition-colors"
                >
                  <Youtube size={24} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Header (hidden on mobile) - Updated alignment */}
        <div className="hidden lg:block">
          <div className="flex items-start gap-4">
            <img 
              src={tokenInfo.logo || '/chats/noimg.svg'} 
              alt={tokenInfo.name} 
              className="w-24 h-24 rounded-lg"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white inline">
                  {tokenInfo.name}
                  <span className="text-gray-400 ml-2">${tokenInfo.symbol}</span>
                </h1>
              </div>
              {/* Updated Description */}
              <p className="text-sm text-gray-400 mt-1">
                {truncateDescription(tokenInfo.description)}
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3 mt-4">
                {tokenInfo.website && (
                  <a href={tokenInfo.website} target="_blank" rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-[var(--primary)]">
                    <Globe size={20} />
                  </a>
                )}
                {tokenInfo.twitter && (
                  <a href={tokenInfo.twitter} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[var(--primary)]">
                    <Twitter size={20} />
                  </a>
                )}
                {tokenInfo.telegram && (
                  <a href={tokenInfo.telegram} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[var(--primary)]">
                    <Telegram size={20} />
                  </a>
                )}
                {tokenInfo.discord && (
                  <a href={tokenInfo.discord} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[var(--primary)]">
                    <Discord size={20} />
                  </a>
                )}
                {tokenInfo.youtube && (
                  <a href={tokenInfo.youtube} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[var(--primary)]">
                    <Youtube size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar (shared between mobile and desktop) */}
        <div className="bg-[var(--card2)] p-4 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress to DEX</span>
            <span className={isCompleted ? "text-[var(--primary)]" : "text-white"}>
              {isCompleted 
                ? 'Completed' 
                : liquidityData && liquidityData[2] 
                  ? `${calculateProgress(liquidityData[2]).toFixed(4)}%` 
                  : '0%'}
            </span>
          </div>
          <div className="w-full bg-[var(--card-boarder)] rounded-full h-2.5">
            <div
              className="bg-[var(--primary)] h-2.5 rounded-full transition-all duration-500"
              style={{ 
                width: isCompleted 
                  ? '100%' 
                  : `${liquidityData ? calculateProgress(liquidityData[2]) : 0}%` 
              }}
            />
          </div>
        </div>

        {/* Token Details */}
        <TokenDetails />
      </div>
    );
  }

  // When showHeader is false, only show the token details
  return <TokenDetails />;
};

const InfoItem: React.FC<{ 
  label: string; 
  value?: string; 
  link?: string; 
  isExternal?: boolean;
  copyValue?: string;
}> = ({ label, value, link, isExternal, copyValue }) => (
  <div className="bg-[var(--card2)] p-3 rounded-lg">
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    <div className="text-sm text-white flex items-center gap-2">
      {link ? (
        <div className="flex items-center gap-2 flex-grow">
          <a 
            href={link} 
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="hover:text-[var(--primary)] transition-colors flex items-center gap-1"
          >
            {value}
            {isExternal && <ExternalLinkIcon size={12} />}
          </a>
          {copyValue && (
            <button
              onClick={() => copyToClipboard(copyValue)}
              className="text-gray-400 hover:text-[var(--primary)] transition-colors"
            >
              <Copy size={12} />
            </button>
          )}
        </div>
      ) : (
        value
      )}
    </div>
  </div>
);

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    toast.success('Address copied to clipboard!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  });
};

export default TokenInfo;
