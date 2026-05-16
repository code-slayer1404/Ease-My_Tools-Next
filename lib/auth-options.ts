import type { NextAuthOptions } from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { PrismaAdapter } from "@next-auth/prisma-adapter";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),

    providers: [
        CredentialsProvider({
            name: "credentials",

            credentials: {
                email: {},
                password: {},
            },

            async authorize(credentials) {
                // Missing credentials
                if (
                    !credentials?.email ||
                    !credentials?.password
                ) {
                    throw new Error("Missing credentials");
                }

                // Find user
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                // User not found
                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                // Require verified email
                if (!user.emailVerified) {
                    throw new Error(
                        "Please verify your email first"
                    );
                }

                // Compare password
                const passwordMatch =
                    await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                if (!passwordMatch) {
                    throw new Error("Invalid credentials");
                }

                return user;
            },
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret:
                process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!;
                session.user.role = token.role;
            }

            return session;
        },
    },

    events: {
        async linkAccount({ user, account }) {
            if (account.provider === "google") {
                await prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        emailVerified: new Date(),
                    },
                });
            }
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
};