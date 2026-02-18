'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { FaSpinner } from 'react-icons/fa';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateUserMutation, useGetMeQuery } from '@/services/facturlyApi';
import { toast } from 'sonner';
import { useMemo, useEffect } from 'react';

type UserFormValues = {
  firstName: string;
  lastName: string;
  password?: string;
};

interface ProfileSettingsFormProps {
  userSchema: z.ZodTypeAny;
}

export function ProfileSettingsForm({ userSchema }: ProfileSettingsFormProps) {
  const t = useTranslations('settings');
  const commonT = useTranslations('common');
  const { data: user } = useGetMeQuery();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      userForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        password: '',
      });
    }
  }, [user, userForm]);

  const onUserSubmit = async (values: UserFormValues) => {
    try {
      await updateUser({
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password || undefined,
      }).unwrap();

      toast.success(t('profile.success.updated'), {
        description: t('profile.success.updatedDescription'),
      });
      userForm.reset({ ...values, password: '' });
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message ?? t('profile.errors.updateError')
          : t('profile.errors.genericError');

      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };

  return (
    <Card className="rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {t('profile.title')}
        </h2>
        <CardDescription className="mt-1 text-[15px]">
          {t('profile.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {t('profile.fields.firstName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder={t('profile.fields.firstName')}
                {...userForm.register('firstName')}
                disabled={isUpdatingUser}
                className={userForm.formState.errors.firstName ? 'border-destructive' : ''}
              />
              {userForm.formState.errors.firstName && (
                <p className="text-xs text-destructive">
                  {userForm.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                {t('profile.fields.lastName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder={t('profile.fields.lastName')}
                {...userForm.register('lastName')}
                disabled={isUpdatingUser}
                className={userForm.formState.errors.lastName ? 'border-destructive' : ''}
              />
              {userForm.formState.errors.lastName && (
                <p className="text-xs text-destructive">
                  {userForm.formState.errors.lastName.message}
                </p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">{t('profile.fields.email')}</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-foreground/60">{t('profile.fields.emailCannotBeChanged')}</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">{t('profile.fields.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('profile.fields.passwordPlaceholder')}
                {...userForm.register('password')}
                disabled={isUpdatingUser}
                className={userForm.formState.errors.password ? 'border-destructive' : ''}
              />
              {userForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {userForm.formState.errors.password.message}
                </p>
              )}
              <p className="text-xs text-foreground/60">{t('profile.fields.passwordHint')}</p>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isUpdatingUser || !userForm.formState.isDirty}
            className="rounded-full px-6"
          >
            {isUpdatingUser && <FaSpinner className="mr-2 h-4 w-4 animate-spin" />}
            {t('profile.buttons.update')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
