import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import { UiProvider } from "@/components/providers/ui-provider";
import { AuthProvider } from "@/context/auth-context"; // Import this

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Qubitgyan Student Portal",
  description: "Advanced Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* AuthProvider must be inside Body but outside UI */}
        <AuthProvider>
          <UiProvider>
            {children}
          </UiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
