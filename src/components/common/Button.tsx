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
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 active:scale-[0.98] select-none rounded-[20px] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 shadow-sm';

  const variants = {
    primary: 'bg-gym-lime hover:bg-lime-400 text-slate-950 font-black shadow-glow-lime hover:shadow-lime-500/40',
    accent: 'bg-gym-electric hover:bg-sky-400 text-slate-950 font-black shadow-glow-accent',
    secondary: 'bg-gym-cardLighter hover:bg-slate-700 text-white border border-gym-border/80',
    danger: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30',
    ghost: 'bg-transparent hover:bg-slate-800 text-gray-300',
    outline: 'bg-transparent border border-gym-border hover:border-gym-lime text-white',
  };

  const sizes = {
    sm: 'text-xs px-3 py-2 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-3 min-h-[46px] gap-2',
    lg: 'text-base px-6 py-3.5 min-h-[52px] gap-2.5',
    xl: 'text-lg px-8 py-4 min-h-[60px] gap-3 font-black uppercase tracking-wider',
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