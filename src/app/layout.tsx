
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WJRFIN | Business Finance",
  description:
    "WJRFIN - Premium Business Financial Management Platform",
};

const themeScript = `
(function () {
  try {
    var saved = localStorage.getItem("wjrfin-theme");
    var allowed = [
      "champagne",
      "emerald",
      "midnight",
      "ocean",
      "rose"
    ];

    var theme = allowed.includes(saved)
      ? saved
      : "champagne";

    document.documentElement.dataset.theme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = "champagne";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
      </head>

      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
