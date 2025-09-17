import React, { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { toast } from 'react-toastify';

interface SiweAuthProps {
  onAuthSuccess: () => void;
}

const SiweAuth: React.FC<SiweAuthProps> = ({ onAuthSuccess }) => {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);

      const nonceRes = await fetch('/api/auth/nonce');
      const { nonce } = await nonceRes.json();

      const message = new SiweMessage({
        domain: process.env.NEXT_PUBLIC_DOMAIN || window.location.host,
        address: address,
        statement: 'Sign in to post a message',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce: nonce
      });
      const messageToSign = message.prepareMessage();
      const signature = await signMessageAsync({ message: messageToSign });

      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyRes.ok) throw new Error('Error verifying message');

      // Notify parent component of successful authentication
      onAuthSuccess();
      toast.success('Successfully signed in!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign. try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!address) return null;

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={handleSignIn} 
        disabled={loading} 
        className="bg-blue-500 text-white text-xs sm:text-sm px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </span>
        ) : (
          'Verify Wallet'
        )}
      </button>
    </div>
  );
};

export default SiweAuth;
