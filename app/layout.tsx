import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from 'next/font/google'


const inter = Nunito({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: "Billing",
  description: "Billing app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} `}
      >
        {children}
      </body>
    </html>
  );
}
