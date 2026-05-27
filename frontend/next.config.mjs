import path from "path";
import { fileURLToPath } from "url";
import createNextIntlPlugin from "next-intl/plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  turbopack: {
    root: path.resolve(__dirname),
    resolveAlias: {
      // Evita que Turbopack intente resolver tailwindcss fuera de frontend/
      tailwindcss: path.resolve(__dirname, "node_modules/tailwindcss"),
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      // Avatares de Google (cuentas firmadas con Google OAuth)
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      // Fotos de perfil y assets de marca en S3
      { protocol: "https", hostname: "*.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "*.s3.amazonaws.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "mitsyy-bucket.s3.us-east-2.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
