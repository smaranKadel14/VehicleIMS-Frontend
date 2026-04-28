import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CustomerStatus = "Active" | "Inactive";
type SearchType     = "All" | "Name" | "Phone" | "Vehicle" | "ID";
type SortOption     = "Total Spend" | "Last Visit" | "Name" | "Vehicles";
type StatusFilter   = "All Active" | "All" | "Inactive";

interface Customer {
  id:            number;
  name:          string;
  phone:         string;
  initials:      string;
  vehicles:      number;
  revenue:       number;
  lastVisit:     string;
  status:        CustomerStatus;
  vehiclePlates: string[];
}

interface CustomerFormData {
  name:    string;
  phone:   string;
  status:  CustomerStatus;
  plate1:  string;
  plate2:  string;
}

type DrawerState  = Customer | null;
type ModalState   = null | "add" | { edit: Customer } | { delete: Customer };

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 1, name: "Jonathan Kalu",   phone: "+1 (555) 012-9934", initials: "JK", vehicles: 4,  revenue: 12450.0,  lastVisit: "Oct 12, 2023", status: "Active",   vehiclePlates: ["KAL-1234", "KAL-5678"] },
  { id: 2, name: "Sarah Richards",  phone: "+1 (555) 014-8821", initials: "SR", vehicles: 1,  revenue: 3200.5,   lastVisit: "Nov 02, 2023", status: "Active",   vehiclePlates: ["RIC-4411"] },
  { id: 3, name: "Apex Motors Ltd.",phone: "+1 (555) 019-2231", initials: "AM", vehicles: 12, revenue: 45900.0,  lastVisit: "Oct 29, 2023", status: "Active",   vehiclePlates: ["APX-0010", "APX-0022"] },
  { id: 4, name: "Marcus Peterson", phone: "+1 (555) 011-0099", initials: "MP", vehicles: 2,  revenue: 950.0,    lastVisit: "Nov 05, 2023", status: "Active",   vehiclePlates: ["PET-7766"] },
  { id: 5, name: "Diana Osei",      phone: "+1 (555) 013-4420", initials: "DO", vehicles: 3,  revenue: 7820.0,   lastVisit: "Sep 18, 2023", status: "Inactive", vehiclePlates: ["OSE-3391"] },
  { id: 6, name: "Robert Finch",    phone: "+1 (555) 016-2200", initials: "RF", vehicles: 1,  revenue: 1540.75,  lastVisit: "Oct 01, 2023", status: "Active",   vehiclePlates: ["FIN-8820"] },
];

const SORT_OPTIONS: SortOption[]   = ["Total Spend", "Last Visit", "Name", "Vehicles"];
const STATUS_OPTIONS: StatusFilter[]= ["All Active", "All", "Inactive"];
const SEARCH_TYPES: SearchType[]   = ["All", "Name", "Phone", "Vehicle", "ID"];

let nextCustomerId = 300;

function makeInitials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard" },
  { icon: "📦", label: "Inventory" },
  { icon: "🔧", label: "Work Orders" },
  { icon: "🚚", label: "Logistics" },
  { icon: "👥", label: "Customers", active: true },
  { icon: "📊", label: "Analytics" },
];

const EMPTY_FORM: CustomerFormData = { name: "", phone: "", status: "Active", plate1: "", plate2: "" };

// ─── Add / Edit Customer Modal ────────────────────────────────────────────────

function CustomerModal({
  customer,
  onClose,
  onSave,
}: {
  customer: Customer | null;
  onClose:  () => void;
  onSave:   (data: CustomerFormData) => void;
}) {
  const [form, setForm] = useState<CustomerFormData>(
    customer
      ? {
          name:   customer.name,
          phone:  customer.phone,
          status: customer.status,
          plate1: customer.vehiclePlates[0] ?? "",
          plate2: customer.vehiclePlates[1] ?? "",
        }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  const set = (key: keyof CustomerFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): boolean => {
    const e: Partial<CustomerFormData> = {};
    if (!form.name.trim())  e.name  = "Customer name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
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
  const errStyle:   React.CSSProperties = { fontSize: 11, color: "#dc2626", marginTop: 4 };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "#6b7280", display: "block",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{customer ? "Edit Customer" : "Add New Customer"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Name */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Full Name / Company *</label>
            <input value={form.name} onChange={set("name")} style={{ ...inputStyle, borderColor: errors.name ? "#dc2626" : "#e5e7eb" }} placeholder="e.g. Jonathan Kalu" />
            {errors.name && <p style={errStyle}>{errors.name}</p>}
          </div>
          {/* Phone */}
          <div>
            <label style={labelStyle}>Phone Number *</label>
            <input value={form.phone} onChange={set("phone")} style={{ ...inputStyle, borderColor: errors.phone ? "#dc2626" : "#e5e7eb" }} placeholder="+1 (555) 000-0000" />
            {errors.phone && <p style={errStyle}>{errors.phone}</p>}
          </div>
          {/* Status */}
          <div>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={set("status")} style={{ ...inputStyle, background: "#fff" }}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          {/* Vehicle plates */}
          <div>
            <label style={labelStyle}>Vehicle Plate 1</label>
            <input value={form.plate1} onChange={set("plate1")} style={inputStyle} placeholder="e.g. KAL-1234" />
          </div>
          <div>
            <label style={labelStyle}>Vehicle Plate 2 (optional)</label>
            <input value={form.plate2} onChange={set("plate2")} style={inputStyle} placeholder="e.g. KAL-5678" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 24px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: "10px 24px", background: "#111", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            {customer ? "Save Changes" : "Add Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ customer, onClose, onConfirm }: { customer: Customer; onClose: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>🗑️</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Remove Customer?</h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>
          Are you sure you want to remove <strong>{customer.name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onClose}    style={{ padding: "10px 28px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Cancel</button>
          <button onClick={onConfirm}  style={{ padding: "10px 28px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Remove</button>
        </div>
      </div>
    </div>
  );
}

// ─── Customer Detail Drawer ───────────────────────────────────────────────────

function CustomerDrawer({ customer, onClose, onEdit, onDelete }: { customer: Customer; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 200 }} onClick={onClose} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 360, background: "#fff", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", zIndex: 300, padding: 28, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>Customer Details</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>

        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ width: 56, height: 56, background: "#111", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>{customer.initials}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{customer.name}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>{customer.phone}</div>
            <span style={{ background: customer.status === "Active" ? "#dcfce7" : "#f3f4f6", color: customer.status === "Active" ? "#16a34a" : "#9ca3af", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "inline-block", marginTop: 6 }}>
              {customer.status}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: "TOTAL REVENUE", value: `$${customer.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
            { label: "VEHICLES",      value: String(customer.vehicles) },
            { label: "LAST VISIT",    value: customer.lastVisit },
            { label: "CUSTOMER ID",   value: `#CUS-${String(customer.id).padStart(4, "0")}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#f9fafb", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Vehicle Plates */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", marginBottom: 10 }}>REGISTERED VEHICLES</div>
          {customer.vehiclePlates.length === 0 && (
            <p style={{ fontSize: 13, color: "#9ca3af" }}>No vehicles registered.</p>
          )}
          {customer.vehiclePlates.map((plate) => (
            <div key={plate} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#f9fafb", borderRadius: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>🚗</span>
              <span style={{ fontWeight: 600, fontSize: 13, fontFamily: "monospace" }}>{plate}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button style={{ flex: 1, padding: 11, border: "1.5px solid #e5e7eb", borderRadius: 10, background: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>View History</button>
          <button style={{ flex: 1, padding: 11, background: "#111", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>New Sale</button>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
            style={{ flex: 1, padding: 11, border: "1.5px solid #e5e7eb", borderRadius: 10, background: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✏️ Edit</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ flex: 1, padding: 11, background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>🗑️ Remove</button>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerSearch() {
  const [customers, setCustomers]         = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [search, setSearch]               = useState("");
  const [searchType, setSearchType]       = useState<SearchType>("All");
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>("All Active");
  const [sortBy, setSortBy]               = useState<SortOption>("Total Spend");
  const [drawer, setDrawer]               = useState<DrawerState>(null);
  const [modal, setModal]                 = useState<ModalState>(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return customers
      .filter((c) => {
        const matchStatus =
          statusFilter === "All" ||
          (statusFilter === "All Active" && c.status === "Active") ||
          (statusFilter === "Inactive"   && c.status === "Inactive");

        if (!matchStatus) return false;

        const q = search.toLowerCase().trim();
        if (!q) return true;

        return (
          ((searchType === "All" || searchType === "Name")    && c.name.toLowerCase().includes(q))  ||
          ((searchType === "All" || searchType === "Phone")   && c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, ""))) ||
          ((searchType === "All" || searchType === "Vehicle") && c.vehiclePlates.some((p) => p.toLowerCase().includes(q))) ||
          ((searchType === "All" || searchType === "ID")      && String(c.id).includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === "Total Spend") return b.revenue  - a.revenue;
        if (sortBy === "Vehicles")    return b.vehicles - a.vehicles;
        if (sortBy === "Name")        return a.name.localeCompare(b.name);
        return 0;
      });
  }, [customers, search, searchType, statusFilter, sortBy]);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleAdd = (data: CustomerFormData) => {
    const plates = [data.plate1.trim(), data.plate2.trim()].filter(Boolean);
    const newCustomer: Customer = {
      id:            ++nextCustomerId,
      name:          data.name.trim(),
      phone:         data.phone.trim(),
      initials:      makeInitials(data.name),
      vehicles:      plates.length,
      revenue:       0,
      lastVisit:     new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status:        data.status,
      vehiclePlates: plates,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    setModal(null);
  };

  const handleEdit = (data: CustomerFormData) => {
    if (modal === null || modal === "add" || !("edit" in modal)) return;
    const id = modal.edit.id;
    const plates = [data.plate1.trim(), data.plate2.trim()].filter(Boolean);
    setCustomers((prev) =>
      prev.map((c) =>
        c.id !== id ? c : {
          ...c,
          name:          data.name.trim(),
          phone:         data.phone.trim(),
          initials:      makeInitials(data.name),
          vehicles:      plates.length,
          status:        data.status,
          vehiclePlates: plates,
        }
      )
    );
    // Update drawer if editing the currently-viewed customer
    setDrawer((d) => d && d.id === id ? { ...d, name: data.name.trim(), phone: data.phone.trim(), initials: makeInitials(data.name), vehicles: plates.length, status: data.status, vehiclePlates: plates } : d);
    setModal(null);
  };

  const handleDelete = () => {
    if (modal === null || modal === "add" || !("delete" in modal)) return;
    const id = modal.delete.id;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (drawer?.id === id) setDrawer(null);
    setModal(null);
  };

  const openEditFor   = (customer: Customer) => { setModal({ edit: customer });   setDrawer(null); };
  const openDeleteFor = (customer: Customer) => { setModal({ delete: customer }); setDrawer(null); };

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

        {/* Nav Items */}
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

        {/* New Customer Request button */}
        <div style={{ padding: "0 16px 16px" }}>
          <button
            onClick={() => setModal("add")}
            style={{ width: "100%", padding: "11px 0", background: "#2a2a2a", color: "#fff", border: "1px solid #3a3a3a", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <span style={{ fontSize: 16 }}>+</span> New Customer
          </button>
        </div>

        {/* Bottom: Settings + Sign Out */}
        <div style={{ borderTop: "1px solid #2a2a2a", padding: "12px 0" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", color: "#9ca3af", fontSize: 13.5, cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
          >
            <span style={{ fontSize: 15 }}>⚙️</span> Settings
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", color: "#9ca3af", fontSize: 13.5, cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
          >
            <span style={{ fontSize: 15 }}>↪</span> Sign Out
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", height: 60, display: "flex", alignItems: "center", gap: 20, flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}>
          {/* Global search */}
          <div style={{ position: "relative", flex: 1, maxWidth: 380 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>🔍</span>
            <input
              placeholder="Search customer, vehicle, or VIN..."
              style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", color: "#374151" }}
            />
          </div>

          {/* Nav tabs */}
          {["Overview", "Performance", "Reports"].map((t) => (
            <span key={t} style={{ fontSize: 13, fontWeight: t === "Overview" ? 700 : 500, color: t === "Overview" ? "#111" : "#6b7280", cursor: "pointer", borderBottom: t === "Overview" ? "2px solid #111" : "none", paddingBottom: 2, whiteSpace: "nowrap" }}>{t}</span>
          ))}

          {/* Icons */}
          <span style={{ fontSize: 18, cursor: "pointer", color: "#374151" }}>🔔</span>
          <span style={{ fontSize: 18, cursor: "pointer", color: "#374151" }}>⚙️</span>

          {/* Staff identity */}
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
              <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: "-1.5px" }}>Customer Directory</h1>
              <p style={{ color: "#6b7280", fontSize: 14, margin: "6px 0 0" }}>Manage client relations and fleet data</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ padding: "11px 20px", border: "1.5px solid #e5e7eb", borderRadius: 10, background: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>↓ Export</button>
              <button onClick={() => setModal("add")} style={{ padding: "11px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>👤+ Add New Customer</button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {/* Search Type Chips */}
              <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                {SEARCH_TYPES.map((t) => (
                  <button key={t} onClick={() => setSearchType(t)}
                    style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid", borderColor: searchType === t ? "#111" : "#e5e7eb", background: searchType === t ? "#111" : "#fff", color: searchType === t ? "#fff" : "#6b7280", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search by ${searchType === "All" ? "name, phone, plate, or ID" : searchType.toLowerCase()}...`}
                  style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 10, paddingBottom: 10, border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              </div>

              {/* Status Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.06em" }}>STATUS</span>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  style={{ padding: "9px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#fff", fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
                  {STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Sort */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.06em" }}>SORT BY</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
                  style={{ padding: "9px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#fff", fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
                  {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    {["CUSTOMER DETAILS", "VEHICLES", "TOTAL REVENUE", "LAST VISIT", "ACTIONS"].map((h) => (
                      <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No customers match your search.</td>
                    </tr>
                  )}
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: "1px solid #f9fafb", cursor: "pointer", background: drawer?.id === c.id ? "#f9fafb" : "" }}
                      onClick={() => setDrawer(drawer?.id === c.id ? null : c)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = drawer?.id === c.id ? "#f9fafb" : "")}
                    >
                      <td style={{ padding: "18px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 42, height: 42, background: "#f3f4f6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{c.initials}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{c.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "18px 20px" }}>
                        <span style={{ background: "#f3f4f6", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                          {c.vehicles} {c.vehicles === 1 ? "UNIT" : "UNITS"}
                        </span>
                      </td>
                      <td style={{ padding: "18px 20px" }}>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>${c.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginTop: 2, letterSpacing: "0.04em" }}>LIFETIME VALUE</div>
                      </td>
                      <td style={{ padding: "18px 20px", fontSize: 14, color: "#374151" }}>{c.lastVisit}</td>
                      <td style={{ padding: "18px 20px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDrawer(c); }}
                            style={{ padding: "6px 14px", border: "1.5px solid #e5e7eb", borderRadius: 7, background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                          >View</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditFor(c); }}
                            style={{ padding: "6px 14px", background: "#111", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                          >Edit</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openDeleteFor(c); }}
                            style={{ padding: "6px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                          >Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer — accurate count */}
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.05em" }}>
                SHOWING {filtered.length} OF {customers.length} CUSTOMERS
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* ── Customer Detail Drawer ── */}
      {drawer && (
        <CustomerDrawer
          customer={drawer}
          onClose={() => setDrawer(null)}
          onEdit={() => openEditFor(drawer)}
          onDelete={() => openDeleteFor(drawer)}
        />
      )}

      {/* ── Modals ── */}
      {modal === "add" && (
        <CustomerModal customer={null} onClose={() => setModal(null)} onSave={handleAdd} />
      )}
      {modal !== null && modal !== "add" && "edit" in modal && (
        <CustomerModal customer={modal.edit} onClose={() => setModal(null)} onSave={handleEdit} />
      )}
      {modal !== null && modal !== "add" && "delete" in modal && (
        <DeleteModal customer={modal.delete} onClose={() => setModal(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
}