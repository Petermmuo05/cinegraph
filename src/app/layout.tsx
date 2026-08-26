import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/Header";
import FloatingDock from "@/components/common/FloatingDock";
import SearchModal from "@/components/common/SearchModal";
import LayoutClientWrapper from "./LayoutClientWrapper";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CineGraph — Cinematic Knowledge Graph & Recommendation Engine",
  description:
    "An intelligent graph database application built on CognoDB and openCypher. Explore 6-degrees of cinema, multi-hop recommendations, and creative cliques.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.variable} antialiased bg-[#040D0A] text-[#F3FAF7] min-h-screen flex flex-col`}>
        <LayoutClientWrapper>{children}</LayoutClientWrapper>
      </body>
    </html>
  );
}
