import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceStatus = "COMPLETED" | "PENDING" | "CANCELLED";
type ActiveTab     = "service" | "purchase";
type StatusFilter  = "All" | "Completed" | "Pending" | "Cancelled";
type DateFilter    = "Last 30 Days" | "Last 90 Days" | "This Year" | "All Time";

interface ServiceRecord {
  id:        number;
  date:      string;
  serviceId: string;
  type:      string;
  
  status:    ServiceStatus;
  total:     number;
}

interface PurchaseRecord {
  id:        number;
  date:      string;
  orderId:   string;
  item:      string;
  icon:      string;
  status:    ServiceStatus;
  total:     number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_HISTORY: ServiceRecord[] = [
  { id: 1, date: "Oct 24, 2023", serviceId: "#SRV-9021", type: "Engine Diagnostic",           status: "COMPLETED",  total: 420.00  },
  { id: 2, date: "Oct 12, 2023", serviceId: "#SRV-8814", type: "Tire Rotation",                status: "PENDING",    total: 85.00   },
  { id: 3, date: "Sep 28, 2023", serviceId: "#SRV-7622", type: "Full Synthetic Oil Change",    status: "COMPLETED",  total: 124.50  },
  { id: 4, date: "Sep 15, 2023", serviceId: "#SRV-7104", type: "Body Repair – Front Bumper",  status: "CANCELLED",  total: 1200.00 },
  { id: 5, date: "Aug 30, 2023", serviceId: "#SRV-6592", type: "Transmission Flush",           status: "COMPLETED",  total: 315.00  },
  { id: 6, date: "Aug 14, 2023", serviceId: "#SRV-6201", type: "Brake Pad Replacement",        status: "COMPLETED",  total: 290.00  },
  { id: 7, date: "Jul 30, 2023", serviceId: "#SRV-5988", type: "AC Recharge",                  status: "COMPLETED",  total: 180.00  },
  { id: 8, date: "Jul 10, 2023", serviceId: "#SRV-5712", type: "Wheel Alignment",              status: "PENDING",    total: 95.00   },
];

const PURCHASE_HISTORY: PurchaseRecord[] = [
  { id: 1, date: "Oct 20, 2023", orderId: "#PO-3301", item: "Engine Air Filter",    icon: "📦", status: "COMPLETED", total: 38.00  },
  { id: 2, date: "Sep 10, 2023", orderId: "#PO-3109", item: "Wiper Blade Set",      icon: "📦", status: "COMPLETED", total: 22.50  },
  { id: 3, date: "Aug 05, 2023", orderId: "#PO-2881", item: "Synthetic Motor Oil",  icon: "📦", status: "CANCELLED", total: 64.00  },
];

const DATE_FILTERS: DateFilter[]     = ["Last 30 Days", "Last 90 Days", "This Year", "All Time"];
const STATUS_FILTERS: StatusFilter[] = ["All", "Completed", "Pending", "Cancelled"];

const STATUS_CONFIG: Record<ServiceStatus, { bg: string; color: string }> = {
  COMPLETED:  { bg: "#dcfce7", color: "#16a34a" },
  PENDING:    { bg: "#f3f4f6", color: "#6b7280" },
  CANCELLED:  { bg: "#fee2e2", color: "#dc2626" },
};

const NAV_ITEMS = [
  { icon: "⊞",  label: "Dashboard"  },
  { icon: "📦", label: "Inventory"  },
  { icon: "🔧", label: "Work Orders" },
  { icon: "🚚", label: "Logistics"  },
  { icon: "👥", label: "Customers", active: true },
  { icon: "📊", label: "Analytics"  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerHistory() {
  const [activeTab, setActiveTab]       = useState<ActiveTab>("service");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [dateFilter, setDateFilter]     = useState<DateFilter>("Last 30 Days");
  const [currentPage, setCurrentPage]   = useState(1);
  const ROWS_PER_PAGE = 5;

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredService = useMemo(() => {
    return SERVICE_HISTORY.filter((r) => {
      const matchStatus =
        statusFilter === "All" ||
        r.status.toLowerCase() === statusFilter.toLowerCase();
      const matchSearch =
        !search.trim() ||
        r.type.toLowerCase().includes(search.toLowerCase()) ||
        r.serviceId.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [search, statusFilter]);

  const filteredPurchase = useMemo(() => {
    return PURCHASE_HISTORY.filter((r) => {
      const matchStatus =
        statusFilter === "All" ||
        r.status.toLowerCase() === statusFilter.toLowerCase();
      const matchSearch =
        !search.trim() ||
        r.item.toLowerCase().includes(search.toLowerCase()) ||
        r.orderId.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [search, statusFilter]);

  const activeData   = activeTab === "service" ? filteredService : filteredPurchase;
  const totalPages   = Math.max(1, Math.ceil(activeData.length / ROWS_PER_PAGE));
  const safePage     = Math.min(currentPage, totalPages);
  const pagedData    = activeData.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const totalServices = SERVICE_HISTORY.length;
  const lifetimeSpend = SERVICE_HISTORY.reduce((s, r) => s + r.total, 0) +
                        PURCHASE_HISTORY.reduce((s, r) => s + r.total, 0);

  const goToPage = (p: number) => setCurrentPage(Math.max(1, Math.min(totalPages, p)));

  const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2 });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif", background: "#f3f4f6", color: "#111" }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 240, background: "#1a1a1a", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>

        {/* Brand */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #2a2a2a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#2a2a2a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚙️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "-0.3px" }}>EngineCore</div>
              <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 500, letterSpacing: "0.04em" }}>V-Series Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV_ITEMS.map(({ icon, label, active }) => (
            <div
              key={label}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "11px 20px",
                background: active ? "#2a2a2a" : "transparent",
                color: active ? "#fff" : "#9ca3af",
                fontWeight: active ? 600 : 400,
                fontSize: 13.5,
                cursor: "pointer",
                borderLeft: active ? "3px solid #fff" : "3px solid transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "#222"; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span style={{ fontSize: 15, opacity: active ? 1 : 0.7 }}>{icon}</span>
              {label}
            </div>
          ))}
        </nav>

        {/* New Transaction */}
        <div style={{ padding: "0 16px 16px" }}>
          <button style={{ width: "100%", padding: "11px 0", background: "#2a2a2a", color: "#fff", border: "1px solid #3a3a3a", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>+</span> New Transaction
          </button>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid #2a2a2a", padding: "12px 0" }}>
          {[["⚙️", "Settings"], ["↪", "Sign Out"]].map(([icon, label]) => (
            <div key={label}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", color: "#9ca3af", fontSize: 13.5, cursor: "pointer" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
            >
              <span style={{ fontSize: 15 }}>{icon}</span> {label}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", height: 60, display: "flex", alignItems: "center", gap: 20, flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 380 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>🔍</span>
            <input
              placeholder="Search customer, vehicle, or VIN..."
              style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", color: "#374151" }}
            />
          </div>
          {["Overview", "Performance", "Reports"].map((t) => (
            <span key={t} style={{ fontSize: 13, fontWeight: t === "Overview" ? 700 : 500, color: t === "Overview" ? "#111" : "#6b7280", cursor: "pointer", borderBottom: t === "Overview" ? "2px solid #111" : "none", paddingBottom: 2, whiteSpace: "nowrap" }}>{t}</span>
          ))}
          <span style={{ fontSize: 18, cursor: "pointer", color: "#374151" }}>🔔</span>
          <span style={{ fontSize: 18, cursor: "pointer", color: "#374151" }}>⚙️</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 4 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", lineHeight: 1.2 }}>Marcus Thorne</div>
              <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em" }}>SERVICE LEAD</div>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#374151", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>MT</div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "36px 32px" }}>

          {/* Page Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>Self-Service Portal</p>
              <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: "-1.5px" }}>Customer History</h1>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 24px", minWidth: 130 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>Total Services</p>
                <p style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>{totalServices}</p>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 24px", minWidth: 160 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>Lifetime Spend</p>
                <p style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>{fmt(lifetimeSpend)}</p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", padding: "0 24px" }}>
              {(["service", "purchase"] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  style={{
                    padding: "16px 0", marginRight: 28, background: "none", border: "none",
                    borderBottom: activeTab === tab ? "2px solid #111" : "2px solid transparent",
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    color: activeTab === tab ? "#111" : "#9ca3af", cursor: "pointer",
                  }}
                >
                  {tab === "service" ? "Service History" : "Purchase History"}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 13 }}>🔍</span>
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Filter by ID or part type..."
                  style={{ width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 9, paddingBottom: 9, border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              </div>

              {/* Status chips */}
              <div style={{ display: "flex", gap: 6 }}>
                {STATUS_FILTERS.map((s) => (
                  <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                    style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid", borderColor: statusFilter === s ? "#111" : "#e5e7eb", background: statusFilter === s ? "#111" : "#fff", color: statusFilter === s ? "#fff" : "#6b7280", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Date filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                style={{ padding: "8px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#fff", fontFamily: "inherit", cursor: "pointer", outline: "none" }}
              >
                {DATE_FILTERS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ background: "#111" }}>
                    {(activeTab === "service"
                      ? ["DATE", "SERVICE ID", "TYPE", "STATUS", "TOTAL", "ACTIONS"]
                      : ["DATE", "ORDER ID",   "ITEM", "STATUS", "TOTAL", "ACTIONS"]
                    ).map((h) => (
                      <th key={h} style={{
                        padding: "12px 20px", textAlign: h === "TOTAL" || h === "ACTIONS" ? "right" : "left",
                        fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.08em", whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedData.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                        No records match your filters.
                      </td>
                    </tr>
                  )}
                  {activeTab === "service" && (pagedData as ServiceRecord[]).map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: i < pagedData.length - 1 ? "1px solid #f3f4f6" : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "#6b7280" }}>{r.date}</td>
                      <td style={{ padding: "16px 20px", fontSize: 13, fontWeight: 700, color: "#111" }}>{r.serviceId}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                          <span style={{ fontSize: 14 }}></span> {r.type}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ background: STATUS_CONFIG[r.status].bg, color: STATUS_CONFIG[r.status].color, padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em" }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", fontWeight: 800, fontSize: 14, textAlign: "right" }}>{fmt(r.total)}</td>
                      <td style={{ padding: "16px 20px", textAlign: "right" }}>
                        <button style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", background: "none", border: "none", cursor: "pointer", color: "#6b7280", textDecoration: "none" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#111")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}>
                          VIEW INVOICE
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === "purchase" && (pagedData as PurchaseRecord[]).map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: i < pagedData.length - 1 ? "1px solid #f3f4f6" : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "#6b7280" }}>{r.date}</td>
                      <td style={{ padding: "16px 20px", fontSize: 13, fontWeight: 700, color: "#111" }}>{r.orderId}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                          <span style={{ fontSize: 14 }}>{r.icon}</span> {r.item}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ background: STATUS_CONFIG[r.status].bg, color: STATUS_CONFIG[r.status].color, padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em" }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", fontWeight: 800, fontSize: 14, textAlign: "right" }}>{fmt(r.total)}</td>
                      <td style={{ padding: "16px 20px", textAlign: "right" }}>
                        <button style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#111")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}>
                          VIEW RECEIPT
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.05em" }}>
                SHOWING {Math.min((safePage - 1) * ROWS_PER_PAGE + 1, activeData.length)}–{Math.min(safePage * ROWS_PER_PAGE, activeData.length)} OF {activeData.length} RESULTS
              </span>

              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => goToPage(safePage - 1)} disabled={safePage === 1}
                  style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: safePage === 1 ? "not-allowed" : "pointer", color: "#6b7280", opacity: safePage === 1 ? 0.4 : 1, fontWeight: 700 }}>
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => goToPage(p)}
                    style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid", borderColor: safePage === p ? "#111" : "#e5e7eb", borderRadius: 8, background: safePage === p ? "#111" : "#fff", color: safePage === p ? "#fff" : "#6b7280", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                    {p}
                  </button>
                ))}
                <button onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages}
                  style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: safePage === totalPages ? "not-allowed" : "pointer", color: "#6b7280", opacity: safePage === totalPages ? 0.4 : 1, fontWeight: 700 }}>
                  ›
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}