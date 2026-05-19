import { useState } from "react";
import type { FormEvent } from "react";
import { X, Plus, Trash2, ShoppingCart, Sparkles } from "lucide-react";

interface SellPartsModalProps {
  onClose: () => void;
  onSave: (data: { customerId: number; items: { partId: number; quantity: number }[]; discountPercentage: number; totalAmount: number }) => Promise<void>;
  dbParts: any[];
  dbCustomers: any[];
}

interface CartItem {
  partId: number;
  partName: string;
  price: number;
  quantity: number;
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

  // Part selector states
  const [selectedPart, setSelectedPart] = useState<any>(partsList[0]);
  const [partSearchQuery, setPartSearchQuery] = useState(partsList[0].name);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quantityInput, setQuantityInput] = useState<number>(1);

  // Cart items list state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    dbCustomers.length > 0 ? String(dbCustomers[0].id) : "1"
  );
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [loading, setLoading] = useState(false);

  const filteredParts = partsList.filter(p => 
    p.name.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
    String(p.id).includes(partSearchQuery)
  );

  // Cart Action Handlers
  const handleAddToCart = () => {
    if (!selectedPart) return;
    
    // Check if part already in cart
    const existing = cartItems.find(item => item.partId === selectedPart.id);
    if (existing) {
      setCartItems(prev => prev.map(item => 
        item.partId === selectedPart.id 
          ? { ...item, quantity: item.quantity + quantityInput }
          : item
      ));
    } else {
      const newItem: CartItem = {
        partId: selectedPart.id,
        partName: selectedPart.name,
        price: selectedPart.price,
        quantity: quantityInput
      };
      setCartItems(prev => [...prev, newItem]);
    }

    setQuantityInput(1);
    // Focus search input or clear query
    setPartSearchQuery("");
    setSelectedPart(null);
  };

  const handleRemoveFromCart = (partId: number) => {
    setCartItems(prev => prev.filter(item => item.partId !== partId));
  };

  // Computations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Loyalty Program: 10% discount if subtotal exceeds 5000 in a single purchase
  const autoLoyaltyDiscount = subtotal > 5000 ? 10 : 0;
  const finalDiscountPercentage = Math.max(discountPercentage, autoLoyaltyDiscount);
  const discountAmount = subtotal * (finalDiscountPercentage / 100);
  const totalAmount = subtotal - discountAmount;

  const handleAuthorizeSale = async (e: FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Please add at least one vehicle part component to the checkout cart.");
      return;
    }
    setLoading(true);

    try {
      await onSave({
        customerId: Number(selectedCustomerId),
        items: cartItems.map(item => ({ partId: item.partId, quantity: item.quantity })),
        discountPercentage: finalDiscountPercentage,
        totalAmount: totalAmount,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 32, width: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", boxSizing: "border-box" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShoppingCart className="w-5 h-5 text-gray-800" />
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Authorize POS Part Sale</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleAuthorizeSale} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Customer Selection */}
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

          {/* Sourcing/Selecting Parts Area */}
          <div style={{ border: "1px solid #E5E7EB", padding: 16, borderRadius: 12, background: "#FAFAFA" }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: "#4B5563", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sourcing Components</span>
            
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, alignItems: "end" }}>
              
              {/* Part Search input */}
              <div style={{ position: "relative" }}>
                <label style={{ fontSize: 9.5, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 4 }}>Select Part</label>
                <input 
                  type="text" 
                  placeholder="Type to search component..."
                  value={partSearchQuery}
                  onChange={e => {
                    setPartSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  style={{ width: "100%", padding: 10, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 12.5, outline: "none", boxSizing: "border-box", background: "#FFFFFF" }}
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
                          style={{ padding: "10px 12px", fontSize: 12.5, cursor: "pointer", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center", background: selectedPart?.id === p.id ? "#F9FAFB" : "none" }}
                        >
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                          <span style={{ color: "#10B981", fontWeight: 700 }}>RS {p.price.toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: 12, fontSize: 12, color: "#9CA3AF", textAlign: "center" }}>
                        No parts found.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label style={{ fontSize: 9.5, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 4 }}>Quantity</label>
                <input 
                  type="number" 
                  min={1} 
                  value={quantityInput}
                  onChange={e => setQuantityInput(parseInt(e.target.value) || 1)}
                  style={{ width: "100%", padding: 10, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 12.5, outline: "none", boxSizing: "border-box", background: "#FFFFFF" }}
                />
              </div>

              {/* Add Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedPart}
                style={{ padding: "10.5px 12px", background: selectedPart ? "#111827" : "#E5E7EB", color: selectedPart ? "#FFFFFF" : "#9CA3AF", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: selectedPart ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
              >
                <Plus className="w-4 h-4" /> Add Part
              </button>

            </div>
          </div>

          {/* POS Cart Ledger */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Checkout Cart ({cartItems.length} items)
            </label>
            <div style={{ border: "1.5px solid #E5E7EB", borderRadius: 12, overflow: "hidden", maxHeight: 180, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB", borderBottom: "1.5px solid #E5E7EB", color: "#6B7280", fontWeight: 700 }}>
                    <th style={{ padding: "8px 12px" }}>Component</th>
                    <th style={{ padding: "8px 12px", textAlign: "center" }}>Qty</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>Price</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>Total</th>
                    <th style={{ padding: "8px 12px", width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#9CA3AF" }}>
                        Checkout cart is empty. Sourced components will list here.
                      </td>
                    </tr>
                  ) : (
                    cartItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600 }}>{item.partName}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700 }}>{item.quantity}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>RS {item.price.toFixed(2)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700 }}>RS {(item.price * item.quantity).toFixed(2)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveFromCart(item.partId)}
                            style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 4 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discount Override Selection */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Staff Discount Code Override</label>
            <select 
              value={discountPercentage}
              onChange={e => setDiscountPercentage(parseInt(e.target.value))}
              style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, background: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
            >
              <option value={0}>0% (None)</option>
              <option value={5}>5% Special Discount</option>
              <option value={10}>10% Special Discount</option>
              <option value={20}>20% High-Priority Client Override</option>
            </select>
          </div>

          {/* POS Summary */}
          {cartItems.length > 0 && (
            <div style={{ padding: 16, background: "#F9FAFB", borderRadius: 12, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#6B7280" }}>Subtotal:</span>
                <span style={{ fontWeight: 700 }}>RS {subtotal.toFixed(2)}</span>
              </div>
              {autoLoyaltyDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                  <span style={{ color: "#10B981", fontWeight: 700 }}>Loyalty Discount (Sub &gt; 5000):</span>
                  <span style={{ color: "#10B981", fontWeight: 800, background: "#D1FAE5", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>10% Off Applied</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#6B7280" }}>Discount Applied:</span>
                <span style={{ fontWeight: 700, color: "#EF4444" }}>
                  -RS {discountAmount.toFixed(2)} {finalDiscountPercentage > 0 && `(${finalDiscountPercentage}%)`}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E5E7EB", paddingTop: 8, fontSize: 14, fontWeight: 800 }}>
                <span>Total Amount:</span>
                <span>RS {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, border: "1.5px solid #E5E7EB", borderRadius: 8, background: "#FFFFFF", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
            <button type="submit" disabled={loading || cartItems.length === 0} style={{ flex: 1, padding: 12, background: cartItems.length > 0 ? "#111827" : "#9CA3AF", color: "#FFFFFF", border: "none", borderRadius: 8, cursor: cartItems.length > 0 ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>
              {loading ? "Authorizing..." : "Authorize Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
