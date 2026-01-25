// ==================== Billing Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  Subscription,
  SubscriptionPreview,
  StripeCheckoutResponse,
  StripePortalResponse,
  PayAsYouGoPlan,
  CreditsPurchaseResponse,
  PackPurchaseResponse,
} from '../types';
import type { TagTypes } from '../base';

export const billingEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  getSubscription: builder.query<Subscription, void>({
    query: () => "/subscriptions/me",
    // // providesTags: ["Subscription"], // Temporairement désactivé pour éviter l'erreur de type // Temporairement désactivé pour éviter l'erreur de type
  }),
  createSubscription: builder.mutation<Subscription, { planId: string }>({
    query: (body) => ({
      url: "/subscriptions",
      method: "POST",
      body,
    }),
    // // invalidatesTags: ["Subscription"], // Temporairement désactivé pour éviter l'erreur de type // Temporairement désactivé pour éviter l'erreur de type
  }),
  previewSubscription: builder.mutation<SubscriptionPreview, { planId: string }>({
    query: (body) => ({
      url: "/subscriptions/preview",
      method: "POST",
      body,
    }),
  }),
  cancelSubscription: builder.mutation<Subscription, void>({
    query: () => ({
      url: "/subscriptions/cancel",
      method: "POST",
    }),
    // // invalidatesTags: ["Subscription"], // Temporairement désactivé pour éviter l'erreur de type // Temporairement désactivé pour éviter l'erreur de type
  }),
  // Stripe
  createCheckoutSession: builder.mutation<
    StripeCheckoutResponse,
    { plan: "free" | "pro" | "enterprise"; interval: "month" | "year" }
  >({
    query: (body) => ({
      url: "/checkout/create",
      method: "POST",
      body,
    }),
  }),
  changePlan: builder.mutation<
    {
      success: boolean;
      subscriptionId: string;
      plan: "free" | "pro" | "enterprise";
      interval: "month" | "year";
    },
    { plan: "free" | "pro" | "enterprise"; interval: "month" | "year" }
  >({
    query: (body) => ({
      url: "/subscriptions/change-plan",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Subscription"],
  }),
  createPortalSession: builder.mutation<StripePortalResponse, void>({
    query: () => ({
      url: "/portal/create",
      method: "POST",
    }),
  }),
  // PHASE 4 : Achat de crédits (Pay-as-you-go)
  getPlans: builder.query<{ data: PayAsYouGoPlan[] }, void>({
    query: () => "/plans",
    providesTags: ["Subscription"],
  }),
  purchaseCredits: builder.mutation<
    CreditsPurchaseResponse,
    { quantity: number }
  >({
    query: (body) => ({
      url: "/credits/purchase",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Subscription"],
  }),
  purchasePack: builder.mutation<
    PackPurchaseResponse,
    { packType: "starter" | "pro" | "business" }
  >({
    query: (body) => ({
      url: "/credits/packs",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Subscription"],
  }),
});
