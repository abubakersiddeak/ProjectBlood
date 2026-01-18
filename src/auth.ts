import NextAuth from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { Adapter } from "next-auth/adapters";
import bcrypt from "bcryptjs";
import dbConnect from "./lib/db";
import clientPromise from "./lib/mongoClient";
import { IUserModel } from "./types/modelTyps";
import UserModel from "./models/UserModel";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "bloodlinkbdDB",
  }) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const { email, password } = credentials;

          await dbConnect();
          const user = (await UserModel.findOne({ email }).select(
            "+password"
          )) as IUserModel | null;
          if (!user) {
            return null;
          }

          const isMatch = await bcrypt.compare(
            password.toString(),
            user.password!.toString()
          );

          if (!isMatch) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            role: user.role,
            avatar: user.avatar,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("Authentication failed");
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },

  trustHost: true,
});
