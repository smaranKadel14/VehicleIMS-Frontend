import { useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";

interface SellPartsModalProps {
  onClose: () => void;
  onSave: (data: { customerId: number; partId: number; quantity: number; discountPercentage: number; totalAmount: number }) => Promise<void>;
  dbParts: any[];
  dbCustomers: any[];
}

export default function SellPartsModal({
  onClose,
  onSave,
  dbParts,
  dbCustomers,
}: SellPartsModalProps) {
  const partsList = dbParts.length > 0 ? dbParts : [
    { id: 1, name: "Clutch Assembly Kit", price: 420.00 },
    { id: 2, name: "V6 Piston Kit", price: 280.00 },
    { id: 3, name: "Heavy Duty Brake Pads", price: 120.00 }
  ];

  const [selectedPart, setSelectedPart] = useState<any>(partsList[0]);
  const [partSearchQuery, setPartSearchQuery] = useState(partsList[0].name);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    dbCustomers.length > 0 ? String(dbCustomers[0].id) : "1"
  );
  const [posData, setPosData] = useState({ quantity: 1, discount: 0 });
  const [loading, setLoading] = useState(false);

  const filteredParts = partsList.filter(p => 
    p.name.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
    String(p.id).includes(partSearchQuery)
  );

  const handleAuthorizeSale = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPart) {
      alert("Please search and select a valid vehicle part from inventory.");
      return;
    }
    setLoading(true);
    const sub = selectedPart.price * posData.quantity;
    
    // Loyalty Program: 10% discount if they spend more than 5000 in a single purchase
    const autoLoyaltyDiscount = sub > 5000 ? 10 : 0;
    const finalDiscountPercentage = Math.max(posData.discount, autoLoyaltyDiscount);
    const disc = sub * (finalDiscountPercentage / 100);
    const tot = sub - disc;

    try {
      await onSave({
        customerId: Number(selectedCustomerId),
        partId: Number(selectedPart.id),
        quantity: posData.quantity,
        discountPercentage: finalDiscountPercentage,
        totalAmount: tot,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 32, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Authorize POS Part Sale</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleAuthorizeSale} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Search & Select Part Component</label>
            <input 
              type="text" 
              placeholder="Type part name to search..."
              value={partSearchQuery}
              onChange={e => {
                setPartSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // Delay hiding suggestions so click event can register
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
              required
            />
            {showSuggestions && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", zIndex: 1010, maxHeight: 180, overflowY: "auto", marginTop: 4 }}>
                {filteredParts.length > 0 ? (
                  filteredParts.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setSelectedPart(p);
                        setPartSearchQuery(p.name);
                        setShowSuggestions(false);
                      }}
                      style={{ padding: "10px 12px", fontSize: 13, cursor: "pointer", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center", background: selectedPart?.id === p.id ? "#F9FAFB" : "none" }}
                    >
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                      <span style={{ color: "#10B981", fontWeight: 700 }}>RS {p.price.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 12, fontSize: 12, color: "#9CA3AF", textAlign: "center" }}>
                    No matching parts found.
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Quantity</label>
              <input 
                type="number" 
                min={1} 
                max={20}
                value={posData.quantity}
                onChange={e => setPosData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Discount (%)</label>
              <select 
                value={posData.discount}
                onChange={e => setPosData(prev => ({ ...prev, discount: parseInt(e.target.value) }))}
                style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, background: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
              >
                <option value={0}>0% (None)</option>
                <option value={5}>5% Off</option>
                <option value={10}>10% Off</option>
                <option value={20}>20% Special</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer Name *</label>
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, background: "#FFFFFF", outline: "none" }}
              required
            >
              {dbCustomers.length > 0 ? (
                dbCustomers.map(c => (
                  <option key={c.id} value={String(c.id)}>{c.fullName} ({c.email})</option>
                ))
              ) : (
                <>
                  <option value="1">Elena Rossi (elena.rossi@gmail.com)</option>
                  <option value="2">Marcus Chen (m.chen@outlook.com)</option>
                  <option value="3">Sarah Jenkins (s.jenkins@yahoo.com)</option>
                </>
              )}
            </select>
          </div>

          {/* POS Summary */}
          {(() => {
            if (!selectedPart) return null;
            const sub = selectedPart.price * posData.quantity;
            
            // Loyalty Program: 10% discount if they spend more than 5000 in a single purchase
            const autoLoyaltyDiscount = sub > 5000 ? 10 : 0;
            const finalDiscountPercentage = Math.max(posData.discount, autoLoyaltyDiscount);
            const disc = sub * (finalDiscountPercentage / 100);
            const tot = sub - disc;
            return (
              <div style={{ padding: 16, background: "#F9FAFB", borderRadius: 10, marginTop: 8, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#6B7280" }}>Subtotal:</span>
                  <span style={{ fontWeight: 700 }}>RS {sub.toFixed(2)}</span>
                </div>
                {autoLoyaltyDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                    <span style={{ color: "#10B981", fontWeight: 700 }}>Loyalty Discount (Sub &gt; 5000):</span>
                    <span style={{ color: "#10B981", fontWeight: 800, background: "#D1FAE5", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>10% Off Applied</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#6B7280" }}>Discount Applied:</span>
                  <span style={{ fontWeight: 700, color: "#EF4444" }}>-RS {disc.toFixed(2)} {finalDiscountPercentage > 0 && `(${finalDiscountPercentage}%)`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E5E7EB", paddingTop: 8, fontSize: 14, fontWeight: 800 }}>
                  <span>Total Amount:</span>
                  <span>RS {tot.toFixed(2)}</span>
                </div>
              </div>
            );
          })()}

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, border: "1.5px solid #E5E7EB", borderRadius: 8, background: "#FFFFFF", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: 12, background: "#111827", color: "#FFFFFF", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>
              {loading ? "Authorizing..." : "Authorize Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
