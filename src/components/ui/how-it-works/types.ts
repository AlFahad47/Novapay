export interface StepItem {
  title: string;
  desc: string;
}

export interface MotionConfig {
  duration: number;
  stagger: number;
}

export interface HowItWorksSectionProps {
  steps?: StepItem[];
  accentGradient?: string;
  motionConfig?: MotionConfig;
}
