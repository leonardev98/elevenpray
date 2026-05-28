import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "../../i18n/routing";
import { AuthProvider } from "../providers/auth-provider";
import { ThemeProvider } from "../providers/theme-provider";
import { ToastProvider } from "../components/toast-provider";
type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: {
      default: t("title"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "Mitsyy",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <ToastProvider />
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
