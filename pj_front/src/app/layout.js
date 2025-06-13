import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/ReduxProvider";
import { AuthInitializer } from "@/lib/AuthInitializer";
import WsConnector from "@/components/WsConnector";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FriendSidebar from "@/components/FriendSidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
          <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
            <Header />
            <AuthInitializer>
              <main className="relative">
                {children}
                <ToastContainer
                  position="bottom-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                />
                <FriendSidebar />
              </main>
            </AuthInitializer>
            <Footer />
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
