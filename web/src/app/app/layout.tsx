import AppHeader from "@/components/AppHeader";
import { WizardFooter } from "@/components/WizardFooter";
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#10231D" },
  ],
  colorScheme: "light dark",
};

export default function AppSectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="theme-auto min-h-screen flex flex-col bg-creme">
      <AppHeader showLanguageSwitcher />
      <main className="flex-1 flex flex-col">{children}</main>
      <WizardFooter />
    </div>
  );
}
