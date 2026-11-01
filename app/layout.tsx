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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Fallback event handler for when React fails to hydrate
                document.addEventListener('click', function(e) {
                  const button = e.target.closest('button');
                  if (!button) return;

                  const ariaLabel = button.getAttribute('aria-label');
                  const dialogs = document.querySelectorAll('[role="dialog"]');

                  function openDialog() {
                    dialogs.forEach(dialog => {
                      dialog.style.display = 'flex';
                      dialog.style.position = 'fixed';
                      dialog.style.inset = '0';
                      dialog.style.zIndex = '50';
                      dialog.style.backgroundColor = 'rgba(0,0,0,0.5)';
                    });
                  }

                  function closeDialog() {
                    dialogs.forEach(dialog => {
                      dialog.style.display = 'none';
                    });
                  }

                  switch(ariaLabel) {
                    case 'Notifications':
                      console.log('Fallback: Opening notifications dialog');
                      openDialog();
                      break;
                    case 'Voice Assistant':
                      console.log('Fallback: Opening voice assistant dialog');
                      openDialog();
                      break;
                    case 'Show keyboard shortcuts':
                      console.log('Fallback: Opening shortcuts dialog');
                      openDialog();
                      break;
                    case 'Settings':
                      console.log('Fallback: Opening settings dialog');
                      openDialog();
                      break;
                  }
                }, true);

                // Close dialogs on backdrop click
                document.addEventListener('click', function(e) {
                  const dialog = e.target.closest('[role="dialog"]');
                  if (dialog && e.target === dialog) {
                    dialog.style.display = 'none';
                  }
                }, true);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
