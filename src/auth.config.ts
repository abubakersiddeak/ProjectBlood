import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import UserModel from "./models/UserModel";

export default {
  providers: [CredentialsProvider],

  callbacks: {
    async jwt({ token, user }) {
      // শুধু user id রাখো
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (!session.user) return session;

      await dbConnect();

      const dbUser = await UserModel.findById(token.id).select(
        "role avatar fullName email",
      );

      if (!dbUser) return session;

      session.user.id = token.id as string;
      session.user.role = dbUser.role; // ✅ fresh role
      session.user.avatar = dbUser.avatar;
      session.user.name = dbUser.fullName;
      session.user.email = dbUser.email;

      return session;
    },
  },
} satisfies NextAuthConfig;
