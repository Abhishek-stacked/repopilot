import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-[#1e2230] text-gray-300 border-[#2e344a]',
    primary: 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    danger: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-800/60',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
