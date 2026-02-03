'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaChevronRight,
  FaFileLines,
  FaTableCellsLarge,
  FaReceipt,
  FaMagnifyingGlass,
  FaGear,
  FaUsers,
  FaChartBar,
  FaBell,
  FaBoxOpen,
  FaArrowsRotate,
} from 'react-icons/fa6';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface Shortcut {
  label: string;
  icon: React.ReactNode;
  link: string;
}

export interface SearchResult {
  icon: React.ReactNode;
  label: string;
  description: string;
  link: string;
}

const SVGFilter = () => {
  return (
    <svg width="0" height="0">
      <filter id="spotlight-blob">
        <feGaussianBlur stdDeviation="10" in="SourceGraphic" />
        <feColorMatrix
          values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 18 -9
          "
          result="blob"
        />
        <feBlend in="SourceGraphic" in2="blob" />
      </filter>
    </svg>
  );
};

interface ShortcutButtonProps {
  icon: React.ReactNode;
  link: string;
  onSelect: (href: string) => void;
}

const ShortcutButton = ({ icon, link, onSelect }: ShortcutButtonProps) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onSelect(link);
      }}
      className="rounded-full cursor-pointer hover:shadow-lg opacity-30 hover:opacity-100 transition-[opacity,shadow] duration-200"
    >
      <div className="size-16 aspect-square flex items-center justify-center [&_svg]:size-7 [&_svg]:stroke-[1.4]">
        {icon}
      </div>
    </button>
  );
};

interface SpotlightPlaceholderProps {
  text: string;
  className?: string;
}

const SpotlightPlaceholder = ({ text, className }: SpotlightPlaceholderProps) => {
  return (
    <motion.div
      layout
      className={cn(
        'absolute text-muted-foreground flex items-center pointer-events-none z-10',
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        <motion.p
          layoutId={`placeholder-${text}`}
          key={`placeholder-${text}`}
          initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
};

interface SpotlightInputProps {
  placeholder: string;
  hidePlaceholder: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholderClassName?: string;
}

const SpotlightInput = ({
  placeholder,
  hidePlaceholder,
  value,
  onChange,
  placeholderClassName,
}: SpotlightInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex items-center w-full justify-start gap-2 px-3 h-12 rounded-xl border border-input bg-background/90 shadow-sm">
      <motion.div
        layoutId="search-icon"
        className="text-muted-foreground [&_svg]:size-5"
      >
        <FaMagnifyingGlass />
      </motion.div>
      <div className="flex-1 relative text-base md:text-sm">
        {!hidePlaceholder && (
          <SpotlightPlaceholder text={placeholder} className={placeholderClassName} />
        )}
        <motion.input
          ref={inputRef}
          layout="position"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none ring-0 border-0 text-foreground placeholder:transparent"
        />
      </div>
    </div>
  );
};

interface SearchResultCardProps extends SearchResult {
  isLast: boolean;
  onSelect: (href: string) => void;
}

const SearchResultCard = ({
  icon,
  label,
  description,
  link,
  isLast,
  onSelect,
}: SearchResultCardProps) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onSelect(link);
      }}
      className={cn(
        'flex items-center text-foreground justify-start hover:bg-muted gap-3 py-2 px-2 rounded-xl hover:shadow-md w-full text-left transition-colors',
        isLast && 'rounded-b-3xl'
      )}
    >
      <div className="size-8 [&_svg]:size-5 aspect-square flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <p className="font-medium truncate">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <div className="flex items-center justify-end opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 shrink-0">
        <FaChevronRight className="size-4" />
      </div>
    </button>
  );
};

interface SearchResultsContainerProps {
  searchResults: SearchResult[];
  onHover: (index: number | null) => void;
  onSelect: (href: string) => void;
}

const SearchResultsContainer = ({
  searchResults,
  onHover,
  onSelect,
}: SearchResultsContainerProps) => {
  return (
    <motion.div
      layout
      onMouseLeave={() => onHover(null)}
      className="px-2 border-t border-border flex flex-col bg-muted/30 dark:bg-muted/20 max-h-96 overflow-y-auto w-full py-2"
    >
      {searchResults.map((result, index) => (
        <motion.div
          key={`search-result-${result.link}-${index}`}
          onMouseEnter={() => onHover(index)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            delay: index * 0.05,
            duration: 0.2,
            ease: 'easeOut',
          }}
        >
          <SearchResultCard
            icon={result.icon}
            label={result.label}
            description={result.description}
            link={result.link}
            isLast={index === searchResults.length - 1}
            onSelect={onSelect}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export interface AppleSpotlightProps {
  shortcuts?: Shortcut[];
  searchResults?: SearchResult[];
  isOpen?: boolean;
  onClose?: () => void;
  onSelect?: (href: string) => void;
  placeholder?: string;
  emptyText?: string;
}

const defaultShortcuts: Shortcut[] = [
  { label: 'Dashboard', icon: <FaTableCellsLarge />, link: '/dashboard' },
  { label: 'Factures', icon: <FaFileLines />, link: '/invoices' },
  { label: 'Nouvelle facture', icon: <FaReceipt />, link: '/invoices/new' },
  { label: 'Clients', icon: <FaUsers />, link: '/clients' },
];

const defaultSearchResults: SearchResult[] = [
  { icon: <FaTableCellsLarge />, label: 'Dashboard', description: 'Tableau de bord', link: '/dashboard' },
  { icon: <FaFileLines />, label: 'Factures', description: 'Liste des factures', link: '/invoices' },
  {
    icon: <FaReceipt />,
    label: 'Nouvelle facture',
    description: 'Créer une facture',
    link: '/invoices/new',
  },
  {
    icon: <FaArrowsRotate />,
    label: 'Factures récurrentes',
    description: 'Gestion des factures récurrentes',
    link: '/recurring-invoices',
  },
  { icon: <FaUsers />, label: 'Clients', description: 'Répertoire clients', link: '/clients' },
  { icon: <FaBoxOpen />, label: 'Articles', description: 'Catalogue produits et services', link: '/items' },
  { icon: <FaBell />, label: 'Relances', description: 'Relances et rappels', link: '/reminders' },
  { icon: <FaChartBar />, label: 'Rapports', description: 'Statistiques et rapports', link: '/reports' },
  { icon: <FaGear />, label: 'Paramètres', description: 'Paramètres du compte', link: '/settings' },
];

function filterResults(results: SearchResult[], query: string): SearchResult[] {
  if (!query.trim()) return results;
  const q = query.toLowerCase().trim();
  return results.filter(
    (r) =>
      r.label.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.link.toLowerCase().includes(q)
  );
}

const AppleSpotlight = ({
  shortcuts = defaultShortcuts,
  searchResults: searchResultsProp,
  isOpen = true,
  onClose = () => {},
  onSelect = () => {},
  placeholder = 'Rechercher...',
  emptyText = 'Aucun résultat.',
}: AppleSpotlightProps) => {
  const [hovered, setHovered] = useState(false);
  const [hoveredSearchResult, setHoveredSearchResult] = useState<number | null>(null);
  const [hoveredShortcut, setHoveredShortcut] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const baseResults = searchResultsProp ?? defaultSearchResults;
  const filteredResults = useMemo(
    () => filterResults(baseResults, searchValue),
    [baseResults, searchValue]
  );

  const handleSearchValueChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSelect = (href: string) => {
    onSelect(href);
    onClose();
    setSearchValue('');
  };

  const overlay = (
    <div
      className="fixed inset-0 z-[100] min-h-screen h-screen w-screen bg-background/80 backdrop-blur-sm"
      style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
      role="presentation"
      aria-modal="true"
      aria-label="Recherche globale"
    >
      <SVGFilter />
      {/* Conteneur centré au milieu du viewport */}
      <div
        className="absolute left-1/2 top-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-4"
        onClick={(e) => e.stopPropagation()}
      >
            <motion.div
              initial={{
                opacity: 0,
                filter: 'blur(20px) url(#spotlight-blob)',
                scaleX: 1.3,
                scaleY: 1.1,
                y: -10,
              }}
              animate={{
                opacity: 1,
                filter: 'blur(0px) url(#spotlight-blob)',
                scaleX: 1,
                scaleY: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                filter: 'blur(20px) url(#spotlight-blob)',
                scaleX: 1.3,
                scaleY: 1.1,
                y: 10,
              }}
              transition={{
                stiffness: 550,
                damping: 50,
                type: 'spring',
              }}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => {
                setHovered(false);
                setHoveredShortcut(null);
              }}
              style={{ filter: 'url(#spotlight-blob)' }}
              className={cn(
                'w-full flex flex-col sm:flex-row items-center justify-center gap-4 z-20 group',
                '[&>div]:bg-card [&>div]:text-foreground [&>div]:rounded-full [&>div]:backdrop-blur-xl [&>div]:border [&>div]:border-border',
                '[&_svg]:size-6 [&_svg]:stroke-[1.4]'
              )}
            >
              <AnimatePresence mode="popLayout">
                <motion.div
                  layoutId="search-input-container"
                  transition={{
                    layout: {
                      duration: 0.5,
                      type: 'spring',
                      bounce: 0.2,
                    },
                  }}
                  style={{ borderRadius: '30px' }}
                  className="h-full w-full flex flex-col items-center justify-start z-10 relative shadow-lg overflow-hidden border border-border bg-card"
                >
                  <SpotlightInput
                    placeholder={
                      hoveredShortcut !== null && shortcuts[hoveredShortcut]
                        ? shortcuts[hoveredShortcut].label
                        : hoveredSearchResult !== null && filteredResults[hoveredSearchResult]
                        ? filteredResults[hoveredSearchResult].label
                        : placeholder
                    }
                    placeholderClassName={
                      hoveredSearchResult !== null ? 'text-foreground' : 'text-muted-foreground'
                    }
                    hidePlaceholder={!(hoveredSearchResult !== null || !searchValue)}
                    value={searchValue}
                    onChange={handleSearchValueChange}
                  />

                  {searchValue && (
                    <>
                      {filteredResults.length > 0 ? (
                        <SearchResultsContainer
                          searchResults={filteredResults}
                          onHover={setHoveredSearchResult}
                          onSelect={handleSelect}
                        />
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground border-t border-border">
                          {emptyText}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
                {hovered &&
                  !searchValue &&
                  shortcuts.map((shortcut, index) => (
                    <motion.div
                      key={`shortcut-${shortcut.link}-${index}`}
                      onMouseEnter={() => setHoveredShortcut(index)}
                      layout
                      initial={{ scale: 0.7, x: -1 * (64 * (index + 1)) }}
                      animate={{ scale: 1, x: 0 }}
                      exit={{
                        scale: 0.7,
                        x:
                          1 *
                          (16 * (shortcuts.length - index - 1) +
                            64 * (shortcuts.length - index - 1)),
                      }}
                      transition={{
                        duration: 0.8,
                        type: 'spring',
                        bounce: 0.2,
                        delay: index * 0.05,
                      }}
                      className="rounded-full cursor-pointer"
                    >
                      <ShortcutButton
                        icon={shortcut.icon}
                        link={shortcut.link}
                        onSelect={handleSelect}
                      />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence mode="popLayout">
      {isOpen && overlay}
    </AnimatePresence>,
    document.body
  );
};

export default AppleSpotlight;
