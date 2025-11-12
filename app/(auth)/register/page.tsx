"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail, User, Building2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRegisterMutation } from "@/services/facturlyApi";
import { toast } from "sonner";

const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  companyName: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [register, { isLoading, isSuccess, isError, error, data }] = useRegisterMutation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      companyName: "",
    },
  });

  useEffect(() => {
    if (isSuccess && data) {
      if (typeof window !== "undefined") {
        document.cookie = `facturly_access_token=${data.accessToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      }

      const userName = data.firstName && data.lastName 
        ? `${data.firstName} ${data.lastName}` 
        : data.email;

      toast.success("Inscription réussie", {
        description: `Bienvenue ${userName}, votre compte a été créé avec succès !`,
      });

      router.push("/dashboard");
    }
  }, [data, isSuccess, router]);

  useEffect(() => {
    if (isError && error) {
      if (typeof window !== "undefined") {
        document.cookie = "facturly_access_token=; path=/; max-age=0";
      }
      const errorMessage = error && "data" in error 
        ? (error.data as { message?: string })?.message ?? "Une erreur est survenue lors de l'inscription."
        : "Vérifiez vos informations ou réessayez plus tard.";
      
      toast.error("Échec de l'inscription", {
        description: errorMessage,
      });
    }
  }, [error, isError]);

  const onSubmit = (values: RegisterFormValues) => {
    register({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      companyName: values.companyName,
    });
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-primary">Créer un compte Facturly</CardTitle>
            <CardDescription className="text-foreground/60">
              Inscrivez-vous pour commencer à gérer vos factures en toute simplicité.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    className="pl-9"
                    {...form.register("firstName")}
                  />
                </div>
                {form.formState.errors.firstName ? (
                  <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    className="pl-9"
                    {...form.register("lastName")}
                  />
                </div>
                {form.formState.errors.lastName ? (
                  <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@entreprise.com"
                  className="pl-9"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email ? (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Mon Entreprise SAS"
                  className="pl-9"
                  {...form.register("companyName")}
                />
              </div>
              {form.formState.errors.companyName ? (
                <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              ) : null}
              <p className="text-xs text-foreground/50">
                Le mot de passe doit contenir au moins 8 caractères.
              </p>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Créer mon compte
            </Button>
          </form>
          <div className="space-y-3 text-center text-sm text-foreground/60">
            <Separator />
            <p>
              Vous avez déjà un compte ? {" "}
              <Link href="/login" className="text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-xs text-foreground/50">
        En créant un compte, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité.
      </p>
    </div>
  );
}

