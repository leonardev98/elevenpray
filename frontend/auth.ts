import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 días
const useSecureCookies = process.env.NODE_ENV === "production"
const cookiePrefix = useSecureCookies ? "__Secure-" : ""

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
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.accessToken = token.accessToken as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET
})
