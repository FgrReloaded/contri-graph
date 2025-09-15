import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/providers/theme-provider"


const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-geist-sans",
});

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
          style={openSans.style}
        >
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
          <Header />
          {children}
      </ThemeProvider>
        </body>
    </html>
  );
}
