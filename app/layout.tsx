import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { SkipToMain } from "@/components/SkipToMain";
import { BodyWrapper } from "@/components/BodyWrapper";
import { ThemeProvider } from "next-themes";
import { Inter, Playfair_Display } from "next/font/google";
import { FallbackModals } from "@/components/FallbackModals";
import { CustomThemeProvider } from "@/components/CustomThemeProvider";
import { SlideshowBackdrop } from "@/components/SlideshowBackdrop";
import SoftAurora from "@/components/SoftAurora";
import ClickSpark from "@/components/ClickSpark";
import GlowCursor from "@/components/GlowCursor";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Progress Tracker",
  description: "12-month development programme tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Progress Tracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body className="pointer-events-auto font-sans relative">
        <SkipToMain />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GlowCursor
            color="#8b5cf6"
            secondaryColor="#ec4899"
            intensity={1.2}
            trailWidth={2.5}
            linger={1.5}
            glow={1.0}
            hotspot={0.7}
            followSpeed={0.6}
            quality="medium"
            theme="dark"
            clickBurst={true}
            enabled={true}
          >
            <ClickSpark sparkColor={['#8b5cf6', '#ec4899', '#3b82f6']} sparkSize={8} sparkCount={4} duration={300} layer="back">
              <div className="pointer-events-none fixed inset-0 z-[-1]">
                <SlideshowBackdrop />
              </div>
              <div className="fixed inset-0 -z-10 opacity-30 dark:opacity-40">
                <SoftAurora
                  color1="#8b5cf6"
                  color2="#ec4899"
                  speed={0.2}
                  scale={0.8}
                  brightness={0.5}
                  enableMouseInteraction={false}
                  opacity={0.3}
                />
              </div>
              <BodyWrapper>
                <AuthProvider>
                  <AppProvider>
                    <CustomThemeProvider>{children}</CustomThemeProvider>
                  </AppProvider>
                </AuthProvider>
              </BodyWrapper>
            </ClickSpark>
          </GlowCursor>
        </ThemeProvider>
        <Toaster />
        <FallbackModals />
      </body>
    </html>
  );
}
