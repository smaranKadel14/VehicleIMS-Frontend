import { useState, useRef, type FC } from "react";
import {
  Car,
  Plus,
  Trash2,
  Edit2,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import customerService, { type VehicleResponse } from "../../services/customerService";
import { optimizeAndConvertToBase64 } from "../../utils/fileHelper";
import truckImg from "../../assets/customer-img/GT.png";
import { Modal } from "../../components/ui/Modal";

interface CustomerVehiclesProps {
  customerId: number | null;
  vehicles: VehicleResponse[];
  fetchData: () => void;
}

export const CustomerVehicles: FC<CustomerVehiclesProps> = ({
  customerId,
  vehicles,
  fetchData,
}) => {
  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleResponse | null>(null);

  // Form states
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [vin, setVin] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // UI States
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setMake("");
    setModel("");
    setYear(new Date().getFullYear());
    setVin("");
    setLicensePlate("");
    setImageBase64(null);
    setErrorMsg(null);
  };

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (vehicle: VehicleResponse) => {
    setEditingVehicle(vehicle);
    setMake(vehicle.make);
    setModel(vehicle.model);
    setYear(vehicle.year);
    setVin(vehicle.vin);
    setLicensePlate(vehicle.licensePlate);
    setImageBase64(vehicle.image || null);
    setErrorMsg(null);
    setIsOpen(true);
  };

  // Image Upload Handlers
  const handleImageFile = async (file: File) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const optimizedBase64 = await optimizeAndConvertToBase64(file, 600, 600, 0.75);
      setImageBase64(optimizedBase64);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process image file.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  // CRUD Submission logic
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setErrorMsg("No active customer profile identified.");
      return;
    }

    if (!make.trim() || !model.trim() || !licensePlate.trim() || !vin.trim()) {
      setErrorMsg("Please complete all required fields (*).");
      return;
    }

    if (vin.trim().length !== 17) {
      setErrorMsg("VIN Code must be exactly 17 alphanumeric characters.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const payload = {
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        vin: vin.trim().toUpperCase(),
        licensePlate: licensePlate.trim().toUpperCase(),
        image: imageBase64 || "",
      };

      if (editingVehicle) {
        await customerService.updateVehicle(customerId, editingVehicle.id, payload);
        setSuccessMsg("Vehicle details successfully synchronized!");
      } else {
        await customerService.addVehicle(customerId, payload);
        setSuccessMsg("New fleet asset successfully registered!");
      }

      fetchData();
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMsg(null);
        resetForm();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          "Failed to synchronize asset data with the ledger."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!customerId) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      await customerService.deleteVehicle(customerId, vehicleId);
      setSuccessMsg("Asset decommissioned successfully!");
      setDeleteConfirmId(null);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to remove asset from database."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-fade-in pb-12">
      {/* Upper header action section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-primary">
            My Garage
          </h1>
          <p className="mt-2 text-base text-primary/70 font-medium">
            Manage your registered industrial fleet vehicles, specifications, and service identities.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl hover:bg-neutral-800 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Fleet Asset
        </button>
      </div>

      {/* Global alert notifications */}
      {successMsg && (
        <div className="p-4.5 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-3 text-emerald-800 text-xs font-extrabold uppercase tracking-widest shadow-sm animate-scale-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4.5 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-3 text-rose-800 text-xs font-extrabold uppercase tracking-widest shadow-sm animate-scale-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Garage fleet grid */}
      {vehicles.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-secondary/40 rounded-4xl p-16 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-secondary/15 rounded-3xl flex items-center justify-center mx-auto text-primary/50">
            <Car className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-heading font-extrabold tracking-tighter">Your Garage is Empty</h3>
          <p className="text-primary/60 font-medium max-w-md mx-auto leading-relaxed">
            No registered assets are currently tied to your EngineCore maintenance contract. Get started by registering your first vehicle.
          </p>
          <button
            onClick={handleOpenAdd}
            className="bg-black text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-800 hover:shadow-lg transition-all"
          >
            Register Primary Vehicle
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-3xl border border-secondary/20 shadow-sm overflow-hidden flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Card visual wrapper */}
              <div className="p-6 space-y-5">
                <div className="aspect-[16/9] w-full rounded-2xl bg-secondary/10 overflow-hidden relative border border-secondary/10 flex items-center justify-center">
                  <img
                    src={vehicle.image || truckImg}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className={`w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-105 ${
                      !vehicle.image ? "scale-90 opacity-80" : ""
                    }`}
                  />
                  <div className="absolute top-3 right-3 rounded-lg bg-black/85 backdrop-blur px-2.5 py-1 text-[10px] font-black font-mono tracking-wider text-white uppercase">
                    {vehicle.year}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-heading text-xl font-extrabold tracking-tight group-hover:text-black/85 transition-colors">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-primary/65 font-bold">
                    <Car className="w-3.5 h-3.5" />
                    <span>Industrial Class Asset</span>
                  </div>
                </div>

                {/* Technical data table */}
                <div className="space-y-3 pt-3 border-t border-secondary/15">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold uppercase tracking-wider text-primary/50 text-[10px]">
                      LICENSE PLATE
                    </span>
                    <span className="font-mono font-bold text-primary bg-secondary/10 px-2 py-0.5 rounded-lg border border-secondary/20 select-all">
                      {vehicle.licensePlate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold uppercase tracking-wider text-primary/50 text-[10px]">
                      VIN / CHASSIS
                    </span>
                    <span className="font-mono text-primary/80 font-bold select-all">
                      {vehicle.vin}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action operations panel */}
              <div className="bg-secondary/15 border-t border-secondary/20 p-4 flex gap-2">
                {deleteConfirmId === vehicle.id ? (
                  <div className="flex w-full items-center gap-2 animate-scale-in">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex-1">
                      CONFIRM DELETION?
                    </span>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="bg-white hover:bg-secondary/20 text-primary border border-secondary/30 px-3.5 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleOpenEdit(vehicle)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-secondary/10 text-primary border border-secondary/35 py-3 rounded-xl text-xs font-bold transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-primary/60" />
                      Edit Asset
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(vehicle.id)}
                      className="p-3 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-secondary/35 rounded-xl transition-all"
                      title="Decommission vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Reusable premium Modal */}
    <Modal
      isOpen={isOpen}
      title={editingVehicle ? "Modify Asset Record" : "Register Fleet Asset"}
      onClose={() => setIsOpen(false)}
      size="lg"
    >
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold uppercase tracking-wider animate-scale-in">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Drag-and-drop Image Uploader */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">
            VEHICLE ILLUSTRATION / PHOTO
          </label>

          {imageBase64 ? (
            <div className="relative aspect-[16/7] w-full rounded-2xl overflow-hidden border border-secondary/30 shadow-sm animate-scale-in">
              <img
                src={imageBase64}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImageBase64(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 backdrop-blur text-white flex items-center justify-center hover:bg-black transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? "border-black bg-secondary/10"
                  : "border-secondary/40 hover:border-primary hover:bg-secondary/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center text-primary/60">
                {loading ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-xs font-extrabold text-primary uppercase tracking-wider">
                  Drag & Drop or Click to Select File
                </p>
                <p className="text-[10px] text-primary/50 font-bold mt-1 uppercase">
                  Optimized browser compression will apply automatically (JPEG, PNG, WebP)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Specification Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">
              Make / Brand *
            </label>
            <input
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="e.g. Tesla"
              className="input w-full bg-secondary/10 px-4 py-3 rounded-xl outline-none border border-secondary/20 focus:border-black/50 text-sm font-semibold transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">
              Model Name *
            </label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Model Y"
              className="input w-full bg-secondary/10 px-4 py-3 rounded-xl outline-none border border-secondary/20 focus:border-black/50 text-sm font-semibold transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">
              Manufacture Year *
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              placeholder="e.g. 2023"
              className="input w-full bg-secondary/10 px-4 py-3 rounded-xl outline-none border border-secondary/20 focus:border-black/50 text-sm font-semibold transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">
              License Plate *
            </label>
            <input
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              placeholder="e.g. BA-1-PA-9999"
              className="input w-full bg-secondary/10 px-4 py-3 rounded-xl outline-none border border-secondary/20 focus:border-black/50 text-sm font-semibold transition-all"
              required
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">
              Chassis VIN Code (17 Characters) *
            </label>
            <input
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              placeholder="17-Digit VIN Alphanumeric String"
              maxLength={17}
              className="input w-full bg-secondary/10 px-4 py-3 rounded-xl outline-none border border-secondary/20 focus:border-black/50 text-sm font-mono font-bold tracking-wide uppercase transition-all"
              required
            />
          </div>
        </div>

        {/* Footer operations */}
        <div className="pt-6 border-t border-secondary/25 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="bg-white hover:bg-secondary/10 text-primary border border-secondary/35 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-black hover:bg-neutral-800 text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            {loading && <RefreshCcw className="w-4 h-4 animate-spin" />}
            {editingVehicle ? "Save Sync" : "Complete Registration"}
          </button>
        </div>
      </form>
    </Modal>
    </>
  );
};
