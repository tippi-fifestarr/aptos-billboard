import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WalletProvider from "@/components/providers/WalletProvider";
import GitHubCorner from "@/components/GitHubCorner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Highway Billboard - Drive the Blockchain Highway",
  description: "Post messages on the Aptos blockchain highway with beautiful UI and gas station sponsorship",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          <GitHubCorner href="https://github.com/tippi-fifestarr/aptos-billboard" />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
