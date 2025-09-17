import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Token } from '@/interface/types';
import { updateToken } from '@/utils/api';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SiweAuth from '@/components/auth/SiweAuth';
import { useAccount } from 'wagmi';

interface TokenUpdateModalProps {
  token: Token;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (token: Token) => void;
}

export const TokenUpdateModal: React.FC<TokenUpdateModalProps> = ({
  token,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [description, setDescription] = useState(token?.description || '');
  const [twitter, setTwitter] = useState(token?.twitter || '');
  const [telegram, setTelegram] = useState(token?.telegram || '');
  const [website, setWebsite] = useState(token?.website || '');
  const [discord, setDiscord] = useState(token?.discord || '');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { address } = useAccount();

  const [socialLinksCount, setSocialLinksCount] = useState(0);

  useEffect(() => {
    // Count existing social links
    const links = [token.twitter, token.telegram, token.discord, token.website].filter(Boolean);
    setSocialLinksCount(links.length);
  }, [token]);

  const needsUpdate = !token.logo || !token.description || socialLinksCount < 3;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      setIsAuthenticated(data.authenticated && data.address?.toLowerCase() === token.creatorAddress.toLowerCase());
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    await handleFileUpload(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > 1024 * 1024) { // 1MB limit
      toast.error('File size should be less than 1MB');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload-to-ipfs', formData);
      setUploadedImageUrl(response.data.url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please verify your wallet first');
      return;
    }
    
    setIsLoading(true);

    try {
      const updatedToken = await updateToken(token.address, {
        logo: uploadedImageUrl || token.logo,
        description: description || token.description,
        twitter: twitter || token.twitter,
        telegram: telegram || token.telegram,
        website: website || token.website,
        discord: discord || token.discord,
      });

      toast.success('Token information updated successfully!');
      onUpdate(updatedToken);
      onClose();
    } catch (error) {
      console.error('Error updating token:', error);
      toast.error('Failed to update token information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!needsUpdate) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-[#111111] rounded-xl w-full max-w-sm mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Token Information Complete</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            This token has all required information (logo, description, and social links).
            No further updates are needed.
          </p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[#111111] rounded-xl w-full max-w-sm mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Update Token Information</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {!isAuthenticated ? (
          <div className="text-center">
            <p className="mb-4 text-gray-400 text-sm">Please verify your wallet to update token information</p>
            <SiweAuth onAuthSuccess={() => {
              setIsAuthenticated(true);
              toast.success('Wallet verified successfully!');
            }} />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              {/* Only show logo upload if no logo exists */}
              {!token.logo && (
                <>
                  <div
                    className={`border border-dashed rounded-lg p-3 text-center cursor-pointer ${
                      isDragging ? 'border-blue-500 bg-[var(--card2)]' : 'border-gray-600'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                    <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-xs text-gray-400">
                      Drag and drop an image here, or click to select
                    </p>
                    <p className="text-xs text-gray-500">
                      Max file size: 1MB
                    </p>
                  </div>

                  {uploadedImageUrl && (
                    <div className="mt-3">
                      <img
                        src={uploadedImageUrl}
                        alt="Token Logo"
                        className="w-16 h-16 mx-auto rounded-full"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Only show description if it doesn't exist */}
              {!token.description && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[var(--card2)] text-white text-sm rounded-lg border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
                    rows={3}
                    placeholder="Enter your token's description..."
                  />
                </div>
              )}

              {/* Only show social fields that don't exist */}
              {!token.twitter && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full bg-[var(--card2)] text-white text-sm h-9 rounded-lg border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                    placeholder="https://twitter.com/username"
                  />
                </div>
              )}

              {!token.telegram && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Telegram
                  </label>
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="w-full bg-[var(--card2)] text-white text-sm h-9 rounded-lg border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                    placeholder="https://t.me/username"
                  />
                </div>
              )}

              {!token.website && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-[var(--card2)] text-white text-sm h-9 rounded-lg border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                    placeholder="https://example.com"
                  />
                </div>
              )}

              {!token.discord && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Discord
                  </label>
                  <input
                    type="text"
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                    className="w-full bg-[var(--card2)] text-white text-sm h-9 rounded-lg border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                    placeholder="https://discord.gg/invite"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#111111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TokenUpdateModal;
