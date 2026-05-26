import "next-auth"
import "next-auth/jwt"
import type { PublicUser } from "@/app/lib/auth-api"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      accessToken?: string
    }
    /** JWT propio del backend Nest (Bearer token usado por toda la app). */
    backendAccessToken?: string
    /** Usuario tal como lo devuelve el backend tras /auth/google. */
    backendUser?: PublicUser
    /** Mensaje de error legible cuando el bridge con el backend falla. */
    backendError?: string
  }

  interface User {
    id: string
    email: string
    name: string
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accessToken?: string
    refreshToken?: string
    backendAccessToken?: string
    backendUser?: PublicUser
    backendError?: string
  }
}
