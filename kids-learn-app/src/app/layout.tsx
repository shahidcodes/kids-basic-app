import type { Metadata, Viewport } from "next";
import { Comic_Neue } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const comicNeue = Comic_Neue({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-comic",
});

export const metadata: Metadata = {
  title: "Kids Learn - Fun Learning App",
  description: "A fun interactive learning app for kids",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KidsLearn",
  },
  icons: {
    apple: "/icon-192.png",
  },
  other: {
    "theme-color": "#f59e0b",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${comicNeue.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-comic">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
