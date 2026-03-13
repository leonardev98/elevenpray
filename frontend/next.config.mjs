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
    ],
  },
};

export default withNextIntl(nextConfig);
