"use client";

import { useEffect, useState } from "react";

type CountdownProps = {
  net: string;
  isApproximate?: boolean;
};

function formatRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (days > 0) {
    return `T-${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  return `T-${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

export default function Countdown({ net, isApproximate = false }: CountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return (
      <div className="font-mono text-2xl font-bold text-zinc-400 dark:text-zinc-600">
        T- --:--:--
      </div>
    );
  }

  const target = new Date(net).getTime();
  const remaining = target - now;

  if (remaining <= 0) {
    return (
      <div className="font-mono text-2xl font-bold text-orange-600 dark:text-orange-400">
        Liftoff
      </div>
    );
  }

  return (
    <div>
      <div className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {formatRemaining(remaining)}
      </div>
      {isApproximate && (
        <div className="text-xs text-amber-600 dark:text-amber-400">
          approximate — date not confirmed
        </div>
      )}
    </div>
  );
}
