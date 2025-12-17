"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

// Composants SVG pour les drapeaux
const FrenchFlag = () => (
  <svg viewBox="0 0 640 480" className="w-5 h-4" xmlns="http://www.w3.org/2000/svg">
    <g fillRule="evenodd" strokeWidth="1pt">
      <path fill="#fff" d="M0 0h640v480H0z"/>
      <path fill="#002654" d="M0 0h213.3v480H0z"/>
      <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
    </g>
  </svg>
);

const BritishFlag = () => (
  <svg viewBox="0 0 640 480" className="w-5 h-4" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="a">
        <path fillOpacity=".7" d="M-85.3 0h682.6v512h-682.6z"/>
      </clipPath>
    </defs>
    <g clipPath="url(#a)" transform="translate(80) scale(.94)">
      <g strokeWidth="1pt">
        <path fill="#006" d="M-256 0H768v512H-256z"/>
        <path fill="#fff" d="M-256 0v57.2l909.5 454.8h146.4v-454.8H-256zM768 0v57.2l-909.5 454.8H-287.9V0H768z" fillRule="evenodd"/>
        <path fill="#fff" d="M170.6 0v512h170.6V0H170.6zM-256 170.6v170.6H768V170.6H-256z" fillRule="evenodd"/>
        <path fill="#c00" d="M-256 204.8v102.4H768V204.8H-256zM204.8 0v512h102.4V0H204.8zM-256 512L85.3 341.3h76.4L-179.7 512H-256zM-256 0L85.3 170.7H8.9L-179.7 0H-256zM768 512L426.7 341.3h-76.4L597.3 512H768zM768 0L426.7 170.7h76.4L851.1 0H768z" fillRule="evenodd"/>
      </g>
    </g>
  </svg>
);

const languages = [
  { code: 'fr', label: 'Français', Flag: FrenchFlag },
  { code: 'en', label: 'English', Flag: BritishFlag },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];


  const CurrentFlag = currentLanguage.Flag;

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px]">
        <div className="flex items-center gap-2 w-full">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <CurrentFlag />
          <span className="text-sm font-medium">{currentLanguage.label}</span>
          <SelectValue className="sr-only" aria-label={currentLanguage.label} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => {
          const Flag = lang.Flag;
          return (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <Flag />
                <span>{lang.label}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

