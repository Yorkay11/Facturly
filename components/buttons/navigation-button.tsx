'use client';

import { ArrowUpRight, Eye } from 'lucide-react';
import { Link } from '@/i18n/routing';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps {
  text: string;
  href: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  className?: string;
  icon?: React.ReactNode;
}

const NavigationButton = ({
  href,
  text = 'Open',
  icon = undefined,
  target = '_blank',
  className = ''
}: ButtonProps) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="flex items-start">
      <Link href={href} target={target}>
        <AnimatePresence mode="popLayout">
          <button
            type="button"
            className={cn(
              'flex items-center gap-1 outline-none cursor-pointer text-zinc-100 hover:text-blue-400 font-semibold shadow-sm py-2 px-4 transition-colors duration-200 rounded-lg',
              className
            )}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {!hovered && (
              <motion.div
                key={'eye-btn' + href}
                initial={{
                  x: -10,
                  opacity: 0
                }}
                animate={{
                  x: 0,
                  opacity: 1
                }}
                exit={{
                  x: -10,
                  opacity: 0
                }}
                transition={{
                  ease: 'linear',
                  duration: 0.1
                }}
              >
                {icon ? icon : <Eye size={14} className="text-inherit" />}
              </motion.div>
            )}
            <motion.p
              layout
              transition={{ duration: 0.1, ease: 'linear' }}
              className="text-xs sm:text-sm whitespace-nowrap text-inherit"
            >
              {text}
            </motion.p>
            {hovered && (
              <motion.div
                key={'arrow-btn' + href}
                initial={{
                  x: 10,
                  opacity: 0
                }}
                animate={{
                  x: 0,
                  opacity: 1
                }}
                exit={{
                  x: 10,
                  opacity: 0
                }}
                transition={{
                  ease: 'linear',
                  duration: 0.1
                }}
              >
                <ArrowUpRight size={14} className="text-inherit" />
              </motion.div>
            )}
          </button>
        </AnimatePresence>
      </Link>
    </div>
  );
};

export default NavigationButton;
