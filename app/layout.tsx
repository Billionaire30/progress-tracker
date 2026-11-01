import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { SkipToMain } from "@/components/SkipToMain";
import { BodyWrapper } from "@/components/BodyWrapper";
import { SlideshowBackdrop } from "@/components/SlideshowBackdrop";
import { ThemeProvider } from "next-themes";
import { Inter, Playfair_Display } from "next/font/google";

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
        <div className="pointer-events-none fixed inset-0 z-[-1]">
          <SlideshowBackdrop />
        </div>
        <SkipToMain />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BodyWrapper>
            <AuthProvider>
              <AppProvider>{children}</AppProvider>
            </AuthProvider>
          </BodyWrapper>
        </ThemeProvider>
        <Toaster />
        <div id="fallback-notifications-modal" style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Notifications</h2>
            <p style={{ color: '#666' }}>React is not loading. Please refresh the page.</p>
            <button onClick={() => document.getElementById('fallback-notifications-modal').style.display = 'none'} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
        <div id="fallback-settings-modal" style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Settings</h2>
            <p style={{ color: '#666' }}>React is not loading. Please refresh the page.</p>
            <button onClick={() => document.getElementById('fallback-settings-modal').style.display = 'none'} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
        <div id="fallback-shortcuts-modal" style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Keyboard Shortcuts</h2>
            <p style={{ color: '#666' }}>React is not loading. Please refresh the page.</p>
            <button onClick={() => document.getElementById('fallback-shortcuts-modal').style.display = 'none'} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
        <div id="fallback-voice-modal" style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Voice Assistant</h2>
            <p style={{ color: '#666' }}>React is not loading. Please refresh the page.</p>
            <button onClick={() => document.getElementById('fallback-voice-modal').style.display = 'none'} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      </body>
    </html>
  );
}
