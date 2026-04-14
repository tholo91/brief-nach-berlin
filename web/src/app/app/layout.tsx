import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function AppSectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col bg-creme">
      <AppHeader />
      <main className="flex-1 flex flex-col">{children}</main>
      <AppFooter />
    </div>
  );
}
