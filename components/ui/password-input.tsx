'use client';

import React, { useMemo, useState, useDeferredValue } from 'react';
import { CheckCheck, Eye, EyeOff, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, key: 'requirementMinLength' },
  { regex: /[0-9]/, key: 'requirementNumber' },
  { regex: /[a-z]/, key: 'requirementLowercase' },
  { regex: /[A-Z]/, key: 'requirementUppercase' },
  { regex: /[!-\/:-@[-`{-~]/, key: 'requirementSpecial' },
] as const;

type StrengthScore = 0 | 1 | 2 | 3 | 4 | 5;

const STRENGTH_COLORS: Record<StrengthScore, string> = {
  0: 'bg-border',
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-amber-500',
  4: 'bg-amber-700',
  5: 'bg-emerald-500',
};

type Requirement = { met: boolean; text: string };
type PasswordStrength = { score: StrengthScore; requirements: Requirement[] };

export interface PasswordInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  /** Minimum score to consider valid (1-5). Default 5 = all requirements must pass. */
  minStrength?: StrengthScore;
  translationNamespace?: string;
  /** Compact layout: smaller inputs and requirements in 2 columns */
  compact?: boolean;
}

export function PasswordInput({
  id = 'password',
  name = 'password',
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  disabled,
  className,
  inputClassName,
  minStrength = 5,
  translationNamespace = 'auth.register.passwordStrength',
  compact = false,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations(translationNamespace);
  
  // Utiliser useDeferredValue pour différer le calcul de la force du mot de passe
  // Cela évite de bloquer le rendu pendant la saisie
  const deferredValue = useDeferredValue(value);

  const strength = useMemo((): PasswordStrength => {
    const requirements: Requirement[] = PASSWORD_REQUIREMENTS.map((req) => ({
      met: req.regex.test(deferredValue),
      text: t(req.key),
    }));
    const score = requirements.filter((r) => r.met).length as StrengthScore;
    return { score, requirements };
  }, [deferredValue, t]);

  const strengthLabel =
    strength.score === 0
      ? t('enterPassword')
      : strength.score === 5
        ? t('veryStrong')
        : strength.score === 4
          ? t('strong')
          : strength.score === 3
            ? t('medium')
            : t('weak');
  const isInvalid = strength.score < minStrength && deferredValue.length > 0;

  return (
    <div className={cn(compact ? 'space-y-1.5' : 'space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider ml-0.5">
          {label}
        </Label>
      )}
      <div className="relative group">
        <Input
          id={id}
          name={name}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={isInvalid || !!error}
          aria-describedby={`${id}-strength ${id}-requirements`}
          className={cn(
            'bg-gray-50 border-gray-200 focus:bg-white transition-[background-color,border-color] duration-150',
            compact ? 'pl-9 pr-9 h-9 text-sm' : 'pl-10 pr-10 h-11',
            (error || isInvalid) && 'border-destructive focus-visible:ring-destructive',
            inputClassName
          )}
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          aria-label={isVisible ? t('hidePassword') : t('showPassword')}
          className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 outline-hidden', compact ? 'right-2.5' : 'right-3')}
        >
          {isVisible ? <EyeOff className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} /> : <Eye className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
        </button>
      </div>
      {error && <p className={cn('text-destructive ml-0.5', compact ? 'text-[10px]' : 'text-xs')}>{error}</p>}
      <div className={cn('flex gap-1 w-full', compact ? 'mt-1' : 'mt-2')}>
        {( [1, 2, 3, 4, 5] as const ).map((i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              strength.score >= i ? STRENGTH_COLORS[i as StrengthScore] : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p id={`${id}-strength`} className={cn('font-medium flex justify-between text-muted-foreground', compact ? 'text-[10px]' : 'text-sm')}>
        <span>{t('mustContain')}</span>
        <span className={strength.score >= 4 ? 'text-emerald-600' : strength.score >= 1 ? 'text-amber-600' : ''}>
          {strengthLabel}
        </span>
      </p>
      <ul
        id={`${id}-requirements`}
        className={cn(compact ? 'grid grid-cols-2 gap-x-4 gap-y-0.5' : 'space-y-1.5')}
        aria-label={t('requirementsLabel')}
      >
        {strength.requirements.map((req, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {req.met ? (
              <CheckCheck size={compact ? 14 : 16} className="text-emerald-500 shrink-0" />
            ) : (
              <X size={compact ? 14 : 16} className="text-muted-foreground/80 shrink-0" />
            )}
            <span className={cn(compact ? 'text-[10px]' : 'text-xs', req.met ? 'text-emerald-600' : 'text-muted-foreground')}>
              {req.text}
              <span className="sr-only">{req.met ? ` - ${t('requirementMet')}` : ` - ${t('requirementNotMet')}`}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PasswordInput;
