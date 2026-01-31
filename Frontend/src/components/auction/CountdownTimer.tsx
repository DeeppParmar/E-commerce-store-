import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endTime: Date;
  className?: string;
  size?: "sm" | "md" | "lg";
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ endTime, className, size = "md" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  const [isUrgent, setIsUrgent] = useState(false);

  function calculateTimeLeft(): TimeLeft {
    const difference = endTime.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Check if under 1 minute
      const totalSeconds = 
        newTimeLeft.days * 86400 +
        newTimeLeft.hours * 3600 +
        newTimeLeft.minutes * 60 +
        newTimeLeft.seconds;
      
      setIsUrgent(totalSeconds > 0 && totalSeconds < 60);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const isEnded = 
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (isEnded) {
    return (
      <div className={cn("text-muted-foreground font-medium", className)}>
        Ended
      </div>
    );
  }

  const sizeClasses = {
    sm: "text-xs gap-1",
    md: "text-sm gap-2",
    lg: "text-lg gap-3",
  };

  const unitClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  };

  return (
    <div
      className={cn(
        "flex items-center font-mono",
        sizeClasses[size],
        isUrgent && "animate-pulse-urgent",
        className
      )}
    >
      {timeLeft.days > 0 && (
        <TimeUnit value={timeLeft.days} label="d" isUrgent={isUrgent} className={unitClasses[size]} />
      )}
      <TimeUnit value={timeLeft.hours} label="h" isUrgent={isUrgent} className={unitClasses[size]} />
      <TimeUnit value={timeLeft.minutes} label="m" isUrgent={isUrgent} className={unitClasses[size]} />
      <TimeUnit value={timeLeft.seconds} label="s" isUrgent={isUrgent} className={unitClasses[size]} />
    </div>
  );
}

interface TimeUnitProps {
  value: number;
  label: string;
  isUrgent: boolean;
  className?: string;
}

function TimeUnit({ value, label, isUrgent, className }: TimeUnitProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg",
        isUrgent ? "bg-urgent/20 text-urgent" : "bg-secondary text-foreground",
        className
      )}
    >
      <span className="font-semibold leading-none">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
    </div>
  );
}
