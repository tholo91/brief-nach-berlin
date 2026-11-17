import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";

export default function StatsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col bg-creme">
      <AppHeader />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
