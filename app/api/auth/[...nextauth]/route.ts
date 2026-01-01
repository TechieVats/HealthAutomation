import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '../../lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Mock authentication - in production, verify against database
        if (credentials?.email && credentials?.password) {
          // For demo purposes, accept any email/password
          return {
            id: '1',
            email: credentials.email as string,
            name: 'Demo User',
          }
        }
        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/api/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})

// Export handlers for Next.js API routes
export const { GET, POST } = handlers
