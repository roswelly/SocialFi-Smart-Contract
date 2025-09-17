import { GetServerSideProps } from 'next';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import 'chartjs-adapter-date-fns';
import {
  ArrowUpDownIcon,
  Globe,
  Twitter,
  Send as Telegram,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import TradingViewChart from '@/components/charts/TradingViewChart';
import {
  useCurrentTokenPrice,
  useTokenLiquidity,
  useCalcBuyReturn,
  useCalcSellReturn,
  useBuyTokens,
  useSellTokens,
  useUserBalance,
  useTokenAllowance,
  useApproveTokens,
  formatAmountV2,
} from '@/utils/blockchainUtils';
import { getTokenInfoAndTransactions, getTokenUSDPriceHistory, getTokenHolders, getTokenLiquidityEvents } from '@/utils/api';
import { parseUnits, formatUnits } from 'viem';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useDebounce } from 'use-debounce';
import { toast } from 'react-toastify';
import ShareButton from '@/components/ui/ShareButton';
import SEO from '@/components/seo/SEO';
import { TokenWithTransactions } from '@/interface/types';
import Spinner from '@/components/ui/Spinner';
import { Tab } from '@headlessui/react';

import TransactionHistory from '@/components/TokenDetails/TransactionHistory';
import TokenHolders from '@/components/TokenDetails/TokenHolders';
import TokenInfo from '@/components/TokenDetails/TokenInfo';
import Chats from '@/components/TokenDetails/Chats';
// import OGPreview from '@/components/OGPreview'


interface TokenDetailProps {
  initialTokenInfo: TokenWithTransactions;
  initialPriceHistory: any[];
  initialHolders: any[];
}

// const TokenDetail: React.FC = () => {
  const TokenDetail: React.FC<TokenDetailProps> = ({ initialTokenInfo }) => {

  const router = useRouter();
  const { address } = router.query;
  const { address: userAddress } = useAccount();

  const [isApproved, setIsApproved] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenWithTransactions>(initialTokenInfo);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionPage, setTransactionPage] = useState(1);
  const [totalTransactionPages, setTotalTransactionPages] = useState(1);
  const [fromToken, setFromToken] = useState({ symbol: 'ETH', amount: '' });
  const [toToken, setToToken] = useState({ symbol: '', amount: '' });
  const [isSwapped, setIsSwapped] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [ethBalance, setEthBalance] = useState('0.000');
  const [tokenBalance, setTokenBalance] = useState('0.000');
  const [actionButtonText, setActionButtonText] = useState('Buy');
  const [chartError, setChartError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();


  //holders
  const [tokenHolders, setTokenHolders] = useState<Awaited<ReturnType<typeof getTokenHolders>>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [holdersPerPage] = useState(10);

  //confirm
  const { data: transactionReceipt, isError: transactionError, isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: transactionHash,
    confirmations: 2,
  });

  const [debouncedFromAmount] = useDebounce(fromToken.amount, 300);

  const { data: currentPrice, refetch: refetchCurrentPrice } = useCurrentTokenPrice(address as `0x${string}`);
  const { data: liquidityData, refetch: refetchLiquidity } = useTokenLiquidity(address as `0x${string}`);

  const { data: buyReturnData, isLoading: isBuyCalculating } = useCalcBuyReturn(address as `0x${string}`, parseUnits(debouncedFromAmount || '0', 18));
  const { data: sellReturnData, isLoading: isSellCalculating } = useCalcSellReturn(address as `0x${string}`, parseUnits(debouncedFromAmount || '0', 18));

  const { ethBalance: fetchedEthBalance, tokenBalance: fetchedTokenBalance, refetch: refetchUserBalance } = useUserBalance(userAddress as `0x${string}`, address as `0x${string}`);
  const { data: tokenAllowance } = useTokenAllowance(
    address as `0x${string}`, 
    userAddress as `0x${string}`, 
    process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as `0x${string}`
  );

  const { buyTokens } = useBuyTokens();
  const { sellTokens } = useSellTokens();
  const { approveTokens } = useApproveTokens();

  const [liquidityEvents, setLiquidityEvents] = useState<any>(null);

  const [refreshCounter, setRefreshCounter] = useState(0);


  const fetchTokenData = useCallback(
    async (page: number) => {
      try {
        const data = await getTokenInfoAndTransactions(address as string, page, 10);
        setTokenInfo(data);
        setTransactions(data.transactions.data);
        setTotalTransactionPages(data.transactions.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
    },
    [address]
  );

  const fetchHistoricalPriceData = useCallback(async () => {
    try {
      const historicalData = await getTokenUSDPriceHistory(address as string);
      if (Array.isArray(historicalData) && historicalData.length > 0) {
        const formattedData = historicalData.map((item, index, arr) => {
          const prevItem = arr[index - 1] || item;
          return {
            time: new Date(item.timestamp).getTime() / 1000,
            open: parseFloat(prevItem.tokenPriceUSD),
            high: Math.max(parseFloat(prevItem.tokenPriceUSD), parseFloat(item.tokenPriceUSD)),
            low: Math.min(parseFloat(prevItem.tokenPriceUSD), parseFloat(item.tokenPriceUSD)),
            close: parseFloat(item.tokenPriceUSD),
          };
        });
        setChartData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching historical price data:', error);
      setChartError('Failed to load chart data');
    }
  }, [address]);

  const fetchTokenHolders = async () => {
    if (address) {
      try {
        const holders = await getTokenHolders(address as string);
        setTokenHolders(holders);
      } catch (error) {
        console.error('Error fetching token holders:', error);
        toast.error('Failed to fetch token holders');
      }
    }
  };

  const indexOfLastHolder = currentPage * holdersPerPage;
  const indexOfFirstHolder = indexOfLastHolder - holdersPerPage;
  const currentHolders = tokenHolders.slice(indexOfFirstHolder, indexOfLastHolder);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const fetchAllData = useCallback(async () => {
    if (address) {
      await fetchTokenData(transactionPage);
      await fetchHistoricalPriceData();
      refetchCurrentPrice();
      refetchLiquidity();
      fetchTokenHolders();
      refetchUserBalance();

      
      try {
        const events = await getTokenLiquidityEvents(tokenInfo.id);
        setLiquidityEvents(events);
      } catch (error) {
        console.error('Error fetching liquidity events:', error);
      }
    }
  }, [address, transactionPage, fetchTokenData, fetchHistoricalPriceData, refetchCurrentPrice, refetchLiquidity, tokenInfo.id, refetchUserBalance]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (tokenAllowance !== undefined && address) {
      setIsApproved(tokenAllowance > 0);
    }
  }, [tokenAllowance, address]);

  useEffect(() => {
    if (fetchedEthBalance) {
      setEthBalance(parseFloat(formatUnits(fetchedEthBalance, 18)).toFixed(5));
    }
    if (fetchedTokenBalance) {
      setTokenBalance(parseFloat(formatUnits(fetchedTokenBalance, 18)).toFixed(5));
    }
  }, [fetchedEthBalance, fetchedTokenBalance]);

  useEffect(() => {
    if (transactionReceipt && !transactionError) {
      if (isSwapped) {
        if (!isApproved) {
          setIsApproved(true);
          toast.success('Token approval successful');
        } else {
          toast.success('Tokens sold successfully');
        }
      } else {
        toast.success('Tokens bought successfully');
      }
      fetchAllData();
      setIsTransacting(false);
      setRefreshCounter(prev => prev + 1);
    } else if (transactionError) {
      toast.error('Transaction failed');
      setIsTransacting(false);
    }
  }, [transactionReceipt, transactionError, isSwapped, isApproved, fetchAllData]);

  useEffect(() => {
    if (debouncedFromAmount) {
      setIsCalculating(true);
      if (isSwapped) {
        // Selling tokens
        if (sellReturnData !== undefined && !isSellCalculating) {
          const ethAmount = formatUnits(sellReturnData, 18);
          setToToken((prev) => ({ ...prev, amount: ethAmount }));
          setIsCalculating(false);
        }
      } else {
        // Buying tokens
        if (buyReturnData !== undefined && !isBuyCalculating) {
          const tokenAmount = formatUnits(buyReturnData, 18);
          setToToken((prev) => ({ ...prev, amount: tokenAmount }));
          setIsCalculating(false);
        }
      }
    } else {
      setToToken((prev) => ({ ...prev, amount: '' }));
      setIsCalculating(false);
    }
  }, [debouncedFromAmount, buyReturnData, sellReturnData, isSwapped, isBuyCalculating, isSellCalculating]);

  useEffect(() => {
    setActionButtonText(isSwapped ? (isApproved ? 'Sell' : 'Approve') : 'Buy');
  }, [isSwapped, isApproved]);

  const handleSwap = useCallback(() => {
    setIsSwapped((prev) => !prev);
    setFromToken((prev) => ({
      symbol: prev.symbol === 'ETH' ? tokenInfo.symbol : 'ETH',
      amount: '',
    }));
    setToToken((prev) => ({
      symbol: prev.symbol === 'ETH' ? tokenInfo.symbol : 'ETH',
      amount: '',
    }));
  }, [tokenInfo]);

  const handleFromAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFromToken((prev) => ({ ...prev, amount: e.target.value }));
    setIsCalculating(true);
  }, []);

  const handleAction = useCallback(async () => {
    if (!address || !fromToken.amount || !userAddress) {
      toast.error('Missing required information');
      return;
    }

    const amount = parseUnits(fromToken.amount, 18);
    setIsTransacting(true);

    try {
      let txHash;
      if (isSwapped) {
        if (!isApproved) {
          txHash = await approveTokens(address as `0x${string}`);
        } else {
          txHash = await sellTokens(address as `0x${string}`, amount);
        }
      } else {
        txHash = await buyTokens(address as `0x${string}`, amount);
      }
      console.log('Transaction hash:', txHash);
      setTransactionHash(txHash);
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Transaction failed to initiate: ' + (error as Error).message);
      setIsTransacting(false);
    }
  }, [address, fromToken.amount, userAddress, isSwapped, isApproved, approveTokens, sellTokens, buyTokens]);

  useEffect(() => {
    if (!isWaiting && !transactionError) {
      setIsTransacting(false);
      setTransactionHash(undefined);
    }
  }, [isWaiting, transactionError]);

  const handlePageChange = useCallback((newPage: number) => {
    setTransactionPage(newPage);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  const handleMaxClick = () => {
    if (isSwapped) {
      // For token balance, use the exact balance without formatting
      if (fetchedTokenBalance) {
        const exactTokenBalance = formatUnits(fetchedTokenBalance, 18);
        setFromToken(prev => ({ ...prev, amount: exactTokenBalance }));
      }
    } else {
      // For ETH balance, use 95% of the balance to reserve for gas
      if (fetchedEthBalance) {
        const exactEthBalance = formatUnits(fetchedEthBalance, 18);
        const maxEthAmount = (parseFloat(exactEthBalance) * 0.95).toString();
        setFromToken(prev => ({ ...prev, amount: maxEthAmount }));
      }
    }
  };

  if (!tokenInfo) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO token={tokenInfo} />
      
      {/* Mobile-first header (shown only on mobile) */}
      <div className="lg:hidden mb-6">
        <TokenInfo 
          tokenInfo={tokenInfo} 
          showHeader={true} 
          refreshTrigger={refreshCounter}
          liquidityEvents={liquidityEvents}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols wide) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Chart Section */}
            <div className="bg-[var(--card)] rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-4 text-gray-400">Price Chart (USD)</h2>
              <div className="bg-[var(--card2)] rounded-lg p-2">
                <TradingViewChart 
                  data={chartData} 
                  liquidityEvents={liquidityEvents} 
                  tokenInfo={tokenInfo}
                />
              </div>
            </div>

            {/* Quick Actions Section - Mobile Only */}
            <div className="lg:hidden bg-[var(--card)] rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-4 text-gray-400">Quick Actions</h2>
              <div className="bg-[var(--card2)] rounded-lg p-4">
                {/* From Input */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">From</span>
                    <span className="text-gray-400">
                      Balance: {isSwapped ? tokenBalance : ethBalance}
                    </span>
                  </div>
                  <div className="flex items-center bg-[var(--card)] rounded-lg p-3">
                    <input
                      type="number"
                      value={fromToken.amount}
                      onChange={handleFromAmountChange}
                      className="w-full bg-transparent text-white outline-none text-sm"
                      placeholder="0.00"
                      disabled={isTransacting}
                    />
                    <button
                      onClick={handleMaxClick}
                      className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium px-2 py-1 rounded transition-colors"
                    >
                      MAX
                    </button>
                    <span className="text-gray-400 ml-2">{fromToken.symbol}</span>
                  </div>
                </div>

                {/* Swap Button */}
                <button 
                  onClick={handleSwap}
                  className="w-full flex justify-center p-2 text-gray-400 hover:text-[var(--primary)]"
                >
                  <ArrowUpDownIcon size={20} />
                </button>

                {/* To Input */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">To</span>
                    <span className="text-gray-400">
                      Balance: {isSwapped ? ethBalance : tokenBalance}
                    </span>
                  </div>
                  <div className="flex items-center bg-[var(--card)] rounded-lg p-3">
                    <input
                      type="text"
                      value={isCalculating ? 'Calculating...' : toToken.amount}
                      readOnly
                      className="w-full bg-transparent text-white outline-none text-sm"
                      placeholder="0.00"
                    />
                    <span className="text-gray-400 ml-2">{toToken.symbol}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleAction}
                  disabled={!fromToken.amount || isCalculating || isTransacting}
                  className="w-full py-3 bg-[var(--primary)] text-black rounded-lg font-medium hover:bg-[var(--primary-hover)] 
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTransacting ? 'Processing...' : actionButtonText}
                </button>
              </div>
            </div>

            {/* Trades and Chat Tabs */}
            <div className="bg-[var(--card)] rounded-lg p-4">
              <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-lg bg-[var(--card2)] p-1 mb-4">
                  <Tab
                    className={({ selected }) =>
                      `w-full rounded-md py-2.5 text-sm font-medium leading-5 transition-colors
                      ${
                        selected
                          ? 'bg-[var(--card-boarder)] text-white'
                          : 'text-gray-400 hover:bg-[var(--card-hover)] hover:text-white'
                      }`
                    }
                  >
                    Trades
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `w-full rounded-md py-2.5 text-sm font-medium leading-5 transition-colors
                      ${
                        selected
                          ? 'bg-[var(--card-boarder)] text-white'
                          : 'text-gray-400 hover:bg-[var(--card-hover)] hover:text-white'
                      }`
                    }
                  >
                    Chat
                  </Tab>
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel>
                    <TransactionHistory
                      transactions={transactions}
                      transactionPage={transactionPage}
                      totalTransactionPages={totalTransactionPages}
                      tokenSymbol={tokenInfo.symbol}
                      handlePageChange={handlePageChange}
                    />
                  </Tab.Panel>
                  <Tab.Panel>
                    <Chats tokenAddress={address as string} tokenInfo={tokenInfo} />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Token Info Header (shown only on desktop) */}
            <div className="hidden lg:block bg-[var(--card)] rounded-lg p-4">
              <TokenInfo 
                tokenInfo={tokenInfo} 
                showHeader={true} 
                refreshTrigger={refreshCounter}
                liquidityEvents={liquidityEvents}
              />
            </div>

            {/* Quick Actions (Swap) Section - Desktop Only */}
            <div className="hidden lg:block bg-[var(--card)] rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-4 text-gray-400">Quick Actions</h2>
              <div className="bg-[var(--card2)] rounded-lg p-4">
                {/* From Input */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">From</span>
                    <span className="text-gray-400">
                      Balance: {isSwapped ? tokenBalance : ethBalance} {fromToken.symbol}
                    </span>
                  </div>
                  <div className="flex items-center bg-[var(--card)] rounded-lg p-3">
                    <input
                      type="number"
                      value={fromToken.amount}
                      onChange={handleFromAmountChange}
                      className="w-full bg-transparent text-white outline-none text-sm"
                      placeholder="0.00"
                      disabled={isTransacting}
                    />
                    <button
                      onClick={handleMaxClick}
                      className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium px-2 py-1 rounded transition-colors"
                    >
                      MAX
                    </button>
                    <span className="text-gray-400 ml-2">{fromToken.symbol}</span>
                  </div>
                </div>

                {/* Swap Button */}
                <button 
                  onClick={handleSwap}
                  className="w-full flex justify-center p-2 text-gray-400 hover:text-[var(--primary)]"
                >
                  <ArrowUpDownIcon size={20} />
                </button>

                {/* To Input */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">To (Estimated)</span>
                    <span className="text-gray-400">
                      Balance: {isSwapped ? ethBalance : tokenBalance} {toToken.symbol}
                    </span>
                  </div>
                  <div className="flex items-center bg-[var(--card)] rounded-lg p-3">
                    <input
                      type="text"
                      value={isCalculating ? 'Calculating...' : toToken.amount}
                      readOnly
                      className="w-full bg-transparent text-white outline-none text-sm"
                      placeholder="0.00"
                    />
                    <span className="text-gray-400 ml-2">{toToken.symbol}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleAction}
                  disabled={!fromToken.amount || isCalculating || isTransacting}
                  className="w-full py-3 bg-[var(--primary)] text-black rounded-lg font-medium hover:bg-[var(--primary-hover)] 
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTransacting ? 'Processing...' : actionButtonText}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Token Holders Section (Full Width) */}
        <div className="mt-6 bg-[var(--card)] rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-4 text-gray-400">Token Holders</h2>
          <TokenHolders
            tokenHolders={currentHolders}
            currentPage={currentPage}
            totalPages={Math.ceil(tokenHolders.length / holdersPerPage)}
            tokenSymbol={tokenInfo.symbol}
            creatorAddress={tokenInfo.creatorAddress}
            tokenAddress={address as string}
            onPageChange={paginate}
            allHolders={tokenHolders}
          />
        </div>
         {/* Share Button */}
         <ShareButton tokenInfo={tokenInfo} />
      </div>
    </Layout>
  );
};

//simple server-side rendering  just to get token info for seo - nothing more - nothing else  
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { address } = context.params as { address: string };

  try {
    const tokenInfo = await getTokenInfoAndTransactions(address, 1, 1);

    return {
      props: {
        initialTokenInfo: tokenInfo,
      },
    };
  } catch (error) {
    console.error('Error fetching token data:', error);
    return {
      notFound: true,
    };
  }
};

export default TokenDetail;