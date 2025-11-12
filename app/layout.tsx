import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from 'next/font/google'
import Providers from "./providers";
import { Toaster } from "sonner";


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
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            closeButton
          />
        </Providers>
      </body>
    </html>
  );
}
