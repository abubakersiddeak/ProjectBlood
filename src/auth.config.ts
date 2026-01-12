import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default {
  providers: [CredentialsProvider],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Add type assertion here
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
