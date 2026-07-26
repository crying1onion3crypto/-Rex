import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { authApi } from '@/lib/api-client';

const handler = NextAuth({
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '',
    }),
    // Email/Password
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        try {
          // Call backend login endpoint
          const response = await authApi.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (response.data) {
            const user = {
              id: response.data.accessToken, // Using token as ID for now
              email: credentials.email,
              name: credentials.email,
            };
            return user;
          }
        } catch (error: any) {
          console.error('Login error:', error);
          throw new Error(error.message || 'Login failed');
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      
      // Add user data to token
      if (user) {
        token.user = user;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user = token.user as any;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

export { handler as GET, handler as POST };
