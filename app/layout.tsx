import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Election Companion",
  description: "Your personalized, AI-powered election process guide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans min-h-screen bg-background text-foreground antialiased selection:bg-primary/30">
        {/* Subtle animated background gradient */}
        <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        {children}
      </body>
    </html>
  );
}
