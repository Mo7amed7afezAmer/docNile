import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
// import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MedShield - Secure Medical Data De-Identification",
  description:
    "Enterprise-grade PHI removal for DICOM, imaging, and clinical data. HIPAA & GDPR compliant.",
  icons: {
    icon: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: "#143a5e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <TooltipProvider>
          {children}
          {/* <Toaster /> */}
          <SonnerToaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
