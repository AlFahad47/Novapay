import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const client = await clientPromise;
        const db = client.db("novapay_db");

        const user = await db
          .collection("users")
          .findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No account found with this email.");
        }

        // 🚨 BLOCK FRAUD USER LOGIN
        if (user?.accountStatus === "fraud") {
          throw new Error("FRAUD_BLOCKED");
        }

        if (!user.password) {
          throw new Error(
            "This account uses Google sign-in. Please use Google to log in.",
          );
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isPasswordCorrect) {
          throw new Error("Incorrect password.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image ?? null,
          role: user.role ?? "User",
          accountStatus: user.accountStatus ?? "active", // ✅ Added status
        };
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const client = await clientPromise;
          const db = client.db("novapay_db");
          const existingUser = await db
            .collection("users")
            .findOne({ email: user.email });

          // 🚨 BLOCK FRAUD GOOGLE LOGIN
          if (existingUser?.accountStatus === "fraud") {
            return false;
          }

          if (!existingUser) {
            // New Google User
            await db.collection("users").insertOne({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
              role: "User",
              accountStatus: "active", // Default status for new users
              createdAt: new Date(),
            });
          }
        } catch (error) {
          console.error("Google Sign-in Error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "User";
        token.accountStatus = (user as any).accountStatus || "active"; // ✅ Added status
      }

      // Always sync role from DB so changes in MongoDB take effect immediately
      try {
        const client = await clientPromise;
        const db = client.db("novapay_db");
        const dbUser = await db
          .collection("users")
          .findOne({ email: token.email });

        if (dbUser) {
          token.role = dbUser.role || "User";
          token.id = dbUser._id.toString();
          token.accountStatus = dbUser.accountStatus || "active";
        }
      } catch {
        // keep existing token values on DB error
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        // ✅ Added accountStatus to session
        (session.user as any).accountStatus = token.accountStatus as string;
      }
      return session;
    },
  },
};
