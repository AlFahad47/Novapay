import { HeroVideoDialog } from "./HeroVideoDialog";
import T from "@/components/T";

export function HeroVideoDialogDemoTopInBottomOut() {
  return (
    <section className="home-section relative py-20">
      <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute left-1/4 bottom-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="home-container">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="home-heading text-2xl md:text-4xl">
            <T>See</T> <span className="home-gradient-text">NovaPay</span> <T>In Action</T>
          </h2>
          <p className="home-body mt-3 text-sm md:text-base">
            <T>Secure payments, instant transfers, and smarter money tools in one colorful experience.</T>
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
          <HeroVideoDialog
            className="block dark:hidden"
            animationStyle="top-in-bottom-out"
            videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
            thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
            thumbnailAlt="NovaPay Hero Video"
          />
          <HeroVideoDialog
            className="hidden dark:block"
            animationStyle="top-in-bottom-out"
            videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
            thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
            thumbnailAlt="NovaPay Hero Video"
          />
        </div>
      </div>
    </section>
  );
}
