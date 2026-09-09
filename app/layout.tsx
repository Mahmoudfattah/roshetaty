import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Cairo } from "next/font/google";
import "./globals.css";

// IBM Plex Sans: أرقام وحروف لاتينية (زي الأصل في DESIGN.md)
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

// Cairo: تغطية عربية كاملة (IBM Plex Sans مفهوش glyphs عربي أصلًا)
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "روشتاتي",
  description: "أرشيف طبي شخصي للعائلة — احفظ روشتاتك وارجعلها بسهولة",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlexSans.variable} ${cairo.variable}`}
    >
      <head>
        {/* أيقونات Material Symbols المستخدمة في كل شاشات الـ Stitch export */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-surface text-on-surface flex flex-col min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}