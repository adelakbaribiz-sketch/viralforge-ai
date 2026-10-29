import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ViralForge AI — Cinematic AI Video Studio for Teams",
  description:
    "ViralForge AI generates short-form viral videos for customers and businesses. Optimized for Hook, Retention, and Caption — never promising guaranteed views.",
  keywords: [
    "ViralForge AI",
    "AI video generation",
    "short-form video",
    "9:16 vertical video",
    "TikTok",
    "Reels",
    "Shorts",
    "AI voiceover",
    "AI captions",
    "Remotion",
    "multi-tenant SaaS",
  ],
  authors: [{ name: "ViralForge AI" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ViralForge AI — Cinematic AI Video Studio",
    description:
      "Generate short-form viral videos in minutes. Brief → script → scenes → voiceover → captions → render.",
    siteName: "ViralForge AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ViralForge AI",
    description: "Cinematic AI video studio for teams.",
  },
};

// Inline script runs before paint — prevents any light-theme flash.
const themeScript = `(function(){try{var t=localStorage.getItem('vf-theme');if(!t||t==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.add('light');document.documentElement.style.colorScheme=t;}}catch(e){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
