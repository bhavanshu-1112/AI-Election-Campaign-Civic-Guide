import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/features/AuthProvider";

export const metadata: Metadata = {
  title: "AI Election Companion — Your Personalized Voting Guide",
  description: "Navigate the democratic process with confidence. AI-powered voter roadmaps, fact-checking, interactive timelines, and readiness checklists — all in one place.",
  keywords: ["election", "voting", "AI", "voter guide", "India elections", "fact check"],
  openGraph: {
    title: "AI Election Companion",
    description: "Your personalized, AI-powered election process guide.",
    type: "website",
  },
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
