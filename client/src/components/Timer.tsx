import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/gameData";

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "warning" | "danger";
  showLabel?: boolean;
}

export function Timer({ 
  timeRemaining, 
  totalTime, 
  label = "TIME",
  size = "md",
  variant = "default",
  showLabel = true
}: TimerProps) {
  const percentage = (timeRemaining / totalTime) * 100;
  const isWarning = percentage <= 25;
  const isDanger = percentage <= 10;
  
  const actualVariant = isDanger ? "danger" : isWarning ? "warning" : variant;
  
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };
  
  const strokeWidth = size === "sm" ? 4 : size === "md" ? 6 : 8;
  const radius = size === "sm" ? 28 : size === "md" ? 42 : 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colorClasses = {
    default: "stroke-primary",
    warning: "stroke-yellow-500",
    danger: "stroke-red-500",
  };
  
  const glowClasses = {
    default: "",
    warning: "drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]",
    danger: "drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative", sizeClasses[size])}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}>
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              "transition-all duration-1000",
              colorClasses[actualVariant],
              glowClasses[actualVariant],
              isDanger && "animate-pulse"
            )}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "font-mono font-bold",
            size === "sm" ? "text-sm" : size === "md" ? "text-xl" : "text-3xl",
            actualVariant === "danger" && "text-red-500 animate-pulse"
          )}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
