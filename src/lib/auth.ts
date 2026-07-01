import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const url = process.env.DATABASE_URL ? "SET" : "MISSING";
          console.log("[AUTH] env:", url, "email:", credentials.email);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });
          console.log("[AUTH] user:", user ? user.email : "NOT_FOUND");
          if (!user || !user.password) return null;
          const pw = credentials.password as string;
          const isValid = await compare(pw, user.password);
          console.log("[AUTH] valid:", isValid);
          if (!isValid) return null;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department || undefined,
            canUploadDocs: user.canUploadDocs,
          };
        } catch (e: any) {
          console.error("[AUTH] ERROR:", e?.message, e?.stack?.split("\n")[1]);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.department = (user as any).department;
        token.id = user.id;
        token.canUploadDocs = (user as any).canUploadDocs;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.department = token.department as string;
        session.user.id = token.id as string;
        session.user.canUploadDocs = token.canUploadDocs as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
