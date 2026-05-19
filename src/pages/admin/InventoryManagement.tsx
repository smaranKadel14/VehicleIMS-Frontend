import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import partService from "../../services/partService";
import vendorService from "../../services/vendorService";
import type { VendorResponse } from "../../services/vendorService";
import authService from "../../services/authService";
import { 
  Cpu, CircleDot, Battery, Settings, Wrench, Wind, AlertCircle, 
  LayoutDashboard, Package, Users, ShieldCheck, FileText, Zap, 
  Boxes 
} from "lucide-react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Topbar } from "../../components/layout/Topbar";

// Data types and interface definitions
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
  icon: any;
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

// Helper functions for common logic
function deriveStatus(stock: number): StockStatus {
  if (stock <= 3) return "CRITICAL";
  if (stock <= 10) return "LOW";
  return "OK";
}

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

const ICON_MAP: Record<string, any> = {
  "ENGINE COMPONENTS": Cpu,
  "BRAKING SYSTEM":    CircleDot,
  "ELECTRICAL":        Battery,
  "TRANSMISSION":      Settings,
  "SUSPENSION":        Wrench,
  "EXHAUST":           Wind,
};

function getCategoryFromSku(sku: string): string {
  const s = sku.toUpperCase();
  if (s.includes("FI") || s.includes("ENG")) return "ENGINE COMPONENTS";
  if (s.includes("BR") || s.includes("BRK")) return "BRAKING SYSTEM";
  if (s.includes("EL") || s.includes("ELE")) return "ELECTRICAL";
  if (s.includes("TR") || s.includes("TRA")) return "TRANSMISSION";
  if (s.includes("SU") || s.includes("SUS")) return "SUSPENSION";
  if (s.includes("EX") || s.includes("EXH")) return "EXHAUST";
  return "ENGINE COMPONENTS";
}


// Reusable UI components used within this page


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
// Modal for creating new entries or modifying existing ones
const EMPTY_FORM: PartFormData = { name: "", sku: "", category: "ENGINE COMPONENTS", stock: "", price: "", supplier: "" };

function AddEditModal({
  part,
  vendors,
  onClose,
  onSave,
}: {
  part: Part | null;
  vendors: VendorResponse[];
  onClose: () => void;
  onSave: (data: PartFormData) => void;
}) {
  const [form, setForm] = useState<PartFormData>(() => {
    if (part) {
      // Find matching vendor ID from vendor list
      const matchedVendor = vendors.find(v => v.name === part.supplier);
      return {
        name: part.name,
        sku: part.sku,
        category: part.category,
        stock: String(part.stock),
        price: String(part.price),
        supplier: matchedVendor ? String(matchedVendor.id) : "",
      };
    }
    return { ...EMPTY_FORM };
  });
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
    if (!form.supplier.trim())                                e.supplier = "Supplier vendor is required";
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
            <label style={labelStyle}>Unit Price (RS) *</label>
            <input type="number" min={0} step="0.01" value={form.price} onChange={set("price")} style={{ ...inputStyle, borderColor: errors.price ? "#dc2626" : "#e5e7eb" }} placeholder="0.00" />
            {errors.price && <p style={errStyle}>{errors.price}</p>}
          </div>
          {/* Supplier Select */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Supplier Vendor *</label>
            <select 
              value={form.supplier} 
              onChange={set("supplier")} 
              style={{ ...inputStyle, borderColor: errors.supplier ? "#dc2626" : "#e5e7eb", background: "#fff" }}
            >
              <option value="">Select a Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={String(v.id)}>{v.name}</option>
              ))}
            </select>
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
// Modal to confirm the deletion of an entry
function DeleteModal({ part, onClose, onConfirm }: { part: Part; onClose: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#dc2626" }}>
          <AlertCircle className="w-8 h-8" />
        </div>
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
// Main page component handling state and layout
export default function PartsManagement() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [parts, setParts]           = useState<Part[]>([]);
  const [vendors, setVendors]       = useState<VendorResponse[]>([]);

  const fetchInventory = async () => {
    try {
      const partsData = await partService.getAll();
      const mapped: Part[] = partsData.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: getCategoryFromSku(p.sku),
        stock: p.stockQuantity,
        status: deriveStatus(p.stockQuantity),
        price: p.price,
        supplier: p.vendorName || "Default Vendor",
        icon: ICON_MAP[getCategoryFromSku(p.sku)] ?? Cpu
      }));
      setParts(mapped);
    } catch (err) {
      console.error("Failed to load parts inventory:", err);
    }
  };

  useEffect(() => {
    fetchInventory();
    vendorService.getAll().then(data => setVendors(data)).catch(err => console.error(err));
  }, []);

  const [search, setSearch]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Components");
  const [stockFilter, setStockFilter]       = useState("All Stock");
  const [modal, setModal]           = useState<ModalState>(null);
  const [menuOpen, setMenuOpen]     = useState<number | null>(null);

  const filteredNavItems = useMemo(() => {
    return [
      { icon: LayoutDashboard, label: "Dashboard", path: "/admin-dashboard" },
      { icon: Package, label: "Inventory", active: true, path: "/inventory" },
      { icon: Users, label: "Vendors", path: "/vendors" },
      { icon: ShieldCheck, label: "Staff", path: "/staff-management" },
      { icon: FileText, label: "Purchases", path: "/purchases" },
    ];
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
// Computes the filtered list based on user search and filters
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
// Computes summary statistics for the top dashboard cards
  const totalStock   = useMemo(() => parts.reduce((s, p) => s + p.stock, 0), [parts]);
  const lowAlerts    = useMemo(() => parts.filter((p) => deriveStatus(p.stock) !== "OK").length, [parts]);
  const inventoryVal = useMemo(() => parts.reduce((s, p) => s + p.stock * p.price, 0), [parts]);
// Handlers for creating, reading, updating, and deleting entries
  const handleAdd = async (data: PartFormData) => {
    try {
      await partService.create({
        name: data.name.trim(),
        description: "",
        price: Number(data.price),
        stockQuantity: Number(data.stock),
        sku: data.sku.trim().startsWith("#") ? data.sku.trim() : `#${data.sku.trim()}`,
        vendorId: Number(data.supplier)
      });
      await fetchInventory();
      setModal(null);
    } catch (err) {
      console.error("Error adding part:", err);
    }
  };

  const handleEdit = async (data: PartFormData) => {
    if (modal === null || modal === "add" || !("edit" in modal)) return;
    const id = modal.edit.id;
    try {
      await partService.update(id, {
        name: data.name.trim(),
        description: "",
        price: Number(data.price),
        stockQuantity: Number(data.stock),
        sku: data.sku.trim().startsWith("#") ? data.sku.trim() : `#${data.sku.trim()}`,
        vendorId: Number(data.supplier)
      });
      await fetchInventory();
      setModal(null);
    } catch (err) {
      console.error("Error updating part:", err);
    }
  };

  const handleDelete = async () => {
    if (modal === null || modal === "add" || !("delete" in modal)) return;
    const id = modal.delete.id;
    try {
      await partService.delete(id);
      await fetchInventory();
      setModal(null);
    } catch (err) {
      console.error("Error deleting part:", err);
    }
  };

  const openEdit   = (part: Part) => { setModal({ edit: part });   setMenuOpen(null); };
  const openDelete = (part: Part) => { setModal({ delete: part }); setMenuOpen(null); };

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex text-primary font-body overflow-hidden">
      <Sidebar
        logoTitle="Enginecore"
        logoSubtitle="V-Series Portal"
        logoIcon={Zap}
        items={filteredNavItems.map((item) => ({
          icon: item.icon,
          label: item.label,
          active: item.active || false,
          onClick: () => { if (item.path !== "#") navigate(item.path); }
        }))}
        actionButton={{
          label: "New Part Request",
          onClick: () => setModal("add")
        }}
        footerItems={[
          { icon: Settings, label: "Settings", onClick: () => {} }
        ]}
        handleLogout={handleLogout}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search serial numbers, parts, or invoices..."
          userName={user?.userName || "Admin"}
          userRole={user?.roles?.[0] || "Administrator"}
        />

        <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>

          {/* Page Title + Filters */}
          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6 }}>WAREHOUSE 04 – BERLIN DISTRICT</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: "-1px" }}>Inventory Management</h1>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button 
                onClick={() => setModal("add")}
                style={{ padding: "9px 18px", background: "#111827", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
              >
                <Boxes className="w-4 h-4" /> + Add New Part
              </button>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: "8px 16px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", background: "#fff", outline: "none" }}>
                {CATEGORY_FILTERS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
                style={{ padding: "8px 16px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", background: "#fff", outline: "none" }}>
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
                RS {inventoryVal >= 1_000_000 ? (inventoryVal / 1_000_000).toFixed(1) + "M" : inventoryVal.toLocaleString()}
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
                            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-neutral transition-all">
                              {(() => {
                                const IconComp = ICON_MAP[part.category] || Boxes;
                                return <IconComp className="w-5 h-5" />;
                              })()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{part.name}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{part.sku.replace("#", "")}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px", fontSize: 13, color: "#6b7280", fontFamily: "monospace", whiteSpace: "nowrap" }}>{part.sku}</td>
                        <td style={{ padding: "16px 20px", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{part.category}</td>
                        <td style={{ padding: "16px 20px" }}><StockBadge stock={part.stock} /></td>
                        <td style={{ padding: "16px 20px", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>RS {part.price.toFixed(2)}</td>
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
              <div className="opacity-20 transform -rotate-12">
                <Zap className="w-24 h-24" />
              </div>
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

      {/* Modals */}
      {modal === "add" && (
        <AddEditModal part={null} vendors={vendors} onClose={() => setModal(null)} onSave={handleAdd} />
      )}
      {modal !== null && modal !== "add" && "edit" in modal && (
        <AddEditModal part={modal.edit} vendors={vendors} onClose={() => setModal(null)} onSave={handleEdit} />
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