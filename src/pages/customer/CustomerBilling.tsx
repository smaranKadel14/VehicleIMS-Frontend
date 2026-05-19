import { useEffect, useState, useMemo } from "react";
import customerService from "../../services/customerService";
import type { SalesInvoiceResponse } from "../../services/customerService";
import {
  CreditCard,
  Receipt,
  TrendingUp,
  Printer,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";

interface CustomerBillingProps {
  customerId: number | null;
  onBackToDashboard?: () => void;
}

export default function CustomerBilling({ customerId, onBackToDashboard }: CustomerBillingProps) {
  const [invoices, setInvoices] = useState<SalesInvoiceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Search
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selected invoice for the slide-out receipt drawer
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoiceResponse | null>(null);

  const fetchInvoices = async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await customerService.getCustomerInvoices(customerId);
      setInvoices(res || []);
    } catch (err) {
      console.error("Failed to load customer sales invoices:", err);
      setError("Unable to retrieve billing and invoice history records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [customerId]);

  // Financial calculations
  const stats = useMemo(() => {
    let outstanding = 0;
    let paid = 0;
    let total = 0;

    invoices.forEach((inv) => {
      total += inv.finalTotal;
      if (inv.isPaid) {
        paid += inv.finalTotal;
      } else {
        outstanding += inv.finalTotal;
      }
    });

    const progress = total > 0 ? Math.round((paid / total) * 100) : 100;

    return {
      outstanding,
      paid,
      total,
      progress,
    };
  }, [invoices]);

  // Filtered & Searched list
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inv.items.some(item => item.partName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "all" ||
                            (statusFilter === "paid" && inv.isPaid) ||
                            (statusFilter === "unpaid" && !inv.isPaid);
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-black/10 border-t-black animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Connecting to Enginecore Ledger...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in">
      {/* Dynamic Style Injection for Clean Invoice Printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice-drawer, #printable-invoice-drawer * {
            visibility: visible;
          }
          #printable-invoice-drawer {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border: none;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-secondary/15 pb-6">
        <div>
          <div className="flex items-center gap-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-secondary/20 hover:bg-neutral hover:text-black transition-all text-tertiary"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-3xl font-heading font-extrabold text-primary tracking-tight">
              Billing Ledger & Statements
            </h2>
          </div>
          <p className="text-xs text-tertiary mt-1">Review accounts summaries, clear outstanding balances, and export invoice records.</p>
        </div>

        <button 
          onClick={fetchInvoices}
          className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-white border border-secondary/30 rounded-xl hover:bg-neutral hover:text-black transition-all shadow-sm flex items-center gap-2"
        >
          <Clock className="w-3.5 h-3.5" />
          Refresh Ledger
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Outstanding Card */}
        <div className="card rounded-2xl bg-white border border-secondary/10 p-6 shadow-sm flex flex-col justify-between group hover:border-amber-500/30 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-tertiary">Outstanding Balance</span>
              <h3 className="text-3xl font-heading font-black tracking-tight text-primary">
                ${stats.outstanding.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100 group-hover:scale-105 transition-all">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-secondary/10 flex items-center justify-between text-[10px] font-bold text-tertiary tracking-wider">
            <span>UNPAID DEBTS</span>
            <span className="text-amber-600">Pending Review</span>
          </div>
        </div>

        {/* Paid Card */}
        <div className="card rounded-2xl bg-white border border-secondary/10 p-6 shadow-sm flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-tertiary">Cleared Payments</span>
              <h3 className="text-3xl font-heading font-black tracking-tight text-primary">
                ${stats.paid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-all">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-secondary/10 flex items-center justify-between text-[10px] font-bold text-tertiary tracking-wider">
            <span>TOTAL EXPENDITURE</span>
            <span className="text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Fully Cleared
            </span>
          </div>
        </div>

        {/* Billing Progress Card */}
        <div className="card rounded-2xl bg-[#151515] p-6 shadow-md flex flex-col justify-between text-white col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#88888b]">Ledger Clearance</span>
              <h3 className="text-3xl font-heading font-black tracking-tight text-white">
                {stats.progress}%
              </h3>
            </div>
            <div className="p-3 bg-white/10 rounded-xl text-white">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500" 
                style={{ width: `${stats.progress}%` }} 
              />
            </div>
            <div className="flex items-center justify-between text-[9px] font-black tracking-widest text-[#88888b]">
              <span>LEDGER COMPLETED</span>
              <span className="text-white">{invoices.length} TOTAL INVOICES</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Filter Table Section */}
      <section className="card rounded-2xl bg-white border border-secondary/10 shadow-sm overflow-hidden">
        {/* Controls Header */}
        <div className="p-5 border-b border-secondary/15 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[#fcfcfb]">
          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${statusFilter === "all" ? "bg-black text-white" : "bg-[#f5f5f3] hover:bg-[#eaeaea] text-tertiary"}`}
            >
              All Invoices
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${statusFilter === "paid" ? "bg-emerald-600 text-white" : "bg-[#f5f5f3] hover:bg-[#eaeaea] text-tertiary"}`}
            >
              Cleared
            </button>
            <button
              onClick={() => setStatusFilter("unpaid")}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${statusFilter === "unpaid" ? "bg-amber-600 text-white" : "bg-[#f5f5f3] hover:bg-[#eaeaea] text-tertiary"}`}
            >
              Outstanding
            </button>
          </div>

          {/* Text Filter Input */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search invoice number or parts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f5f5f3] border border-secondary/20 rounded-xl px-4 py-2 text-xs font-semibold text-primary focus:outline-none focus:border-black/50 transition-all placeholder:text-tertiary"
            />
          </div>
        </div>

        {/* Invoice Grid Table */}
        {filteredInvoices.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center bg-[#fcfcfb]">
            <Receipt className="w-12 h-12 text-secondary/40 mb-3" />
            <h4 className="text-sm font-black uppercase tracking-wider text-primary">No invoices found</h4>
            <p className="text-xs text-tertiary mt-1">There are no records in the billing ledger matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-secondary/15 text-[10px] font-black uppercase tracking-widest text-tertiary bg-[#f5f5f3]">
                  <th className="py-4 px-6">Invoice ID</th>
                  <th className="py-4 px-6">Issue Date</th>
                  <th className="py-4 px-6">Item Count</th>
                  <th className="py-4 px-6 text-right">Subtotal</th>
                  <th className="py-4 px-6 text-right">Deductions</th>
                  <th className="py-4 px-6 text-right">Total Amount</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {filteredInvoices.map((inv) => (
                  <tr 
                    key={inv.id}
                    className="hover:bg-[#fcfcfb] text-xs font-semibold text-primary transition-all"
                  >
                    <td className="py-4.5 px-6 font-mono font-bold tracking-wider">{inv.invoiceNumber}</td>
                    <td className="py-4.5 px-6 text-tertiary">
                      {new Date(inv.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="py-4.5 px-6 font-bold">{inv.items.length} parts</td>
                    <td className="py-4.5 px-6 text-right font-mono text-tertiary">${inv.subTotal.toFixed(2)}</td>
                    <td className="py-4.5 px-6 text-right font-mono text-rose-600">
                      {inv.discountPercentage > 0 ? (
                        <span>-{inv.discountPercentage}% (-${inv.discountAmount.toFixed(2)})</span>
                      ) : (
                        <span className="text-tertiary italic font-normal">-</span>
                      )}
                    </td>
                    <td className="py-4.5 px-6 text-right font-mono font-black text-primary">${inv.finalTotal.toFixed(2)}</td>
                    <td className="py-4.5 px-6 text-center">
                      {inv.isPaid ? (
                        <span className="inline-block px-3 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full">
                          Cleared
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 rounded-full">
                          Outstanding
                        </span>
                      )}
                    </td>
                    <td className="py-4.5 px-6 text-center">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-black text-white hover:bg-neutral hover:text-black border border-black rounded-lg transition-all shadow-sm"
                      >
                        View Statement
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>

    {/* Printable Receipt Drawer Modal */}
    {selectedInvoice && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          {/* Dismiss Overlay */}
          <div 
            onClick={() => setSelectedInvoice(null)} 
            className="absolute inset-0 cursor-default no-print" 
          />

          {/* Modal Content */}
          <div 
            id="printable-invoice-drawer"
            className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left border-l border-secondary/20 z-50 p-6 sm:p-10"
          >
            {/* Header controls (No print) */}
            <div className="flex items-center justify-between border-b border-secondary/15 pb-6 mb-8 no-print">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">Invoice Statement</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="p-2 border border-secondary/20 rounded-xl hover:bg-neutral hover:text-black text-tertiary transition-all"
                  title="Print Statement"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 border border-secondary/20 rounded-xl hover:bg-neutral hover:text-black text-tertiary transition-all"
                  title="Close Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Statement Frame */}
            <div className="flex-1 space-y-8">
              {/* Branded Letterhead */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-start pb-6 border-b border-dashed border-secondary/20">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black tracking-tight text-primary uppercase font-heading">
                    EngineCore <span className="font-normal text-tertiary font-sans">Industrial</span>
                  </h1>
                  <p className="text-[10px] text-tertiary uppercase font-black tracking-widest">Global Parts Logistics & Maintenance</p>
                </div>
                <div className="text-right sm:text-right space-y-1">
                  <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${selectedInvoice.isPaid ? 'text-emerald-800 bg-emerald-50 border border-emerald-100' : 'text-amber-800 bg-amber-50 border border-amber-100'}`}>
                    {selectedInvoice.isPaid ? 'Payment Status: PAID' : 'Payment Status: OUTSTANDING'}
                  </span>
                  <p className="text-xs font-mono font-bold text-tertiary mt-2">INVOICE: {selectedInvoice.invoiceNumber}</p>
                </div>
              </div>

              {/* Customer and Vendor Registry */}
              <div className="grid gap-6 sm:grid-cols-2 text-xs">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-tertiary mb-2">Billed From Vendor</p>
                  <div className="font-semibold text-primary space-y-1">
                    <p className="font-black text-sm">EngineCore Solutions Inc.</p>
                    <p>Building 40, Industrial Logistics Hub</p>
                    <p>Kathmandu, Nepal</p>
                    <p className="font-mono text-tertiary">support@enginecore.global</p>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-tertiary mb-2">Billed To Client</p>
                  <div className="font-semibold text-primary space-y-1">
                    <p className="font-black text-sm">{selectedInvoice.customerName}</p>
                    <p>Customer ID: EC-{selectedInvoice.customerId}-CUST</p>
                    <p>Date: {new Date(selectedInvoice.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    <p className="font-mono text-tertiary">Registered Corporate Profile</p>
                  </div>
                </div>
              </div>

              {/* Itemized Parts Sheet */}
              <div className="space-y-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-tertiary">Itemized Maintenance Sheet</p>
                <div className="border border-secondary/15 rounded-2xl overflow-hidden bg-[#fcfcfb]">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-secondary/15 text-[9px] font-black uppercase tracking-widest text-tertiary bg-[#f5f5f3]">
                        <th className="py-3 px-4">Part Description</th>
                        <th className="py-3 px-4 text-center">Quantity</th>
                        <th className="py-3 px-4 text-right">Unit Price</th>
                        <th className="py-3 px-4 text-right">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id} className="font-semibold text-primary">
                          <td className="py-3.5 px-4 font-black">{item.partName} <span className="font-mono font-medium text-[10px] text-tertiary block mt-0.5">Part ID: #{item.partId}</span></td>
                          <td className="py-3.5 px-4 text-center font-bold text-tertiary">{item.quantity}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-tertiary">${item.unitPrice.toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-black">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation breakdown */}
              <div className="flex justify-end pt-4">
                <div className="w-full max-w-xs space-y-3 text-xs font-semibold">
                  <div className="flex items-center justify-between text-tertiary">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold">${selectedInvoice.subTotal.toFixed(2)}</span>
                  </div>

                  {selectedInvoice.discountPercentage > 0 && (
                    <div className="flex items-center justify-between text-rose-600">
                      <span>Deductions ({selectedInvoice.discountPercentage}%)</span>
                      <span className="font-mono font-bold">-${selectedInvoice.discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-dashed border-secondary/20 pt-3 text-sm font-black text-primary">
                    <span>Total Amount Billed</span>
                    <span className="font-mono text-base font-black">${selectedInvoice.finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions footer */}
            <div className="border-t border-dashed border-secondary/20 pt-6 mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between text-[10px] font-bold text-tertiary tracking-widest no-print">
              <span>AUTHORIZED LEDGER STATEMENT</span>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 border border-secondary/30 rounded-xl hover:bg-neutral hover:text-black transition-all"
                >
                  Dismiss Drawer
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-black text-white border border-black hover:bg-neutral hover:text-black rounded-xl transition-all flex items-center gap-2 shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
