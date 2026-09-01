import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorksWithExample from "@/components/HowItWorksWithExample";
import WhyItWorks from "@/components/WhyItWorks";
import Vision from "@/components/Vision";
import Roadmap from "@/components/Roadmap";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { ReviewMarquee } from "@/components/reviews/ReviewMarquee";
import { PressMarquee } from "@/components/PressMarquee";
import { getHeroReviews } from "@/lib/reviews/getHeroReviews";
import { getLetterCount } from "@/lib/counter";
import { formatNumber } from "@/lib/formatNumber";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "Brief-nach-Berlin | Dein Anliegen an die Politik",
  description:
    "Beschreibe dein Anliegen. Brief-nach-Berlin findet die passenden Abgeordneten und formuliert in wenigen Minuten deinen persönlichen Brief.",
};

export default async function Home() {
  const [heroReviews, letterCount] = await Promise.all([
    getHeroReviews(),
    getLetterCount(),
  ]);
  const formattedLetterCount = formatNumber(letterCount);

  return (
    <>
      <Header />
      <main>
        <Hero />
        {/* Press logos + review strip below hero */}
        <section className="relative z-20 -mt-12 md:-mt-12 lg:-mt-24 pb-2">
          <PressMarquee />
          <p className="mt-4 md:mt-8 text-center font-typewriter text-xs sm:text-sm tracking-widest uppercase text-warmgrau/50 mb-1 px-6">
            Schon <span className="font-bold text-waldgruen">{formattedLetterCount}</span> Briefe geschrieben
          </p>
          {heroReviews.length > 0 && (
            <div className="mt-4 md:mt-8">
              <ReviewMarquee reviews={heroReviews} variant="compact" limit={20} cardHref="/stimmen" />
            </div>
          )}
        </section>
        <HowItWorksWithExample />
        <WhyItWorks />
        <Vision />
        <Roadmap />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
