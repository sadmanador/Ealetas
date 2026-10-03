import CredentialsProviderImport from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma.js';

const CredentialsProvider = CredentialsProviderImport.default || CredentialsProviderImport;

export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@ealetas.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password.');
        }

        const admin = await prisma.adminUser.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!admin) {
          throw new Error('Invalid email or password.');
        }

        const isValid = await bcrypt.compare(credentials.password, admin.password);
        if (!isValid) {
          throw new Error('Invalid email or password.');
        }

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.phone) token.phone = session.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'ealetas-super-secret-jwt-key-2026-auth',
};
