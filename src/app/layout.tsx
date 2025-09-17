import type { Metadata, Viewport } from "next";
import localFont from 'next/font/local'
import "./globals.css";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Analytics } from '@vercel/analytics/next';


const grotesk = localFont({
  src: './grotesk.ttf',
})


export const metadata: Metadata = {
  title: "Contri Graph",
  description: "Visualize your GitHub contributions",
  applicationName: "Contri Graph",
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Contri Graph",
    title: "Contri Graph",
    description: "Visualize your GitHub contributions",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contri Graph",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contri Graph",
    description: "Visualize your GitHub contributions",
    images: ["/og-image.png"],
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
  category: "utilities",
  other: {
    "creator": "Contri Graph",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="h-screen sm:overflow-y-hidden overflow-x-hidden"
        style={grotesk.style}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
