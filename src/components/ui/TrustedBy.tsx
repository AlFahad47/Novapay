const COMPANY_LOGOS = [
  "slack",
  "framer",
  "netflix",
  "google",
  "linkedin",
  "instagram",
  "facebook",
];

const TrustedBy = () => {
  const logos = [...COMPANY_LOGOS, ...COMPANY_LOGOS];

  return (
    <>
      <div className="relative mx-auto w-full max-w-7xl select-none overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-linear-to-r from-[#F8FAFC] to-transparent dark:from-[#050B14]" />

        <div
          className="marquee-inner flex min-w-[200%] will-change-transform"
          aria-label="Trusted by partner companies"
        >
          <div className="flex items-center">
            {logos.map((company, index) => (
              // External SVG logos are served from GitHub; keep <img> to avoid next/image remote config overhead.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${company}-${index}`}
                src={`https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/companyLogo/${company}.svg`}
                alt={company.charAt(0).toUpperCase() + company.slice(1)}
                className="mx-5 h-8 w-auto object-contain opacity-90 transition-opacity duration-300 hover:opacity-100 sm:mx-6 sm:h-10"
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-linear-to-l from-[#F8FAFC] to-transparent dark:from-[#050B14] md:w-40" />
      </div>

      <style jsx>{`
        .marquee-inner {
          animation: marqueeScroll 15s linear infinite;
        }

        @keyframes marqueeScroll {
          0% {
            transform: translateX(0%);
          }

          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </>
  );
};

export default TrustedBy;
