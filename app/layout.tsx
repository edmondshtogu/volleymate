import { Footer } from "@/components/footer/Footer";
import Menu from "@/components/menu/Menu";
import NavBar from "@/components/navBar/NavBar";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Volleyball BOT",
  description: "A Whatsapp BOT manager for Volleyball games.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#2A3447] text-white flex flex-col min-h-screen`}
      >
        <header>
          <NavBar />
        </header>
        <main className="flex flex-1">
          <section className="flex md:p-5 flex-1">
            <Menu />
            {children}
          </section>
        </main>
        <footer>
          <Footer />
        </footer>
      </body>
    </html>
  );
}
