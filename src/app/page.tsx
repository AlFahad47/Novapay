 import BannerSwitch from "@/components/ui/BannerSwitch";
  import OfferSection from "@/components/ui/OfferSection";
  import ProjectDemo from "@/components/ui/ProjectDemo";
  import HowItWorksPage from "@/components/ui/HowItWorks";
  import KeyFeatures from "@/components/ui/KeyFeatures";
  import Menus from "@/components/ui/menus";
import TopReviews from "@/components/ui/Topreviews";
import EliteRewards from './../components/ui/EliteRewards';
import EliteFeaturesSlider from "@/components/ui/EliteFeaturesSlider";

  export default function Home() {
    return (
      <main>
        <section id="home">
          <BannerSwitch />
        </section>

        <section id="menus">
          <Menus />
        </section>
        <EliteFeaturesSlider/>
{/* 
        <EliteRewards/> */}

        <section id="offers">
          <OfferSection />
        </section>

        <section id="features">
          <KeyFeatures />
        </section>

        <section id="how">
          <HowItWorksPage />
        </section>
          
          <section id="reviews">  <TopReviews /></section>
      

        <section id="demo">
  <ProjectDemo />
</section>
      </main>
    );
  }
