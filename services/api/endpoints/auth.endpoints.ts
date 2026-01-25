// ==================== Auth Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { AuthResponse, RegisterPayload, LoginPayload, User, UpdateUserPayload } from '../types';
import type { TagTypes } from '../base';

export const authEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  register: builder.mutation<AuthResponse, RegisterPayload>({
    query: (body) => ({
      url: "/auth/register",
      method: "POST",
      body,
    }),
  }),
  login: builder.mutation<AuthResponse, LoginPayload>({
    query: (body) => ({
      url: "/auth/login",
      method: "POST",
      body,
    }),
  }),
  logout: builder.mutation<void, void>({
    query: () => ({
      url: "/auth/logout",
      method: "POST",
    }),
  }),
  getMe: builder.query<User, void>({
    query: () => "/auth/me",
    providesTags: ["User"],
  }),
  updateUser: builder.mutation<User, UpdateUserPayload>({
    query: (body) => ({
      url: "/users/me",
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["User"],
  }),
});
