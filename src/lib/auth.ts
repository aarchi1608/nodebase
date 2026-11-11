import { betterAuth } from "better-auth";
import { checkout, polar, portal } from "@polar-sh/better-auth";
import { polarClient } from "./polar";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db"
if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.startsWith("http")) {
  process.env.BETTER_AUTH_URL = `https://${process.env.BETTER_AUTH_URL}`;
}

// Auto-correct if BETTER_AUTH_URL was accidentally set to unassigned placeholder "nodebase.vercel.app"
if (
  process.env.BETTER_AUTH_URL?.includes("nodebase.vercel.app") &&
  !process.env.BETTER_AUTH_URL?.includes("nodebase-")
) {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    process.env.BETTER_AUTH_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  } else {
    process.env.BETTER_AUTH_URL = "https://nodebase-alpha-two.vercel.app";
  }
}

if (!process.env.BETTER_AUTH_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  process.env.BETTER_AUTH_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
} else if (!process.env.BETTER_AUTH_URL && process.env.VERCEL_URL) {
  process.env.BETTER_AUTH_URL = `https://${process.env.VERCEL_URL}`;
}

export const auth = betterAuth({
  database: prismaAdapter(
    prisma, {
    provider: "postgresql",
  }
  ),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://*.vercel.app",
    "https://nodebase-alpha-two.vercel.app",
    "https://nodebase-aarchi6.vercel.app",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_BRANCH_URL ? [`https://${process.env.VERCEL_BRANCH_URL}`] : []),
  ],
  socialProviders: {
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  plugins: [
    ...(process.env.POLAR_ACCESS_TOKEN
      ? [
          polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
              checkout({
                products: [
                  {
                    productId: "7a4354d0-4fe2-48aa-ba55-fee036fba626",
                    slug: "Nodebase-Pro",
                  },
                ],
                successUrl: process.env.POLAR_SUCCESS_URL,
                authenticatedUsersOnly: true,
              }),
              portal(),
            ],
          }),
        ]
      : []),
  ],
});
