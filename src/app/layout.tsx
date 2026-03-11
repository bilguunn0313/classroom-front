import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  variable: "--font-nunito",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Онлайн Сургалт",
  description: "Космо компаны дотоод сургалт",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" className={nunito.variable}>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              duration: 2000,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
