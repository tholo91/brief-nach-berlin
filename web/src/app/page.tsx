import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorksWithExample from "@/components/HowItWorksWithExample";
import WhyItWorks from "@/components/WhyItWorks";
import LetterCounter from "@/components/LetterCounter";
import Vision from "@/components/Vision";
import Roadmap from "@/components/Roadmap";
import Support from "@/components/Support";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorksWithExample />
        <WhyItWorks />
        <LetterCounter />
        <Vision />
        <Roadmap />
        <Support />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
