import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Keep your preferred font here
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast"; // Toast notifications
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import Footer from "@/components/layout/Footer";

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
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <AuthProvider>
          <NavbarWrapper />
          {children}
          <Footer></Footer>
        </AuthProvider>

        {/* Place toaster near the end of body */}
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}