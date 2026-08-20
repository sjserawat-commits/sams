import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Phase2WorkflowNav from "@/components/Phase2WorkflowNav";
import { Suspense } from "react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SAMS | Serawat Advanced Multispecialty Joint & Spine Center",
  description: "SAMS — Serawat Advanced Multispecialty Joint & Spine Center clinical operations workspace.",
  icons: { icon: "/serawat-logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Suspense fallback={null}>
          <Phase2WorkflowNav />
        </Suspense>
      </body>
    </html>
  );
}
