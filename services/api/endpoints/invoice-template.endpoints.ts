import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  InvoiceTemplate,
  CreateInvoiceTemplateDto,
  UpdateInvoiceTemplateDto,
  InvoiceTemplatesResponse,
  DuplicateTemplateDto,
} from '../types/invoice-template.types';
import type { TagTypes } from '../base';

export const invoiceTemplateEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
    // Liste tous les templates
    getInvoiceTemplates: builder.query<InvoiceTemplatesResponse, void>({
      query: () => ({
        url: '/invoice-templates',
        method: 'GET',
      }),
      providesTags: ['InvoiceTemplate'],
    }),

    // Template par défaut
    getDefaultInvoiceTemplate: builder.query<InvoiceTemplate | null, void>({
      query: () => ({
        url: '/invoice-templates/default',
        method: 'GET',
      }),
      providesTags: ['InvoiceTemplate'],
    }),

    // Détails d'un template
    getInvoiceTemplate: builder.query<InvoiceTemplate, string>({
      query: (id) => ({
        url: `/invoice-templates/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'InvoiceTemplate', id }],
    }),

    // Créer un template
    createInvoiceTemplate: builder.mutation<InvoiceTemplate, CreateInvoiceTemplateDto>({
      query: (body) => ({
        url: '/invoice-templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['InvoiceTemplate'],
    }),

    // Mettre à jour un template
    updateInvoiceTemplate: builder.mutation<
      InvoiceTemplate,
      { id: string; data: UpdateInvoiceTemplateDto }
    >({
      query: ({ id, data }) => ({
        url: `/invoice-templates/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'InvoiceTemplate', id },
        'InvoiceTemplate',
      ],
    }),

    // Supprimer un template
    deleteInvoiceTemplate: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/invoice-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['InvoiceTemplate'],
    }),

    // Dupliquer un template
    duplicateInvoiceTemplate: builder.mutation<InvoiceTemplate, { id: string; name: string }>({
      query: ({ id, ...body }) => ({
        url: `/invoice-templates/${id}/duplicate`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['InvoiceTemplate'],
    }),
  });
