import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seamless Auth - Passwordless Authentication",
  description: "Add passwordless authentication to your website with one line of code",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
