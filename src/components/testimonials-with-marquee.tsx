"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";
import {
  TestimonialCard,
  TestimonialAuthor,
} from "@/components/ui/testimonial-card";

interface TestimonialsSectionProps {
  title?: string;
  description?: string;
  testimonials: Array<{
    author: TestimonialAuthor;
    text: string;
    href?: string;
  }>;
  className?: string;
}

export function TestimonialsSection({
  title,
  description,
  testimonials,
  className,
}: TestimonialsSectionProps) {
  const PIXELS_PER_SECOND = 85;

  const topTrackRef = useRef<HTMLDivElement>(null);
  const bottomTrackRef = useRef<HTMLDivElement>(null);
  const [hoveredRow, setHoveredRow] = useState<"top" | "bottom" | null>(null);
  const [halfWidths, setHalfWidths] = useState({ top: 0, bottom: 0 });
  const topPositionRef = useRef(0);
  const bottomPositionRef = useRef(0);

  const hasHeader = Boolean(title || description);
  const cleanTestimonials = useMemo(
    () => testimonials.filter((item) => item.text?.trim()),
    [testimonials],
  );
  const firstRow = cleanTestimonials.filter((_, index) => index % 2 === 0);
  const secondRow = cleanTestimonials.filter((_, index) => index % 2 === 1);
  const bottomRow = secondRow.length > 0 ? secondRow : firstRow;
  const loopTopRow = [...firstRow, ...firstRow];
  const loopBottomRow = [...bottomRow, ...bottomRow];

  useEffect(() => {
    const updateHalfWidths = () => {
      const topWidth = topTrackRef.current?.scrollWidth ?? 0;
      const bottomWidth = bottomTrackRef.current?.scrollWidth ?? 0;

      const nextTopHalf = topWidth / 2;
      const nextBottomHalf = bottomWidth / 2;

      setHalfWidths({ top: nextTopHalf, bottom: nextBottomHalf });

      // Start from the middle so the beginning is never visible.
      topPositionRef.current = nextTopHalf > 0 ? -nextTopHalf / 2 : 0;
      bottomPositionRef.current = nextBottomHalf > 0 ? -nextBottomHalf / 2 : 0;
    };

    updateHalfWidths();
    const resizeObserver = new ResizeObserver(updateHalfWidths);

    if (topTrackRef.current) {
      resizeObserver.observe(topTrackRef.current);
    }

    if (bottomTrackRef.current) {
      resizeObserver.observe(bottomTrackRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [loopTopRow.length, loopBottomRow.length]);

  useEffect(() => {
    let frameId = 0;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const deltaSeconds = (time - lastTime) / 1000;
      lastTime = time;

      if (topTrackRef.current && halfWidths.top > 0 && hoveredRow !== "top") {
        topPositionRef.current -= PIXELS_PER_SECOND * deltaSeconds;

        if (topPositionRef.current <= -halfWidths.top) {
          topPositionRef.current += halfWidths.top;
        }

        if (topPositionRef.current > 0) {
          topPositionRef.current -= halfWidths.top;
        }

        topTrackRef.current.style.transform = `translate3d(${topPositionRef.current}px, 0, 0)`;
      }

      if (
        bottomTrackRef.current &&
        halfWidths.bottom > 0 &&
        hoveredRow !== "bottom"
      ) {
        bottomPositionRef.current += PIXELS_PER_SECOND * deltaSeconds;

        if (bottomPositionRef.current >= 0) {
          bottomPositionRef.current -= halfWidths.bottom;
        }

        if (bottomPositionRef.current < -halfWidths.bottom) {
          bottomPositionRef.current += halfWidths.bottom;
        }

        bottomTrackRef.current.style.transform = `translate3d(${bottomPositionRef.current}px, 0, 0)`;
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [halfWidths, hoveredRow]);

  const commonTrackStyle: CSSProperties = {
    transform: "translate3d(0, 0, 0)",
    backfaceVisibility: "hidden",
  };

  return (
    <section className={cn("text-foreground px-0 py-0", className)}>
      <div className="mx-auto flex w-full max-w-container flex-col items-center gap-6 text-center sm:gap-10">
        {hasHeader && (
          <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
            {title && (
              <h2 className="max-w-180 text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-md max-w-150 font-medium text-muted-foreground sm:text-xl">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="relative flex w-full flex-col gap-4 overflow-hidden">
          <div
            className="relative flex overflow-hidden p-2 [--gap:1rem]"
            onMouseEnter={() => setHoveredRow("top")}
            onMouseLeave={() =>
              setHoveredRow((value) => (value === "top" ? null : value))
            }
          >
            <div
              ref={topTrackRef}
              style={commonTrackStyle}
              className="flex w-max shrink-0 flex-row justify-around gap-(--gap) will-change-transform"
            >
              {loopTopRow.map((testimonial, i) => (
                <TestimonialCard key={`top-${i}`} {...testimonial} />
              ))}
            </div>
          </div>

          <div
            className="relative flex overflow-hidden p-2 [--gap:1rem]"
            onMouseEnter={() => setHoveredRow("bottom")}
            onMouseLeave={() =>
              setHoveredRow((value) => (value === "bottom" ? null : value))
            }
          >
            <div
              ref={bottomTrackRef}
              style={commonTrackStyle}
              className="flex w-max shrink-0 flex-row justify-around gap-(--gap) will-change-transform"
            >
              {loopBottomRow.map((testimonial, i) => (
                <TestimonialCard key={`bottom-${i}`} {...testimonial} />
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 bg-linear-to-r from-[#F0F7FF] dark:from-[#040911] sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 bg-linear-to-l from-[#F0F7FF] dark:from-[#040911] sm:block" />
        </div>
      </div>
    </section>
  );
}
