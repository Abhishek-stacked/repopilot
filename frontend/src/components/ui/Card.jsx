import React from 'react';

export const Card = ({ children, className = '', hoverEffect = false, ...props }) => {
  return (
    <div
      className={`bg-[#12141c] border border-[#222736] rounded-xl p-5 transition-all duration-200 ${
        hoverEffect ? 'hover:border-[#38415c] hover:bg-[#151824]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
