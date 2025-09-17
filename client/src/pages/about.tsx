import React from 'react';
import Layout from '@/components/layout/Layout';
import { CubeTransparentIcon, ChartBarIcon, CurrencyDollarIcon, ArrowPathIcon, BeakerIcon } from '@heroicons/react/24/outline';

const AboutPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-8 text-center">About CrossFun</h1>
        
        <div className="mb-12">
          <div className="bg-[var(--card)] rounded-lg p-6 md:p-8">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-4">What is CrossFun?</h2>
            <div className="text-gray-400 text-xs sm:text-sm leading-relaxed space-y-4">
              <p>
                CrossFun is a revolutionary decentralized platform that empowers individuals to create and trade tokens using innovative bonding curve technology.
              </p>
              <p className="hidden sm:block">
                Our mission is to democratize token creation and provide a dynamic, fair trading environment for the crypto community.
              </p>
              <p className="sm:hidden">
                Our mission is to democratize token creation for the crypto community.
              </p>
              <p className="sm:hidden">
                We provide a dynamic and fair trading environment using bonding curve technology.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: CubeTransparentIcon, title: "Token Creation", description: "Users easily create tokens by setting a name, symbol, and description." },
              { icon: ChartBarIcon, title: "Bonding Curve", description: "Each token's price is determined by its unique bonding curve." },
              { icon: CurrencyDollarIcon, title: "Trading", description: "Users can buy and sell tokens, with prices dynamically adjusted by the curve." },
              { icon: ArrowPathIcon, title: "Liquidity Pool", description: "Each token has its own liquidity pool that grows and shrinks with trades." },
              { icon: BeakerIcon, title: "Customization", description: "Various curve shapes allow for different token economics." },
            ].map((item, index) => (
              <div key={index} className="bg-[var(--card)] rounded-lg p-6 flex flex-col items-center text-center hover:bg-[var(--card-hover)] transition-colors">
                <item.icon className="h-12 w-12 text-[var(--primary)] mb-4" />
                <h3 className="text-sm sm:text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Benefits of Bonding Curves</h2>
          <div className="bg-[var(--card)] rounded-lg p-6 md:p-8">
            <ul className="space-y-4 text-gray-400 text-xs sm:text-sm">
              {[
                { title: "Continuous Liquidity", description: "Tokens can always be bought or sold, ensuring a fluid market." },
                { title: "Algorithmic Price Discovery", description: "Market price is determined automatically based on supply and demand." },
                { title: "Incentivized Participation", description: "Early supporters benefit from potential price appreciation as demand grows." },
                { title: "Flexible Token Economics", description: "Different curve shapes allow for various economic models to suit project needs." },
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-6 w-6 text-[var(--primary)] mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <span className="font-semibold text-white">{item.title}:</span> {item.description}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;