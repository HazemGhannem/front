import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RelayProvider } from "@/lib/relayContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home Relay — your PC, from your phone",
  description:
    "See your computer's screen, control it, and grab files from your phone or any browser. Install the agent on your PC, link it with a 6-digit code, done.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0c0d10] text-[#f2f4f8]">
        <RelayProvider>
          {children}
        </RelayProvider>
      </body>
    </html>
  );
}
