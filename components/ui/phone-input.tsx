"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { isValidPhoneNumber } from "react-phone-number-input";

// Mapping des drapeaux SVG
const COUNTRY_FLAGS: Record<string, string> = {
  TG: "/images/countries/flag-for-flag-togo-svgrepo-com.svg",
  CI: "/images/countries/flag-for-flag-cote-divoire-svgrepo-com.svg",
  SN: "/images/countries/flag-for-flag-senegal-svgrepo-com.svg",
  BJ: "/images/countries/flag-for-flag-benin-svgrepo-com.svg",
  BF: "/images/countries/flag-for-flag-burkina-faso-svgrepo-com.svg",
  ML: "/images/countries/flag-for-flag-mali-svgrepo-com.svg",
  NE: "/images/countries/flag-for-flag-niger-svgrepo-com.svg",
  CM: "/images/countries/flag-for-flag-cameroon-svgrepo-com.svg",
  GA: "/images/countries/flag-for-flag-gabon-svgrepo-com.svg",
  CG: "/images/countries/flag-for-flag-congo-brazzaville-svgrepo-com.svg",
  CD: "/images/countries/flag-for-flag-republic-of-the-congo-svgrepo-com.svg",
  GN: "/images/countries/flag-for-flag-guinea-svgrepo-com.svg",
  GH: "/images/countries/flag-for-flag-ghana-svgrepo-com.svg",
  NG: "/images/countries/flag-for-flag-nigeria-svgrepo-com.svg",
  TD: "/images/countries/flag-for-flag-tchad-svgrepo-com.svg",
};

// Indicatifs téléphoniques pour les pays africains principaux
export const PHONE_COUNTRY_CODES = [
  { code: "TG", dialCode: "+228", name: "Togo", flag: "🇹🇬" },
  { code: "CI", dialCode: "+225", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "SN", dialCode: "+221", name: "Sénégal", flag: "🇸🇳" },
  { code: "BJ", dialCode: "+229", name: "Bénin", flag: "🇧🇯" },
  { code: "BF", dialCode: "+226", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "ML", dialCode: "+223", name: "Mali", flag: "🇲🇱" },
  { code: "NE", dialCode: "+227", name: "Niger", flag: "🇳🇪" },
  { code: "CM", dialCode: "+237", name: "Cameroun", flag: "🇨🇲" },
  { code: "GA", dialCode: "+241", name: "Gabon", flag: "🇬🇦" },
  { code: "CG", dialCode: "+242", name: "Congo", flag: "🇨🇬" },
  { code: "CD", dialCode: "+243", name: "RDC", flag: "🇨🇩" },
  { code: "GN", dialCode: "+224", name: "Guinée", flag: "🇬🇳" },
  { code: "GH", dialCode: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "NG", dialCode: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "TD", dialCode: "+235", name: "Tchad", flag: "🇹🇩" },
] as const;

// Détecter l'indicatif depuis un numéro
export function detectCountryCode(phoneNumber: string): string | null {
  if (!phoneNumber) return null;
  
  // Nettoyer le numéro (enlever espaces, tirets, etc.)
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");
  
  // Chercher l'indicatif qui correspond au début du numéro
  for (const country of PHONE_COUNTRY_CODES) {
    if (cleaned.startsWith(country.dialCode)) {
      return country.code;
    }
  }
  
  return null;
}

// Valider le format du numéro de téléphone avec react-phone-number-input
export function validatePhoneNumber(
  phoneNumber: string,
  countryCode?: string
): { isValid: boolean; error?: string } {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { isValid: true }; // Vide est valide si optionnel
  }

  // Utiliser isValidPhoneNumber de react-phone-number-input
  // Convertir notre code pays (ex: "TG") en code ISO (ex: "TG")
  const isValid = isValidPhoneNumber(phoneNumber, countryCode as any);
  
  if (!isValid) {
    return { 
      isValid: false, 
      error: "Format de numéro de téléphone invalide" 
    };
  }

  return { isValid: true };
}

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
}

export function PhoneInput({
  value = "",
  onChange,
  onBlur,
  countryCode: controlledCountryCode,
  onCountryCodeChange,
  placeholder,
  disabled,
  className,
  error,
  required = false,
}: PhoneInputProps) {
  const [internalCountryCode, setInternalCountryCode] = useState<string>(
    controlledCountryCode || PHONE_COUNTRY_CODES[0].code
  );
  const [phoneNumber, setPhoneNumber] = useState<string>(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Utiliser le countryCode contrôlé ou l'interne
  const countryCode = controlledCountryCode ?? internalCountryCode;

  // Trouver le pays sélectionné
  const selectedCountry = useMemo(
    () => PHONE_COUNTRY_CODES.find((c) => c.code === countryCode) || PHONE_COUNTRY_CODES[0],
    [countryCode]
  );

  // Détecter l'indicatif à partir du numéro saisi
  useEffect(() => {
    if (phoneNumber && !controlledCountryCode) {
      const detected = detectCountryCode(phoneNumber);
      if (detected && detected !== countryCode) {
        setInternalCountryCode(detected);
        if (onCountryCodeChange) {
          onCountryCodeChange(detected);
        }
      }
    }
  }, [phoneNumber, controlledCountryCode, countryCode, onCountryCodeChange]);

  // Synchroniser avec la valeur externe
  useEffect(() => {
    if (value !== phoneNumber) {
      setPhoneNumber(value || "");
    }
  }, [value]);

  const handleCountryCodeChange = (newCode: string) => {
    if (!controlledCountryCode) {
      setInternalCountryCode(newCode);
    }
    if (onCountryCodeChange) {
      onCountryCodeChange(newCode);
    }
    
    // Si le numéro existe déjà, mettre à jour avec le nouvel indicatif
    if (phoneNumber) {
      const currentCountry = PHONE_COUNTRY_CODES.find((c) => c.code === countryCode);
      const newCountry = PHONE_COUNTRY_CODES.find((c) => c.code === newCode);
      
      if (currentCountry && newCountry && phoneNumber.startsWith(currentCountry.dialCode)) {
        // Remplacer l'ancien indicatif par le nouveau
        const numberWithoutCode = phoneNumber.slice(currentCountry.dialCode.length);
        const newPhoneNumber = newCountry.dialCode + numberWithoutCode;
        setPhoneNumber(newPhoneNumber);
        if (onChange) {
          onChange(newPhoneNumber);
        }
      }
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Permettre seulement les chiffres, espaces, tirets, parenthèses et le +
    newValue = newValue.replace(/[^\d\s\-\(\)\+]/g, "");
    
    // Si l'utilisateur commence à taper sans indicatif, ajouter automatiquement celui du pays sélectionné
    if (newValue && !newValue.startsWith("+")) {
      // Si le numéro ne commence pas par un indicatif connu, ajouter celui du pays sélectionné
      const hasKnownCode = PHONE_COUNTRY_CODES.some((c) => newValue.startsWith(c.dialCode));
      if (!hasKnownCode) {
        newValue = selectedCountry.dialCode + newValue;
      }
    }
    
    setPhoneNumber(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Select
        value={countryCode}
        onValueChange={handleCountryCodeChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[140px] shrink-0">
          <SelectValue>
            <span className="flex items-center gap-1.5">
              {COUNTRY_FLAGS[selectedCountry.code] ? (
                <div className="relative w-5 h-4 overflow-hidden rounded-sm shadow-sm shrink-0">
                  <Image
                    src={COUNTRY_FLAGS[selectedCountry.code]}
                    alt={selectedCountry.name}
                    fill
                    className="object-cover"
                    sizes="20px"
                  />
                </div>
              ) : (
                <span className="w-5 text-center">🌍</span>
              )}
              <span className="text-xs">{selectedCountry.dialCode}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PHONE_COUNTRY_CODES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                {COUNTRY_FLAGS[country.code] ? (
                  <div className="relative w-5 h-4 overflow-hidden rounded-sm shadow-sm shrink-0">
                    <Image
                      src={COUNTRY_FLAGS[country.code]}
                      alt={country.name}
                      fill
                      className="object-cover"
                      sizes="20px"
                    />
                  </div>
                ) : (
                  <span className="w-5 text-center">🌍</span>
                )}
                <span className="text-sm">{country.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{country.dialCode}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex-1">
        <Input
          ref={inputRef}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          onBlur={onBlur}
          placeholder={placeholder || `${selectedCountry.dialCode} 90 12 34 56`}
          disabled={disabled}
          className={cn(error && "border-destructive")}
        />
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
