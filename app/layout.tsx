import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, Poppins, Bricolage_Grotesque, Dancing_Script, Playfair_Display } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Momentum — AI Career & Resume Builder",
  description: "Build ATS-optimized resumes, GitHub profile READMEs, LinkedIn cover art, and practice AI mock interviews.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${bricolageGrotesque.variable} ${dancingScript.variable} ${playfairDisplay.variable} h-full antialiased`}
      >
        {/* suppressHydrationWarning covers only <body>'s own attributes, not
            its children. Browser extensions (ColorZilla adds
            cz-shortcut-listen, password managers add their own) stamp
            attributes on <body> before React hydrates, which React reports as
            a mismatch even though nothing in this app is at fault. */}
        <body className="min-h-full flex flex-col" suppressHydrationWarning>
          <GoogleAnalytics />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
