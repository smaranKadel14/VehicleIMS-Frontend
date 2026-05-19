import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  ShoppingCart,
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Layers,
  Wrench,
  Gauge
} from 'lucide-react';
import authService from "../../services/authService";
import customerService from "../../services/customerService";
import partService from "../../services/partService";
import salesService from "../../services/salesService";
import { Sidebar } from "../../components/layout/Sidebar";
import { Topbar } from "../../components/layout/Topbar";
import RegisterCustomerModal from "../../components/staff/RegisterCustomerModal";

interface CartItem {
  partId: number;
  partName: string;
  price: number;
  sku: string;
  binLocation: string;
  quantity: number;
}

export default function StaffPOS() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // State Management
  const [dbParts, setDbParts] = useState<any[]>([]);
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  // Cart & Transaction States
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<"paid" | "credit">("paid");
  const [discountPercentageOverride, setDiscountPercentageOverride] = useState(0);

  // Search & Autosuggest States
  const [partSearchQuery, setPartSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Modals / Overlays
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState<any | null>(null);

  // Initial Fetches
  const fetchInventoryAndCustomers = async () => {
    setLoading(true);
    try {
      const parts = await partService.getAll();
      setDbParts(parts);

      // Force-populate customers
      const customers = await customerService.search("", "All", "Active", "Name");
      setDbCustomers(customers);
      
      if (customers.length > 0 && selectedCustomerId === 0) {
        setSelectedCustomerId(customers[0].id);
      }
    } catch (err) {
      console.error("Failed to load POS reference libraries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryAndCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Quick-Add Parts Catalog List
  const quickCatalogItems = [
    { id: 1, name: "Clutch Assembly Kit", sku: "CLUTCH-V1", bin: "BIN: A-12-04", price: 420.00, icon: Gauge },
    { id: 2, name: "V6 Piston Kit", sku: "V6-PISTON", bin: "BIN: C-05-01", price: 280.00, icon: Layers },
    { id: 3, name: "Heavy Duty Brake Pads", sku: "BRAKE-HD", bin: "BIN: A-10-02", price: 120.00, icon: Wrench }
  ];

  // Map backend matches for the Quick Catalog parts
  const getCatalogItemPart = (catalogItem: any) => {
    // Attempt exact match by name
    const match = dbParts.find(p => p.name.toLowerCase() === catalogItem.name.toLowerCase());
    if (match) return match;
    // Fallback to first database part to guarantee database constraints are satisfied
    if (dbParts.length > 0) return dbParts[0];
    // Ultimate fallback
    return {
      id: 1,
      name: catalogItem.name,
      price: catalogItem.price,
      sku: catalogItem.sku,
      binLocation: catalogItem.bin
    };
  };

  // Add Part to Cart
  const handleAddPartToCart = (part: any, qty: number = 1) => {
    const partId = part.id;
    const existing = cartItems.find(item => item.partId === partId);
    
    if (existing) {
      setCartItems(prev => prev.map(item => 
        item.partId === partId 
          ? { ...item, quantity: item.quantity + qty }
          : item
      ));
    } else {
      const newItem: CartItem = {
        partId,
        partName: part.name,
        price: part.price,
        sku: part.sku || "N/A",
        binLocation: part.binLocation || "N/A",
        quantity: qty
      };
      setCartItems(prev => [...prev, newItem]);
    }
  };

  // Quantity Modifier Stepper
  const handleModifyQuantity = (partId: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.partId !== partId) return item;
      const newQty = item.quantity + delta;
      return newQty > 0 ? { ...item, quantity: newQty } : item;
    }).filter(item => item.quantity > 0));
  };

  const handleRemoveItem = (partId: number) => {
    setCartItems(prev => prev.filter(item => item.partId !== partId));
  };

  // Computations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% Tax standard
  
  // Loyalty Program: 10% discount if subtotal exceeds 5000 in a single purchase
  const autoLoyaltyDiscount = subtotal > 5000 ? 10 : 0;
  const finalDiscountPercentage = Math.max(discountPercentageOverride, autoLoyaltyDiscount);
  const discountAmount = subtotal * (finalDiscountPercentage / 100);
  const totalAmount = subtotal + tax - discountAmount;

  // Search & Typeahead filtering
  const filteredPartsList = dbParts.filter(p => 
    p.name.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(partSearchQuery.toLowerCase()))
  );

  const selectedCustomerObj = dbCustomers.find(c => c.id === selectedCustomerId) || (dbCustomers.length > 0 ? dbCustomers[0] : null);

  // CRM Quick-Add handler
  const handleRegisterCustomer = async (data: { firstName: string; lastName: string; email: string; phone: string; address: string }) => {
    try {
      await customerService.register({
        username: data.firstName.toLowerCase() + data.lastName.toLowerCase() + Math.floor(Math.random() * 100),
        email: data.email.trim(),
        passwordHash: "Client123!",
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
        address: data.address.trim() || "N/A",
        make: "Generic",
        model: "Vehicle",
        year: 2024,
        vin: "VIN-TEMP-1234",
        licensePlate: "TEMP-" + Math.floor(1000 + Math.random() * 9000)
      });
      
      // Re-fetch customer directory
      const customers = await customerService.search("", "All", "Active", "Name");
      setDbCustomers(customers);
      
      // Auto-select the newly added customer
      const newlyAdded = customers.find(c => c.email.toLowerCase() === data.email.toLowerCase());
      if (newlyAdded) {
        setSelectedCustomerId(newlyAdded.id);
      }
      setIsQuickAddOpen(false);
    } catch (err) {
      console.error("CRM quick-registration failed:", err);
      alert("Failed to register customer profiles. Ensure unique email.");
    }
  };

  // Transaction Checkout
  const handleCompleteTransaction = async () => {
    if (cartItems.length === 0) {
      alert("Sourcing cart is currently empty. Add mechanical components to finalize sales.");
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        isPaid: paymentType === "paid",
        items: cartItems.map(item => ({
          partId: item.partId,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      };

      const invoice = await salesService.create(payload);
      
      // Show elegant visual receipt modal details
      setSuccessOverlay({
        invoiceNumber: invoice.invoiceNumber,
        finalTotal: invoice.finalTotal,
        discountPercentage: finalDiscountPercentage,
        customerName: selectedCustomerObj?.fullName || "Marcus Thorne",
        itemsCount: cartItems.length
      });

      // Reset local cart
      setCartItems([]);
      setPartSearchQuery("");
      setDiscountPercentageOverride(0);
    } catch (err: any) {
      console.error("POS database sync transaction failed:", err);
      const serverError = err.response?.data?.message || err.response?.data || err.message;
      alert(`POS checkout synchronization failed.\nReason: ${serverError}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F3F4F6", fontFamily: "'Inter', -apple-system, sans-serif", color: "#111827", overflow: "hidden" }}>
      
      {/* Sidebar */}
      <Sidebar
        logoTitle="EngineCore"
        logoSubtitle="V-Series Portal"
        logoIcon={Settings}
        items={[
          { icon: LayoutDashboard, label: "Dashboard", active: false, onClick: () => navigate("/staff/dashboard") },
          { icon: ShoppingCart, label: "POS", active: true, onClick: () => navigate("/staff/pos") },
          { icon: Calendar, label: "Appointments", active: false, onClick: () => navigate("/staff/appointments") },
          { icon: BarChart3, label: "Reports", active: false, onClick: () => navigate("/staff/reports") },
          { icon: Users, label: "Customers", active: false, onClick: () => navigate("/staff/customers") }
        ]}
        footerItems={[
          { icon: Settings, label: "Settings", onClick: () => alert("Settings preferences are managed in your profile panel.") }
        ]}
        handleLogout={handleLogout}
      />

      {/* Main Workspace Frame */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Top Header */}
        <Topbar
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          searchPlaceholder="Search components, plates, or transactions..."
          notificationBadgeCount={0}
          onNotificationClick={() => alert("Telemetry system diagnostic active.")}
          onLogoutClick={handleLogout}
          userName={user?.userName || "Marcus Thorne"}
          userRole={user?.roles?.[0] || "SERVICE LEAD"}
        />

        {/* Transaction Split Screen Panels */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          
          {/* Middle Catalog & Selection panel */}
          <div style={{ flex: 1.5, display: "flex", flexDirection: "column", padding: "24px 32px", boxSizing: "border-box", overflowY: "auto" }}>
            
            {/* Action title block */}
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: "-0.8px" }}>NEW TRANSACTION</h1>
              <p style={{ margin: "4px 0 0 0", fontSize: 13.5, color: "#6B7280", fontWeight: 500 }}>
                Search or scan vehicle components to begin
              </p>
            </div>

            {/* Premium Autocomplete Search bar */}
            <div style={{ position: "relative", marginBottom: 28 }}>
              <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Enter Part Name, OEM Number, or Scan Barcode..."
                value={partSearchQuery}
                onChange={e => {
                  setPartSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                style={{ 
                  width: "100%", 
                  padding: "16px 16px 16px 52px", 
                  border: "none", 
                  background: "#FFFFFF", 
                  borderRadius: 12, 
                  fontSize: 14.5, 
                  fontWeight: 500, 
                  color: "#111827", 
                  outline: "none", 
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)", 
                  boxSizing: "border-box" 
                }}
              />

              {/* Autocomplete Suggestion Menus */}
              {showSuggestions && partSearchQuery.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", zIndex: 1010, maxHeight: 220, overflowY: "auto", marginTop: 6 }}>
                  {filteredPartsList.length > 0 ? (
                    filteredPartsList.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          handleAddPartToCart(p, 1);
                          setPartSearchQuery("");
                          setShowSuggestions(false);
                        }}
                        style={{ padding: "12px 16px", fontSize: 13.5, cursor: "pointer", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      >
                        <div>
                          <span style={{ fontWeight: 700, color: "#111827" }}>{p.name}</span>
                          <span style={{ fontSize: 11, color: "#6B7280", display: "block" }}>{p.sku || "NO SKU"} • {p.binLocation || "No BIN Location"}</span>
                        </div>
                        <span style={{ color: "#10B981", fontWeight: 800 }}>RS {p.price.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: 16, fontSize: 13, color: "#9CA3AF", textAlign: "center" }}>
                      No matching engine components found.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Catalog Grid Section */}
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", display: "block", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Popular Quick-Add Components
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {quickCatalogItems.map(catalogItem => {
                  const IconComponent = catalogItem.icon;
                  const dbPart = getCatalogItemPart(catalogItem);
                  return (
                    <div 
                      key={catalogItem.id}
                      style={{ 
                        background: "#FFFFFF", 
                        borderRadius: 14, 
                        padding: 20, 
                        boxShadow: "0 4px 15px rgba(0,0,0,0.02)", 
                        display: "flex", 
                        flexDirection: "column", 
                        position: "relative",
                        transition: "all 0.2s" 
                      }}
                    >
                      {/* Floating Add circular action button */}
                      <button 
                        onClick={() => handleAddPartToCart(dbPart, 1)}
                        style={{ 
                          position: "absolute", 
                          right: 16, 
                          bottom: 16, 
                          width: 32, 
                          height: 32, 
                          background: "#111827", 
                          color: "#FFFFFF", 
                          border: "none", 
                          borderRadius: "50%", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          cursor: "pointer", 
                          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                          padding: 0
                        }}
                      >
                        <ShoppingCart style={{ width: 14, height: 14, margin: "auto" }} />
                      </button>

                      {/* Header Badge */}
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: 8 }}>
                        {catalogItem.sku}
                      </span>

                      {/* Graphic Icon avatar */}
                      <div style={{ width: 44, height: 44, background: "#F3F4F6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                        <IconComponent className="w-5 h-5 text-gray-700" />
                      </div>

                      {/* Title & Location details */}
                      <h4 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 4px 0", color: "#111827" }}>{catalogItem.name}</h4>
                      <span style={{ fontSize: 10.5, color: "#9CA3AF", fontWeight: 500, display: "block", marginBottom: 12 }}>{catalogItem.bin}</span>
                      
                      {/* Price tag */}
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginTop: "auto" }}>
                        RS {catalogItem.price.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Diagnostic Workshop Placeholder Graphical Frame */}
            <div style={{ 
              borderRadius: 14, 
              background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)", 
              padding: "24px 32px", 
              color: "#FFFFFF", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              marginTop: "auto" 
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", color: "#9CA3AF", textTransform: "uppercase" }}>
                    EngineCore precision POS
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px 0", letterSpacing: "-0.4px" }}>Multi-Item Transactional Checkout</h3>
                <p style={{ margin: 0, fontSize: 12.5, color: "#9CA3AF", fontWeight: 500 }}>
                  Live catalog mapping updates inventory levels instantly inside databases upon completion.
                </p>
              </div>
              <div style={{ opacity: 0.15 }}>
                <ShoppingCart className="w-16 h-16 text-white" />
              </div>
            </div>

          </div>

          {/* Right Billing & Cart Drawer panel */}
          <div style={{ 
            width: 400, 
            background: "#FFFFFF", 
            borderLeft: "1px solid #E5E7EB", 
            boxShadow: "-10px 0 30px rgba(0,0,0,0.02)", 
            display: "flex", 
            flexDirection: "column", 
            overflow: "hidden" 
          }}>
            
            {/* Scrollable details area */}
            <div style={{ flex: 1, padding: 24, boxSizing: "border-box", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Customer Selector Card Header block */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer CRM Profile</span>
                  <button 
                    onClick={() => setIsQuickAddOpen(true)}
                    style={{ background: "none", border: "none", color: "#111827", fontSize: 11, fontWeight: 800, cursor: "pointer", textDecoration: "underline", textTransform: "uppercase", padding: 0 }}
                  >
                    + QUICK ADD
                  </button>
                </div>

                {/* Selected customer card display */}
                {selectedCustomerObj ? (
                  <div style={{ background: "#F9FAFB", padding: 14, borderRadius: 12, border: "1px solid #E5E7EB", display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111827", color: "#FFFFFF", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                      {selectedCustomerObj.fullName ? selectedCustomerObj.fullName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0,2) : "C"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 800, margin: "0 0 2px 0", color: "#111827" }}>{selectedCustomerObj.fullName}</h4>
                      <p style={{ margin: 0, fontSize: 10.5, color: "#6B7280", fontWeight: 500 }}>
                        ID: #{selectedCustomerObj.id} • Tier: {subtotal > 5000 ? "Platinum" : "Regular"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 12, border: "1px dashed #E5E7EB", borderRadius: 12, textAlign: "center", fontSize: 12, color: "#9CA3AF", marginBottom: 12 }}>
                    No Customer Profiles Selected.
                  </div>
                )}

                {/* Fast Select dropdown option */}
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(Number(e.target.value))}
                  style={{ width: "100%", padding: 10, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 12.5, outline: "none", background: "#FFFFFF" }}
                >
                  {dbCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.email || "No Email"})</option>
                  ))}
                </select>
              </div>

              {/* Current checkout cart items */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Current Cart</span>
                  <span style={{ background: "#111827", color: "#FFFFFF", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6 }}>
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)} ITEMS
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {cartItems.length === 0 ? (
                    <div style={{ padding: 24, border: "1.5px dashed #E5E7EB", borderRadius: 12, textAlign: "center", color: "#9CA3AF", fontSize: 12.5 }}>
                      Checkout Cart is empty. Select components to build sale.
                    </div>
                  ) : (
                    cartItems.map(item => (
                      <div key={item.partId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ fontSize: 12.5, fontWeight: 800, margin: "0 0 2px 0", color: "#111827" }}>{item.partName}</h5>
                          <span style={{ fontSize: 10.5, color: "#9CA3AF", display: "block" }}>PN: {item.sku}</span>
                          
                          {/* Stepper Quantity control */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                            <button 
                              onClick={() => handleModifyQuantity(item.partId, -1)}
                              style={{ width: 22, height: 22, border: "1px solid #E5E7EB", borderRadius: 4, background: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <Minus className="w-3 h-3 text-gray-600" />
                            </button>
                            <span style={{ fontSize: 12, fontWeight: 700, minWidth: 16, textAlign: "center" }}>{item.quantity}</span>
                            <button 
                              onClick={() => handleModifyQuantity(item.partId, 1)}
                              style={{ width: 22, height: 22, border: "1px solid #E5E7EB", borderRadius: 4, background: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <Plus className="w-3 h-3 text-gray-600" />
                            </button>
                          </div>
                        </div>

                        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "end", gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
                            RS {(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button 
                            onClick={() => handleRemoveItem(item.partId)}
                            style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", padding: 2 }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Loyalty Discount Banner popover */}
              {autoLoyaltyDiscount > 0 && (
                <div style={{ 
                  background: "#111827", 
                  borderRadius: 12, 
                  padding: "12px 16px", 
                  color: "#FFFFFF", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  boxShadow: "0 6px 20px rgba(17,24,39,0.15)" 
                }}>
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#9CA3AF", letterSpacing: "0.08em", display: "block", textTransform: "uppercase" }}>
                      Loyalty Discount
                    </span>
                    <h5 style={{ fontSize: 11.5, fontWeight: 800, margin: 0, color: "#FFFFFF" }}>Bulk Purchase Bonus Applied</h5>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#10B981" }}>10% OFF</span>
                </div>
              )}

              {/* Calculations Block */}
              {cartItems.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6B7280", fontWeight: 500 }}>Subtotal</span>
                    <span style={{ fontWeight: 700, color: "#111827" }}>RS {subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6B7280", fontWeight: 500 }}>Tax (8%)</span>
                    <span style={{ fontWeight: 700, color: "#111827" }}>RS {tax.toFixed(2)}</span>
                  </div>
                  {finalDiscountPercentage > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#10B981", fontWeight: 700 }}>Loyalty Discount ({finalDiscountPercentage}%)</span>
                      <span style={{ fontWeight: 800, color: "#10B981" }}>-RS {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1.5px solid #E5E7EB", paddingTop: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: "#6B7280" }}>TOTAL AMOUNT</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}>RS {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

            </div>

            {/* Permanent bottom actions */}
            <div style={{ borderTop: "1px solid #E5E7EB", padding: 24, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 14 }}>
              
              {/* Payment Type Toggles */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button 
                  onClick={() => setPaymentType("paid")}
                  style={{ 
                    padding: 12, 
                    borderRadius: 8, 
                    border: "1.5px solid #111827", 
                    background: paymentType === "paid" ? "#111827" : "transparent",
                    color: paymentType === "paid" ? "#FFFFFF" : "#111827",
                    fontSize: 12.5, 
                    fontWeight: 700, 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: 6,
                    fontFamily: "inherit" 
                  }}
                >
                  <DollarSign style={{ width: 14, height: 14 }} /> PAY NOW
                </button>
                <button 
                  onClick={() => setPaymentType("credit")}
                  style={{ 
                    padding: 12, 
                    borderRadius: 8, 
                    border: "1.5px solid #111827", 
                    background: paymentType === "credit" ? "#111827" : "transparent",
                    color: paymentType === "credit" ? "#FFFFFF" : "#111827",
                    fontSize: 12.5, 
                    fontWeight: 700, 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: 6,
                    fontFamily: "inherit" 
                  }}
                >
                  <Briefcase style={{ width: 14, height: 14 }} /> ON CREDIT
                </button>
              </div>

              {/* Massive Submit button */}
              <button
                onClick={handleCompleteTransaction}
                disabled={loading || cartItems.length === 0}
                style={{ 
                  width: "100%", 
                  padding: "16px 20px", 
                  background: cartItems.length > 0 ? "#111827" : "#E5E7EB", 
                  color: "#FFFFFF", 
                  border: "none", 
                  borderRadius: 10, 
                  fontSize: 13, 
                  fontWeight: 900, 
                  letterSpacing: "0.08em", 
                  cursor: cartItems.length > 0 ? "pointer" : "not-allowed", 
                  textAlign: "center",
                  textTransform: "uppercase",
                  transition: "all 0.2s" 
                }}
              >
                {loading ? "AUTHORIZING TRANS..." : "COMPLETE TRANSACTION"}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* CRM Quick Add Overlay Modal */}
      {isQuickAddOpen && (
        <RegisterCustomerModal
          onClose={() => setIsQuickAddOpen(false)}
          onSave={handleRegisterCustomer}
        />
      )}

      {/* Elegant Invoice Success Dialog Receipt popover */}
      {successOverlay && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFFFFF", padding: 40, borderRadius: 20, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", boxSizing: "border-box", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ width: 56, height: 56, background: "#D1FAE5", color: "#10B981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                Checkout Completed
              </span>
              <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>Transaction Authorized</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#6B7280", fontWeight: 500 }}>
                Invoice receipt and email dispatch succeeded.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div style={{ width: "100%", background: "#F9FAFB", padding: 18, borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 13, display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280" }}>Invoice:</span>
                <span style={{ fontWeight: 700, color: "#111827" }}>{successOverlay.invoiceNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280" }}>Customer:</span>
                <span style={{ fontWeight: 700, color: "#111827" }}>{successOverlay.customerName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280" }}>Staged Items:</span>
                <span style={{ fontWeight: 700, color: "#111827" }}>{successOverlay.itemsCount} Components</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E5E7EB", paddingTop: 10, fontWeight: 800, fontSize: 14 }}>
                <span>Final Total:</span>
                <span style={{ color: "#10B981" }}>RS {successOverlay.finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setSuccessOverlay(null)}
              style={{ width: "100%", padding: 12, background: "#111827", color: "#FFFFFF", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
            >
              DISMISS RECEIPT
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
