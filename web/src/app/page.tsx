import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import LetterExample from "@/components/LetterExample";
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
        <HowItWorks />
        <LetterExample />
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
