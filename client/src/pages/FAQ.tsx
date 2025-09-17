import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is a bonding curve?",
      answer: "A bonding curve is a mathematical function that defines the relationship between a token's price and its supply. It creates a dynamic pricing mechanism that automatically adjusts based on demand.\n\nKey points:\n• As supply increases, price increases\n• As supply decreases, price decreases\n• This creates a dynamic pricing mechanism that automatically adjusts based on demand"
    },
    {
      question: "How do I create a token?",
      answer: "To create a token on CrossFun:\n\n1. Go to 'Create Token' page\n2. Fill in token details (name, symbol, etc.)\n3. Upload an image (optional)\n4. Add social links (optional)\n5. Review details\n6. Pay small fee in ETH\n7. Wait for confirmation\n\nYour token will then be live and tradable!"
    },
    {
      question: "How is the token price determined?",
      answer: "Token price is determined dynamically by the bonding curve.\n\n• Buying tokens: Price increases\n• Selling tokens: Price decreases\n\nThis creates a fair and transparent pricing mechanism reflecting real-time supply and demand."
    },
    {
      question: "Can I sell my tokens at any time?",
      answer: "Yes, you can sell your tokens back to the contract at any time.\n\n• Sell price: Determined by current position on the bonding curve\n• Ensures continuous liquidity\n• Allows you to exit your position whenever you choose"
    },
    {
      question: "Is there a fee for buying or selling tokens?",
      answer: "Yes, there's a small fee (typically 1%) for buying and selling.\n\nPurposes of the fee:\n1. Incentivize long-term holding\n2. Prevent market manipulation\n3. Contribute to platform sustainability\n4. Potentially reward token holders or fund development"
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[var(--card)] rounded-lg overflow-hidden">
              <button
                className="w-full text-left p-4 sm:p-5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 flex justify-between items-center hover:bg-[var(--card-hover)] transition-colors"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-sm sm:text-base font-semibold text-white pr-4">{faq.question}</h3>
                <ChevronDownIcon
                  className={`w-5 h-5 text-[var(--primary)] transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-[1000px]' : 'max-h-0'
                }`}
              >
                <div className="p-4 sm:p-5 bg-[var(--card2)]">
                  <p className="text-xs sm:text-sm text-gray-400 whitespace-pre-line leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;