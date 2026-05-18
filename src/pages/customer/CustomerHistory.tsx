import { useState } from 'react';
import type { FC } from 'react';
import { 
  Star, 
  CheckCircle2, 
  AlertTriangle,
  ShoppingBag
} from 'lucide-react';
import customerService from '../../services/customerService';

export interface ServiceHistoryItem {
  appointmentDate: string;
  vehicleName: string;
  licensePlate: string;
  notes?: string;
  status: string;
}

export interface TransactionItem {
  date: string;
  orderId: string;
  title: string;
  price: string;
}

interface CustomerHistoryProps {
  customerId: number | null;
  dbServiceHistory: ServiceHistoryItem[];
  transactions: TransactionItem[];
  fetchData: () => void;
}

export const CustomerHistory: FC<CustomerHistoryProps> = ({
  customerId,
  dbServiceHistory,
  transactions,
  fetchData
}) => {
  const [activeHistoryTab, setActiveHistoryTab] = useState<'services' | 'purchases'>('services');
  const [searchQuery, setSearchQuery] = useState('');

  // Service Feedback Modal States
  const [selectedAppointmentForReview, setSelectedAppointmentForReview] = useState<ServiceHistoryItem | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !selectedAppointmentForReview) return;

    try {
      setReviewLoading(true);
      setReviewError(null);
      setReviewSuccess(null);

      const res = await customerService.submitReview(customerId, {
        rating: reviewRating,
        comment: reviewComment
      });

      setReviewSuccess(res.message || "Feedback submitted! Thank you for helping us maintain precision.");
      setReviewComment('');
      
      setTimeout(() => {
        setSelectedAppointmentForReview(null);
        setReviewSuccess(null);
      }, 2000);

      fetchData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setReviewError(err.response?.data?.message || err.message || "Failed to submit feedback");
    } finally {
      setReviewLoading(false);
    }
  };

  const filteredServices = dbServiceHistory.filter(item => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      (item.vehicleName && item.vehicleName.toLowerCase().includes(term)) ||
      (item.notes && item.notes.toLowerCase().includes(term)) ||
      (item.status && item.status.toLowerCase().includes(term))
    );
  });

  const filteredPurchases = transactions.filter(tx => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      (tx.title && tx.title.toLowerCase().includes(term)) ||
      (tx.orderId && tx.orderId.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-tertiary">Self-Service Records</p>
        <h2 className="text-4xl font-heading font-extrabold tracking-tighter mt-1">Transaction History & Service Reviews</h2>
        <p className="text-primary/60 font-medium text-sm mt-2 max-w-2xl">
          Review your comprehensive diagnostics log book, print completed parts sales receipts, and rate finished mechanic work orders.
        </p>
      </div>

      {/* Segment switcher & Search block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-3xl border border-secondary/20 shadow-sm">
        <div className="flex gap-2 bg-[#F5F5F3] p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveHistoryTab('services')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeHistoryTab === 'services' ? 'bg-black text-neutral shadow-lg' : 'text-primary/60 hover:text-primary'}`}
          >
            Service Records ({dbServiceHistory.length})
          </button>
          <button
            onClick={() => setActiveHistoryTab('purchases')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeHistoryTab === 'purchases' ? 'bg-black text-neutral shadow-lg' : 'text-primary/60 hover:text-primary'}`}
          >
            Parts Purchases ({transactions.length})
          </button>
        </div>

        <input
          type="text"
          placeholder="Filter logs by search keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 bg-[#F5F5F3] border-none rounded-2xl py-3 px-5 text-xs font-bold transition-all outline-none"
        />
      </div>

      {/* History Ledger Table */}
      <div className="bg-white rounded-4xl border border-secondary/20 shadow-sm overflow-hidden">
        {activeHistoryTab === 'services' ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px] text-left">
              <thead>
                <tr className="bg-black text-neutral">
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest pl-8">Date</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Asset Details</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Notes / Symptoms</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Database Status</th>
                  <th className="p-5 text-[10px] font-black tracking-widest text-right pr-8">Precision Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10 font-medium text-sm">
                {filteredServices.length > 0 ? (
                  filteredServices.map((item, index) => (
                    <tr key={index} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="p-5 pl-8 text-tertiary font-bold">{new Date(item.appointmentDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</td>
                      <td className="p-5 font-black text-primary uppercase tracking-tight">
                        {item.vehicleName} <span className="block text-[10px] font-bold text-tertiary tracking-normal mt-0.5">{item.licensePlate}</span>
                      </td>
                      <td className="p-5 text-primary/75 max-w-[300px] truncate">{item.notes || "Standard multi-point inspection checkup."}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${item.status === 'Completed' || item.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-[#F5F5F3] text-tertiary'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-5 text-right pr-8">
                        {item.status === 'Completed' || item.status === 'COMPLETED' ? (
                          <button 
                            onClick={() => setSelectedAppointmentForReview(item)}
                            className="bg-black text-neutral px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral hover:text-black border border-black transition-all active:scale-95"
                          >
                            Leave Review
                          </button>
                        ) : (
                          <span className="text-xs text-tertiary font-bold italic">Review Available Post-Service</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-tertiary font-bold uppercase tracking-widest text-xs">No active service records logged in database</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px] text-left">
              <thead>
                <tr className="bg-black text-neutral">
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest pl-8">Date</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Order ID</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Purchased Component</th>
                  <th className="p-5 text-[10px] font-black tracking-widest text-right pr-8">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10 font-medium text-sm">
                {filteredPurchases.length > 0 ? (
                  filteredPurchases.map((tx, index) => (
                    <tr key={index} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="p-5 pl-8 text-tertiary font-bold">{tx.date}</td>
                      <td className="p-5 font-black text-primary uppercase tracking-tight">{tx.orderId}</td>
                      <td className="p-5 text-primary/75">
                        <div className="flex items-center gap-3 font-bold">
                          <ShoppingBag className="w-4 h-4 text-tertiary" />
                          {tx.title}
                        </div>
                      </td>
                      <td className="p-5 text-right pr-8 font-black text-green-600">RS {tx.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-tertiary font-bold uppercase tracking-widest text-xs">No recent parts purchases logged</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Service Quality Feedback Modal Overlay */}
      {selectedAppointmentForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-10 rounded-4xl border border-secondary/20 shadow-2xl max-w-xl w-full relative space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-secondary/10">
              <div className="w-12 h-12 bg-black text-neutral rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </div>
              <div>
                <h3 className="text-2xl font-heading font-extrabold tracking-tight">Service Quality Review</h3>
                <p className="text-xs text-tertiary font-medium">Your feedback ensures our workshop operations maintain highest precision standards.</p>
              </div>
            </div>

            {reviewSuccess && (
              <div className="p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-3 border border-green-200">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold">{reviewSuccess}</p>
              </div>
            )}

            {reviewError && (
              <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 border border-red-200">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold">{reviewError}</p>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Selected Work Order */}
              <div className="p-4 bg-[#F5F5F3] rounded-2xl">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-tertiary">Completed Service Record</p>
                <p className="text-sm font-black text-primary uppercase mt-1">{selectedAppointmentForReview.vehicleName} — {selectedAppointmentForReview.notes || "Standard Inspection"}</p>
              </div>

              {/* Interactive Stars Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Overall Satisfaction</label>
                  <span className="text-sm font-black text-primary">0{reviewRating} / 05</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="hover:scale-115 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-secondary/40'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Technical Comments & Observations</label>
                <textarea 
                  rows={3}
                  placeholder="Describe the performance improvements or any remaining mechanical issues..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-[#F5F5F3] border-none rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-primary/10 font-medium transition-all outline-none resize-none placeholder:text-tertiary"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedAppointmentForReview(null)}
                  className="w-full bg-[#F5F5F3] text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#EDEDED] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full bg-black text-neutral py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  {reviewLoading ? "PROBING DI..." : "Submit Quality Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
