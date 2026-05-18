import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { 
  Calendar, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  Info 
} from 'lucide-react';
import customerService from '../../services/customerService';
import type { Vehicle } from '../../services/dashboardService';

interface CustomerServicesProps {
  customerId: number | null;
  vehicles: Vehicle[];
  fetchData: () => void;
}

export const CustomerServices: FC<CustomerServicesProps> = ({
  customerId,
  vehicles,
  fetchData
}) => {
  // Appointment Form States
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('09:00');
  const [appointmentNotes, setAppointmentNotes] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);

  // Part Request Form States
  const [partName, setPartName] = useState<string>('');
  const [partUrgency, setPartUrgency] = useState<string>('Priority');
  const [partSuccess, setPartSuccess] = useState<string | null>(null);
  const [partError, setPartError] = useState<string | null>(null);
  const [partLoading, setPartLoading] = useState<boolean>(false);

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedVehicleId(vehicles[0].id.toString());
    }
  }, [vehicles, selectedVehicleId]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setBookingError("No customer profile found. Please register first.");
      return;
    }
    if (!appointmentDate || !selectedVehicleId) {
      setBookingError("Please select a date and specify your vehicle.");
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);
      setBookingSuccess(null);

      // Combine Date & Time into single DateTime ISO String
      const fullDateTime = `${appointmentDate}T${appointmentTime}:00`;
      
      const payload = {
        appointmentDate: new Date(fullDateTime).toISOString(),
        vehicleId: parseInt(selectedVehicleId),
        notes: appointmentNotes
      };

      const res = await customerService.bookAppointment(customerId, payload);
      setBookingSuccess(res.message || "Appointment scheduled successfully!");
      setAppointmentNotes('');
      
      // Refresh parent dashboard stats
      fetchData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setBookingError(err.response?.data?.message || err.message || "Failed to book appointment");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleRequestPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setPartError("No customer profile found.");
      return;
    }
    if (!partName.trim()) {
      setPartError("Please enter a part name.");
      return;
    }

    try {
      setPartLoading(true);
      setPartError(null);
      setPartSuccess(null);

      const res = await customerService.submitPartRequest(customerId, {
        partName: `${partName.trim()} (${partUrgency} Urgency)`
      });

      setPartSuccess(res.message || "Rare part sourced and queued successfully!");
      setPartName('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setPartError(err.response?.data?.message || err.message || "Failed to submit part request");
    } finally {
      setPartLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-8 animate-fade-in">
      {/* Intro Header */}
      <div className="col-span-12">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-tertiary">Industrial Operations Portal</p>
        <h2 className="text-4xl font-heading font-extrabold tracking-tighter mt-1">Customer Scheduler & Sourcing Hub</h2>
        <p className="text-primary/60 font-medium text-sm mt-2 max-w-2xl">
          Configure your service intervals directly on database schedules, or request custom components that are currently out of stock.
        </p>
      </div>

      {/* Left Side: Scheduling Form */}
      <div className="col-span-12 lg:col-span-7 bg-white rounded-4xl p-10 border border-secondary/20 shadow-sm space-y-8">
        <div className="flex items-center gap-4 pb-4 border-b border-secondary/10">
          <div className="w-12 h-12 bg-black text-neutral rounded-2xl flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-heading font-extrabold tracking-tight">Service Scheduling</h3>
            <p className="text-xs text-tertiary font-medium">Select a precision maintenance window for your engine inspection.</p>
          </div>
        </div>

        {bookingSuccess && (
          <div className="p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-3 border border-green-200">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{bookingSuccess}</p>
          </div>
        )}

        {bookingError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 border border-red-200">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{bookingError}</p>
          </div>
        )}

        <form onSubmit={handleBookAppointment} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Select Fleet Vehicle</label>
              <select 
                value={selectedVehicleId} 
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-[#F5F5F3] border-none rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-primary/10 font-bold transition-all outline-none"
              >
                {vehicles.length > 0 ? (
                  vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name} (Odo: {v.odometer})</option>
                  ))
                ) : (
                  <option value="">No registered vehicles found</option>
                )}
              </select>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Desired Maintenance Date</label>
              <input 
                type="date" 
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#F5F5F3] border-none rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-primary/10 font-bold transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Select Time Interval</label>
              <select 
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full bg-[#F5F5F3] border-none rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-primary/10 font-bold transition-all outline-none"
              >
                <option value="09:00">09:00 AM (Available)</option>
                <option value="11:30">11:30 AM (Available)</option>
                <option value="13:30">01:30 PM (Priority Slot)</option>
                <option value="15:30">03:30 PM (Late Shift)</option>
              </select>
            </div>

            {/* Estimated Price Card (Visual) */}
            <div className="bg-[#1A1A1A] text-neutral p-5 rounded-3xl flex items-center justify-between shadow-inner">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral/50">Base Diagnostics Quote</p>
                <p className="text-2xl font-heading font-extrabold mt-1">RS 4,500.00</p>
              </div>
              <div className="px-3.5 py-1.5 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral">Nominal Price</div>
            </div>
          </div>

          {/* Maintenance Notes */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Technical Notes / Service Description</label>
            <textarea 
              rows={4}
              placeholder="Describe the issues, symptoms, or maintenance checkups required (e.g. Engine vibrations, noise in rear suspension, annual oil filter change...)"
              value={appointmentNotes}
              onChange={(e) => setAppointmentNotes(e.target.value)}
              className="w-full bg-[#F5F5F3] border-none rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-primary/10 font-medium transition-all outline-none resize-none placeholder:text-tertiary"
            />
          </div>

          <button 
            type="submit" 
            disabled={bookingLoading}
            className="w-full bg-black text-neutral py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
          >
            {bookingLoading ? "PROBING DATABASE..." : "Confirm & Schedule Appointment"}
          </button>
        </form>
      </div>

      {/* Right Side: Specialized Parts Sourcing Card */}
      <div className="col-span-12 lg:col-span-5 bg-white rounded-4xl p-10 border border-secondary/20 shadow-sm flex flex-col justify-between space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-secondary/10">
            <div className="w-12 h-12 bg-neutral text-black rounded-2xl flex items-center justify-center shadow-lg border border-secondary/35">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-extrabold tracking-tight">Specialized Parts Request</h3>
              <p className="text-xs text-tertiary font-medium">Request components currently not listed in active system stock.</p>
            </div>
          </div>

          {partSuccess && (
            <div className="p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-3 border border-green-200">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">{partSuccess}</p>
            </div>
          )}

          {partError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 border border-red-200">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">{partError}</p>
            </div>
          )}

          <form onSubmit={handleRequestPart} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Component Name / SKU Details</label>
              <input 
                type="text" 
                placeholder="e.g. Forged Titanium Piston Rings, V8 Seal Gasket"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                className="w-full bg-[#F5F5F3] border-none rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-primary/10 font-bold transition-all outline-none"
              />
            </div>

            {/* Urgency Level chips */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Procurement Urgency</label>
              <div className="grid grid-cols-3 gap-3">
                {['Standard', 'Priority', 'Critical'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPartUrgency(level)}
                    className={`py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${partUrgency === level ? 'bg-black text-neutral border-black' : 'bg-transparent text-primary border-secondary/30 hover:bg-[#F5F5F3]'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={partLoading}
              className="w-full bg-secondary/15 text-primary border border-secondary/30 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all active:scale-95 disabled:opacity-50"
            >
              {partLoading ? "QUEUING SOURCING..." : "Submit Parts Sourcing Request"}
            </button>
          </form>
        </div>

        <div className="p-6 bg-[#F5F5F3] rounded-3xl flex gap-4 items-start">
          <Info className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.1em] text-primary">Procurement System Guarantee</p>
            <p className="text-[11px] text-tertiary font-medium mt-1 leading-relaxed">
              Sourced parts will be transactionally processed, cataloged, and held for a maximum of 14 days under your customer profile once they arrive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
