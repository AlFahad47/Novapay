import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google"; // বা তোমার যে ফন্ট আছে
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast"; // Toast notifications
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/layout/Navbar";
import LocaleProvider from "@/providers/LocaleProvider";
import ChatBotAI from "./components/ChatBotAI";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NovaPay - Manage your finances",
  description: "A modern fintech application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <body suppressHydrationWarning className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LocaleProvider>
            <AuthProvider>
              <Navbar />
              <main>               
                {children}
              </main>
              <ChatBotAI />
              <Footer />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>

        {/* Place toaster near the end of body */}
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}