// pages/index.tsx (future)
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CubeTransparentIcon, ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/seo/SEO';

const FeatureCard: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
  <motion.div 
    className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
    whileHover={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Icon className="h-8 w-8 sm:h-12 sm:w-12 text-blue-400 mb-3 sm:mb-4" />
    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm sm:text-base text-gray-400">{description}</p>
  </motion.div>
);

const HomePage: React.FC = () => {
  return (
    <Layout>
      <SEO 
        title="CrossFun - Create and Trade Tokens with Bonding Curves"
        description="Discover the next generation of token trading. Create, trade, and earn with fair, dynamic, and continuous liquidity on CrossFun."
        image="/seo/home-hero.jpg"
      />
      <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="text-center">
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Welcome to CrossFun
              </motion.h1>
              <motion.p 
                className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Create, trade, and grow your tokens with bonding curves
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link href="/explore" className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full text-white bg-blue-500 hover:bg-blue-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg">
                  Enter App
                  <ArrowRightIcon className="ml-2 -mr-1 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </Link>
              </motion.div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-[-1]">
            <Image src="/images/hero-bg.jpg" alt="Hero background" layout="fill" objectFit="cover" quality={100} />
            <div className="absolute inset-0 bg-gray-900 bg-opacity-75"></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-400 mb-8 sm:mb-12">Why Choose CrossFun?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <FeatureCard 
                icon={CubeTransparentIcon}
                title="Easy Token Creation"
                description="Launch your own token in minutes with our user-friendly interface."
              />
              <FeatureCard 
                icon={ChartBarIcon}
                title="Bonding Curve Technology"
                description="Experience dynamic pricing and continuous liquidity for your tokens."
              />
              <FeatureCard 
                icon={CurrencyDollarIcon}
                title="Fair Trading"
                description="Trade tokens with transparent, algorithm-based pricing."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 sm:py-16 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-400 mb-8 sm:mb-12">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                "Create your token",
                "Set bonding curve parameters",
                "Users buy and sell tokens",
                "Watch your token grow"
              ].map((step, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-700 rounded-lg p-4 sm:p-6 text-center"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-blue-500 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-300">{step}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to revolutionize token trading?</h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8">Join CrossFun today and experience the future of decentralized finance.</p>
            <Link href="/explore" className="inline-flex items-center px-6 sm:px-8 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full text-gray-900 bg-blue-400 hover:bg-blue-300 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg">
              Launch Your Token Now
              <ArrowRightIcon className="ml-2 -mr-1 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;