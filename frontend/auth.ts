import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { PublicUser } from "@/app/lib/auth-api"

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 días
const useSecureCookies = process.env.NODE_ENV === "production"
const cookiePrefix = useSecureCookies ? "__Secure-" : ""

function getBackendBaseUrl(): string | null {
  // Server-side: preferimos una URL interna explícita si existe, si no
  // caemos en NEXT_PUBLIC_API_URL que también está disponible en el server.
  return (
    process.env.BACKEND_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    null
  )
}

/**
 * Intercambia el ID token de Google por el JWT propio del backend Nest.
 * Llamado desde el callback `jwt` de NextAuth tras un sign-in exitoso de Google.
 */
async function exchangeGoogleIdToken(
  idToken: string,
): Promise<{ accessToken: string; user: PublicUser } | { error: string }> {
  const baseUrl = getBackendBaseUrl()
  if (!baseUrl) {
    return { error: "Backend URL no configurada" }
  }
  try {
    const res = await fetch(`${baseUrl}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      // Server-to-server: nunca queremos cache.
      cache: "no-store",
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as {
        message?: string | string[]
      }
      const msg = Array.isArray(body.message)
        ? body.message.join(", ")
        : body.message ?? `Backend error ${res.status}`
      return { error: msg }
    }
    const data = (await res.json()) as {
      accessToken: string
      user: PublicUser
    }
    return data
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `No se pudo contactar al backend: ${err.message}`
          : "No se pudo contactar al backend",
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: 60 * 60 * 24, // se renueva como máximo una vez al día
  },
  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  useSecureCookies,
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: SESSION_MAX_AGE_SECONDS,
      },
    },
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.id = user.id
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token

        // Bridge Google → backend Nest: cambiamos el id_token de Google por
        // el JWT propio que toda la app usa para hablar con el backend.
        if (account.provider === "google" && account.id_token) {
          const result = await exchangeGoogleIdToken(account.id_token)
          if ("accessToken" in result) {
            token.backendAccessToken = result.accessToken
            token.backendUser = result.user
            token.backendError = undefined
          } else {
            token.backendAccessToken = undefined
            token.backendUser = undefined
            token.backendError = result.error
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.accessToken = token.accessToken as string
      }
      session.backendAccessToken = token.backendAccessToken
      session.backendUser = token.backendUser
      session.backendError = token.backendError
      return session
    }
  },
  pages: {
    signIn: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET
})
