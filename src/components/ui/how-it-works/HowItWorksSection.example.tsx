"use client";

import { HowItWorksSection, type StepItem } from "../HowItWorks";

const exampleSteps: StepItem[] = [
  {
    title: "Create Your Account",
    desc: "Register with email verification and complete KYC in under three minutes.",
  },
  {
    title: "Add Funds Securely",
    desc: "Top up instantly through bank transfer or card with bank-grade encryption.",
  },
  {
    title: "Send and Receive Instantly",
    desc: "Pay anyone, split expenses, and settle transfers in real time.",
  },
  {
    title: "Track and Grow",
    desc: "Use spending insights and micro-savings automation to hit financial goals faster.",
  },
];

export function HowItWorksSectionExample() {
  return (
    <div className="space-y-10">
      <HowItWorksSection steps={exampleSteps} />

      <div className="dark rounded-xl border border-white/10 bg-[#050B14] p-6">
        <HowItWorksSection steps={exampleSteps} />
      </div>
    </div>
  );
}
