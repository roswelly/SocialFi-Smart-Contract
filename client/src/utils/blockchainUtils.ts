import { formatUnits, parseUnits, maxUint256, decodeEventLog, Log, TransactionReceipt, UserRejectedRequestError } from 'viem';
import { useReadContract, useWriteContract, useBalance, useWaitForTransactionReceipt, usePublicClient, useAccount, useContractRead } from 'wagmi';
import BondingCurveManagerABI from '@/abi/BondingCurveManager.json';
import BondingCurveABI from '@/abi/Bonding.json';
import ERC20ABI from '@/abi/ERC20.json';
import { useCallback, useMemo } from 'react';
import oldTokenAddresses from '@/abi/old_token.json';
import oldTokenAddresses1 from '@/abi/old_token1.json';

import { config } from '@/chain/config1'

import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'



export function useCurrentTokenPrice(tokenAddress: `0x${string}`) {
  const { data, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as `0x${string}`,
    abi: BondingCurveManagerABI,
    functionName: 'getCurrentTokenPrice',
    args: [tokenAddress],
  });
  return { data: data as bigint | undefined, refetch };
}

export function useTotalSupply(tokenAddress: `0x${string}`) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'totalSupply',
  });
}

export function useMarketCap(tokenAddress: `0x${string}` | null) {
  const { data, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as `0x${string}`,
    abi: BondingCurveManagerABI,
    functionName: 'getMarketCap',
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!tokenAddress,
    }
  });
  return { data: data as bigint | undefined, refetch };
}

// Add the old contract ABI for the tokens function
const OLD_TOKENS_ABI = [{
  "inputs": [{
    "internalType": "address",
    "name": "",
    "type": "address"
  }],
  "name": "tokens",
  "outputs": [{
    "internalType": "contract BondingCurveToken",
    "name": "token",
    "type": "address"
  }, {
    "internalType": "bool",
    "name": "isListed",
    "type": "bool"
  }, {
    "internalType": "uint256",
    "name": "ethBalance",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}];

// Update the type definition to be more specific
type OldTokenLiquidityResponse = [string, boolean, bigint];
type NewTokenLiquidityResponse = [string, bigint, bigint, boolean];
type TransformedLiquidityData = [string, bigint, bigint, boolean] | undefined;

export const useTokenLiquidity = (tokenAddress: `0x${string}` | null) => {
  const isOldContract = tokenAddress ? oldTokenAddresses.some(addr => 
    addr.toLowerCase() === tokenAddress.toLowerCase()
  ) : false;
  
  const { data, isError, isLoading, refetch } = useContractRead({
    address: process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as `0x${string}`,
    abi: isOldContract ? OLD_TOKENS_ABI : BondingCurveManagerABI,
    functionName: 'tokens',
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!tokenAddress,
    }
  });

  // Transform the response based on contract version
  const transformedData = useMemo<TransformedLiquidityData>(() => {
    if (!data) return undefined;

    try {
      if (isOldContract) {
        // Old contract format: [token, isListed, ethBalance]
        const [token, isListed, ethBalance] = data as OldTokenLiquidityResponse;
        return [token, BigInt(0), ethBalance, isListed];
      }

      // New contract format: [token, tokenBalance, ethBalance, isListed]
      const [token, tokenBalance, ethBalance, isListed] = data as NewTokenLiquidityResponse;
      return [token, tokenBalance, ethBalance, isListed];
    } catch (error) {
      return undefined;
    }
  }, [data, isOldContract]);

  return {
    data: transformedData,
    isError,
    isLoading,
    refetch,
  };
};

export function useCalcBuyReturn(tokenAddress: `0x${string}`, ethAmount: bigint) {
  const { data, isLoading } = useReadContract({
    address: process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as `0x${string}`,
    abi: BondingCurveManagerABI,
    functionName: 'calculateCurvedBuyReturn',
    args: [tokenAddress, ethAmount],
  });
  return { data: data as bigint | undefined, isLoading };
}

export function useCalcSellReturn(tokenAddress: `0x${string}`, tokenAmount: bigint) {
  const { data, isLoading } = useReadContract({
    address: process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as `0x${string}`,
    abi: BondingCurveManagerABI,
    functionName: 'calculateCurvedSellReturn',
    args: [tokenAddress, tokenAmount],
  });
  return { data: data as bigint | undefined, isLoading };
}

export function useUserBalance(userAddress: `0x${string}`, tokenAddress: `0x${string}`) {
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: userAddress,
  });

  const { data: tokenBalance, refetch: refetchTokenBalance } = useBalance({
    address: userAddress,
    token: tokenAddress,
  });

  const refetch = useCallback(() => {
    refetchEthBalance();
    refetchTokenBalance();
  }, [refetchEthBalance, refetchTokenBalance]);

  return {
    ethBalance: ethBalance?.value,
    tokenBalance: tokenBalance?.value,
    refetch,
  };
}

export function useERC20Balance(tokenAddress: `0x${string}`, walletAddress: `0x${string}`) {
  const { data, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [walletAddress],
  });

  return { 
    balance: data as bigint | undefined, 
    refetch 
  };
}

export function useTokenAllowance(tokenAddress: `0x${string}`, owner: `0x${string}`, spender: `0x${string}`) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [owner, spender],
  }) as { data: bigint | undefined };
}

// Function to check token allowance (can be used outside of hooks)
export async function checkTokenAllowance(
  tokenAddress: `0x${string}`, 
  owner: `0x${string}`, 
  spender: `0x${string}`,
  publicClient: any
): Promise<bigint> {
  try {
    const allowance = await readContract(config, {
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: 'allowance',
      args: [owner, spender],
    });
    return allowance as bigint;
  } catch (error) {
    console.error('Error checking token allowance:', error);
    throw error;
  }
}

export function useCreateToken() {
  const { writeContractAsync } = useWriteContract();
  const { data: transactionReceipt, isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt();
  const publicClient = usePublicClient();
  // const { address } = useAccount();

  const createToken = async (name: string, symbol: string, initialPurchaseAmount: bigint, paymentToken?: "ETH" | "DAI" | "USDC" | "USDT") => {
    if (!publicClient) {
      throw new Error('Public client is not available');
    }

    try {
      console.log('Initiating token creation transaction...');
      console.log({ name, symbol, initialPurchaseAmount, paymentToken });

      let hash: `0x${string}`;

      if (paymentToken === "ETH") {
        // Use launchWithEth for ETH payments
        hash = await writeContract(config, {
          address: process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as `0x${string}`,
          abi: BondingCurveABI,
          functionName: 'launchWithEth',
          args: [name, symbol],
          value: initialPurchaseAmount,        
        });
      } else {
        // Use launchWithAsset for token payments
        const TOKEN_ADDRESS: Record<"DAI" | "USDC" | "USDT", `0x${string}`> = {
          DAI: `0x6B175474E89094C44Da98b954EedeAC495271d0F`,
          USDC: `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`,
          USDT: `0xdac17f958d2ee523a2206206994597c13d831ec7`,
        };

        const assetTokenAddress = TOKEN_ADDRESS[paymentToken as "DAI" | "USDC" | "USDT"];
        
        hash = await writeContract(config, {
          address: process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as `0x${string}`,
          abi: BondingCurveABI,
          functionName: 'launchWithAsset',
          args: [name, symbol, initialPurchaseAmount, assetTokenAddress],
        });
      }

      console.log('Token creation transaction sent. Hash:', hash);

      console.log('Waiting for transaction confirmation...');
      let receipt: TransactionReceipt | null = null;
      let attempts = 0;
      const maxAttempts = 30; // a maximum of 30 * 2 seconds

      while (!receipt && attempts < maxAttempts) {
        if (isSuccess && transactionReceipt) {
          receipt = transactionReceipt;
          break;
        }

        if (isError) {
          console.error('Transaction failed:', error?.message);
          throw new Error('Transaction failed: ' + error?.message);
        }

        // Manual check for transaction receipt
        try {
          receipt = await waitForTransactionReceipt(config, { hash });
          if (receipt) break;
        } catch (e) {
          console.log('Error fetching receipt, will retry:', e);
        }

        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds
        attempts++;
        console.log(`Still waiting for confirmation... Attempt ${attempts}/${maxAttempts}`);
      }

      if (!receipt) {
        console.error('Transaction confirmation timeout');
        throw new Error('Transaction confirmation timeout');
      }

      console.log('Transaction confirmed. Receipt:', receipt);

      const tokenCreatedLog = receipt.logs.find(log => 
        log.address.toLowerCase() === (process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as `0x${string}`).toLowerCase()
      ) as Log | undefined;

      if (tokenCreatedLog) {
        console.log('TokenCreated event found in logs');
        const decodedLog = decodeEventLog({
          abi: BondingCurveManagerABI,
          data: tokenCreatedLog.data,
          topics: tokenCreatedLog.topics,
        }) as unknown as { eventName: string; args: { tokenAddress: `0x${string}`; creator: `0x${string}`; name: string; symbol: string } };

        if (decodedLog.eventName === 'TokenCreated' && decodedLog.args) {
          console.log('Token created successfully. Address:', decodedLog.args.tokenAddress);
          return decodedLog.args.tokenAddress;
        }
      }

      console.error('TokenCreated event not found in transaction logs');
      throw new Error('TokenCreated event not found in transaction logs');
    } catch (error) {
      
      // console.error('Error in createToken function:', error);
      if (error instanceof UserRejectedRequestError) {
        throw error;
      }

      throw error;
    }
  };

  return { createToken, isLoading: isLoading || isSuccess === false , UserRejectedRequestError};
}

export function useBuyTokens(tokenAddress?: string) {
  const { writeContractAsync, data, error, isPending } = useWriteContract();

  const buyTokens = async (tokenAddress: `0x${string}`, ethAmount: bigint) => {
    try {
      const result = await writeContractAsync({
        address: process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as `0x${string}`,
        abi: BondingCurveManagerABI,
        functionName: 'buy',
        args: [tokenAddress],
        value: ethAmount,
      });
      return result;
    } catch (error) {
      console.error('Buy tokens error:', error);
      throw error;
    }
  };

  return { buyTokens, data, error, isPending };
}

export function useSellTokens(tokenAddress?: string) {
  const { writeContractAsync, data, error, isPending } = useWriteContract();

  const sellTokens = async (tokenAddress: `0x${string}`, amount: bigint) => {
    try {
      const result = await writeContractAsync({
        address: process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as `0x${string}`,
        abi: BondingCurveManagerABI,
        functionName: 'sell',
        args: [tokenAddress, amount],
      });
      return result;
    } catch (error) {
      console.error('Sell tokens error:', error);
      throw error;
    }
  };

  return { sellTokens, data, error, isPending };
}

export function useApproveTokens() {
  const { writeContractAsync, data, error, isPending } = useWriteContract();

  const approveTokens = async (tokenAddress: `0x${string}`) => {
    try {
      const result = await writeContract(config, {
        address: tokenAddress,  // The token contract address
        abi: ERC20ABI,
        functionName: 'approve',
        args: [process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as `0x${string}`, maxUint256],  // Approve the bonding curve contract
      });
      return result;
    } catch (error) {
      console.error('Approve tokens error:', error);
      throw error;
    }
  };

  return { approveTokens, data, error, isPending };
}

export const formatAmountV3 = (amount: string, decimals: number = 18) => {
  const formattedAmount = parseFloat(formatUnits(BigInt(amount), decimals));
  
  const format = (value: number, maxDecimals: number) => {
    const rounded = value.toFixed(maxDecimals);
    const withoutTrailingZeros = parseFloat(rounded).toString();
    return withoutTrailingZeros;
  };

  if (formattedAmount >= 1e12) {
    return `${format(formattedAmount / 1e12, 2)}T`;
  } else if (formattedAmount >= 1e9) {
    return `${format(formattedAmount / 1e9, 2)}B`;
  } else if (formattedAmount >= 1e6) {
    return `${format(formattedAmount / 1e6, 2)}M`;
  } else if (formattedAmount >= 1e3) {
    return `${format(formattedAmount / 1e3, 2)}k`;
  } else if (formattedAmount >= 1) {
    return format(formattedAmount, 2);
  } else {
    const decimals = Math.min(6, Math.max(2, 3 - Math.floor(Math.log10(formattedAmount))));
    return format(formattedAmount, decimals);
  }
};

export function formatTimestamp(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const seconds = diffInSeconds % 60;
  const minutes = Math.floor((diffInSeconds / 60) % 60);
  const hours = Math.floor((diffInSeconds / 3600) % 24);
  const days = Math.floor((diffInSeconds / 86400) % 30);
  const months = Math.floor((diffInSeconds / (86400 * 30)) % 12);
  const years = Math.floor(diffInSeconds / (86400 * 365));

  let result = '';
  let unitCount = 0;

  if (years > 0 && unitCount < 2) {
    result += `${years}yr `;
    unitCount++;
  }
  if (months > 0 && unitCount < 2) {
    result += `${months}mo `;
    unitCount++;
  }
  if (days > 0 && unitCount < 2) {
    result += `${days}d `;
    unitCount++;
  }
  if (hours > 0 && unitCount < 2) {
    result += `${hours}h `;
    unitCount++;
  }
  if (minutes > 0 && unitCount < 2) {
    result += `${minutes}m `;
    unitCount++;
  }
  if (seconds > 0 && unitCount === 0) {
    result += `${seconds}s `;
  }

  return result.trim() + ' ago';
}

export function formatTimestampV1(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}hr`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}yr`;
}

export const formatAmount = (amount: string, decimals: number = 18) => {
  const formattedAmount = parseFloat(formatUnits(BigInt(amount), decimals));
  if (formattedAmount >= 1e12) {
    return `${(formattedAmount / 1e12).toFixed(4)}T`;
  } else if (formattedAmount >= 1e9) {
    return `${(formattedAmount / 1e9).toFixed(4)}B`;
  } else if (formattedAmount >= 1e6) {
    return `${(formattedAmount / 1e6).toFixed(4)}M`;
  } else if (formattedAmount >= 1e3) {
    return `${(formattedAmount / 1e3).toFixed(4)}k`;
  } else {
    return formattedAmount.toFixed(8);
  }
};
export const formatAmountV2 = (amount: string, decimals: number = 18) => {
  const formattedAmount = parseFloat(formatUnits(BigInt(amount), decimals));
  if (formattedAmount >= 1e12) {
    return `${(formattedAmount / 1e12).toFixed(1)}T`;
  } else if (formattedAmount >= 1e9) {
    return `${(formattedAmount / 1e9).toFixed(2)}B`;
  } else if (formattedAmount >= 1e6) {
    return `${(formattedAmount / 1e6).toFixed(2)}M`;
  } else if (formattedAmount >= 1e3) {
    return `${(formattedAmount / 1e3).toFixed(2)}k`;
  } else {
    return formattedAmount.toFixed(3);
  }
};

export function formatAddressV2(address: string): string {
  const lastSix = address.slice(-6);
  return `${lastSix}`;
}

export function shortenAddress(address: string): string {
  return address.slice(2, 8);
}

export function getExplorerUrl(txHash: string): string {
  return `https://etherscan.io/tx/${txHash}`;
}
