import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 border-opacity-50 w-6 h-6 ${sizeClasses[size]}`}
        style={{
          borderImage: 'linear-gradient(to right, #4F46E5, #818CF8) 1',
        }}
      ></div>
    </div>
  );
};

export default Spinner;