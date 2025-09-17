import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Token } from '@/interface/types';

interface WebSocketContextType {
  newTokens: Token[];
  newTransactions: any[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [newTokens, setNewTokens] = useState<Token[]>([]);
  const [newTransactions, setNewTransactions] = useState<any[]>([]);

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_BASE_URL as string);

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'tokenCreated') {
        setNewTokens(prev => [data.data, ...prev]);
      } else if (data.type === 'tokensBought' || data.type === 'tokensSold') {
        setNewTransactions(prev => [data.data, ...prev]);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ newTokens, newTransactions }}>
      {children}
    </WebSocketContext.Provider>
  );
};