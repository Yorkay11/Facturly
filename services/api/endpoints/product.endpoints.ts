// ==================== Product Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  PaginatedResponse,
  ListQueryParams,
  BulkImportResponse,
  BulkImportProductsPayload,
} from '../types';
import type { TagTypes } from '../base';

export const productEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  getProducts: builder.query<PaginatedResponse<Product>, ListQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params && params.page) searchParams.append("page", params.page.toString());
      if (params && params.limit) searchParams.append("limit", params.limit.toString());
      if (params && params.search) searchParams.append("search", params.search);
      const queryString = searchParams.toString();
      return `/products${queryString ? `?${queryString}` : ""}`;
    },
    transformResponse: (response: { data: any[]; meta: any }) => {
      // Mapper unitPrice vers price pour compatibilité avec le code existant
      return {
        ...response,
        data: response.data.map((product) => ({
          ...product,
          price: product.unitPrice, // Alias pour compatibilité
        })),
      };
    },
    providesTags: ["Product"],
    keepUnusedDataFor: 120, // Garder les produits en cache 120 secondes (2 minutes)
  }),
  getProductById: builder.query<Product, string>({
    query: (id) => `/products/${id}`,
    transformResponse: (product: any) => {
      // Mapper unitPrice vers price pour compatibilité avec le code existant
      return {
        ...product,
        price: product.unitPrice, // Alias pour compatibilité
      };
    },
    providesTags: (_result, _error, id) => [{ type: "Product", id }],
  }),
  createProduct: builder.mutation<Product, CreateProductPayload>({
    query: (body) => ({
      url: "/products",
      method: "POST",
      body: {
        ...body,
        // Le backend accepte price comme alias de unitPrice, mais on envoie price pour compatibilité
        unitPrice: body.price, // Envoyer unitPrice au backend
      },
    }),
    transformResponse: (product: any) => {
      // Mapper unitPrice vers price pour compatibilité avec le code existant
      return {
        ...product,
        price: product.unitPrice, // Alias pour compatibilité
      };
    },
    invalidatesTags: ["Product"],
  }),
  updateProduct: builder.mutation<Product, { id: string; payload: UpdateProductPayload }>({
    query: ({ id, payload }) => {
      // Créer un nouveau payload sans price, en utilisant unitPrice à la place
      const { price, ...restPayload } = payload;
      const body = {
        ...restPayload,
        ...(price && { unitPrice: price }), // Convertir price en unitPrice pour le backend
      };
      return {
        url: `/products/${id}`,
        method: "PATCH",
        body,
      };
    },
    transformResponse: (product: any) => {
      // Mapper unitPrice vers price pour compatibilité avec le code existant
      return {
        ...product,
        price: product.unitPrice, // Alias pour compatibilité
      };
    },
    invalidatesTags: (_result, _error, { id }) => [{ type: "Product", id }, "Product"],
  }),
  deleteProduct: builder.mutation<void, string>({
    query: (id) => ({
      url: `/products/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: (_result, _error, id) => [{ type: "Product", id }, "Product"],
  }),
  bulkImportProducts: builder.mutation<BulkImportResponse, BulkImportProductsPayload>({
    query: (body) => ({
      url: "/products/bulk",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Product"],
  }),
});
