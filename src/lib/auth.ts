import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import type { NextAuthOptions } from "next-auth";

// authOptions lives here so any API route can import it safely
// without causing circular import issues from the [...nextauth]/route.ts file

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
          throw new Error("ইমেইল ও পাসওয়ার্ড দিতে হবে!");
        }

        const client = await clientPromise;
        const db = client.db();

        const user = await db.collection("users").findOne({ email: credentials.email });
        if (!user) {
          throw new Error("এই ইমেইল দিয়ে কোনো একাউন্ট পাওয়া যায়নি!");
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("পাসওয়ার্ড ভুল হয়েছে!");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role ?? "User",
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
          const db = client.db();
          const existingUser = await db.collection("users").findOne({ email: user.email });
          if (!existingUser) {
            await db.collection("users").insertOne({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
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

  if (user) {
    token.role = (user as any).role;
    token.id = user.id;
  }
  return token;
},

async session({ session, token }) {
  if (session.user) {
    
    session.user.id = token.id as string;
    session.user.role = token.role as string;
  }
  return session;
},
  },
};
