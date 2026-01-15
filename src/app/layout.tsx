import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BackGround from "./components/bg";
import { Suspense } from "react";
import Image from "next/image";
import ICYS from "@img/ICYS.jpg";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KVIS-ISF & ICYS Regristration",
  description: "KVIS-ISF & ICYS Regristration System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense
          fallback={
            <div style={{ position: "fixed", inset: 0, zIndex: -1 }}>
              <Image src={ICYS} alt="ISF" fill style={{ objectFit: "cover" }} />
            </div>
          }
        >
          <BackGround />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
