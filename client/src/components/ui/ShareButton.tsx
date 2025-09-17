import React, { useState, useEffect } from 'react';
import { Share2Icon, X } from 'lucide-react';
import { 
  TwitterIcon, 
  FacebookIcon, 
  InstagramIcon, 
  LinkedinIcon, 
  Send as TelegramIcon,
  MessageCircle as DiscordIcon
} from 'lucide-react';

interface TokenInfo {
  name: string;
  description: string;
  logo: string;
}

interface ShareModalProps {
  tokenInfo: TokenInfo;
  isOpen: boolean;
  onClose: () => void;
}

interface SocialPlatform {
  name: string;
  icon: React.ElementType;
  color: string;
  getShareUrl: (shareText: string, shareUrl: string, logoUrl: string) => string;
}

const ShareModal: React.FC<ShareModalProps> = ({ tokenInfo, isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out ${tokenInfo.name} on our platform!\n\n${tokenInfo.description}\n\n`;

  const socialPlatforms: SocialPlatform[] = [
    { 
      name: 'Twitter', 
      icon: TwitterIcon, 
      color: 'bg-[#1DA1F2]', 
      getShareUrl: (text, url, logo) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&image=${encodeURIComponent(logo)}`
    },
    { 
      name: 'Facebook', 
      icon: FacebookIcon, 
      color: 'bg-[#4267B2]', 
      getShareUrl: (text, url, logo) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    { 
      name: 'Telegram', 
      icon: TelegramIcon, 
      color: 'bg-[#0088cc]', 
      getShareUrl: (text, url, logo) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    },
    { 
      name: 'LinkedIn', 
      icon: LinkedinIcon, 
      color: 'bg-[#0077B5]', 
      getShareUrl: (text, url, logo) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(tokenInfo.name)}&summary=${encodeURIComponent(text)}`
    },
    { 
      name: 'Instagram', 
      icon: InstagramIcon, 
      color: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]', 
      getShareUrl: (text, url, logo) => `https://www.instagram.com/`
    },
    { 
      name: 'Discord', 
      icon: DiscordIcon, 
      color: 'bg-[#7289DA]', 
      getShareUrl: (text, url, logo) => `https://discord.com/`
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-xs sm:text-sm font-bold text-white">Share {tokenInfo.name} on</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <img 
            src={tokenInfo.logo || '/chats/noimg.svg'} 
            alt={`${tokenInfo.name} logo`} 
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
          />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {socialPlatforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.getShareUrl(shareText, shareUrl, tokenInfo.logo)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${platform.color} text-white p-2 sm:p-3 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity`}
              aria-label={`Share on ${platform.name}`}
            >
              <platform.icon size={20} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ShareButtonProps {
  tokenInfo: TokenInfo;
  className?: string; 
}

const ShareButton: React.FC<ShareButtonProps> = ({ tokenInfo, className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          aria-label="Share"
        >
          <Share2Icon size={24} />
        </button>
      </div>
      <ShareModal 
        tokenInfo={tokenInfo} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default ShareButton;