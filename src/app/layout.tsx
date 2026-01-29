import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";

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
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              duration: 2000, // 2 секунд (2000ms)
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
