import React, { useState } from 'react';
import { cn } from '@/lib/utils';

type MovingBorderButtonProps = {
  children?: React.ReactNode;
  wrapperClassName?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
};

const MovingBorderButton = ({
  children,
  wrapperClassName,
  className,
  onClick,
  type = 'button',
}: MovingBorderButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={cn('rounded-full overflow-hidden relative p-[2px]', wrapperClassName)}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      type={type}
    >
      <span
        className={cn(
          'absolute transition-all inset-[-200%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg,transparent_30%,#7a5af8_100%)] blur-md',
          isHovered && 'bg-[conic-gradient(from_90deg,transparent_30%,#c4b5fd_100%)]',
        )}
      />
      <span
        className={cn(
          'bg-primary text-white transition-all hover:bg-primary/90 rounded-full px-4 py-2 flex items-center justify-center relative',
          className,
        )}
      >
        {children}
      </span>
    </button>
  );
};

export default MovingBorderButton;
