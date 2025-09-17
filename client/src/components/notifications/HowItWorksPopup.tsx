import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { 
  Rocket, 
  TrendingUp, 
  DollarSign, 
  BarChart2, 
  Zap 
} from 'lucide-react';

interface HowItWorksPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const HowItWorksPopup: React.FC<HowItWorksPopupProps> = ({ isVisible, onClose }) => {
  const steps = [
    { icon: Rocket, text: "Launch your token instantly" },
    { icon: TrendingUp, text: "Get discovered by early traders" },
    { icon: DollarSign, text: "Trade with zero slippage" },
    { icon: BarChart2, text: "Track your portfolio" },
            { icon: Zap, text: "List on DEX at 2500 ETH" }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card)] rounded-lg relative max-w-md w-full">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6 text-center">How It Works</h2>
          
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="bg-[var(--card2)] p-3 rounded-lg">
                  <step.icon className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <p className="text-gray-400">{step.text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-8 py-3 bg-[var(--primary)] text-black rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPopup;
