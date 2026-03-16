import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google"; // বা তোমার যে ফন্ট আছে
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast"; // ১. এই লাইনটি ইমপোর্ট করো
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

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
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Navbar />
            {children}
            <Footer></Footer>
          </AuthProvider>
        </ThemeProvider>

        {/* ২. ঠিক <body> ট্যাগ শেষ হওয়ার আগে এই লাইনটি বসিয়ে দাও */}
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
