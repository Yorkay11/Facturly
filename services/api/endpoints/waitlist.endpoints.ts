import type { EndpointBuilder } from "@reduxjs/toolkit/query";

export interface JoinWaitlistDto {
  email: string;
  name?: string;
  country?: string;
}

export const waitlistEndpoints = (builder: EndpointBuilder<any, any, any>) => ({
  joinWaitlist: builder.mutation<any, JoinWaitlistDto>({
    query: (dto) => ({
      url: "/waitlist",
      method: "POST",
      body: dto,
    }),
  }),
});
