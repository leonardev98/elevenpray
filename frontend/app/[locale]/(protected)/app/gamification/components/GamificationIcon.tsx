import { getLucideIcon } from "@/data/gamification";
import { cn } from "@/lib/utils";

interface GamificationIconProps {
  name: string;
  className?: string;
  strokeWidth?: number;
}

export function GamificationIcon({ name, className, strokeWidth = 2 }: GamificationIconProps) {
  const Icon = getLucideIcon(name);
  return <Icon className={cn(className)} strokeWidth={strokeWidth} aria-hidden />;
}
