import React from 'react';
import { useCurrentTokenPrice, useTokenLiquidity } from '@/utils/blockchainUtils';
import { formatAmount, formatAmountV2 } from '@/utils/blockchainUtils';

interface PriceLiquidityProps {
  address: `0x${string}`;
}

const PriceLiquidity: React.FC<PriceLiquidityProps> = ({ address }) => {
  const { data: currentPrice } = useCurrentTokenPrice(address);
  const { data: liquidityData } = useTokenLiquidity(address);

  const calculateProgress = (currentLiquidity: bigint): number => {
    const liquidityInEth = parseFloat(formatAmountV2(currentLiquidity.toString()));
    const target = Number(process.env.NEXT_PUBLIC_DEX_TARGET);
    const progress = (liquidityInEth / target) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-base sm:text-lg font-semibold mb-2 text-blue-300">Current Price</h2>
        <p className="text-lg sm:text-xl text-blue-400">
          {currentPrice ? formatAmount(currentPrice.toString()) : 'Loading...'} ETH
        </p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-base sm:text-lg font-semibold mb-2 text-blue-300">Current Liquidity</h2>
        <p className="text-lg sm:text-xl text-blue-400 mb-2">
          {liquidityData && liquidityData[2] ? `${formatAmountV2(liquidityData[2].toString())} ETH` : '0 ETH'}
        </p>
        {liquidityData && liquidityData[2] && (
          <>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2 relative">
              <div 
                className="bg-blue-600 h-full rounded-l-full transition-all duration-500 ease-out"
                style={{ width: `${calculateProgress(liquidityData[2])}%` }}
              ></div>
              <div 
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-semibold text-white"
              >
                {calculateProgress(liquidityData[2]).toFixed(2)}%
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PriceLiquidity;