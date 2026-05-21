import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import FadeFooterImage from "@/components/FadeFooterImage";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col bg-creme">
      <AppHeader />
      <main className="flex-1 flex flex-col">{children}</main>
      <FadeFooterImage variant="content" />
      <AppFooter />
    </div>
  );
}
