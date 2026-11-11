import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { polar } from 'better-auth';
import { polarClient } from '@/lib/polar';
import superjson from "superjson";
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: 'user_123' };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async({ctx , next}) => {
  const session = await auth.api.getSession({
    headers : await headers(),
  });
  if (!session) {
    throw new TRPCError({
      code : "UNAUTHORIZED",
      message : "Unauthorized",
    });
  }
  return next({ ctx : {...ctx, auth : session}});
});

export const premiumProcedure = protectedProcedure.use(async({ctx , next}) => {
  // If Polar is not configured, bypass subscription check for development/self-hosting
  if (!process.env.POLAR_ACCESS_TOKEN) {
    return next({ ctx });
  }

  try {
    const customer = await polarClient.customers.getStateExternal({
      externalId : ctx.auth.user.id,
    });
    if (!customer.activeSubscriptions || customer.activeSubscriptions.length === 0) {
      throw new TRPCError({
        code : "FORBIDDEN",
        message : "You need an active subscription to access this resource",
      });
    }
    return next({ ctx : {...ctx,customer}});
  } catch (error) {
    // Re-throw TRPCErrors (like the FORBIDDEN above) as-is
    if (error instanceof TRPCError) {
      throw error;
    }
    // Log the actual Polar API error for debugging
    console.error("Polar API error:", error);
    // For genuine API errors (network, auth, etc.), return INTERNAL_SERVER_ERROR
    throw new TRPCError({
      code : "INTERNAL_SERVER_ERROR",
      message : "Failed to verify subscription status. Please try again later.",
    });
  }
});