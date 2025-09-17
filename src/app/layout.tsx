import type { Metadata } from "next";
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
