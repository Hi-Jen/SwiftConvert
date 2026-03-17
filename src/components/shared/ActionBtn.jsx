import React from 'react';

const ActionBtn = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  icon: Icon,
  loading = false,
  activeScale = true
}) => {
  const baseStyles = "flex items-center justify-center gap-2 font-bold transition-all duration-300 rounded-xl relative overflow-hidden";
  
  const variants = {
    primary: "apple-btn-primary text-white shadow-lg shadow-indigo-500/20",
    secondary: "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-apple-dark dark:text-white",
    outline: "border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400",
    danger: "text-red-500/60 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${activeScale ? 'active:scale-95' : ''} 
        ${disabled || loading ? 'opacity-50 cursor-not-allowed grayscale' : ''} 
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </>
      )}
    </button>
  );
};

export default ActionBtn;
