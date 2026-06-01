import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorksWithExample from "@/components/HowItWorksWithExample";
import WhyItWorks from "@/components/WhyItWorks";
import LetterCounter from "@/components/LetterCounter";
import Vision from "@/components/Vision";
import Roadmap from "@/components/Roadmap";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { ReviewMarquee } from "@/components/reviews/ReviewMarquee";
import { getHeroReviews } from "@/lib/reviews/getHeroReviews";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const heroReviews = await getHeroReviews();

  return (
    <>
      <Header />
      <main>
        <Hero />
        {/* Review strip below hero — mobile + desktop, swipeable on touch, auto-scroll on hover-capable */}
        {heroReviews.length > 0 && (
          <section className="relative z-20 -mt-6 md:-mt-24 lg:-mt-32 pb-2">
            <ReviewMarquee reviews={heroReviews} variant="compact" limit={6} cardHref="/stimmen" />
          </section>
        )}
        <HowItWorksWithExample />
        <WhyItWorks />
        <LetterCounter />
        <Vision />
        <Roadmap />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
