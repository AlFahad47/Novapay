 "use client";

  import { useSession } from "next-auth/react";
  import Banner from "./Banner";
  import BannerUser from "./BannerUser";

  const BannerSwitch: React.FC = () => {
    const { data: session, status } = useSession();

    // Still loading - show nothing to avoid flash
    if (status === "loading") {
      return (
        <div className="w-full min-h-[88vh] bg-[#f0f7ff] dark:bg-[#050B14] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#4DA1FF] border-t-transparent animate-spin" />
        </div>
      );
    }

    // Logged in → show user banner
    if (session) {
      return <BannerUser />;
    }

    // Guest → show original banner
    return <Banner />;
  };

  export default BannerSwitch;

