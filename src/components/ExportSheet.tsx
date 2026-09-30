import { formatDate, formatQty } from "@/lib/format";
import type { SiteView } from "@/lib/types";

/** PNG ga aylantiriladigan yorug' varaq. Faqat nom, miqdor va birlik. */
export function ExportSheet({ site }: { site: SiteView }) {
  const items = site.items.filter((i) => i.product);
  const total = items.reduce((a, i) => a + i.qty, 0);
  return (
    <div className="export-sheet" style={{ width: 720, padding: 40, borderRadius: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#0b1222", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="30" height="30" viewBox="0 0 64 64"><path d="M14 40V26h12v-8h12v8h12v14" fill="none" stroke="#22d3ee" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /><circle cx="32" cy="48" r="4" fill="#fb923c" /></svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>Imarat<span style={{ color: "#0891b2" }}>-log</span></div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Santexnika ashyolar ro'yxati</div>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: "#64748b" }}>
          <div>{formatDate(new Date(), true)}</div>
        </div>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>{site.name}</h1>
      {site.address && <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 14 }}>{site.address}</p>}

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24, fontSize: 15 }}>
        <thead>
          <tr style={{ background: "#f1f5f9", color: "#475569", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 }}>
            <th style={{ textAlign: "left", padding: "10px 12px", borderRadius: "10px 0 0 10px", width: 44 }}>#</th>
            <th style={{ textAlign: "left", padding: "10px 12px" }}>Mahsulot</th>
            <th style={{ textAlign: "right", padding: "10px 12px", borderRadius: "0 10px 10px 0", width: 140 }}>Miqdor</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td style={{ padding: "11px 12px", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
              <td style={{ padding: "11px 12px", fontWeight: 600 }}>
                {it.product!.name}
                {it.note && <div style={{ fontSize: 12, color: "#64748b", fontWeight: 400 }}>{it.note}</div>}
              </td>
              <td style={{ padding: "11px 12px", textAlign: "right", fontWeight: 800, whiteSpace: "nowrap" }}>
                {formatQty(it.qty)} <span style={{ color: "#64748b", fontWeight: 500, fontSize: 13 }}>{it.product!.unit}</span>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={3} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>Ro'yxat bo'sh</td></tr>
          )}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, paddingTop: 14, borderTop: "2px solid #0f172a", fontSize: 14 }}>
        <span style={{ color: "#475569" }}>Jami: <b style={{ color: "#0f172a" }}>{items.length}</b> xil mahsulot</span>
        <span style={{ color: "#475569" }}>Umumiy miqdor: <b style={{ color: "#0f172a" }}>{formatQty(total)}</b></span>
      </div>
    </div>
  );
}
