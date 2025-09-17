import React from 'react';

interface LdSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LdSpinner: React.FC<LdSpinnerProps> = ({ 
  size = 'medium',
  color = '#ffffff'
}) => {
  const sizeMap = {
    small: 'w-4 h-4 border',
    medium: 'w-6 h-6 border-2',
    large: 'w-8 h-8 border-2'
  };

  return (
    <div className="inline-flex items-center justify-center">
      <div 
        className={`${sizeMap[size]} rounded-full border-t-transparent animate-ldspinner`}
        style={{ 
          borderColor: color,
          borderTopColor: 'transparent',
        }}
      />
    </div>
  );
};

export default LdSpinner;