import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/ReduxProvider";
import { AuthInitializer } from "@/lib/AuthInitializer";
import WsConnector from "@/components/WsConnector";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PJ-Arcade",
  description: "A retro arcade game collection",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Primero el provider de Redux (client component) */}
        <ReduxProvider>
          {/* Al arrancar, AuthInitializer lee de localStorage y dispara setCredentials */}
          <AuthInitializer>
            <WsConnector />
            {children}
          </AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}