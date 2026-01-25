// ==================== Billing Types ====================

// Plans & Subscriptions
// Nouveau format : catalogue depuis Stripe (pas de table plans)
export interface PlanCatalogItem {
  plan: "free" | "pro" | "enterprise";
  interval: "month" | "year";
  stripePriceId: string | null; // null = non configuré, désactiver l'option
}

// Ancien format Plan (pour compatibilité temporaire)
export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  billingInterval: string;
  invoiceLimit: number | null;
  metadata?: {
    features?: string[];
  };
}

export interface InvoiceLimit {
  effective: number | null; // Limite effective (null = illimité)
  used: number; // Nombre de factures utilisées
  remaining: number | null; // Nombre restant (null = illimité)
  percentage: number | null; // Pourcentage utilisé (null = illimité)
  periodStart: string; // Date de début de période
  periodEnd: string; // Date de fin de période
  isUnlimited: boolean; // true si plan illimité
  isNearLimit: boolean; // true si >= 80% de la limite
  isLimitReached: boolean; // true si limite atteinte
}

export interface Subscription {
  id: string;
  status: "active" | "past_due" | "canceled" | string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: "free" | "pro" | "enterprise" | "pay_as_you_go"; // PHASE 4 : Ajout de pay_as_you_go
  interval: "month" | "year"; // Nouveau format : intervalle de facturation
  invoicesIssuedCurrentPeriod?: number; // Nombre de factures émises dans la période actuelle
  invoiceLimit?: InvoiceLimit; // Informations détaillées sur la limite
  // PHASE 4 : Champs Pay-as-you-go
  credits?: number; // Nombre de crédits disponibles (pay_as_you_go)
  totalInvoicesSent?: number; // Total de factures envoyées depuis le début
  freeInvoicesThisMonth?: number; // Nombre de factures gratuites utilisées ce mois (free tier)
  freeClientsCount?: number; // Nombre de clients créés (free tier)
  packType?: "starter" | "pro" | "business"; // Type de pack acheté (pay_as_you_go)
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionPreview {
  currentPlan: {
    id: string;
    code: string;
    name: string;
    price: string;
    billingInterval?: "monthly" | "yearly";
    currency?: string;
  };
  newPlan: {
    id: string;
    code: string;
    name: string;
    price: string;
    billingInterval?: "monthly" | "yearly";
    currency?: string;
  };
  prorationAmount: string;
  creditAmount?: string | null;
  prorationDetails?: {
    daysElapsed: number;
    daysRemaining: number;
    totalDaysInPeriod: number;
    usedValue: string;
    remainingValue: string;
    isUpgrade: boolean;
    isDowngrade: boolean;
    intervalChange: boolean;
  };
  nextBillingDate: string;
  invoiceLimitChange: {
    current: number | null;
    new: number | null;
  };
}

// Stripe
export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface StripePortalResponse {
  url: string;
}

// PHASE 4 : Pay-as-you-go (Crédits)
export interface PayAsYouGoPlan {
  plan: "free" | "pay_as_you_go";
  type: "free" | "unit" | "pack";
  pricePerInvoice?: number; // Pour type "unit" (150 FCFA)
  packType?: "starter" | "pro" | "business"; // Pour type "pack"
  price?: number; // Prix du pack (FCFA)
  credits?: number; // Nombre de crédits dans le pack
}

export interface CreditsPurchaseResponse {
  checkoutUrl: string;
  providerRef: string;
  amount: number;
  currency: string;
  credits: number;
}

export interface PackPurchaseResponse {
  checkoutUrl: string;
  providerRef: string;
  amount: number;
  currency: string;
  credits: number;
  packType: "starter" | "pro" | "business";
  pricePerInvoice: number;
}
