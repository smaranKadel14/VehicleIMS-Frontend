import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StockStatus = "LOW" | "CRITICAL" | "OK";

interface Part {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  status: StockStatus;
  price: number;
  supplier: string;
  icon: string;
}

interface PartFormData {
  name: string;
  sku: string;
  category: string;
  stock: string;
  price: string;
  supplier: string;
}

type ModalState = null | "add" | { edit: Part } | { delete: Part };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveStatus(stock: number): StockStatus {
  if (stock <= 3) return "CRITICAL";
  if (stock <= 10) return "LOW";
  return "OK";
}

let nextId = 100;

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_PARTS: Part[] = [
  { id: 1, name: "High-Performance Fuel Injector",  sku: "#FI-88291-LX",  category: "ENGINE COMPONENTS", stock: 8,   status: "LOW",      price: 284.5,  supplier: "Bosch Automotive GmbH",  icon: "⚙️" },
  { id: 2, name: "Ceramic Brake Pads (Front)",       sku: "#BP-00221-CF",  category: "BRAKING SYSTEM",    stock: 142, status: "OK",       price: 112.0,  supplier: "Brembo S.p.A",           icon: "🔘" },
  { id: 3, name: "Li-Ion Battery Cell Module",       sku: "#BT-998-22X",   category: "ELECTRICAL",        stock: 34,  status: "OK",       price: 1240.0, supplier: "Panasonic Energy Ltd",    icon: "🔋" },
  { id: 4, name: "Turbocharger Wastegate Actuator",  sku: "#TC-44512-WA",  category: "TRANSMISSION",      stock: 3,   status: "CRITICAL",  price: 455.0,  supplier: "Garrett Motion Inc",      icon: "🔩" },
  { id: 5, name: "Variable Valve Timing Solenoid",   sku: "#VV-11002-LX",  category: "ENGINE COMPONENTS", stock: 56,  status: "OK",       price: 88.25,  supplier: "Denso Corporation",       icon: "⚙️" },
];

const CATEGORY_OPTIONS = [
  "ENGINE COMPONENTS",
  "BRAKING SYSTEM",
  "ELECTRICAL",
  "TRANSMISSION",
  "SUSPENSION",
  "EXHAUST",
];

const CATEGORY_FILTERS = ["All Components", ...CATEGORY_OPTIONS.map(
  (c) => c.charAt(0) + c.slice(1).toLowerCase()
)];

const STOCK_FILTERS = ["All Stock", "Low Stock", "Critical", "Healthy"];

const ICON_MAP: Record<string, string> = {
  "ENGINE COMPONENTS": "⚙️",
  "BRAKING SYSTEM":    "🔘",
  "ELECTRICAL":        "🔋",
  "TRANSMISSION":      "🔩",
  "SUSPENSION":        "🔧",
  "EXHAUST":           "💨",
};

const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard" },
  { icon: "📦", label: "Inventory", active: true },
  { icon: "🏭", label: "Vendors" },
  { icon: "🛒", label: "Orders" },
  { icon: "🏠", label: "Warehouse" },
  { icon: "⚙️", label: "Settings" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  const status = deriveStatus(stock);
  const styles: Record<StockStatus, React.CSSProperties> = {
    LOW:      { background: "#fee2e2", color: "#dc2626" },
    CRITICAL: { background: "#fecaca", color: "#b91c1c" },
    OK:       { background: "#f3f4f6", color: "#374151" },
  };
  const labels: Record<StockStatus, string> = {
    LOW:      `${stock} UNITS / LOW`,
    CRITICAL: `${stock} UNITS / CRITICAL`,
    OK:       `${stock} UNITS`,
  };
  return (
    <span style={{ ...styles[status], padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
      {labels[status]}
    </span>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

const EMPTY_FORM: PartFormData = { name: "", sku: "", category: "ENGINE COMPONENTS", stock: "", price: "", supplier: "" };

function AddEditModal({
  part,
  onClose,
  onSave,
}: {
  part: Part | null;
  onClose: () => void;
  onSave: (data: PartFormData) => void;
}) {
  const [form, setForm] = useState<PartFormData>(
    part
      ? { name: part.name, sku: part.sku, category: part.category, stock: String(part.stock), price: String(part.price), supplier: part.supplier }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState<Partial<PartFormData>>({});

  const set = (key: keyof PartFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): boolean => {
    const e: Partial<PartFormData> = {};
    if (!form.name.trim())                                    e.name     = "Part name is required";
    if (!form.sku.trim())                                     e.sku      = "SKU is required";
    if (!form.stock || isNaN(+form.stock) || +form.stock < 0) e.stock   = "Valid stock quantity required";
    if (!form.price || isNaN(+form.price) || +form.price <= 0) e.price  = "Valid price required";
    if (!form.supplier.trim())                                e.supplier = "Supplier is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb",
    borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
  const errStyle: React.CSSProperties = { fontSize: 11, color: "#dc2626", marginTop: 4 };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "#6b7280", display: "block",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{part ? "Edit Part" : "Add New Part"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Name */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Part Name *</label>
            <input value={form.name} onChange={set("name")} style={{ ...inputStyle, borderColor: errors.name ? "#dc2626" : "#e5e7eb" }} placeholder="e.g. High-Performance Fuel Injector" />
            {errors.name && <p style={errStyle}>{errors.name}</p>}
          </div>
          {/* SKU */}
          <div>
            <label style={labelStyle}>SKU / Code *</label>
            <input value={form.sku} onChange={set("sku")} style={{ ...inputStyle, borderColor: errors.sku ? "#dc2626" : "#e5e7eb" }} placeholder="#FI-88291-LX" />
            {errors.sku && <p style={errStyle}>{errors.sku}</p>}
          </div>
          {/* Category */}
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={set("category")} style={{ ...inputStyle, background: "#fff" }}>
              {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Stock */}
          <div>
            <label style={labelStyle}>Stock Quantity *</label>
            <input type="number" min={0} value={form.stock} onChange={set("stock")} style={{ ...inputStyle, borderColor: errors.stock ? "#dc2626" : "#e5e7eb" }} placeholder="0" />
            {errors.stock && <p style={errStyle}>{errors.stock}</p>}
          </div>
          {/* Price */}
          <div>
            <label style={labelStyle}>Unit Price ($) *</label>
            <input type="number" min={0} step="0.01" value={form.price} onChange={set("price")} style={{ ...inputStyle, borderColor: errors.price ? "#dc2626" : "#e5e7eb" }} placeholder="0.00" />
            {errors.price && <p style={errStyle}>{errors.price}</p>}
          </div>
          {/* Supplier */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Supplier *</label>
            <input value={form.supplier} onChange={set("supplier")} style={{ ...inputStyle, borderColor: errors.supplier ? "#dc2626" : "#e5e7eb" }} placeholder="e.g. Bosch Automotive GmbH" />
            {errors.supplier && <p style={errStyle}>{errors.supplier}</p>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 24px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: "10px 24px", background: "#111", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            {part ? "Save Changes" : "Add Part"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ part, onClose, onConfirm }: { part: Part; onClose: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>🗑️</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Delete Part?</h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>
          Are you sure you want to delete <strong>{part.name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onClose}    style={{ padding: "10px 28px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Cancel</button>
          <button onClick={onConfirm}  style={{ padding: "10px 28px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PartsManagement() {
  const [parts, setParts]           = useState<Part[]>(INITIAL_PARTS);
  const [search, setSearch]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Components");
  const [stockFilter, setStockFilter]       = useState("All Stock");
  const [modal, setModal]           = useState<ModalState>(null);
  const [menuOpen, setMenuOpen]     = useState<number | null>(null);

  // ── Derived filtered list ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return parts.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);

      const matchCat =
        categoryFilter === "All Components" ||
        p.category === categoryFilter.toUpperCase();

      const status = deriveStatus(p.stock);
      const matchStatus =
        stockFilter === "All Stock" ||
        (stockFilter === "Low Stock" && status === "LOW") ||
        (stockFilter === "Critical"  && status === "CRITICAL") ||
        (stockFilter === "Healthy"   && status === "OK");

      return matchSearch && matchCat && matchStatus;
    });
  }, [parts, search, categoryFilter, stockFilter]);

  // ── Stat helpers ──────────────────────────────────────────────────────────
  const totalStock   = useMemo(() => parts.reduce((s, p) => s + p.stock, 0), [parts]);
  const lowAlerts    = useMemo(() => parts.filter((p) => deriveStatus(p.stock) !== "OK").length, [parts]);
  const inventoryVal = useMemo(() => parts.reduce((s, p) => s + p.stock * p.price, 0), [parts]);

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleAdd = (data: PartFormData) => {
    const newPart: Part = {
      id:       ++nextId,
      name:     data.name.trim(),
      sku:      data.sku.trim().startsWith("#") ? data.sku.trim() : `#${data.sku.trim()}`,
      category: data.category,
      stock:    Number(data.stock),
      status:   deriveStatus(Number(data.stock)),
      price:    Number(data.price),
      supplier: data.supplier.trim(),
      icon:     ICON_MAP[data.category] ?? "⚙️",
    };
    setParts((prev) => [newPart, ...prev]);
    setModal(null);
  };

  const handleEdit = (data: PartFormData) => {
    if (modal === null || modal === "add" || !("edit" in modal)) return;
    const id = modal.edit.id;
    setParts((prev) =>
      prev.map((p) =>
        p.id !== id ? p : {
          ...p,
          name:     data.name.trim(),
          sku:      data.sku.trim().startsWith("#") ? data.sku.trim() : `#${data.sku.trim()}`,
          category: data.category,
          stock:    Number(data.stock),
          status:   deriveStatus(Number(data.stock)),
          price:    Number(data.price),
          supplier: data.supplier.trim(),
          icon:     ICON_MAP[data.category] ?? p.icon,
        }
      )
    );
    setModal(null);
  };

  const handleDelete = () => {
    if (modal === null || modal === "add" || !("delete" in modal)) return;
    const id = modal.delete.id;
    setParts((prev) => prev.filter((p) => p.id !== id));
    setModal(null);
  };

  const openEdit   = (part: Part) => { setModal({ edit: part });   setMenuOpen(null); };
  const openDelete = (part: Part) => { setModal({ delete: part }); setMenuOpen(null); };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif", background: "#f9fafb", color: "#111" }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 220, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "0 20px 24px" }}>
          <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.5px" }}>Precision Engine</div>
          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em", marginTop: 2 }}>WAREHOUSE ADMIN</div>
        </div>
        {NAV_ITEMS.map(({ icon, label, active }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 20px", background: active ? "#f3f4f6" : "transparent", fontWeight: active ? 700 : 500, fontSize: 13, cursor: "pointer", color: active ? "#111" : "#6b7280" }}>
            <span>{icon}</span> {label.toUpperCase()}
          </div>
        ))}
        <div style={{ marginTop: "auto", padding: 20 }}>
          <button onClick={() => setModal("add")} style={{ width: "100%", padding: 12, background: "#111", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            + ADD NEW PART
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", height: 60, display: "flex", alignItems: "center", gap: 24, flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, Part name..."
              style={{ width: "100%", maxWidth: 420, paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>
          {["Analytics", "Reports", "Logs"].map((t) => (
            <span key={t} style={{ fontSize: 13, fontWeight: t === "Reports" ? 700 : 500, color: t === "Reports" ? "#111" : "#6b7280", cursor: "pointer", borderBottom: t === "Reports" ? "2px solid #111" : "none", paddingBottom: 2 }}>{t}</span>
          ))}
          <span style={{ fontSize: 18, cursor: "pointer" }}>🔔</span>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>WA</div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>

          {/* Page Title + Filters */}
          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6 }}>WAREHOUSE 04 – BERLIN DISTRICT</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: "-1px" }}>Inventory Management</h1>
            <div style={{ display: "flex", gap: 12 }}>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: "8px 16px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", background: "#fff" }}>
                {CATEGORY_FILTERS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
                style={{ padding: "8px 16px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", background: "#fff" }}>
                {STOCK_FILTERS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Stat Cards — all computed from live data */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", marginBottom: 8 }}>TOTAL COMPONENTS</div>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-1px", marginBottom: 8 }}>{totalStock.toLocaleString()}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>{parts.length} unique part types</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", marginBottom: 8 }}>LOW STOCK ALERTS</div>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-1px", marginBottom: 8 }}>{lowAlerts}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: lowAlerts > 0 ? "#dc2626" : "#16a34a" }}>
                {lowAlerts > 0 ? "⚠ REQUIRES REORDER" : "✓ ALL STOCK OK"}
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", marginBottom: 8 }}>INVENTORY VALUE</div>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-1px", marginBottom: 8 }}>
                ${inventoryVal >= 1_000_000 ? (inventoryVal / 1_000_000).toFixed(1) + "M" : inventoryVal.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ASSET VALUATION</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", marginBottom: 8 }}>WAREHOUSE CAPACITY</div>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-1px", marginBottom: 8 }}>84%</div>
              <div style={{ height: 6, background: "#f3f4f6", borderRadius: 999, overflow: "hidden", marginTop: 8 }}>
                <div style={{ width: "84%", height: "100%", background: "#111", borderRadius: 999 }} />
              </div>
            </div>
          </div>

          {/* Parts Table */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                No parts match your current filters.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                      {["PART DETAIL", "SKU/CODE", "CATEGORY", "STOCK LEVEL", "UNIT PRICE", "SUPPLIER", ""].map((h) => (
                        <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((part) => (
                      <tr key={part.id} style={{ borderBottom: "1px solid #f9fafb" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 40, height: 40, background: "#f3f4f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{part.icon}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{part.name}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{part.sku.replace("#", "")}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px", fontSize: 13, color: "#6b7280", fontFamily: "monospace", whiteSpace: "nowrap" }}>{part.sku}</td>
                        <td style={{ padding: "16px 20px", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{part.category}</td>
                        <td style={{ padding: "16px 20px" }}><StockBadge stock={part.stock} /></td>
                        <td style={{ padding: "16px 20px", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>${part.price.toFixed(2)}</td>
                        <td style={{ padding: "16px 20px", fontSize: 13, color: "#374151" }}>{part.supplier}</td>
                        <td style={{ padding: "16px 20px", position: "relative" }}>
                          <button
                            onClick={() => setMenuOpen(menuOpen === part.id ? null : part.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6b7280", padding: "4px 8px", borderRadius: 6 }}
                          >⋮</button>
                          {menuOpen === part.id && (
                            <div style={{ position: "absolute", right: 16, top: "100%", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, minWidth: 140, overflow: "hidden" }}>
                              <div
                                onClick={() => openEdit(part)}
                                style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", fontWeight: 500 }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f9fafb")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                              >✏️ Edit Part</div>
                              <div
                                onClick={() => openDelete(part)}
                                style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", fontWeight: 500, color: "#dc2626" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#fee2e2")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                              >🗑️ Delete Part</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Footer — accurate count */}
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                SHOWING {filtered.length} OF {parts.length} PARTS
              </span>
            </div>
          </div>

          {/* Bottom Panels */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, flexWrap: "wrap" }}>
            <div style={{ background: "#111", borderRadius: 16, padding: "32px 40px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 0 }}>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Optimize Supply Chain</h3>
                <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.6, marginBottom: 20, maxWidth: 360 }}>Our automated reorder system has identified 8 vendors with faster delivery times for your critical components.</p>
                <button style={{ padding: "12px 24px", background: "#fff", color: "#111", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>VIEW SUGGESTIONS</button>
              </div>
              <div style={{ fontSize: 64, opacity: 0.2 }}>🚀</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24, minWidth: 260 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", marginBottom: 16 }}>⏱ RECENT ACTIVITY</div>
              {[
                { dot: "#16a34a", title: "Bulk Order Received", sub: "#FI-88291-LX (+200 units)" },
                { dot: "#dc2626", title: "Price Increase Alert", sub: "Transmission parts up 4.2%" },
              ].map((a) => (
                <div key={a.title} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.dot, marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{a.sub}</div>
                  </div>
                </div>
              ))}
              <button style={{ fontSize: 12, fontWeight: 700, color: "#111", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 8 }}>VIEW AUDIT LOG →</button>
            </div>
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      {modal === "add" && (
        <AddEditModal part={null} onClose={() => setModal(null)} onSave={handleAdd} />
      )}
      {modal !== null && modal !== "add" && "edit" in modal && (
        <AddEditModal part={modal.edit} onClose={() => setModal(null)} onSave={handleEdit} />
      )}
      {modal !== null && modal !== "add" && "delete" in modal && (
        <DeleteModal part={modal.delete} onClose={() => setModal(null)} onConfirm={handleDelete} />
      )}

      {/* Click-away to close dropdown */}
      {menuOpen !== null && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
}