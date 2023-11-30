// Пример работы с NextAuth, авторизация на стороне Next сервера

import NextAuth, { AuthOptions, Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import apiAuthService from '@/api/auth'
import axios from '@/lib/axios'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        code: { label: 'Code', type: 'text' },
        password: { label: 'Password', type: 'text' },
      },
      async authorize(credentials) {
        if (credentials?.password) {
          const res = await apiAuthService.loginWithPassword({
            phone: credentials?.phone || '',
            password: credentials?.password || '',
          })
          const { data } = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/client/info`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: res.access_token,
              },
            }
          )

          if (data) {
            return { ...data, ...res }
          }
          return data
        }

        const res = await apiAuthService.login({
          phone: credentials?.phone || '',
          code: credentials?.code || '',
        })

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/client/info`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: res.access_token,
            },
          }
        )

        if (data) {
          return { ...data, ...res }
        }
        return data
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session?.id) {
        return { ...token, ...session }
      }
      return { ...token, ...user }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async session({ session, token }) {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/client/info`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.access_token as string,
          },
        }
      )

      session.user = { ...token, ...data } as any
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60 * 60,
  },
  pages: {
    signIn: '/auth',
  },
  events: {
    async signOut({ token, session }) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.access_token as string,
          },
        })
      } catch (error) {
        console.log('error', error)
      }
      token = {}
      session = {} as Session
    },
  },
  useSecureCookies: false,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
