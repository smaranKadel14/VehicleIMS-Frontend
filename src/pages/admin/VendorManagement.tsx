import vendorService from "../../services/vendorService";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  Zap, 
  TrendingUp,
  AlertCircle,
  Users,
  ShieldCheck,
  FileText
} from 'lucide-react';
import authService from "../../services/authService";
import { Sidebar } from "../../components/layout/Sidebar";
import { Topbar } from "../../components/layout/Topbar";
import { AdminStatCard } from "../../components/ui/AdminStatCard";

interface Vendor {
  id:            number;
  name:          string;
  initials:      string;
  vendorId:      string;
  contactPerson: string;
  email:         string;
  phone:         string;
  address:       string;
}

interface VendorFormData {
  name:          string;
  contactPerson: string;
  email:         string;
  phone:         string;
  address:       string;
}

type ModalState = null | "add" | { edit: Vendor } | { delete: Vendor };

function makeInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin-dashboard" },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: Users, label: "Vendors", active: true, path: "/vendors" },
  { icon: ShieldCheck, label: "Staff", path: "/staff-management" },
  { icon: FileText, label: "Purchases", path: "/purchases" },
];

const EMPTY_FORM: VendorFormData = {
  name: "", contactPerson: "", email: "", phone: "", address: "",
};

// Reusable UI components

// Vendor Modal (Add / Edit)
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
      ? { 
          name: vendor.name, 
          contactPerson: vendor.contactPerson, 
          email: vendor.email, 
          phone: vendor.phone, 
          address: vendor.address 
        }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState<Partial<VendorFormData>>({});

  const set = (key: keyof VendorFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): boolean => {
    const e: Partial<VendorFormData> = {};
    if (!form.name.trim()) e.name = "Vendor name is required";
    if (!form.contactPerson.trim()) e.contactPerson = "Contact person is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email address is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.address.trim()) e.address = "Business address is required";
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
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{vendor ? "Edit Vendor Details" : "Register New Vendor"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Name */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Vendor Name *</label>
            <input value={form.name} onChange={set("name")} style={{ ...inputStyle, borderColor: errors.name ? "#dc2626" : "#e5e7eb" }} placeholder="e.g. Axel & Co. Logistics" />
            {errors.name && <p style={errStyle}>{errors.name}</p>}
          </div>
          {/* Contact Person */}
          <div>
            <label style={labelStyle}>Contact Person *</label>
            <input value={form.contactPerson} onChange={set("contactPerson")} style={{ ...inputStyle, borderColor: errors.contactPerson ? "#dc2626" : "#e5e7eb" }} placeholder="e.g. John Doe" />
            {errors.contactPerson && <p style={errStyle}>{errors.contactPerson}</p>}
          </div>
          {/* Phone */}
          <div>
            <label style={labelStyle}>Phone Number *</label>
            <input value={form.phone} onChange={set("phone")} style={{ ...inputStyle, borderColor: errors.phone ? "#dc2626" : "#e5e7eb" }} placeholder="e.g. +977-9812345678" />
            {errors.phone && <p style={errStyle}>{errors.phone}</p>}
          </div>
          {/* Email */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Email Address *</label>
            <input type="email" value={form.email} onChange={set("email")} style={{ ...inputStyle, borderColor: errors.email ? "#dc2626" : "#e5e7eb" }} placeholder="contact@vendor.com" />
            {errors.email && <p style={errStyle}>{errors.email}</p>}
          </div>
          {/* Address */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Business Address *</label>
            <textarea rows={2} value={form.address} onChange={set("address")} style={{ ...inputStyle, borderColor: errors.address ? "#dc2626" : "#e5e7eb", resize: "none" }} placeholder="e.g. Baneshwor, Kathmandu, Nepal" />
            {errors.address && <p style={errStyle}>{errors.address}</p>}
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

// Delete Confirmation Modal
function DeleteModal({ vendor, onClose, onConfirm }: { vendor: Vendor; onClose: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#dc2626" }}>
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Remove Vendor?</h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>
          Are you sure you want to remove <strong>{vendor.name}</strong>? This will terminate the supply partnership inside your database.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onClose}    style={{ padding: "10px 28px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Cancel</button>
          <button onClick={onConfirm}  style={{ padding: "10px 28px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Remove</button>
        </div>
      </div>
    </div>
  );
}

// Main VendorManagement Page Component
export default function VendorManagement() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const fetchVendors = async () => {
    try {
      const data = await vendorService.getAll();
      const mapped: Vendor[] = data.map(v => ({
        id: v.id,
        name: v.name,
        initials: makeInitials(v.name),
        vendorId: `VND-${1000 + v.id}`,
        contactPerson: v.contactPerson || "No Contact",
        email: v.email || "No Email",
        phone: v.phone || "No Phone",
        address: v.address || "No Address"
      }));
      setVendors(mapped);
    } catch (err) {
      console.error("Failed to load vendors:", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVendors();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Live filtered list computed from live search
  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.contactPerson.toLowerCase().includes(q) ||
        v.phone.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q) ||
        v.vendorId.toLowerCase().includes(q)
      );
    });
  }, [vendors, search]);

  const activeContactsCount = useMemo(() => {
    return vendors.filter(v => v.email && v.phone && v.email !== "No Email" && v.phone !== "No Phone").length;
  }, [vendors]);

  const handleAdd = async (data: VendorFormData) => {
    try {
      await vendorService.create({
        name: data.name.trim(),
        contactPerson: data.contactPerson.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        address: data.address.trim()
      });
      await fetchVendors();
      setModal(null);
    } catch (err) {
      console.error("Error creating vendor:", err);
    }
  };

  const handleEdit = async (data: VendorFormData) => {
    if (modal === null || modal === "add" || !("edit" in modal)) return;
    const id = modal.edit.id;
    try {
      await vendorService.update(id, {
        name: data.name.trim(),
        contactPerson: data.contactPerson.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        address: data.address.trim()
      });
      await fetchVendors();
      setModal(null);
    } catch (err) {
      console.error("Error updating vendor:", err);
    }
  };

  const handleDelete = async () => {
    if (modal === null || modal === "add" || !("delete" in modal)) return;
    const id = modal.delete.id;
    try {
      await vendorService.delete(id);
      await fetchVendors();
      setModal(null);
    } catch (err) {
      console.error("Error deleting vendor:", err);
    }
  };

  const openEdit   = (vendor: Vendor) => { setModal({ edit: vendor });   setMenuOpen(null); };
  const openDelete = (vendor: Vendor) => { setModal({ delete: vendor }); setMenuOpen(null); };

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex text-primary font-body overflow-hidden">
      
      <Sidebar
        logoTitle="Enginecore"
        logoSubtitle="V-Series Portal"
        logoIcon={Zap}
        items={NAV_ITEMS.map((item) => ({
          icon: item.icon,
          label: item.label,
          active: item.active || false,
          onClick: () => { if (item.path !== "#") navigate(item.path); }
        }))}
        actionButton={{
          label: "Register Vendor",
          onClick: () => setModal("add")
        }}
        footerItems={[
          { icon: Settings, label: "Settings", onClick: () => {} }
        ]}
        handleLogout={handleLogout}
      />

      {/* Main Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        <Topbar
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search vendor name, email, contact person, city..."
          userName={user?.userName || "Admin"}
          userRole={user?.roles?.[0] || "Administrator"}
        />

        <main style={{ flex: 1, overflowY: "auto", padding: 32, position: "relative" }}>

          {/* Page Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: "-1px" }}>Vendor Directory</h1>
              <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6, marginBottom: 0 }}>Manage and monitor verified business-to-business supplier profiles inside the EF Core database.</p>
            </div>
            <button onClick={() => setModal("add")} style={{ padding: "12px 24px", background: "#111", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Register Vendor
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <AdminStatCard label="Total Suppliers" value={String(vendors.length)} trend="Active EF Core Records" icon={Users} />
            <AdminStatCard label="Active Contacts" value={String(activeContactsCount)} trend="Has Phone & Email Profiles" icon={ShieldCheck} />
            <AdminStatCard label="Database Sync" value="100.0%" trend="Connected to C# Web API" icon={TrendingUp} variant="black" />
          </div>

          {/* Table */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                No registered vendors match your filter keyword search.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                      {["VENDOR NAME", "CONTACT PERSON", "EMAIL ADDRESS", "PHONE NUMBER", "BUSINESS ADDRESS", ""].map((h) => (
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
                        <td style={{ padding: "16px 20px", fontSize: 13, color: "#374151", fontWeight: 700 }}>{vendor.contactPerson}</td>
                        <td style={{ padding: "16px 20px", fontSize: 13, color: "#6b7280" }}>{vendor.email}</td>
                        <td style={{ padding: "16px 20px", fontSize: 13, color: "#374151" }}>{vendor.phone}</td>
                        <td style={{ padding: "16px 20px", fontSize: 13, color: "#6b7280", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendor.address}</td>
                        <td style={{ padding: "16px 20px", position: "relative" }}>
                          <button onClick={() => setMenuOpen(menuOpen === vendor.id ? null : vendor.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6b7280", padding: "4px 8px", borderRadius: 6 }}>⋮</button>
                          {menuOpen === vendor.id && (
                            <div style={{ position: "absolute", right: 16, bottom: "100%", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, minWidth: 150, overflow: "hidden" }}>
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
            {/* Table Footer count */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                Displaying {filtered.length} of {vendors.length} vendors in database
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Dialog overlays */}
      {modal === "add" && (
        <VendorModal vendor={null} onClose={() => setModal(null)} onSave={handleAdd} />
      )}
      {modal !== null && modal !== "add" && "edit" in modal && (
        <VendorModal vendor={modal.edit} onClose={() => setModal(null)} onSave={handleEdit} />
      )}
      {modal !== null && modal !== "add" && "delete" in modal && (
        <DeleteModal vendor={modal.delete} onClose={() => setModal(null)} onConfirm={handleDelete} />
      )}

      {/* Dropdown Click-away catcher overlay */}
      {menuOpen !== null && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
}