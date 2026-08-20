import type { Metadata } from "next";
import Sidebar from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "MountLift Ops",
  description: "Internal console for Creators, Brands, Campaigns and Finance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex">
        <Sidebar />
        <main className="flex-1 px-10 py-8 max-w-6xl">{children}</main>
      </body>
    </html>
  );
}
