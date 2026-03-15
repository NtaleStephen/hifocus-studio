import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppThemeApplier } from "@/components/AppThemeApplier";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Hifocus — Minimalist Flip Clock",
  description: "A beautiful, distraction-free flip clock for focus and productivity. Timer, countdown, and customizable themes.",
  authors: [{ name: "Hifocus" }],
  openGraph: {
    title: "Hifocus — Minimalist Flip Clock",
    description: "A beautiful, distraction-free flip clock for focus and productivity. Timer, countdown, and customizable themes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hifocus — Minimalist Flip Clock",
    description: "A beautiful, distraction-free flip clock for focus and productivity. Timer, countdown, and customizable themes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SettingsProvider>
              <TaskProvider>
                <WorkspaceProvider>
                  <AppThemeApplier />
                  <ProtectedRoute>
                    {children}
                  </ProtectedRoute>
                  <Toaster />
                </WorkspaceProvider>
              </TaskProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
