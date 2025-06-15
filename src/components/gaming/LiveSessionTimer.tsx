
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface LiveSessionTimerProps {
  startTime: string;
}

export const LiveSessionTimer = ({ startTime }: LiveSessionTimerProps) => {
  const [duration, setDuration] = useState<string>("");

  useEffect(() => {
    const updateDuration = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const diff = now - start;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setDuration(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setDuration(`${minutes}m ${seconds}s`);
      } else {
        setDuration(`${seconds}s`);
      }
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center gap-2 text-green-500 font-mono font-medium">
      <Clock className="w-4 h-4" />
      <span>{duration}</span>
    </div>
  );
};
