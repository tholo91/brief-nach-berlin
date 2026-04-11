import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WhyItWorks from "@/components/WhyItWorks";
import Vision from "@/components/Vision";
import Support from "@/components/Support";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <WhyItWorks />
        <Vision />
        <Support />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
