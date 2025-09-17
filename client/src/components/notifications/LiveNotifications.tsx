import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useWebSocket } from '@/components/providers/WebSocketProvider';
import { formatAmountV2 } from '@/utils/blockchainUtils';

interface Notification {
  message: string;
  secondPart: string;
  type: 'buy' | 'sell' | 'tokenCreated';
  logo?: string;
}

const LiveNotifications: React.FC = () => {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { newTokens, newTransactions } = useWebSocket();

  const createNotificationMessage = (data: { type: string; data: any }): Notification => {
    const addressEnd = data.data.senderAddress?.slice(-6) || data.data.creatorAddress?.slice(-6) || 'Unknown';
    
    switch (data.type) {
      case 'buy':
        return {
          message: `${addressEnd} Bought ${formatAmountV2(data.data.tokenAmount)} ${data.data.symbol}`,
          secondPart: `with ${formatAmountV2(data.data.ethAmount)} ETH`,
          type: 'buy',
          logo: data.data.logo
        };
      case 'sell':
        return {
          message: `${addressEnd} Sold ${formatAmountV2(data.data.tokenAmount)} ${data.data.symbol}`,
          secondPart: `for ${formatAmountV2(data.data.ethAmount)} ETH`,
          type: 'sell',
          logo: data.data.logo
        };
      case 'tokenCreated':
        return {
          message: `${data.data.symbol}`,
          secondPart: `Created by ${addressEnd}`,
          type: 'tokenCreated',
          logo: data.data.logo
        };
      default:
        return {
          message: 'New activity',
          secondPart: '',
          type: 'buy',
          logo: undefined
        };
    }
  };

  const closeNotification = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setCurrentNotification(null);
    }, 3000); // 3 seconds delay
  };

  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      setCurrentNotification(notification);
      setIsVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    if (newTokens.length > 0) {
      console.log(newTokens)
      const notification = createNotificationMessage({ type: 'tokenCreated', data: newTokens[0] });
      handleNewNotification(notification);
    }

    if (newTransactions.length > 0) {
      console.log(newTransactions)
      const notification = createNotificationMessage({ type: newTransactions[0].type, data: newTransactions[0] });
      handleNewNotification(notification);
    }
  }, [newTokens, newTransactions]);

  useEffect(() => {
    if (containerRef.current && currentNotification && isVisible) {
      const container = containerRef.current;
      const totalWidth = container.scrollWidth;
      const viewportWidth = container.offsetWidth;
      const duration = 15000; // 15 seconds for a complete cycle

      if (animationRef.current) {
        animationRef.current.cancel();
      }

      animationRef.current = container.animate(
        [
          { transform: 'translateX(100%)' },
          { transform: `translateX(-${totalWidth - viewportWidth}px)` }
        ],
        {
          duration: duration,
          easing: 'linear'
        }
      );

      animationRef.current.onfinish = closeNotification;

      return () => {
        if (animationRef.current) {
          animationRef.current.cancel();
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [currentNotification, isVisible]);

  if (!isVisible || !currentNotification) return null;

  return (
    <div className="bg-[var(--card)] text-white py-1 overflow-hidden sticky top-0 z-50 border-b border-[var(--card-boarder)]">
      <div ref={containerRef} className="flex whitespace-nowrap items-center">
        <div className="flex items-center space-x-2 mx-3">
          <span className="text-xs font-medium text-gray-400">
            {currentNotification.message}
            {currentNotification.logo && (
              <span className="inline-flex items-center mx-1">
                <Image
                  src={currentNotification.logo}
                  alt="Token Logo"
                  width={12}
                  height={12}
                  className="rounded-full"
                />
              </span>
            )}
            {currentNotification.secondPart}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveNotifications;