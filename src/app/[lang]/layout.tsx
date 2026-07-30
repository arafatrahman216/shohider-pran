import type { Metadata } from "next";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { themeInitScript } from "@/lib/theme-script";
import { getDictionary, isLocale, locales, defaultLocale, type Locale } from "@/lib/dictionaries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Header dict={dict} locale={locale} />
        <main id="main">{children}</main>
        <Footer dict={dict} />
      </body>
    </html>
  );
}
