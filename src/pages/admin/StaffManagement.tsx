import staffService from '../../services/staffService';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  Truck, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Zap, 
  TrendingUp,
  Clock,
  Users,
  UserPlus,
  Mail,
  ShieldCheck,
  Activity,
  Save,
  X,
  IdCard,
  FileText
} from 'lucide-react';
import authService from '../../services/authService';
// Data types and interface definitions
type StaffStatus = "Active" | "Inactive";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  status: StaffStatus;
  initials: string;
  role: string;
  department: string;
  position: string;
}

interface StaffFormData {
  name: string;
  email: string;
  isActive: boolean;
  role: string;
  department: string;
  position: string;
}

type ModalState = null | "add" | { edit: StaffMember } | { delete: StaffMember };

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin-dashboard" },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: Users, label: "Vendors", path: "/vendors" },
  { icon: ShieldCheck, label: "Staff", active: true, path: "/staff-management" },
  { icon: FileText, label: "Purchases", path: "/purchases" },
  { icon: Wrench, label: "Work Orders", path: "#" },
  { icon: Truck, label: "Logistics", path: "#" },
];
// Reusable UI components used within this page
const NavItem = ({ icon: Icon, label, active = false, delay = "", onClick }: { icon: any, label: string, active?: boolean, delay?: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-150 ease-out group ${delay} ${active ? 'bg-neutral text-black font-black shadow-xl' : 'text-tertiary hover:text-neutral hover:bg-white/5'}`}
  >
    <Icon className={`w-5 h-5 transition-transform duration-150 ease-out ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="text-sm tracking-tight">{label}</span>
  </button>
);

const HeaderIcon = ({ icon: Icon, badge = false }: { icon: any, badge?: boolean }) => (
  <button className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-secondary/10 hover:bg-primary hover:text-neutral transition-all group">
    <Icon className="w-5 h-5 group-active:scale-90 transition-transform" />
    {badge && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>}
  </button>
);

const AdminStatCard = ({ label, value, trend, icon: Icon, variant = 'white' }: { label: string, value: string, trend: string, icon: any, variant?: 'white' | 'gray' | 'black' }) => (
  <div className={`rounded-3xl p-6 transition-all duration-200 ease-out hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between min-h-[170px] cursor-default ${
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

// Staff Modal (The high-fidelity form from the image)

// Staff Modal for registering and editing role permissions
function StaffModal({
  staff,
  onClose,
  onSave,
}: {
  staff: StaffMember | null;
  onClose: () => void;
  onSave: (data: StaffFormData) => void;
}) {
  const [form, setForm] = useState<StaffFormData>(
    staff
      ? { 
          name: staff.name, 
          email: staff.email, 
          isActive: staff.status === "Active",
          role: staff.role || "Staff",
          department: staff.department || "Operations",
          position: staff.position || "Operator"
        }
      : { 
          name: "", 
          email: "", 
          isActive: true,
          role: "Staff",
          department: "Operations",
          position: "Operator"
        }
  );

  const handleSave = () => {
    if (form.name.trim() && form.email.trim()) {
      onSave(form);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] w-full max-w-[560px] shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="px-10 pt-10 pb-6 flex items-start gap-6 border-b border-secondary/10">
          <div className="w-14 h-14 bg-secondary/5 rounded-2xl flex items-center justify-center shrink-0">
             <UserPlus className="w-7 h-7 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-3xl font-heading font-extrabold tracking-tight text-primary">
              {staff ? "Edit Staff Profile" : "Register New Staff"}
            </h2>
            <p className="text-tertiary text-xs leading-relaxed max-w-[380px]">
              Modify permissions and industrial operations roles for database integrity and access logging.
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-10 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Full Name */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary ml-1">Full Name</label>
            <div className="relative group">
              <input 
                type="text" 
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={!!staff}
                className="w-full bg-secondary/5 border-none rounded-2xl py-4.5 px-6 text-sm font-bold tracking-tight text-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-tertiary/40 disabled:opacity-50"
                placeholder="e.g. Alexander Vance"
              />
              <IdCard className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary group-focus-within:text-primary transition-colors opacity-30" />
            </div>
          </div>

          {/* Corporate Email */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary ml-1">Corporate Email Address</label>
            <div className="relative group">
              <input 
                type="email" 
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={!!staff}
                className="w-full bg-secondary/5 border-none rounded-2xl py-4.5 px-6 text-sm font-bold tracking-tight text-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-tertiary/40 disabled:opacity-50"
                placeholder="a.vance@enginecore.industrial"
              />
              <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary group-focus-within:text-primary transition-colors opacity-30" />
            </div>
          </div>

          {/* Role, Department & Position selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary ml-1">System Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-secondary/5 border-none rounded-2xl py-4 px-5 text-sm font-bold tracking-tight text-primary focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer"
              >
                <option value="Staff">Staff Operator</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>
            
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary ml-1">Department</label>
              <input 
                type="text" 
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                disabled={!!staff}
                className="w-full bg-secondary/5 border-none rounded-2xl py-4 px-5 text-sm font-bold tracking-tight text-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-tertiary/40 disabled:opacity-50"
                placeholder="e.g. Operations"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary ml-1">Professional Position</label>
            <input 
              type="text" 
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              disabled={!!staff}
              className="w-full bg-secondary/5 border-none rounded-2xl py-4 px-6 text-sm font-bold tracking-tight text-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-tertiary/40 disabled:opacity-50"
              placeholder="e.g. Operator"
            />
          </div>

          {/* Account Status Toggle */}
          {staff && (
            <div className="bg-secondary/5 rounded-2xl p-5 flex items-center justify-between group">
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">System Access Status</h4>
                <p className="text-[9px] font-bold text-tertiary opacity-60">Control active database query permission instantly.</p>
              </div>
              <button 
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={`w-14 h-8 rounded-full relative transition-all duration-300 ease-out focus:ring-4 focus:ring-primary/10 ${form.isActive ? 'bg-black shadow-[0_0_20px_rgba(0,0,0,0.15)]' : 'bg-secondary/20'}`}
              >
                <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-sm ${form.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleSave}
              className="flex-1 h-16 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-[0.98]"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
            <button 
              onClick={onClose}
              className="w-1/3 h-16 bg-secondary/10 text-tertiary rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-secondary/20 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
// Main page component handling state and layout
export default function StaffManagement() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);

  const fetchStaff = async () => {
    try {
      const data = await staffService.getAll();
      const mapped: StaffMember[] = data.map(s => {
        const initials = `${s.firstName?.[0] || ""}${s.lastName?.[0] || ""}`.toUpperCase() || "ST";
        return {
          id: s.id,
          name: s.fullName || `${s.firstName} ${s.lastName}`,
          email: s.email,
          status: s.isActive ? "Active" : "Inactive",
          initials,
          role: s.role || "Staff",
          department: s.department || "Operations",
          position: s.position || "Operator"
        };
      });
      setStaffList(mapped);
    } catch (err) {
      console.error("Failed to load staff list:", err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
    );
  }, [staffList, search]);

  const activeCount = useMemo(() => {
    if (!staffList.length) return 0;
    return staffList.filter(s => s.status === "Active").length;
  }, [staffList]);

  const handleSave = async (data: StaffFormData) => {
    try {
      if (modal !== null && typeof modal === 'object' && 'edit' in modal) {
        // Edit flow
        const staffId = modal.edit.id;

        // 1. If role was changed, call updateRole endpoint
        if (data.role !== modal.edit.role) {
          await staffService.updateRole(staffId, data.role);
        }

        // 2. If access status was changed, deactivate or handle locally
        if (!data.isActive && modal.edit.status === "Active") {
          await staffService.deactivate(staffId);
        }

        await fetchStaff();
      } else {
        // Add/Register flow
        const nameParts = data.name.trim().split(/\s+/);
        const firstName = nameParts[0] || "Staff";
        const lastName = nameParts.slice(1).join(" ") || "Member";
        
        await staffService.register({
          username: data.email.split("@")[0] || `staff${Math.floor(Math.random() * 1000)}`,
          email: data.email.trim(),
          password: "Password@123", // default secure initial password
          firstName,
          lastName,
          phone: "9876543210",
          department: data.department,
          position: data.position,
          role: data.role
        });
        await fetchStaff();
      }
      setModal(null);
    } catch (err) {
      console.error("Failed to save staff records:", err);
    }
  };

  const handleDelete = async () => {
    if (modal !== null && typeof modal === 'object' && 'delete' in modal) {
      try {
        await staffService.deactivate(modal.delete.id);
        await fetchStaff();
        setModal(null);
      } catch (err) {
        console.error("Failed to deactivate staff:", err);
      }
    }
  };

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
            Register Staff
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative h-screen">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-secondary/20 flex items-center justify-between px-10 shrink-0 z-10 sticky top-0">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff by name, email or role..." 
                className="w-full bg-[#F5F5F3]/50 border-none rounded-2xl py-3.5 pl-14 pr-6 text-sm focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-tertiary font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex items-center gap-6 pl-10 border-l border-secondary/20">
              <div className="flex gap-2">
                <HeaderIcon icon={Bell} badge />
                <HeaderIcon icon={Settings} />
              </div>
              <div className="flex items-center gap-4 ml-2">
                <div className="text-right">
                  <p className="font-black text-sm leading-none">{user?.userName || 'Admin'}</p>
                  <p className="text-[10px] text-tertiary font-bold uppercase tracking-widest mt-1">{user?.roles?.[0] || 'Administrator'}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl overflow-hidden ring-4 ring-secondary/10 shadow-lg">
                  <img src={`https://ui-avatars.com/api/?name=${user?.userName || 'Admin'}&background=1a1a1a&color=fff&bold=true`} alt="User" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-10">
          <div className="max-w-[1500px] mx-auto space-y-10">
            
            {/* Page Header */}
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-heading font-extrabold tracking-tighter">Staff Management</h2>
                <p className="text-base text-tertiary font-medium mt-1">Configure system access and professional credentials for the Enginecore team.</p>
              </div>
              <button 
                onClick={() => setModal("add")}
                className="flex items-center gap-2 px-8 py-4 bg-black text-neutral rounded-2xl text-[11px] font-black uppercase tracking-widest hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" /> Register New Staff
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <AdminStatCard label="Total Staff" value={String(staffList.length)} trend="Global team size" icon={Users} />
              <AdminStatCard label="Active Sessions" value={String(activeCount)} trend={`${Math.round((activeCount/staffList.length)*100)}% online status`} icon={ShieldCheck} />
              <AdminStatCard label="System Integrity" value="99.9%" trend="Audit logs verified" icon={Activity} variant="black" />
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-[40px] border border-secondary/20 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary border-b border-secondary/10">
                    <th className="px-10 py-8">Staff Identity</th>
                    <th className="px-10 py-8">Corporate Email</th>
                    <th className="px-10 py-8">Status</th>
                    <th className="px-10 py-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/10">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-secondary/5 transition-colors group">
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center font-black text-primary transition-all group-hover:bg-black group-hover:text-white">
                            {staff.initials}
                          </div>
                          <div>
                            <p className="text-base font-black tracking-tight">{staff.name}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[9px] text-tertiary font-bold uppercase tracking-widest opacity-60">ID: STAFF-{staff.id}</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase ${staff.role === 'Admin' ? 'bg-black text-white' : 'bg-secondary/10 text-primary'}`}>
                                {staff.role}
                              </span>
                              <span className="px-2 py-0.5 bg-[#E4E4E4] rounded text-[8px] font-black tracking-widest text-tertiary uppercase">
                                {staff.department}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-sm font-bold text-tertiary tracking-tight">
                        {staff.email}
                      </td>
                      <td className="px-10 py-7">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest ${
                          staff.status === 'Active' ? 'bg-black text-neutral' : 'bg-secondary/20 text-tertiary'
                        }`}>{staff.status.toUpperCase()}</span>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setModal({ edit: staff })}
                            className="p-3 bg-secondary/10 rounded-xl hover:bg-black hover:text-white transition-all"
                          >
                             <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setModal({ delete: staff })}
                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                          >
                             <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>

      {/* Modals */}
      {(modal === "add" || (modal !== null && typeof modal === 'object' && 'edit' in modal)) && (
        <StaffModal 
          staff={modal === "add" ? null : (modal as { edit: StaffMember }).edit} 
          onClose={() => setModal(null)} 
          onSave={handleSave} 
        />
      )}

      {modal !== null && typeof modal === 'object' && 'delete' in modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] p-10 max-w-[400px] w-full text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <X className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight">Deactivate Staff?</h3>
              <p className="text-tertiary text-sm leading-relaxed">This will immediately revoke all system access for <strong>{(modal as { delete: StaffMember }).delete.name}</strong>.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all">Deactivate</button>
              <button onClick={() => setModal(null)} className="flex-1 py-4 bg-secondary/10 text-tertiary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-secondary/20 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
