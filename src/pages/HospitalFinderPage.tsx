import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { HospitalFacility } from "../types";
import { Building2, Search, PhoneCall, Navigation, ShieldCheck, HeartPulse, Stethoscope, Droplet, Clock, MapPin, Globe } from "lucide-react";

const DEMO_HOSPITALS: HospitalFacility[] = [
  {
    id: "h1",
    name: "BloomNest Women & Children's Super-Specialty",
    type: "Maternity Super-Specialty",
    distanceKm: 1.8,
    address: "42 Healthcare Boulevard, Medical Enclave",
    emergencyPhone: "+91 98765 43210",
    nicuLevel: "Level IV (Advanced)",
    bloodBankAvailable: true,
    pharmacy24x7: true,
    ambulanceAvailable: true,
    rating: 4.9,
  },
  {
    id: "h2",
    name: "City General Hospital & Maternal Center",
    type: "Tertiary Hospital",
    distanceKm: 3.5,
    address: "108 Central Avenue, Sector 4",
    emergencyPhone: "+91 98111 22334",
    nicuLevel: "Level III (Specialized)",
    bloodBankAvailable: true,
    pharmacy24x7: true,
    ambulanceAvailable: true,
    rating: 4.7,
  },
  {
    id: "h3",
    name: "St. Jude Maternity Care & Neonatal Clinic",
    type: "Maternity Super-Specialty",
    distanceKm: 5.2,
    address: "18 Rosewood Lane, Near City Park",
    emergencyPhone: "+91 99000 11223",
    nicuLevel: "Level III (Specialized)",
    bloodBankAvailable: true,
    pharmacy24x7: false,
    ambulanceAvailable: true,
    rating: 4.8,
  },
  {
    id: "h4",
    name: "Apex Medical Institute & Advanced NICU",
    type: "Government Medical College",
    distanceKm: 8.1,
    address: "Universal Health Campus, Ring Road",
    emergencyPhone: "+91 97777 88899",
    nicuLevel: "Level IV (Advanced)",
    bloodBankAvailable: true,
    pharmacy24x7: true,
    ambulanceAvailable: true,
    rating: 4.6,
  },
];

export const HospitalFinderPage: React.FC = () => {
  const { showToast } = useApp();
  const [citySearch, setCitySearch] = useState("");
  const [filterNicuOnly, setFilterNicuOnly] = useState(false);
  const [filterBloodBank, setFilterBloodBank] = useState(false);

  const filteredHospitals = DEMO_HOSPITALS.filter((h) => {
    const matchesCity =
      h.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      h.address.toLowerCase().includes(citySearch.toLowerCase());
    const matchesNicu = !filterNicuOnly || h.nicuLevel.includes("Level III") || h.nicuLevel.includes("Level IV");
    const matchesBlood = !filterBloodBank || h.bloodBankAvailable;
    return matchesCity && matchesNicu && matchesBlood;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Emergency Facilities & Travel Relocation</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            Hospital, NICU & Maternity Center Finder
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            Locate nearby maternity hospitals, verify NICU level availability, 24/7 blood banks, and pharmacies.
          </p>
        </div>

        <button
          onClick={() => showToast("Emergency SOS dispatch initialized!")}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call 108 Maternity Ambulance</span>
        </button>
      </div>

      {/* Filter & Relocation Search Controls */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Search hospital name, street, or relocation city..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterNicuOnly(!filterNicuOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                filterNicuOnly
                  ? "bg-purple-600 text-white border-purple-700"
                  : "bg-rose-50/30 dark:bg-rose-950/20 text-gray-700 dark:text-rose-200 border-rose-100 dark:border-rose-900/30"
              }`}
            >
              Advanced NICU (Level III/IV)
            </button>

            <button
              onClick={() => setFilterBloodBank(!filterBloodBank)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                filterBloodBank
                  ? "bg-red-600 text-white border-red-700"
                  : "bg-rose-50/30 dark:bg-rose-950/20 text-gray-700 dark:text-rose-200 border-rose-100 dark:border-rose-900/30"
              }`}
            >
              24/7 Blood Bank
            </button>
          </div>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHospitals.map((hospital) => (
          <div
            key={hospital.id}
            className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold">
                  {hospital.type}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  ★ {hospital.rating} · {hospital.distanceKm} km away
                </span>
              </div>

              <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100">
                {hospital.name}
              </h3>

              <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-rose-300">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{hospital.address}</span>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2">
                <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="text-[10px] text-gray-400">NICU Standard</div>
                    <div className="font-bold">{hospital.nicuLevel}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-900 dark:text-red-200 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="text-[10px] text-gray-400">Blood Bank</div>
                    <div className="font-bold">{hospital.bloodBankAvailable ? "24/7 On-Site" : "On-Call"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
              <a
                href={`tel:${hospital.emergencyPhone}`}
                onClick={() => showToast(`Dialing emergency line: ${hospital.emergencyPhone}`)}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Emergency</span>
              </a>

              <button
                onClick={() => showToast(`Simulating GPS route navigation to ${hospital.name}...`)}
                className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100"
              >
                <Navigation className="w-3.5 h-3.5 text-rose-500" />
                <span>Navigate</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
