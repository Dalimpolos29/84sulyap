import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Lora } from 'next/font/google'
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
})

export const metadata: Metadata = {
  title: "UPIS 84 - Alumni Portal",
  description: "UPIS Batch '84 Alumni Portal - Reconnecting Our Past, Empowering Our Future",
  icons: {
    icon: [
      {
        url: "/icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        url: "/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png"
      }
    ],
    apple: {
      url: "/icons/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png"
    }
  },
  manifest: "/icons/site.webmanifest"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} font-serif antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
