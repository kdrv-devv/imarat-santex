import { Activity, type ActivityType } from "@/lib/models/Activity";

type LogInput = {
  actor: string;
  type: ActivityType;
  site?: string | null;
  product?: string | null;
  targetUser?: string | null;
  meta?: Partial<{
    siteName: string;
    productName: string;
    userName: string;
    qty: number | null;
    unit: string;
    extra: string;
  }>;
};

export async function logActivity(input: LogInput) {
  try {
    // Bir xil element miqdori 5 daqiqa ichida ketma-ket o'zgartirilsa — oxirgi yozuvni yangilaymiz
    if (input.type === "ITEM_UPDATED" && input.site && input.product) {
      const since = new Date(Date.now() - 5 * 60_000);
      const last = await Activity.findOne({
        actor: input.actor, type: "ITEM_UPDATED", site: input.site, product: input.product, createdAt: { $gte: since },
      }).sort({ createdAt: -1 });
      if (last) {
        last.set("meta", { ...last.meta, ...input.meta });
        last.set("createdAt", new Date());
        await last.save();
        return;
      }
    }
    await Activity.create({
      actor: input.actor,
      type: input.type,
      site: input.site ?? null,
      product: input.product ?? null,
      targetUser: input.targetUser ?? null,
      meta: input.meta ?? {},
    });
  } catch (e) {
    console.error("Activity log xatosi:", e);
  }
}
