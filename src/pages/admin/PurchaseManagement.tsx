import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
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
  FileText,
  Plus,
  Trash2,
  Save,
  X,
  Download,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import authService from "../../services/authService";
import purchaseService from "../../services/purchaseService";
import type { PurchaseInvoiceResponse, CreatePurchaseInvoiceRequest } from "../../services/purchaseService";
import partService from "../../services/partService";
import vendorService from "../../services/vendorService";
import type { VendorResponse } from "../../services/vendorService";

// Interface and definitions
interface Part {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  status: string;
  price: number;
  supplier: string;
  icon: string;
}

type ModalState = null | "add" | { view: PurchaseInvoiceResponse };

// Helper to determine stock status
function deriveStatus(stock: number): string {
  if (stock <= 3) return "CRITICAL";
  if (stock <= 10) return "LOW";
  return "OK";
}

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

// Reusable components
const NavItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-150 ease-out group ${active ? 'bg-neutral text-black font-black shadow-xl' : 'text-tertiary hover:text-neutral hover:bg-white/5'}`}
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

export default function PurchaseManagement() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  // States
  const [purchases, setPurchases] = useState<PurchaseInvoiceResponse[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const fetchPurchasesAndInventory = async () => {
    try {
      const partsData = await partService.getAll();
      const mappedParts: Part[] = partsData.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: getCategoryFromSku(p.sku),
        stock: p.stockQuantity,
        status: deriveStatus(p.stockQuantity),
        price: p.price,
        supplier: p.vendorName || "Default Vendor",
        icon: "⚙️"
      }));
      setParts(mappedParts);

      const purchasesData = await purchaseService.getAll();
      setPurchases(purchasesData);
    } catch (err) {
      console.error("Failed to fetch purchases data:", err);
    }
  };

  useEffect(() => {
    fetchPurchasesAndInventory();
    vendorService.getAll().then(v => setVendors(v)).catch(err => console.error(err));
  }, []);

  // Alert timer
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Nav Items
  const NAV_ITEMS = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin-dashboard" },
    { icon: Package, label: "Inventory", path: "/inventory" },
    { icon: Users, label: "Vendors", path: "/vendors" },
    { icon: ShieldCheck, label: "Staff", path: "/staff-management" },
    { icon: FileText, label: "Purchases", active: true, path: "/purchases" },
  ];

  // Derived statistics
  const totalCost = useMemo(() => purchases.reduce((s, p) => s + p.finalTotal, 0), [purchases]);
  const stockAddedCount = useMemo(() => {
    return purchases.reduce((s, p) => s + p.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  }, [purchases]);
  const uniqueVendorsCount = useMemo(() => new Set(purchases.map(p => p.vendorName)).size, [purchases]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => 
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.vendorName.toLowerCase().includes(search.toLowerCase())
    );
  }, [purchases, search]);

  // Log new purchase
  const handleSavePurchase = async (reqPayload: CreatePurchaseInvoiceRequest) => {
    try {
      await purchaseService.create(reqPayload);
      await fetchPurchasesAndInventory();
      setModal(null);
      setAlert({
        message: `Bulk purchase invoice registered successfully! Stock levels replenished.`,
        type: "success"
      });
    } catch (err) {
      console.error("Failed to record bulk purchase:", err);
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
            Log Bulk Purchase
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

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative h-screen">
        
        {/* Floating Alert Banner */}
        {alert && (
          <div className="fixed top-8 left-[320px] right-8 z-[2000] flex items-center justify-between bg-black text-white px-6 py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-top-4 duration-300 border border-neutral/20">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm font-bold tracking-tight">{alert.message}</p>
            </div>
            <button onClick={() => setAlert(null)} className="text-tertiary hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Topbar */}
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-secondary/20 flex items-center justify-between px-10 shrink-0 z-10 sticky top-0">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search purchases by Invoice # or Supplier..." 
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

        {/* Content Body */}
        <main className="flex-1 p-10">
          <div className="max-w-[1500px] mx-auto space-y-10">
            
            {/* Header */}
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-heading font-extrabold tracking-tighter">Purchase Invoices</h2>
                <p className="text-base text-tertiary font-medium mt-1">Log supplier bulk parts acquisitions to automatically replenish warehouse inventory levels.</p>
              </div>
              <button 
                onClick={() => setModal("add")}
                className="flex items-center gap-2 px-8 py-4 bg-black text-neutral rounded-2xl text-[11px] font-black uppercase tracking-widest hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Log Bulk Purchase
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <AdminStatCard label="Total Acquisitions" value={`RS ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} trend="Cumulative spending" icon={FileText} />
              <AdminStatCard label="Invoices Registered" value={`${purchases.length} Invoices`} trend="Supply transactions logged" icon={FileCheck} />
              <AdminStatCard label="Stock Replenished" value={`+${stockAddedCount.toLocaleString()} Units`} trend="Replenished inventory volume" icon={Package} variant="gray" />
              <AdminStatCard label="Active Suppliers" value={`${uniqueVendorsCount} Vendors`} trend="Global partnerships" icon={Users} variant="black" />
            </div>

            {/* Purchases Table */}
            <div className="bg-white rounded-[40px] border border-secondary/20 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-secondary/10 flex justify-between items-center">
                <h3 className="text-xl font-extrabold tracking-tight">Acquisition Log Ledger</h3>
                <span className="text-xs font-bold text-tertiary uppercase tracking-widest">Displaying {filteredPurchases.length} Invoices</span>
              </div>
              
              {filteredPurchases.length === 0 ? (
                <div className="p-20 text-center text-tertiary">
                  <AlertCircle className="w-12 h-12 mx-auto text-tertiary/30 mb-4 animate-bounce" />
                  <p className="text-sm font-bold tracking-tight">No purchase invoices match your query.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary border-b border-secondary/10 bg-secondary/5">
                        <th className="px-10 py-6">Invoice Number</th>
                        <th className="px-10 py-6">Supplier / Vendor</th>
                        <th className="px-10 py-6">Purchase Date</th>
                        <th className="px-10 py-6">Total Items</th>
                        <th className="px-10 py-6">Grand Total</th>
                        <th className="px-10 py-6">Status</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                      {filteredPurchases.map((inv) => (
                        <tr key={inv.id} className="hover:bg-secondary/5 transition-colors group">
                          <td className="px-10 py-6 text-sm font-bold tracking-tight text-primary font-mono">{inv.invoiceNumber}</td>
                          <td className="px-10 py-6">
                            <p className="text-sm font-black tracking-tight">{inv.vendorName}</p>
                            <p className="text-[10px] text-tertiary font-bold tracking-wider mt-1 opacity-60">ID: VND-{inv.vendorId}</p>
                          </td>
                          <td className="px-10 py-6 text-xs font-bold text-tertiary tracking-tight">
                            {new Date(inv.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-10 py-6 text-sm font-bold text-tertiary">
                            {inv.items.reduce((s, i) => s + i.quantity, 0)} units ({inv.items.length} parts)
                          </td>
                          <td className="px-10 py-6 text-base font-black text-primary">RS {inv.finalTotal.toFixed(2)}</td>
                          <td className="px-10 py-6">
                            <span className="px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest bg-black text-neutral">
                              COMPLETED
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <button 
                              onClick={() => setModal({ view: inv })}
                              className="px-5 py-2.5 bg-secondary/10 rounded-xl hover:bg-black hover:text-white font-black text-[9px] uppercase tracking-widest transition-all"
                            >
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Add Invoice Modal */}
      {modal === "add" && (
        <AddPurchaseModal 
          partsList={parts}
          vendors={vendors}
          onClose={() => setModal(null)}
          onSave={handleSavePurchase}
        />
      )}

      {/* View Receipt Modal */}
      {modal !== null && typeof modal === 'object' && 'view' in modal && (
        <ViewReceiptModal 
          invoice={modal.view}
          onClose={() => setModal(null)}
        />
      )}

    </div>
  );
}

// Modal: Log Purchase Invoice
function AddPurchaseModal({
  partsList,
  vendors,
  onClose,
  onSave
}: {
  partsList: Part[];
  vendors: VendorResponse[];
  onClose: () => void;
  onSave: (inv: CreatePurchaseInvoiceRequest) => void;
}) {
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [items, setItems] = useState<{ partId: number; quantity: number; unitPrice: number; }[]>([
    { partId: partsList[0]?.id || 1, quantity: 10, unitPrice: partsList[0]?.price || 100 }
  ]);
  const [errors, setErrors] = useState<string | null>(null);

  useEffect(() => {
    if (vendors.length > 0 && !selectedVendorId) {
      setSelectedVendorId(String(vendors[0].id));
    }
  }, [vendors, selectedVendorId]);

  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVendorId(e.target.value);
  };

  const selectedVendor = useMemo(() => {
    return vendors.find(v => String(v.id) === selectedVendorId) || vendors[0];
  }, [vendors, selectedVendorId]);

  const handleAddItem = () => {
    setItems(prev => [...prev, { partId: partsList[0]?.id || 1, quantity: 10, unitPrice: partsList[0]?.price || 100 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, key: "partId" | "quantity" | "unitPrice", val: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      
      const nextItem = { ...item, [key]: val };
      if (key === "partId") {
        // Prepopulate price on selecting part
        const matchingPart = partsList.find(p => p.id === val);
        if (matchingPart) {
          nextItem.unitPrice = matchingPart.price;
        }
      }
      return nextItem;
    }));
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0);
  }, [items]);

  const totalQuantity = useMemo(() => {
    return items.reduce((s, item) => s + item.quantity, 0);
  }, [items]);

  // Programmatic 5% bulk discount for total items >= 50
  const discount = useMemo(() => {
    return totalQuantity >= 50 ? subtotal * 0.05 : 0;
  }, [subtotal, totalQuantity]);

  const grandTotal = subtotal - discount;

  const handleLogInvoice = () => {
    // Validations
    if (!selectedVendorId) {
      setErrors("Please select a vendor supplier.");
      return;
    }
    if (items.some(item => item.quantity <= 0 || item.unitPrice <= 0)) {
      setErrors("Quantities and unit prices must be positive numbers.");
      return;
    }

    const compiledItems = items.map(item => ({
      partId: item.partId,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    }));

    onSave({
      vendorId: Number(selectedVendorId),
      items: compiledItems
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] w-full max-w-[720px] shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-10 pt-10 pb-8 flex items-start gap-6 border-b border-secondary/10 shrink-0">
          <div className="w-14 h-14 bg-secondary/5 rounded-2xl flex items-center justify-center shrink-0">
             <FileCheck className="w-7 h-7 text-primary" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h2 className="text-3xl font-heading font-extrabold tracking-tight text-primary">Log Bulk Purchase</h2>
            <p className="text-tertiary text-sm leading-relaxed">Select supplier and part aggregates. Stock levels replenish dynamically in inventory database upon checkout authorization.</p>
          </div>
          <button onClick={onClose} className="text-tertiary hover:text-primary transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-10 space-y-6 overflow-y-auto flex-1">
          {errors && (
            <div className="p-4 bg-red-100 text-red-700 rounded-xl text-sm font-bold flex items-center gap-3">
              <AlertCircle className="w-5 h-5" /> {errors}
            </div>
          )}

          {/* Supplier Vendor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary ml-1">Supplier Vendor *</label>
              <select 
                value={selectedVendorId}
                onChange={handleVendorChange}
                className="w-full bg-secondary/5 border-none rounded-2xl py-4 px-5 text-sm font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all"
              >
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary ml-1">Supplier Contact Email</label>
              <input 
                type="email"
                value={selectedVendor?.email || ""}
                disabled
                className="w-full bg-secondary/5 border-none rounded-2xl py-4 px-5 text-sm font-bold text-tertiary/60 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Dynamic Item Form List */}
          <div className="space-y-4 pt-4 border-t border-secondary/10">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-[0.25em] text-tertiary ml-1">Acquisition Parts List</h4>
              <button 
                onClick={handleAddItem}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary border border-secondary/30 rounded-xl px-4 py-2 hover:bg-neutral transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Part Item
              </button>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-secondary/5 p-4 rounded-2xl group border border-transparent hover:border-secondary/20 transition-all">
                  
                  {/* Select Part */}
                  <div className="flex-1 min-w-0">
                    <select
                      value={item.partId}
                      onChange={(e) => handleItemChange(idx, "partId", Number(e.target.value))}
                      className="w-full bg-white border-none rounded-xl py-3 px-4 text-xs font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all"
                    >
                      {partsList.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-24">
                    <input 
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white border-none rounded-xl py-3 px-4 text-xs font-bold text-primary text-center focus:ring-4 focus:ring-primary/5"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="w-28 flex items-center bg-white rounded-xl px-4 py-3 border-none focus-within:ring-4 focus-within:ring-primary/5">
                    <span className="text-xs text-tertiary font-bold">RS</span>
                    <input 
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                      className="w-full bg-transparent border-none p-0 text-xs font-bold text-primary text-right focus:ring-0 ml-1"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="w-24 text-right">
                    <p className="text-[10px] text-tertiary uppercase tracking-widest font-black">Subtotal</p>
                    <p className="text-sm font-black mt-1">RS {(item.quantity * item.unitPrice).toFixed(2)}</p>
                  </div>

                  {/* Delete Item */}
                  <button 
                    disabled={items.length <= 1}
                    onClick={() => handleRemoveItem(idx)}
                    className="p-3 text-tertiary hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-colors disabled:opacity-20 disabled:pointer-events-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              ))}
            </div>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="bg-secondary/5 rounded-2xl p-6 flex flex-col gap-3 font-bold text-sm tracking-tight text-tertiary border border-secondary/15">
            <div className="flex justify-between">
              <span>Items Total Count</span>
              <span className="text-primary font-black">{totalQuantity} units</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-primary font-black">RS {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Volume Discount (5% Active)</span>
                <span className="font-black">-RS {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-primary pt-3 border-t border-secondary/10">
              <span className="uppercase tracking-widest text-xs text-tertiary">Grand Total Cost</span>
              <span className="text-lg leading-none">RS {grandTotal.toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-10 py-8 border-t border-secondary/10 flex gap-4 shrink-0 bg-secondary/5">
          <button 
            onClick={handleLogInvoice}
            className="flex-1 h-16 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4" /> Log & Replenish Stock
          </button>
          <button 
            onClick={onClose}
            className="w-1/3 h-16 bg-white border border-secondary/35 text-tertiary rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-secondary/10 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

// Modal: Receipt Viewer
function ViewReceiptModal({
  invoice,
  onClose
}: {
  invoice: PurchaseInvoiceResponse;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] w-full max-w-[540px] shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-8 right-8 text-tertiary hover:text-primary transition-colors z-10">
          <X className="w-6 h-6" />
        </button>
 
        {/* Receipt Wrapper */}
        <div className="p-10 space-y-8 flex flex-col">
          
          {/* Header */}
          <div className="text-center space-y-2 border-b border-secondary/10 pb-8">
            <div className="w-16 h-16 bg-neutral rounded-2xl flex items-center justify-center mx-auto shadow-md">
               <Zap className="w-8 h-8 text-black fill-black" />
            </div>
            <h3 className="text-2xl font-heading font-extrabold tracking-tighter text-primary">ENGINECORE INDUSTRIAL</h3>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-tertiary">Bulk Purchase Receipt</p>
          </div>
 
          {/* Invoice Specs */}
          <div className="grid grid-cols-2 gap-4 text-xs font-bold text-tertiary leading-normal">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Invoice ID</p>
              <p className="text-sm font-black text-primary font-mono mt-1">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Supplier</p>
              <p className="text-sm font-black text-primary mt-1">{invoice.vendorName}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Transaction Date</p>
              <p className="text-sm font-black text-primary mt-1">
                {new Date(invoice.date).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Replenish Status</p>
              <p className="text-sm font-black text-green-600 mt-1 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> REPLENISHED
              </p>
            </div>
          </div>
 
          {/* Line Items List */}
          <div className="space-y-4 border-t border-secondary/10 pt-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Acquired Line Items</h4>
            
            <div className="space-y-3 divide-y divide-secondary/5">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-bold text-tertiary pt-3 first:pt-0">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-primary">{item.partName}</p>
                    <p className="text-[9px] font-bold text-tertiary opacity-70">ID: PART-{item.partId} • {item.quantity} units @ RS {item.unitPrice.toFixed(2)}</p>
                  </div>
                  <span className="text-sm font-black text-primary">RS {item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
 
          {/* Financials Summary */}
          <div className="bg-secondary/5 rounded-2xl p-6 space-y-2.5 border border-secondary/10">
            <div className="flex justify-between text-xs font-bold text-tertiary">
              <span>Subtotal</span>
              <span className="text-primary font-black">RS {invoice.subTotal.toFixed(2)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-xs font-bold text-green-600">
                <span>Volume Discount ({invoice.discountPercentage}%)</span>
                <span className="font-black">-RS {invoice.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-primary border-t border-secondary/10 pt-3">
              <span className="text-xs uppercase tracking-widest text-tertiary">Grand Total</span>
              <span>RS {invoice.finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex gap-4">
            <button 
              onClick={() => {
                alert("Receipt sent to printer spool successfully.");
              }}
              className="flex-1 h-14 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" /> Print PDF
            </button>
            <button 
              onClick={onClose}
              className="w-1/3 h-14 bg-secondary/10 text-tertiary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-secondary/20 transition-all"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
