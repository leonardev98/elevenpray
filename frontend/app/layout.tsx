import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist_Mono, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./domains-pattern.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mitsyy",
  description: "Organiza tu vida y rutinas en un solo lugar",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = headersList.get("x-next-intl-locale") ?? "es";

  return (
    <html lang={locale}>
      <body
        className={`${geistMono.variable} ${jetbrainsMono.variable} ${inter.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
