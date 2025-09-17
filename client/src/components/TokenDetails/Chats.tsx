import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { getChatMessages, addChatMessage } from '@/utils/api';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import { formatTimestamp, getRandomAvatarImage, shortenAddress } from '@/utils/chatUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { TokenWithTransactions } from '@/interface/types';
import SiweAuth from '@/components/auth/SiweAuth';
import { Reply, X } from 'lucide-react';

interface ChatMessage {
  id: number;
  user: string;
  token: string;
  message: string;
  reply_to: number | null;
  timestamp: string;
}

interface ChatsProps {
  tokenAddress: string;
  tokenInfo: TokenWithTransactions;
}

const Chats: React.FC<ChatsProps> = ({ tokenAddress, tokenInfo }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const { address } = useAccount();

  const userAvatars = useMemo(() => {
    const avatars: { [key: string]: string } = {};
    messages.forEach(msg => {
      if (!avatars[msg.user]) {
        avatars[msg.user] = getRandomAvatarImage();
      }
    });
    return avatars;
  }, [messages]);

  useEffect(() => {
    checkAuth();
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [tokenAddress]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user');
      setIsAuthenticated(response.ok);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const fetchedMessages = await getChatMessages(tokenAddress);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to chat');
      return;
    }
    if (!newMessage.trim()) return;
    try {
      await addChatMessage(address!, tokenAddress, newMessage, replyingTo?.id);
      setNewMessage('');
      setReplyingTo(null);
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const findParentMessage = (replyId: number | null) => {
    if (!replyId) return null;
    return messages.find(m => m.id === replyId);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <SiweAuth onAuthSuccess={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px] sm:h-[500px]">
      <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2 sm:space-y-4 p-2">
        <AnimatePresence>
          {messages.map((message) => {
            const parentMessage = findParentMessage(message.reply_to);
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-[var(--card2)] rounded-lg p-2 sm:p-3 ${message.reply_to ? 'ml-2 sm:ml-4 border-l-2 border-[var(--card-boarder)]' : ''}`}
              >
                {parentMessage && (
                  <div className="mb-1 sm:mb-2 text-[10px] sm:text-xs text-gray-400 bg-[var(--card)] p-1.5 sm:p-2 rounded">
                    <span className="font-medium">{shortenAddress(parentMessage.user)}</span>: 
                    <span className="line-clamp-1">{parentMessage.message}</span>
                  </div>
                )}
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <Image
                    src={userAvatars[message.user] || getRandomAvatarImage()}
                    alt="Avatar"
                    width={20}
                    height={20}
                    className="rounded-full hidden sm:block"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-medium text-gray-300">
                        {shortenAddress(message.user)}
                        {message.user.toLowerCase() === tokenInfo.creatorAddress.toLowerCase() && 
                          <span className="ml-1 text-[var(--primary)] text-[10px] sm:text-xs">(dev)</span>
                        }
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-200 mt-0.5 sm:mt-1 break-words">{message.message}</p>
                    <button
                      onClick={() => handleReply(message)}
                      className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-400 hover:text-[var(--primary)] flex items-center gap-0.5 sm:gap-1"
                    >
                      <Reply size={10} className="sm:w-3 sm:h-3" />
                      Reply
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSendMessage} className="mt-2 sm:mt-4 space-y-1 sm:space-y-2 p-2">
        {replyingTo && (
          <div className="flex items-center justify-between bg-[var(--card)] p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm">
            <span className="text-gray-400">
              Replying to <span className="text-[var(--primary)]">{shortenAddress(replyingTo.user)}</span>
            </span>
            <button
              type="button"
              onClick={cancelReply}
              className="text-gray-400 hover:text-white"
            >
              <X size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
        <div className="flex gap-1.5 sm:gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow bg-[var(--card2)] text-white rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-[var(--primary)] text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chats;
