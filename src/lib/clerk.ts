import { ClerkProvider } from '@clerk/nextjs'

export const clerkConfig = {
  frontendApi: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API,
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
}

export default ClerkProvider