"use client";

import { useEffect, useState } from "react";
import { timeAgo, formatDate } from "@/lib/format";

/** Server va klient vaqti farq qilganda hydration xatosini oldini oladi */
export function TimeAgo({ date, className }: { date: string | Date; className?: string }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  void tick;
  const text = timeAgo(date);
  return <span className={className} suppressHydrationWarning title={formatDate(date, true)}>{text}</span>;
}
