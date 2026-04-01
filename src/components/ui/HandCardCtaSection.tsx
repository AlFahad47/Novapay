"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function clamp(value: number, min = 0, max = 1) {
	return Math.min(max, Math.max(min, value));
}

export default function HandCardCtaSection() {
	const sectionRef = useRef<HTMLElement | null>(null);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		let frame = 0;

		const updateProgress = () => {
			if (!sectionRef.current) return;

			const rect = sectionRef.current.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const stickyTravel = Math.max(1, rect.height - viewportHeight);
			const scrolledInSection = -rect.top;
			const next = clamp(scrolledInSection / stickyTravel);

			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => setProgress(next));
		};

		updateProgress();
		window.addEventListener("scroll", updateProgress, { passive: true });
		window.addEventListener("resize", updateProgress);

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("scroll", updateProgress);
			window.removeEventListener("resize", updateProgress);
		};
	}, []);

	const imageSlide = clamp((progress - 0.08) / 0.72);
	const easedSlide = 1 - Math.pow(1 - imageSlide, 3);
	const cardTranslateRem = 1 + easedSlide * 13;

	return (
		<section ref={sectionRef} className="card-sticky-wrap relative bg-[#e9e9ea] dark:bg-[#0b0d14]">
			<div className="container mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="page-padding">
					<div className="card-sticky-inner relative h-[195vh]">
						<div className="card-hand-wrap sticky top-0 flex h-screen items-center justify-center overflow-hidden">
							<div className="relative h-screen w-full">
								<div className="card-header pointer-events-auto absolute inset-x-0 top-[30%] z-10 flex flex-col items-center px-4 text-center sm:top-[32%]">
									<h2 className="home-section-heading cc-card text-balance text-2xl font-bold leading-[0.98] tracking-tight text-[#101117] dark:text-[#f2f4f8] sm:text-4xl md:text-5xl">
										Earn globally,
										<br />
										spend locally.
									</h2>
									<Link
										data-button="get-start"
										href="/login"
										className="cta mt-4 inline-flex rounded-full bg-linear-to-r from-[#4DA1FF] to-[#1E50FF] px-6 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_-10px_rgba(44,100,255,0.85)] transition hover:brightness-105 sm:text-sm"
									>
										Get Start
									</Link>
								</div>

								<div
									className="card-hand-img absolute inset-x-0 bottom-0 z-20 mx-auto w-full max-w-4xl will-change-transform"
									style={{
										transform: `translate3d(0, ${cardTranslateRem}rem, 0)`,
									}}
								>
									<Image
										src="/handcard.png"
										loading="eager"
										alt="hand holding nsave card"
										width={1869}
										height={2217}
										priority
										unoptimized
										className="mx-auto h-auto max-h-[74vh] w-full max-w-160 select-none object-contain"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
