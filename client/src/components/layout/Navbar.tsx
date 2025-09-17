import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Send as TelegramIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import HowItWorksPopup from '@/components/notifications/HowItWorksPopup'
import { shortenAddress } from '@/utils/blockchainUtils'
import { useAccount } from 'wagmi'

const CustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} className="btn btn-primary text-xs px-2 py-1">
                    Connect
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} className="btn btn-secondary text-[10px] sm:text-xs px-2 py-1">
                    Wrong network
                  </button>
                )
              }

              return (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={openChainModal}
                    className="btn btn-secondary text-xs px-2 py-1"
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    <span className="text-[10px] sm:text-xs">{chain.name}</span>
                  </button>

                  <button onClick={openAccountModal} className="btn btn-primary text-[10px] sm:text-xs px-2 py-1">
                    {shortenAddress(account.address)}
                    {account.displayBalance
                      ? <span className="hidden sm:inline ml-1">({account.displayBalance})</span>
                      : ''}
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const { address } = useAccount()
  const router = useRouter()

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!address) {
      toast.error('Please connect your wallet first', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      return
    }
    router.push(`/profile/${address}`)
  }

  return (
    <>
      <nav className="bg-[#111111] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center text-2xl font-bold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white mr-2"
                  style={{ transform: 'rotate(-60deg)' }}
                >
                  <circle cx="19" cy="5" r="2"/>
                  <circle cx="5" cy="19" r="2"/>
                  <path d="M5 17A12 12 0 0 1 17 5"/>
                </svg>
                <span className="text-[var(--primary)]">CrossFun</span>
              </Link>
              <div className="hidden md:flex items-center space-x-4">
                <button 
                  onClick={handleProfileClick}
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => setShowHowItWorks(true)}
                  className="bg-white text-black px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-sm"
                >
                  How it works
                </button>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link href="https://t.me/cross_fun" target="_blank" className="text-gray-300 hover:text-white">
                <TelegramIcon className="w-5 h-5" />
              </Link>
              <Link href="https://x.com/cross_fun" target="_blank" className="text-gray-300 hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => router.push('/create')}
                className="bg-[var(--primary)] text-black px-4 py-2 rounded-lg font-medium hover:bg-[var(--primary-hover)]"
              >
                Launch Token
              </button>
              <CustomConnectButton />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-white focus:outline-none"
              >
                {isOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-[var(--card2)] border-t border-[var(--card-boarder)]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={handleProfileClick}
                className="text-gray-300 hover:text-white block px-2 py-1.5 text-sm"
              >
                My Profile
              </button>
              <button
                onClick={() => setShowHowItWorks(true)}
                className="bg-white text-black px-2 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-sm inline-block"
              >
                How it works
              </button>
              <Link href="https://t.me/crossfun_xyz" target="_blank" className="text-gray-300 hover:text-white hover:bg-[var(--card-hover)] block px-2 py-1.5 text-sm rounded-lg transition-colors">
                <TelegramIcon className="w-4 h-4 mr-2" />
                Telegram
              </Link>
              <Link href="https://x.com/crossfunxyz" target="_blank" className="text-gray-300 hover:text-white hover:bg-[var(--card-hover)] block px-2 py-1.5 text-sm rounded-lg transition-colors">
                <XMarkIcon className="w-4 h-4 mr-2" />
                X (Twitter)
              </Link>
              <div className="pt-4 pb-3 border-t border-[var(--card-boarder)]">
                <div className="flex items-center px-5">
                  <button 
                    onClick={() => router.push('/create')}
                    className="bg-[var(--primary)] text-black px-4 py-2 rounded-lg font-medium hover:bg-[var(--primary-hover)] w-full"
                  >
                    Launch Token
                  </button>
                </div>
              </div>
              <div className="pt-4 px-3">
                <CustomConnectButton />
              </div>
            </div>
          </div>
        )}
      </nav>
      
      <HowItWorksPopup 
        isVisible={showHowItWorks} 
        onClose={() => setShowHowItWorks(false)} 
      />
    </>
  )
}

export default Navbar