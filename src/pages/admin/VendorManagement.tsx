import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

// ─── Types ────────────────────────────────────────────────────────────────────

type VendorStatus = "ACTIVE" | "INACTIVE";
type FilterTab    = "All" | "Active" | "Inactive";

interface Vendor {
  id:       number;
  name:     string;
  initials: string;
  vendorId: string;
  contact:  string;
  email:    string;
  rating:   number;
  status:   VendorStatus;
  category: string;
}

interface VendorFormData {
  name:     string;
  contact:  string;
  email:    string;
  vendorId: string;
  category: string;
  status:   VendorStatus;
  rating:   string;
}

type ModalState = null | "add" | { edit: Vendor } | { delete: Vendor };

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_VENDORS: Vendor[] = [
  { id: 1, name: "Axel & Co. Logistics",    initials: "AX", vendorId: "VND-4822", contact: "Marcus Sterling", email: "m.sterling@axelco.de",    rating: 4.9, status: "ACTIVE",   category: "Logistics"    },
  { id: 2, name: "Nordic Transmission",     initials: "NT", vendorId: "VND-9901", contact: "Elena Varkas",    email: "evarkas@nordic.se",         rating: 4.7, status: "ACTIVE",   category: "Transmission" },
  { id: 3, name: "Peak Tech Parts",         initials: "PT", vendorId: "VND-2115", contact: "David Chen",      email: "dchen@peaktech.com",         rating: 3.2, status: "INACTIVE", category: "Electronics"  },
  { id: 4, name: "Rapid Systems",           initials: "RS", vendorId: "VND-6610", contact: "Sarah Millane",   email: "sarah@rapid-parts.uk",       rating: 4.5, status: "ACTIVE",   category: "General"      },
  { id: 5, name: "Industrial Drivetrain GmbH", initials: "ID", vendorId: "VND-3302", contact: "Stefan Müller", email: "s.mueller@id-gmbh.de",    rating: 4.8, status: "ACTIVE",   category: "Drivetrain"   },
];

const CATEGORIES = ["Logistics", "Transmission", "Electronics", "Drivetrain", "General", "Braking", "Electrical"];

let nextVendorId = 200;

function makeInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function makeVendorId(): string {
  return `VND-${Math.floor(1000 + Math.random() * 9000)}`;
}

const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard" },
  { icon: "📦", label: "Inventory" },
  { icon: "🏭", label: "Vendors", active: true },
  { icon: "🛒", label: "Orders" },
  { icon: "🏠", label: "Warehouse" },
  { icon: "⚙️", label: "Settings" },
];

const EMPTY_FORM: VendorFormData = {
  name: "", contact: "", email: "", vendorId: "", category: "General", status: "ACTIVE", rating: "5.0",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return <span style={{ fontSize: 13, fontWeight: 700 }}>★ {rating.toFixed(1)}</span>;
}

function StatusBadge({ status }: { status: VendorStatus }) {
  const active = status === "ACTIVE";
  return (
    <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: active ? "#111" : "#f3f4f6", color: active ? "#fff" : "#9ca3af", letterSpacing: "0.05em" }}>
      {status}
    </span>
  );
}

// ─── Vendor Modal (Add / Edit) ────────────────────────────────────────────────

function VendorModal({
  vendor,
  onClose,
  onSave,
}: {
  vendor: Vendor | null;
  onClose: () => void;
  onSave: (data: VendorFormData) => void;
}) {
  const [form, setForm] = useState<VendorFormData>(
    vendor
      ? { name: vendor.name, contact: vendor.contact, email: vendor.email, vendorId: vendor.vendorId, category: vendor.category, status: vendor.status, rating: String(vendor.rating) }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState<Partial<VendorFormData>>({});

  const set = (key: keyof VendorFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): boolean => {
    const e: Partial<VendorFormData> = {};
    if (!form.name.trim())    e.name    = "Vendor name is required";
    if (!form.contact.trim()) e.contact = "Contact person is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email address is required";
    if (!form.rating || isNaN(+form.rating) || +form.rating < 1 || +form.rating > 5)
      e.rating = "Rating must be between 1.0 and 5.0";
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
  const errStyle: React.CSSProperties  = { fontSize: 11, color: "#dc2626", marginTop: 4 };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "#6b7280", display: "block",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 540, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{vendor ? "Edit Vendor" : "Register Vendor"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Name */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Vendor Name *</label>
            <input value={form.name} onChange={set("name")} style={{ ...inputStyle, borderColor: errors.name ? "#dc2626" : "#e5e7eb" }} placeholder="e.g. Axel & Co. Logistics" />
            {errors.name && <p style={errStyle}>{errors.name}</p>}
          </div>
          {/* Contact */}
          <div>
            <label style={labelStyle}>Contact Person *</label>
            <input value={form.contact} onChange={set("contact")} style={{ ...inputStyle, borderColor: errors.contact ? "#dc2626" : "#e5e7eb" }} placeholder="Full name" />
            {errors.contact && <p style={errStyle}>{errors.contact}</p>}
          </div>
          {/* Vendor ID */}
          <div>
            <label style={labelStyle}>Vendor ID</label>
            <input value={form.vendorId} onChange={set("vendorId")} style={inputStyle} placeholder="Auto-generated if blank" />
          </div>
          {/* Email */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Email Address *</label>
            <input type="email" value={form.email} onChange={set("email")} style={{ ...inputStyle, borderColor: errors.email ? "#dc2626" : "#e5e7eb" }} placeholder="contact@vendor.com" />
            {errors.email && <p style={errStyle}>{errors.email}</p>}
          </div>
          {/* Category */}
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={set("category")} style={{ ...inputStyle, background: "#fff" }}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {/* Status */}
          <div>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={set("status")} style={{ ...inputStyle, background: "#fff" }}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          {/* Rating */}
          <div>
            <label style={labelStyle}>Rating (1.0 – 5.0)</label>
            <input type="number" min={1} max={5} step={0.1} value={form.rating} onChange={set("rating")}
              style={{ ...inputStyle, borderColor: errors.rating ? "#dc2626" : "#e5e7eb" }} placeholder="5.0" />
            {errors.rating && <p style={errStyle}>{errors.rating}</p>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 24px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: "10px 24px", background: "#111", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            {vendor ? "Save Changes" : "Register Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ vendor, onClose, onConfirm }: { vendor: Vendor; onClose: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>🗑️</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Remove Vendor?</h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>
          Are you sure you want to remove <strong>{vendor.name}</strong>? This will terminate the supply chain partnership.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onClose}    style={{ padding: "10px 28px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Cancel</button>
          <button onClick={onConfirm}  style={{ padding: "10px 28px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Remove</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VendorManagement() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [vendors, setVendors]       = useState<Vendor[]>(INITIAL_VENDORS);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  const [filter, setFilter]         = useState<FilterTab>("All");
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState<ModalState>(null);
  const [menuOpen, setMenuOpen]     = useState<number | null>(null);
  const [showInsights, setShowInsights] = useState(true);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const matchFilter =
        filter === "All" ||
        v.status === (filter.toUpperCase() as VendorStatus);
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.contact.toLowerCase().includes(q) ||
        v.vendorId.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [vendors, filter, search]);

  const activeCount = useMemo(() => vendors.filter((v) => v.status === "ACTIVE").length, [vendors]);
  const avgRating   = useMemo(() => {
    if (!vendors.length) return 0;
    return vendors.reduce((s, v) => s + v.rating, 0) / vendors.length;
  }, [vendors]);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleAdd = (data: VendorFormData) => {
    const newVendor: Vendor = {
      id:       ++nextVendorId,
      name:     data.name.trim(),
      initials: makeInitials(data.name),
      vendorId: data.vendorId.trim() || makeVendorId(),
      contact:  data.contact.trim(),
      email:    data.email.trim(),
      rating:   Math.min(5, Math.max(1, parseFloat(data.rating) || 5)),
      status:   data.status,
      category: data.category,
    };
    setVendors((prev) => [newVendor, ...prev]);
    setModal(null);
  };

  const handleEdit = (data: VendorFormData) => {
    if (modal === null || modal === "add" || !("edit" in modal)) return;
    const id = modal.edit.id;
    setVendors((prev) =>
      prev.map((v) =>
        v.id !== id ? v : {
          ...v,
          name:     data.name.trim(),
          initials: makeInitials(data.name),
          vendorId: data.vendorId.trim() || v.vendorId,
          contact:  data.contact.trim(),
          email:    data.email.trim(),
          rating:   Math.min(5, Math.max(1, parseFloat(data.rating) || v.rating)),
          status:   data.status,
          category: data.category,
        }
      )
    );
    setModal(null);
  };

  const handleDelete = () => {
    if (modal === null || modal === "add" || !("delete" in modal)) return;
    const id = modal.delete.id;
    setVendors((prev) => prev.filter((v) => v.id !== id));
    setModal(null);
  };

  const openEdit   = (vendor: Vendor) => { setModal({ edit: vendor });   setMenuOpen(null); };
  const openDelete = (vendor: Vendor) => { setModal({ delete: vendor }); setMenuOpen(null); };

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
        <div style={{ marginTop: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setModal("add")} style={{ width: "100%", padding: 12, background: "#111", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            + ADD NEW VENDOR
          </button>
          <button 
            onClick={handleLogout}
            style={{ width: "100%", padding: 12, background: "#fff", color: "#dc2626", border: "1px solid #e5e7eb", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", height: 60, display: "flex", alignItems: "center", gap: 24, flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors by name, email, ID..."
              style={{ width: "100%", maxWidth: 340, paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          {["Analytics", "Reports", "Logs"].map((t) => (
            <span key={t} style={{ fontSize: 13, fontWeight: t === "Reports" ? 700 : 500, color: t === "Reports" ? "#111" : "#6b7280", cursor: "pointer", borderBottom: t === "Reports" ? "2px solid #111" : "none", paddingBottom: 2 }}>{t}</span>
          ))}
          <span style={{ fontSize: 18, cursor: "pointer" }}>🔔</span>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
            {user?.userName ? user.userName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'WA'}
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: 32, position: "relative" }}>

          {/* Page Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: "-1px" }}>Vendor Directory</h1>
              <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6, marginBottom: 0 }}>Manage and monitor global supply chain partnerships.</p>
            </div>
            <button onClick={() => setModal("add")} style={{ padding: "12px 24px", background: "#111", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Register Vendor
            </button>
          </div>

          {/* Stat Cards — live data */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
            {[
              { label: "TOTAL VENDORS",  value: String(vendors.length) },
              { label: "ACTIVE VENDORS", value: String(activeCount) },
              { label: "AVG RATING",     value: `${avgRating.toFixed(1)} ★` },
              { label: "ON-TIME RATE",   value: "96.2%" },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", marginBottom: 10 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {(["All", "Active", "Inactive"] as FilterTab[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "7px 18px", borderRadius: 8, border: "1.5px solid", borderColor: filter === f ? "#111" : "#e5e7eb", background: filter === f ? "#111" : "#fff", color: filter === f ? "#fff" : "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {f}
              </button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af" }}>
              Displaying {filtered.length} of {vendors.length} vendors
            </span>
          </div>

          {/* Table */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                No vendors match your current filters.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                      {["VENDOR NAME", "CONTACT PERSON", "EMAIL", "RATING", "STATUS", ""].map((h) => (
                        <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((vendor) => (
                      <tr key={vendor.id} style={{ borderBottom: "1px solid #f9fafb" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 38, height: 38, background: "#f3f4f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{vendor.initials}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{vendor.name}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>ID: {vendor.vendorId}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px", fontSize: 13, color: "#374151" }}>{vendor.contact}</td>
                        <td style={{ padding: "16px 20px", fontSize: 13, color: "#6b7280" }}>{vendor.email}</td>
                        <td style={{ padding: "16px 20px" }}><StarRating rating={vendor.rating} /></td>
                        <td style={{ padding: "16px 20px" }}><StatusBadge status={vendor.status} /></td>
                        <td style={{ padding: "16px 20px", position: "relative" }}>
                          <button onClick={() => setMenuOpen(menuOpen === vendor.id ? null : vendor.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6b7280", padding: "4px 8px", borderRadius: 6 }}>⋮</button>
                          {menuOpen === vendor.id && (
                            <div style={{ position: "absolute", right: 16, top: "100%", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, minWidth: 150, overflow: "hidden" }}>
                              <div onClick={() => openEdit(vendor)}
                                style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", fontWeight: 500 }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f9fafb")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}>✏️ Edit Vendor</div>
                              <div onClick={() => openDelete(vendor)}
                                style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", fontWeight: 500, color: "#dc2626" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#fee2e2")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}>🗑️ Remove Vendor</div>
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
            <div style={{ padding: "16px 20px", borderTop: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                Showing {filtered.length} of {vendors.length} vendors
              </span>
            </div>
          </div>

          {/* Insights Panel */}
          {showInsights && (
            <div style={{ position: "fixed", bottom: 40, right: 40, background: "#111", color: "#fff", borderRadius: 16, padding: 24, width: 280, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", zIndex: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Vendor Performance Insights</span>
                <button onClick={() => setShowInsights(false)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 4 }}>QUARTERLY GROWTH</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#4ade80" }}>+12.4%</div>
                <div style={{ height: 6, background: "#333", borderRadius: 999, overflow: "hidden", marginTop: 8 }}>
                  <div style={{ width: "72%", height: "100%", background: "#4ade80", borderRadius: 999 }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 10 }}>UPCOMING RENEWALS (3)</div>
                {[{ name: "Nordic Transmission", days: "5d" }, { name: "Axel & Co. Logistics", days: "12d" }].map((r) => (
                  <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "#e5e7eb" }}>• {r.name}</span>
                    <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{r.days}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Modals ── */}
      {modal === "add" && (
        <VendorModal vendor={null} onClose={() => setModal(null)} onSave={handleAdd} />
      )}
      {modal !== null && modal !== "add" && "edit" in modal && (
        <VendorModal vendor={modal.edit} onClose={() => setModal(null)} onSave={handleEdit} />
      )}
      {modal !== null && modal !== "add" && "delete" in modal && (
        <DeleteModal vendor={modal.delete} onClose={() => setModal(null)} onConfirm={handleDelete} />
      )}

      {/* Click-away for dropdown */}
      {menuOpen !== null && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
}