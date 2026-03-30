"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaLock } from "react-icons/fa";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee";
import { Button } from "@/components/ui/button";
import T from "@/components/T";

type ReviewType = {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  avatar: string;
  email: string;
};

export default function TopReviews() {
  const { data: session } = useSession();
  const [topReviews, setTopReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);

  const testimonials = useMemo(
    () =>
      topReviews
        .filter((review) => Boolean(review.comment?.trim()))
        .map((review) => {
          const emailPrefix = review.email?.split("@")[0] || "novapay-user";
          const handle = `@${emailPrefix.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 16) || "novapay-user"}`;
          const plainComment = (review.comment || "").trim();
          const shortenedComment =
            plainComment.length > 120
              ? `${plainComment.slice(0, 120)}...`
              : plainComment;

          return {
            author: {
              name: review.name || "NovaPay User",
              handle,
              avatar: review.avatar || "/user.jfif",
            },
            text: shortenedComment,
          };
        }),
    [topReviews],
  );

  useEffect(() => {
    const fetchTopReviews = async () => {
      try {
        const res = await fetch("/api/reviews");
        const data: unknown = await res.json();
        // Use all review records from the database and guard unexpected payloads
        setTopReviews(Array.isArray(data) ? (data as ReviewType[]) : []);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopReviews();
  }, []);

  return (
    <section className="home-section py-20">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />

      <div className="home-container px-6">
        {/* Header Section */}
        <div className="mb-16 flex flex-col justify-between gap-6 text-left md:flex-row md:items-end">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="home-heading mt-3 text-2xl md:text-4xl"
            >
              <T>What Our Users</T> <span className="home-gradient-text"><T>Say</T></span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="home-body mt-3 max-w-2xl text-sm md:text-base"
            >
              <T>Real feedback from NovaPay users worldwide, sharing how faster payments and smarter money tools improved their daily lives.</T>
            </motion.p>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.95 }}>
            {session ? (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="group rounded-full border-slate-200 px-6 font-bold text-slate-700 hover:border-[#4DA1FF]/40 hover:text-[#1E50FF] dark:border-white/10 dark:text-slate-200"
              >
                <Link href="/review">
                  <T>Share Your Experience</T>
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            ) : (
              <Button
                onClick={() => signIn("google")}
                variant="novapay"
                size="lg"
                className="home-btn-primary rounded-full px-6"
                aria-label="Login to Review"
              >
                <FaLock size={14} />
                <T>Login to Review</T>
              </Button>
            )}
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-gray-200 animate-pulse dark:bg-white/5"
              />
            ))}
          </div>
        ) : testimonials.length > 0 ? (
          <div className="p-2">
            <TestimonialsSection
              testimonials={testimonials}
              className="bg-transparent py-0"
            />
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white/70 px-6 py-16 text-center text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            <T>No reviews yet. Be the first to share your experience.</T>
          </div>
        )}

        {/* View All Button */}
        <div className="mt-16 text-center">
          <Link
            href="/review"
            className="flex items-center justify-center gap-2 font-semibold text-slate-500 transition-colors hover:text-[#1E50FF]"
          >
            <T>See all community feedback</T> <FaArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
