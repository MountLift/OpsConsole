import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Sidebar from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "MountLift Ops",
  description: "Internal console for Creators, Brands, Campaigns and Finance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen font-sans md:flex">
          <Sidebar />
          <main className="w-full flex-1 px-4 py-4 sm:px-6 sm:py-6 md:max-w-6xl md:px-10 md:py-8">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}