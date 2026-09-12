"use client";

export default function MessageTimestamp({ value }: { value: string }) {
  const date = new Date(value);
  const time = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
  const fullDate = new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "long" }).format(date);

  return <time dateTime={value} title={fullDate} className="mt-1 text-[10px] font-mono text-muted">{time}</time>;
}