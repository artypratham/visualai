import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VisualAI — Learn AI from first principles, by tinkering",
    template: "%s · VisualAI",
  },
  description:
    "An interactive, visual roadmap for understanding AI from zero. Every concept comes with something you can play with — build real intuition, not just read about it.",
  keywords: ["learn AI", "machine learning", "neural networks", "interactive", "visual", "first principles"],
  authors: [{ name: "VisualAI" }],
  openGraph: {
    title: "VisualAI — Learn AI by tinkering",
    description:
      "An interactive, visual roadmap for understanding AI from zero. Build intuition with hands-on artifacts.",
    type: "website",
  },
};

// No-flash theme: set the .dark class before first paint.
const themeScript = `(function(){try{var s=localStorage.getItem('visualai:theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${jbMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
