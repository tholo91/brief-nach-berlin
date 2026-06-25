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
import { PressMarquee } from "@/components/PressMarquee";
import { getHeroReviews } from "@/lib/reviews/getHeroReviews";
import { getLetterCount } from "@/lib/counter";

const LETTER_COUNT_DISPLAY_THRESHOLD = 50;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [heroReviews, letterCount] = await Promise.all([
    getHeroReviews(),
    getLetterCount(),
  ]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        {/* Press logos + review strip below hero */}
        <section className="relative z-20 -mt-6 md:-mt-24 lg:-mt-32 pb-2 bg-creme">
          <PressMarquee />
          {heroReviews.length > 0 && (
            <>
              {letterCount >= LETTER_COUNT_DISPLAY_THRESHOLD && (
                <p className="text-center font-typewriter text-xs sm:text-sm tracking-widest uppercase text-warmgrau/50 mb-2 md:mb-3 px-6">
                  Schon{" "}
                  <span className="font-bold text-waldgruen">{letterCount}</span>{" "}
                  Briefe geschrieben
                </p>
              )}
              <ReviewMarquee reviews={heroReviews} variant="compact" limit={20} cardHref="/stimmen" />
            </>
          )}
        </section>
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
