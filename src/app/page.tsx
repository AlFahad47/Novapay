"use client"; // Ensure this is here if you're using useSession in Next.js App Router

import BannerSwitch from "@/components/ui/BannerSwitch";
import HowItWorksPage from "@/components/ui/HowItWorks";
import KeyFeatures from "@/components/ui/KeyFeatures";
import Menus from "@/components/ui/menus";
import TopReviews from "@/components/ui/Topreviews";
import EliteFeaturesSlider from "@/components/ui/EliteFeaturesSlider";
import { useSession } from "next-auth/react";
import { HeroVideoDialogDemoTopInBottomOut } from "@/components/ui/HeroVideoDialogDemoTopInBottomOut";
import HandCardCtaSection from "@/components/ui/HandCardCtaSection";

export default function Home() {
  const { data: session } = useSession(); // Correct way to extract session

  return (
    <main className="w-full">
      <section id="home">
        <BannerSwitch />
      </section>

      <section id="menus">
        <Menus />
      </section>

      {/* Conditional rendering must be inside curly braces */}
      {session && (
        <section id="elite-features">
          <EliteFeaturesSlider />
        </section>
      )}

      <section id="features">
        <KeyFeatures />
      </section>

      <section id="how">
        <HowItWorksPage />
      </section>

      <section id="reviews">
        <TopReviews />
      </section>

      <section id="reviews">
        <HeroVideoDialogDemoTopInBottomOut />
      </section>

      <section id="hand-card-cta">
        <HandCardCtaSection />
      </section>
    </main>
  );
}
