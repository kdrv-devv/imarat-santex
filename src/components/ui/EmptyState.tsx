import Image from "next/image";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon?: LucideIcon;
  /** public papkadagi rasm yo'li, masalan "/maxsulot-bosh.png". Berilsa icon o'rniga chiqadi. */
  image?: string;
  title: string;
  text?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon: Icon, image, title, text, action }: Props) {
  return (
    <div className="card p-10 flex flex-col items-center text-center animate-fade-up">
      {image ? (
        <Image src={image} alt="" width={64} height={64} className="w-16 h-16 object-contain mb-4" />
      ) : Icon ? (
        <div className="w-16 h-16 rounded-2xl bg-primary-3 text-primary flex items-center justify-center mb-4">
          <Icon size={28} />
        </div>
      ) : null}
      <h3 className="text-lg font-bold">{title}</h3>
      {text && <p className="text-sm text-muted mt-1 max-w-sm">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
