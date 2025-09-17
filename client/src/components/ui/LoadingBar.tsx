import React from 'react';

interface LoadingBarProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingBar: React.FC<LoadingBarProps> = ({ 
  size = 'medium',
  color = 'var(--primary)'
}) => {
  const sizeClasses = {
    small: 'w-32 h-1',
    medium: 'w-48 h-1.5',
    large: 'w-64 h-2'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={`${sizeClasses[size]} bg-[var(--card-boarder)] rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full animate-loading-bar"
          style={{ 
            backgroundColor: color,
            width: '30%'
          }}
        />
      </div>
      <span className="text-gray-400 text-xs">Loading...</span>
    </div>
  );
};

export default LoadingBar; 