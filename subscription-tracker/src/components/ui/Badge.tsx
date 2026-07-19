import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "mint" | "amber" | "coral" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  primary: "bg-primary/12 text-primary",
  mint: "bg-mint/12 text-mint",
  amber: "bg-amber/15 text-amber",
  coral: "bg-coral/12 text-coral",
  muted: "bg-surface2 text-muted",
};

export function Badge({ className, tone = "muted", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
