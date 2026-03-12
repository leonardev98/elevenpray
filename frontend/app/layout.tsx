import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import "./domains-pattern.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
        className={`${geistMono.variable} ${montserrat.variable} antialiased`}
        style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
