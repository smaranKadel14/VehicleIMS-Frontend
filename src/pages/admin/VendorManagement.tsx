import vendorService from "../../services/vendorService";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  Truck, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Clock, 
  Zap, 
  TrendingUp,
  AlertCircle,
  Users,
  ShieldCheck,
  FileText
} from 'lucide-react';
import authService from "../../services/authService";

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
  { icon: Wrench, label: "Work Orders", path: "#" },
  { icon: Truck, label: "Logistics", path: "#" },
];

const EMPTY_FORM: VendorFormData = {
  name: "", contactPerson: "", email: "", phone: "", address: "",
};

// Reusable UI components
const NavItem = ({ icon: Icon, label, active = false, delay = "", onClick }: { icon: ComponentType<{ className?: string }>, label: string, active?: boolean, delay?: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-150 ease-out group ${delay} ${active ? 'bg-neutral text-black font-black shadow-xl' : 'text-tertiary hover:text-neutral hover:bg-white/5'}`}
  >
    <Icon className={`w-5 h-5 transition-transform duration-150 ease-out ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="text-sm tracking-tight">{label}</span>
  </button>
);

const HeaderIcon = ({ icon: Icon, badge = false }: { icon: ComponentType<{ className?: string }>, badge?: boolean }) => (
  <button className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-secondary/10 hover:bg-primary hover:text-neutral transition-all group">
    <Icon className="w-5 h-5 group-active:scale-90 transition-transform" />
    {badge && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>}
  </button>
);

const AdminStatCard = ({ label, value, trend, icon: Icon, delay = "", variant = 'white' }: { label: string, value: string, trend: string, icon: ComponentType<{ className?: string }>, delay?: string, variant?: 'white' | 'gray' | 'black' }) => (
  <div className={`rounded-3xl p-6 transition-all duration-100 hover:duration-200 ease-out hover:shadow-xl hover:-translate-y-1 ${delay} flex flex-col justify-between min-h-[170px] cursor-default ${
    variant === 'black' ? 'bg-black text-neutral' : 
    variant === 'gray' ? 'bg-[#D4D4D4] text-primary' : 
    'bg-white shadow-sm border border-secondary/10'
  }`}>
    <div className="flex justify-between items-start">
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${variant === 'black' ? 'text-neutral/40' : 'text-tertiary'}`}>{label}</p>
      <Icon className={`w-5 h-5 ${variant === 'black' ? 'text-neutral/40' : 'text-tertiary'}`} />
    </div>
    <div className="mt-4">
      <p className="text-3xl font-heading font-extrabold tracking-tighter leading-none">{value}</p>
    </div>
    <div className={`mt-4 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase ${variant === 'black' ? 'text-neutral/30' : 'text-tertiary opacity-80'}`}>
       {trend.toLowerCase().includes('critical') ? <Clock className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
       {trend}
    </div>
  </div>
);

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
      {/* Sidebar */}
      <aside className="w-[280px] h-screen bg-[#1A1A1A] text-neutral flex flex-col shrink-0 z-20 shadow-2xl overflow-hidden sticky top-0">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-110 transition-transform cursor-pointer">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
               <Zap className="w-4 h-4 text-neutral fill-neutral" />
            </div>
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl leading-tight uppercase tracking-tighter">Enginecore</h1>
            <p className="text-[10px] text-tertiary uppercase tracking-[0.3em] font-bold opacity-70">V-Series Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-6 py-8 space-y-3">
          {NAV_ITEMS.map((item) => (
            <NavItem 
              key={item.label} 
              icon={item.icon} 
              label={item.label} 
              active={item.active} 
              onClick={() => item.path !== "#" && navigate(item.path)} 
            />
          ))}
        </nav>

        <div className="px-6 py-8 border-t border-white/5 space-y-6">
          <button 
            onClick={() => setModal("add")}
            className="w-full bg-neutral text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:shadow-[0_10px_20px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all active:scale-95"
          >
            Register Vendor
          </button>
          
          <div className="space-y-2">
            <button className="flex items-center gap-4 px-4 py-3 w-full text-tertiary hover:text-neutral hover:bg-white/5 rounded-xl transition-all text-sm font-bold group text-left">
              <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" /> Settings
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 w-full text-tertiary hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all text-sm font-bold group text-left"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-secondary/20 flex items-center justify-between px-10 shrink-0 z-10 sticky top-0">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendor name, email, contact person, city..." 
                className="w-full bg-[#F5F5F3]/50 border-none rounded-2xl py-3.5 pl-14 pr-6 text-sm focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-tertiary font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-10">
            <nav className="flex items-center gap-10">
              <button className="text-[10px] font-black uppercase tracking-[0.25em] text-tertiary hover:text-primary transition-colors" onClick={() => navigate('/admin-dashboard')}>Analytics</button>
              <button className="text-[10px] font-black uppercase tracking-[0.25em] text-primary border-b-2 border-primary pb-1">Vendors</button>
              <button className="text-[10px] font-black uppercase tracking-[0.25em] text-tertiary hover:text-primary transition-colors" onClick={() => navigate('/inventory')}>Inventory</button>
            </nav>

            <div className="flex items-center gap-6 pl-10 border-l border-secondary/20">
              <div className="flex gap-2">
                <HeaderIcon icon={Bell} badge />
                <HeaderIcon icon={Settings} />
              </div>
              <div className="flex items-center gap-4 ml-2 group cursor-pointer">
                <div className="text-right">
                  <p className="font-black text-sm leading-none">{user?.userName || 'Admin'}</p>
                  <p className="text-[10px] text-tertiary font-bold uppercase tracking-widest mt-1">{user?.roles?.[0] || 'Administrator'}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl overflow-hidden ring-4 ring-secondary/10 group-hover:ring-primary/10 transition-all shadow-lg">
                  <img src={`https://ui-avatars.com/api/?name=${user?.userName || 'Admin'}&background=1a1a1a&color=fff&bold=true`} alt="User" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </header>

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

      {/* ── Modal Dialog overlays ── */}
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