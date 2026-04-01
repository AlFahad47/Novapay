import type { StepItem } from "./types";

export const truncate = (text: string, max = 140) => {
  const normalized = text.trim();
  return normalized.length > max
    ? `${normalized.slice(0, max).trimEnd()}...`
    : normalized;
};

export const defaultSteps: StepItem[] = [
  {
    title: "Create Your Account",
    desc: "Register securely with email verification and complete your automated KYC process in less than 3 minutes.",
  },
  {
    title: "Add Funds Securely",
    desc: "Deposit money into your wallet instantly via bank transfer or card, protected by 256-bit encryption.",
  },
  {
    title: "Send and Receive Instantly",
    desc: "Transfer funds across borders or pay merchants instantly with real-time transaction logging.",
  },
  {
    title: "Track and Grow",
    desc: "Analyze your spending habits with smart insights and automate micro-savings to reach your financial goals.",
  },
];
