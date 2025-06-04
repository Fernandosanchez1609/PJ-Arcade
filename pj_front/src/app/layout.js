import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/ReduxProvider";
import { AuthInitializer } from "@/lib/AuthInitializer";
import WsConnector from "@/components/WsConnector";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FriendSidebar from "@/components/FriendSidebar";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <WsConnector />
          <div className="flex flex-col min-h-screen">
            <Header />
            <AuthInitializer>
              <main className="flex-1 min-h-screen">{children}</main>
              <FriendSidebar />
            </AuthInitializer>
            <Footer />
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}