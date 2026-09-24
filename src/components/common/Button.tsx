import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 active:scale-[0.98] select-none rounded-[16px] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 shadow-sm';

  const variants = {
    primary: 'bg-gym-primary hover:bg-lime-400 text-zinc-950 font-bold shadow-sm',
    accent: 'bg-gym-primary hover:bg-lime-400 text-zinc-950 font-bold shadow-sm',
    secondary: 'bg-[#27272A] hover:bg-[#3F3F46] text-zinc-100 border border-[#27272A] font-semibold',
    danger: 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 font-semibold',
    ghost: 'bg-transparent hover:bg-[#27272A] text-zinc-400 hover:text-zinc-100 font-medium',
    outline: 'bg-transparent border border-[#27272A] hover:border-gym-primary/60 hover:bg-[#18181B] text-zinc-100 font-semibold',
  };

  const sizes = {
    sm: 'text-xs px-3 py-2 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2',
    lg: 'text-base px-6 py-3 min-h-[48px] gap-2.5',
    xl: 'text-lg px-8 py-3.5 min-h-[54px] gap-3 font-bold uppercase tracking-wider',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};