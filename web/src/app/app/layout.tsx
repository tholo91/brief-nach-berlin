import AppHeader from "@/components/AppHeader";
import { WizardFooter } from "@/components/WizardFooter";

export default function AppSectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col bg-creme">
      <AppHeader showLanguageSwitcher />
      <main className="flex-1 flex flex-col">{children}</main>
      <WizardFooter />
    </div>
  );
}
