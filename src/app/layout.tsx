import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BloodLink BD – Bangladesh's Trusted Blood Donation Platform",
  description:
    "BloodLink BD হলো বাংলাদেশের একটি নির্ভরযোগ্য রক্তদান প্ল্যাটফর্ম যেখানে দ্রুত রক্ত খুঁজে পাওয়া যায় এবং রক্তদাতারা সহজেই রেজিস্টার করতে পারেন।",

  keywords: [
    "Blood Donation",
    "BloodLink BD",
    "Blood Donor Bangladesh",
    "রক্ত দান",
    "রক্তদাতা",
    "Blood Bank BD",
  ],

  authors: [{ name: "BloodLink BD Team" }],
  creator: "BloodLink BD",
  publisher: "BloodLink BD",

  metadataBase: new URL("https://blood-link-bd-ochre.vercel.app/"),

  openGraph: {
    title: "BloodLink BD – Fast & Reliable Blood Donation Platform",
    description:
      "বাংলাদেশে দ্রুত রক্ত খুঁজে পাওয়ার জন্য এবং রক্তদাতা রেজিস্ট্রেশনের জন্য BloodLink BD হলো সবচেয়ে সহজ সমাধান।",
    url: "https://blood-link-bd-ochre.vercel.app/",
    siteName: "BloodLink BD",
    images: [
      {
        url: "/bloodlinkLogo.webp",
        width: 1200,
        height: 630,
        alt: "BloodLink BD Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "BloodLink BD – Bangladesh's Trusted Blood Donation Platform",
    description:
      "রক্ত খুঁজছেন? BloodLink BD আপনাকে দ্রুত নিকটবর্তী রক্তদাতার সাথে যুক্ত করবে!",
    images: ["/bloodlinkLogo.webp"],
    creator: "Abu Bakar Siddik Zisan",
  },

  icons: {
    icon: "/bloodlinkLogo.webp",
    apple: "/bloodlinkLogo.webp",
  },

  themeColor: "#DC2626",
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
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
