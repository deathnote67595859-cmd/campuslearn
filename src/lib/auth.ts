import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    // JWT strategy is required when using CredentialsProvider.
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "CampusLearn Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        expectedRole: { label: "Expected Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password.");
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid email or password.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password.");
        }

        // Role-Aware Check: If logging in through Faculty / Teacher portal
        if (credentials.expectedRole === "TEACHER") {
          if (user.role !== "TEACHER" && user.role !== "ADMIN") {
            throw new Error("TEACHER_NOT_AUTHORIZED");
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          username: user.username,
          university: user.university,
          major: user.major,
        };
      },
    }),
  ],
  callbacks: {
    // Allow all credentials sign-ins (authorize() already ran its checks)
    async signIn() {
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // ── First sign-in (user object is populated) ──────────────────────────
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "STUDENT";
        token.username = (user as any).username;
        token.university = (user as any).university;
        token.major = (user as any).major;
      }

      // ── Session update (e.g. profile edit) ───────────────────────────────
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.role = (token.role as any) ?? "STUDENT";
        session.user.username = token.username as string | undefined;
        session.user.university = token.university as string | undefined;
        session.user.major = token.major as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
