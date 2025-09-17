import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, ChevronDownIcon } from 'lucide-react';
import { formatTimestamp, formatAmountV3, shortenAddress } from '@/utils/blockchainUtils';
import { Transaction } from '@/interface/types';

interface TransactionHistoryProps {
  transactions: Transaction[];
  transactionPage: number;
  totalTransactionPages: number;
  tokenSymbol: string;
  handlePageChange: (page: number) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  transactionPage,
  totalTransactionPages,
  tokenSymbol,
  handlePageChange,
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getPaginationRange = (current: number, total: number) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 2) {
      return [1, 2, 3, '...', total];
    }

    if (current >= total - 1) {
      return [1, '...', total - 2, total - 1, total];
    }

    return [
      1,
      '...',
      current,
      '...',
      total
    ];
  };

  // Desktop view table
  const DesktopTable = () => (
    <table className="w-full text-left hidden md:table">
      <thead>
        <tr className="bg-[var(--card2)]">
          <th className="px-4 py-2 text-sm text-gray-400">Maker</th>
          <th className="px-4 py-2 text-sm text-gray-400">Type</th>
                          <th className="px-4 py-2 text-sm text-gray-400">ETH</th>
          <th className="px-4 py-2 text-sm text-gray-400">{tokenSymbol}</th>
          <th className="px-4 py-2 text-sm text-gray-400">Date</th>
          <th className="px-4 py-2 text-sm text-gray-400">Tx</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx.id} className="border-b border-[var(--card-hover)]">
            <td className="px-4 py-2">
              <a 
                href={`https://etherscan.io/address/${tx.senderAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[var(--primary)] text-sm transition-colors"
              >
                {shortenAddress(tx.senderAddress)}
              </a>
            </td>
            <td className="px-4 py-2 text-sm text-gray-400">{tx.type}</td>
            <td className="px-4 py-2 text-sm text-gray-400">{formatAmountV3(tx.ethAmount)}</td>
            <td className="px-4 py-2 text-sm text-gray-400">{formatAmountV3(tx.tokenAmount)}</td>
            <td className="px-4 py-2 text-sm text-gray-400">{formatTimestamp(tx.timestamp)}</td>
            <td className="px-4 py-2">
              <a
                href={`https://etherscan.io/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[var(--primary)] text-sm transition-colors"
              >
                {tx.txHash.slice(0, 8)}
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Mobile view table
  const MobileTable = () => (
    <div className="md:hidden">
      {transactions.map((tx) => (
        <div key={tx.id} className="mb-2">
          <div 
            className="bg-[var(--card2)] p-3 rounded-lg cursor-pointer"
            onClick={() => setExpandedRow(expandedRow === tx.id ? null : tx.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">{tx.type}</span>
                  <ChevronDownIcon 
                    size={16} 
                    className={`text-gray-400 transition-transform ${
                      expandedRow === tx.id ? 'transform rotate-180' : ''
                    }`}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{formatAmountV3(tx.ethAmount)} ETH</span>
                  <span className="text-gray-400">{formatAmountV3(tx.tokenAmount)} {tokenSymbol}</span>
                </div>
              </div>
            </div>

            {expandedRow === tx.id && (
              <div className="mt-3 pt-3 border-t border-[var(--card-hover)] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Maker:</span>
                  <a 
                    href={`https://etherscan.io/address/${tx.senderAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[var(--primary)]"
                  >
                    {shortenAddress(tx.senderAddress)}
                  </a>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-gray-400">{formatTimestamp(tx.timestamp)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Transaction:</span>
                                      <a
                      href={`https://etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[var(--primary)] flex items-center gap-1"
                    >
                    View <ExternalLinkIcon size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <DesktopTable />
      <MobileTable />

      {transactions.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No transactions yet
        </div>
      )}

      {totalTransactionPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => handlePageChange(transactionPage - 1)}
            disabled={transactionPage === 1}
            className="p-1 rounded bg-[var(--card2)] text-gray-400 hover:bg-[var(--card-hover)] disabled:opacity-50"
          >
            <ChevronLeftIcon size={20} />
          </button>
          {getPaginationRange(transactionPage, totalTransactionPages).map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-1 text-gray-400">...</span>
              ) : (
                <button
                  onClick={() => handlePageChange(page as number)}
                  className={`px-3 py-1 rounded text-sm ${
                    transactionPage === page
                      ? 'bg-[var(--primary)] text-black'
                      : 'bg-[var(--card2)] text-gray-400 hover:bg-[var(--card-hover)]'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
          <button
            onClick={() => handlePageChange(transactionPage + 1)}
            disabled={transactionPage === totalTransactionPages}
            className="p-1 rounded bg-[var(--card2)] text-gray-400 hover:bg-[var(--card-hover)] disabled:opacity-50"
          >
            <ChevronRightIcon size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;