import { initials } from "@/lib/format";

const palette = [
  "bg-orange-100 text-orange-800",
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-800",
  "bg-emerald-100 text-emerald-800",
  "bg-rose-100 text-rose-800",
  "bg-amber-100 text-amber-800",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Avatar({ firstName, lastName, size = 36 }: { firstName: string; lastName: string; size?: number }) {
  const cls = palette[hash(firstName + lastName) % palette.length];
  return (
    <div
      className={`shrink-0 rounded-full ${cls} font-bold flex items-center justify-center`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      title={`${firstName} ${lastName}`}
    >
      {initials(firstName, lastName)}
    </div>
  );
}
