import React, { useEffect, useRef, useState } from 'react';
import { X as XIcon } from 'lucide-react';
import { parseUnits } from 'viem';

interface PurchaseConfirmationPopupProps {
  onConfirm: (amount: bigint, selectedToken: Token) => void;
  onCancel: () => void;
  tokenSymbol: Token;
  onTokenChange?: (token: Token) => void;
}

type Token = "ETH" | "DAI" | "USDC" | "USDT";
const TOKENS: Token[] = ['ETH', 'DAI', 'USDC', 'USDT']

const Token_ADDRESS: Record<Token, `0x${string}`> = {
  ETH: `0x0000000000000000000000000000000000000000`,
  DAI: `0x6B175474E89094C44Da98b954EedeAC495271d0F`,
  USDC: `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`,
  USDT: `0xdac17f958d2ee523a2206206994597c13d831ec7`,
}


const TOKEN_DECIMALS: Record<Token, number> = {
  ETH: 18,
  DAI: 18,
  USDC: 6,
  USDT: 6,
}

const TOKEN_IMAGES: Record<Token, string> = {
  ETH: "/tokens/eth.png",
  DAI: "/tokens/dai.png",
  USDC: "/tokens/usdc.png",
  USDT: "/tokens/usdt.png",
};


const PurchaseConfirmationPopup: React.FC<PurchaseConfirmationPopupProps> = ({ onConfirm, onCancel, tokenSymbol, onTokenChange, }) => {

  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token>(tokenSymbol);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedToken(tokenSymbol);
  }, [tokenSymbol]);


  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);


  const handleConfirm = () => {

    const clean = purchaseAmount.trim() === "" ? "0" : purchaseAmount;
    const decimals = TOKEN_DECIMALS[selectedToken];
    const amount = parseUnits(clean, decimals);
    onConfirm(amount, selectedToken);
  };

  const handleTokenChange = (t: Token) => {
    setSelectedToken(t);
    setOpen(false);
    onTokenChange?.(t);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="flex-col bg-[var(--card)] p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm relative">

        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <XIcon size={18} />
        </button>

        <h2 className="text-sm font-bold text-white mb-2">How many {selectedToken} do you want to buy?</h2>

        <p className="text-[10px] sm:text-xs text-gray-400 mb-3 italic leading-tight">
          Tip: It&apos;s optional, but buying a small amount helps protect your coin from snipers.
          When creating, creators can buy up to 5% of the trading supply; any excess {selectedToken} is refunded.
        </p>

        {/* Amount Input*/}
        <div className='flex-1'>
          <label className='block text-xs text-gray-400 mb-1'>
            Amount
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(e.target.value)}
            className="w-full py-2 px-3 bg-[var(--card2)] border border-[var(--card-boarder)] rounded-md text-white text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors"
            placeholder={`0.0 (optional)`}
          />
        </div>

        {/* Token Selector */}
        <div className="flex-1 mt-2 relative" ref={dropdownRef}>
          <label className="block text-xs text-gray-400 mb-1">Token</label>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between rounded-md border border-[var(--card-boarder)] bg-[var(--card2)] text-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <span className="flex items-center gap-2">
              <img
                src={TOKEN_IMAGES[selectedToken]}
                alt={selectedToken}
                className="h-4 w-4"
              />
              {selectedToken}
            </span>
            <span>▾</span>
          </button>

          {open && (
            <ul className="absolute mt-1 w-full rounded-md border border-[var(--card-boarder)] bg-[var(--card2)] shadow-lg z-50">
              {TOKENS.map((t) => (
                <li
                  key={t}
                  onClick={() => handleTokenChange(t)}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[var(--card-hover)] text-xs text-white"
                >
                  <img src={TOKEN_IMAGES[t]} alt={t} className="h-4 w-4" />
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>


        <div className="flex justify-end space-x-3 mb-3 mt-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-[var(--card2)] text-white rounded-md text-xs sm:text-sm hover:bg-[var(--card-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-1.5 bg-[var(--primary)] text-black rounded-md text-xs sm:text-sm hover:bg-[var(--primary-hover)] transition-colors"
          >
            Confirm
          </button>
        </div>
        <p className="text-[8px] sm:text-xs text-gray-400 text-center">
          Cost to deploy: ~0 ETH
        </p>
      </div>
    </div>
  );
};

export default PurchaseConfirmationPopup;